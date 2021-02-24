$(document).ready(function(){

    const modal_new = $("#newRfidModal"),
          add_new_form = $("#addNewRfidForm"),
          update_rfid = $("#updateRfid"),
          delete_rfid = $("#deleteRfid"),
          rfid_table = $("#rfidTable"),
          new_rfid_button = $("#newRfidButton"),
          modal_new_title = $("#newRfidModalTitle")

    const select_schedule = $("#selectSchedule"),
          select_shift = $("#selectShift"),
          input_rfid = $("#inputRFID"),
          add_new_rfid = $("#addNewRfid"),
          rfid_label = $("#rfidLabel");

    const edit_labels = $(".edit-label"),
          edit_label_schedule =  $("#edit-label-schedule"),
          edit_label_tripshift = $("#edit-label-tripshift")

    const alert_modal = $("#alertModal"),
          alert_section = $("#alertSection");

    const filter_select_schedule = $("#filterSelectSchedule"),
          order_select = $("#orderSelect")

    const highlightRow = (tr) =>{
        tr.addClass("highlightedRow")
        setTimeout(function (tr) {
            tr.removeClass("highlightedRow")
        }, 5000, tr)
    }

    new_rfid_button.click(function (event) {
        //debugger;
        modal_new_title.text("Nuovo RFID");
        alert_modal.html("")
        add_new_rfid.show();
        update_rfid.hide();
        delete_rfid.hide();
        edit_labels.hide();
        rfid_label.text("")
        input_rfid.val("")
        select_schedule.removeAttr("disabled").val("");
        select_shift.html("").attr("disabled", true).val("");
        add_new_rfid.attr("disabled", true);
        modal_new.modal("show")

        //update schedule select

        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    })

    select_schedule.change(function (e) {
        if($(this).attr("disabled")) {
            return false
        }
        $.getJSON(baseURL + "/api/rfid/rfidshift/shift?schedule=" + $(this).val()).done(function(data){
            select_shift.html("<option></option>");
            //debugger;
            //sort data by busStopStart
            data.map(function(item){
                select_shift.append('<option data-shift_code="' + item.shift_code + '" data-shift_number="' + item.shift_number + '" value="' + item.shift_id + '">Codice: ' + item.shift_code + "/ n. " + item.shift_number + '</option>')
                //bus stop ids
                //select_pattern.append('<option data-trips='+ JSON.stringify(item.trip_route) + ' value=' + item.id + '">Da ' + item.busStopStart + " (" + item.busStopStartId  + ') - A ' + item.busStopEnd + " - " + item.busStopStartId + ')</option>')

            })
            select_shift.removeAttr("disabled")
        }).fail(function(err) {
            //debugger
            //print alert
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> OTP Server non risponde </div>')
            add_new_rfid.attr("disabled", true)
            console.log( "OTP Server error: " + JSON.stringify(err));
            console.log( "error: " + JSON.stringify(err));
        })
    });

    select_shift.change(function () {
        if($(this).val() != "" && input_rfid.val() != ""){
            add_new_rfid.removeAttr("disabled")
        }else{
            add_new_rfid.attr("disabled", true)
        }

    })

    add_new_form.submit(function (e) {
        e.preventDefault();
        //debugger;
        //check button
        if(add_new_rfid.attr("disabled")) {
            return false
        }
        //check fields
        $(".empty-required-field").removeClass("empty-required-field");
        if(!validation_form(e)){
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Valori non validi!</strong> Controlla i campi richiesti <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            return false;
        }

        //var pattern_option = select_pattern.find(":selected")

        $.ajax({
            url: baseURL + "/rfid/rfidshift/cardrfid/create",
            data: JSON.stringify({
                rfid: input_rfid.val(),
                shift: select_shift.val()
            }),
            type: "post",
            contentType: 'application/json'
        }).done((result) => {
            //debugger;
            if(result.cancel_request){
                window.location = baseURL;
                return false;
            }
            if(result.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
                return false;
            }
            //else it's ok
            //close modal and alert user
            modal_new.modal("hide")
            add_new_rfid.hide();
            const schedule_option = select_schedule.find(":selected")
            const shift_option = select_shift.find(":selected")
            alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>' + result.rfid_code + '</strong> è stato aggiunto correttamente <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            //add item to table
            //debugger;
            let tr = $.parseHTML('<tr id="rfidshift_'+result.rfid_id+'"><th scope="row">'+result.rfid_code+'</th><td class="shift_id-field">'+result.rs_shift_fk+'</td><td class="shift_code-field">'+ shift_option.data("shift_code") +'</td><td class="shift_number-field">'+shift_option.data("shift_number")+'</td><td class="schedule-field">'+schedule_option.text()+'</td><td class="rs_created-field">'+result.rfid_created+'</td></tr>')
            let edit_button = $.parseHTML("<a class='edit-button' href='#'>Modifica</a>")[0]
            $(edit_button).attr("data-edit", JSON.stringify(result))
            $(tr).append("<td>"+edit_button.outerHTML+"</td>")
            rfid_table.append(tr)

            highlightRow($('#rfid_code_'+result.rfid_code))
        }).fail(err => {
            //debugger;
            if(err.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
            if(err.responseJSON){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    })

    input_rfid.change(function(e){
        //debugger;
        rfid_label.text("")
        if($(this).val() == "" || $(this).attr("disabled")){
            return false
        }
        $.ajax({
            url: baseURL + "/rfid/rfidshift/cardrfid/check_rfid",
            data: JSON.stringify({
                rfid_code: input_rfid.val()
            }),
            type: "post",
            contentType: 'application/json'
        }).done((result) => {
            //debugger;
            rfid_label.text(result.msg)
            if(result.result){
                rfid_label.css("color", "red")
                add_new_rfid.attr("disabled", true)
            }else{
                rfid_label.css("color", "#28a745")
                if(select_shift.val() != ""){
                    add_new_rfid.removeAttr("disabled")
                }
            }
            //else it's ok
        }).fail(err => {
            //debugger;
            if(err.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
            if(err.responseJSON){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    })

    function validation_form(e){
        let validation = [];

        const rfid_code = input_rfid.val();
        if(!rfid_code){
            validation.push(input_rfid);
        }
        const schedule = select_schedule.val()
        if(!schedule){
            validation.push(select_schedule);
        }
        const shift = select_shift.val()
        if(!shift){
            validation.push(select_shift);
        }

        if(validation.length > 0){
            validation.map((item) => {
                item.addClass("empty-required-field")
            })
            return false
        }else{
            return true
        }

    }

    modal_new.on('hide.bs.modal', function (event) {
        const rows = $(".highlightedRow");
        if(rows.length){
            rows.removeClass("highlightedRow")
        }
    })

    $("body").on("click", ".edit-button", function (e) {
        e.preventDefault()
        //debugger;
        let data;
        if(typeof($(e.currentTarget).data("edit")) == "object"){
            data = $(e.currentTarget).data("edit");
        }else{
            data = JSON.parse($(e.currentTarget).data("edit"))
        }

        $(e.currentTarget).closest("tr").addClass("highlightedRow")
        modal_new_title.text("Modifica RFID - " + data.rfid_code)
        add_new_rfid.hide()
        update_rfid.show().data("update", data)
        delete_rfid.show().data("delete", data.rfid_id)
        alert_modal.html("")

        //fill form's fields
        input_rfid.val(data.rfid_code).attr("disabled", true);
        select_schedule.val("");
        select_shift.html("").attr("disabled", true).val("");

        if(data.shift){
            edit_label_schedule.text(": " + data.shift.schedule.schedule_name)
            edit_label_tripshift.html(" Codice: " + data.shift.shift_code + " / n. " + data.shift.shift_number)
        }

        edit_labels.show()
        rfid_label.text("")

        modal_new.modal("show")

    })

    update_rfid.click(function (e) {
        e.preventDefault();

        const data = $(e.currentTarget).data("update")

        //check button
        if(update_rfid.attr("disabled")) {
            return false
        }
        //check fields
        if(input_rfid.val() != data.rfid_code){
            alert_section.html('<div class="alert alert-warning alert-dismissible fade show" role="alert"> <strong>Ops!</strong> C\'è stato un problema. Prova di nuovo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            modal_new.modal("hide")
            return;
        }

        let new_values = {
            rfid_id: data.rfid_id,
            shift: null
        }

        if((select_schedule.val() && select_shift.val()) &&
            (select_schedule.val() != (data.shift ? data.shift.schedule_fk : 0) || select_shift.val() != data.rs_shift_fk)){
            new_values.shift = select_shift.val()
        }

        $.ajax({
            url: baseURL + "/rfid/rfidshift/cardrfid/update",
            data: JSON.stringify(new_values),
            type: "post",
            contentType: 'application/json'
        }).done((result) => {
            //debugger;
            if(result.cancel_request){
                window.location = baseURL
                return false;
            }
            if(result.editing){
                //it's ok
                filter_select_schedule.trigger("change")

                modal_new.modal("hide")
                alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>'+ data.rfid_code +'</strong> è stato modificato con successo.  <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        }).fail(err => {
            //debugger;
            if(err.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
                return;
            }
            if(err.responseJSON){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    })

    delete_rfid.click(function (e) {
        e.preventDefault();
        //debugger;
        const rfid_id = $(e.currentTarget).data("delete")
        const data = update_rfid.data("update")

        //check button
        if(update_rfid.attr("disabled")) {
            return false
        }

        $.ajax({
            url: baseURL + "/rfid/rfidshift/cardrfid/delete",
            data: JSON.stringify({rfid_id: rfid_id}),
            type: "post",
            contentType: 'application/json'
        }).done((result) => {
            //debugger;
            if(result.cancel_request){
                window.location = baseURL
                return false;
            }
            if(result.delete){
                //it's ok
                $("#rfidshift_" + rfid_id).remove()
                modal_new.modal("hide")
                alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>'+ data.rfid_code +'</strong> è stato rimosso con successo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        }).fail(err => {
            //debugger;
            if(err.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
                return;
            }
            if(err.responseJSON){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    })

    order_select.change(function(e) {
        var order = $(this).val()
        var schedule = filter_select_schedule.val();
        $.getJSON(baseURL + "/api/rfid/rfidshift/cardrfid?schedule=" + schedule + "&order_by=" + order)
        .done((result) => {
            if(result.cancel_request){
                window.location = baseURL
                return false;
            }
            updateTable(result)
        })
        .fail((err) => {
            alert_section.html('<div class="alert alert-warning alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
        })

    })

    filter_select_schedule.change(function(e) {
        var schedule = $(this).val()
        var order = order_select.val();
        $.getJSON(baseURL + "/api/rfid/rfidshift/cardrfid?schedule=" + schedule + "&order_by=" + order)
            .done((result) => {
                //debugger;
                if(result.cancel_request){
                    window.location = baseURL
                    return false;
                }
                updateTable(result)
            })
            .fail((err) => {
                alert_section.html('<div class="alert alert-warning alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            })

    })

    const updateTable = (result) => {
        rfid_table.html("")
        result.map(item => {
            //debugger;
            let tr = $.parseHTML('<tr id="rfidshift_'+item.rfid_id+'"><th scope="row">'+item.rfid_code+'</th><td class="shift_id-field">'+ (item.shift ? item.rs_shift_fk : '') +'</td><td class="shift_code-field">'+ (item.shift ? item.shift.shift_code : '') +'</td><td class="shift_number-field">'+ (item.shift ? item.shift.shift_number : '') +'</td><td class="schedule-field">'+ (item.shift ? item.shift.schedule.schedule_name : '') +'</td><td class="rs_created-field">'+ moment(item.rfid_created).format()+'</td></tr>')
            let edit_button = $.parseHTML("<a class='edit-button' href='#'>Modifica</a>")[0]
            $(edit_button).attr("data-edit", JSON.stringify(item))
            $(tr).append("<td>"+edit_button.outerHTML+"</td>")
            rfid_table.append(tr)
        })
    }

})