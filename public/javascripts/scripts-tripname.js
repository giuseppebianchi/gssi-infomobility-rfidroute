$(document).ready(function(){

    const modal_new = $("#newRfidModal"),
          add_new_form = $("#addNewRfidForm"),
          update_rfid = $("#updateRfid"),
          delete_rfid = $("#deleteRfid"),
          rfid_table = $("#rfidTable"),
          new_rfid_button = $("#newRfidButton"),
          modal_new_title = $("#newRfidModalTitle")

    const select_route = $("#selectRoute"),
          select_pattern = $("#selectPattern"),
          select_trip = $("#selectTrip"),
          input_rfid = $("#inputRFID"),
          input_bus = $("#inputBus"),
          add_new_rfid = $("#addNewRfid"),
          tripshift_label = $("#tripshiftLabel");

    const edit_labels = $(".edit-label"),
          edit_label_route =  $("#edit-label-route"),
          edit_label_pattern = $("#edit-label-pattern"),
          edit_label_trip = $("#edit-label-trip");

    const alert_modal = $("#alertModal"),
          alert_section = $("#alertSection");

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
        tripshift_label.text("")
        input_bus.val("").attr("disabled", true);
        input_rfid.val("").attr("disabled", true);
        select_route.html("<option></option>").attr("disabled", true).val("");
        select_pattern.html("<option></option>").attr("disabled", true).val("");
        select_trip.html("").attr("disabled", true).val("");
        add_new_rfid.attr("disabled", true);
        modal_new.modal("show")

        $.getJSON(urlOTP + routesAPI).done(function(data){
            select_route.removeAttr("disabled")
            data.map(function(item){
                select_route.append('<option value="' + item.shortName + '">' + item.shortName + '</option>')
            })
            select_route.removeAttr("disabled")
            input_bus.removeAttr("disabled")
            input_rfid.removeAttr("disabled")
        }).fail(function(err) {
            //debugger
            //print alert
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> OTP Server non risponde </div>')
            console.log( "OTP Server error: " + JSON.stringify(err));
        })

        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    })

    select_route.change(function (e) {
        if($(this).attr("disabled")) {
            return false
        }
        $.getJSON(urlOTP + routesAPI + "1:" + $(this).val() + "/patterns").done(function(data){
            select_pattern.html("<option></option>");
            //debugger;
            //sort data by busStopStart
            const data_ = data.sort(function(a, b){
                if ( a.busStopStart < b.busStopStart ){
                    return -1;
                }
                if ( a.busStopStart > b.busStopStart ){
                    return 1;
                }
                return 0;
            })
            select_trip.html("");
            data_.map(function(item){
                select_pattern.append('<option data-from="' + item.busStopStart + '" data-to="' + item.busStopEnd + '" data-from_stop_id="' + item.busStopStartId + '" data-to_stop_id="' + item.busStopEndId + '" data-trips='+ JSON.stringify(item.trip_route) + ' value="' + item.id + '">Da ' + item.busStopStart + ' - A ' + item.busStopEnd + '</option>')
                //bus stop ids
                //select_pattern.append('<option data-trips='+ JSON.stringify(item.trip_route) + ' value=' + item.id + '">Da ' + item.busStopStart + " (" + item.busStopStartId  + ') - A ' + item.busStopEnd + " - " + item.busStopStartId + ')</option>')

            })
            select_pattern.removeAttr("disabled")
        }).fail(function(err) {
            //debugger
            //print alert
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> OTP Server non risponde </div>')
            add_new_rfid.attr("disabled", true)
            console.log( "OTP Server error: " + JSON.stringify(err));
            console.log( "error: " + JSON.stringify(err));
        })
    });

    select_pattern.change(function (e) {
        //debugger;
        if($(this).attr("disabled")) {
            return false
        }
        select_trip.html("")
        var pattern_trips = $(this).find(":selected").data("trips");
        pattern_trips.map(function(item){
            select_trip.append('<option value="' + item + '">' + item + '</option>')
        })
        select_trip.removeAttr("disabled")
        add_new_rfid.removeAttr("disabled")
    });

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

        var pattern_option = select_pattern.find(":selected")

        $.ajax({
            url: baseURL + "/rfid/tripname/create",
            data: JSON.stringify({
                rfid_code: input_rfid.val(),
                autobus: input_bus.val(),
                route: select_route.val(),
                pattern_id: select_pattern.val(),
                pattern_from: pattern_option.data("from"),
                pattern_to: pattern_option.data("to"),
                pattern_from_stop_id: pattern_option.data("from_stop_id"),
                pattern_to_stop_id: pattern_option.data("to_stop_id"),
                trip_name: select_trip.val()
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
            alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>' + result.rfid_code + '</strong> è stato aggiunto correttamente <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            //add item to table
            let tr = $.parseHTML('<tr id="rfid_code_'+result.rfid_code+'"><th scope="row">'+result.rfid_code+'</th><td class="trip_name-field">'+result.trip_name+'</td><td class="pattern_from-field">'+result.from+'</td><td class="pattern_to-field">'+result.to+'</td><td class="route-field">'+result.route+'</td><td class="pattern_id-field">'+result.pattern_id+'</td><td class="autobus-field">'+result.bus+'</td></tr>')
            let edit_button = $.parseHTML("<a class='edit-button' href='#'>Modifica</a>")[0]
            $(edit_button).attr("data-edit", JSON.stringify(result))
            $(tr).append("<td>"+edit_button.outerHTML+"</td>")
            rfid_table.append(tr)

            highlightRow($('#rfid_code_'+result.rfid_code))
        }).fail(err => {
            debugger;
            if(err.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
            if(err.responseJSON){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    })

    $(".check-tripshift").change(function(e){
        //debugger;
        tripshift_label.text("")
        if($(this).val() == "" || $(this).attr("disabled")){
            return false
        }
        $.ajax({
            url: baseURL + "/rfid/tripname/check_rfid",
            data: JSON.stringify({
                rfid_code: input_rfid.val()
            }),
            type: "post",
            contentType: 'application/json'
        }).done((result) => {
            //debugger;
            tripshift_label.text(result.msg)
            if(result.result){
                tripshift_label.css("color", "red")
            }else{
                tripshift_label.css("color", "#28a745")
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
        const route = select_route.val()
        if(!route){
            validation.push(select_route);
        }
        const pattern = select_pattern.val()
        if(!pattern){
            validation.push(select_pattern);
        }
        const trip_name = select_trip.val()
        if(!trip_name){
            validation.push(select_trip);
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
        delete_rfid.show().data("delete", data.rfid_code)
        alert_modal.html("")

        //fill form's fields
        input_rfid.val(data.rfid_code).attr("disabled", true);
        input_bus.val(data.bus)
        edit_label_route.text(": " + data.route)
        edit_label_pattern.text(data.pattern_desc)
        edit_label_trip.text(": " + data.trip_name)
        edit_labels.show()
        tripshift_label.text("")

        select_route.html("<option></option>").attr("disabled", true).val("");
        select_pattern.html("<option></option>").attr("disabled", true).val("");
        select_trip.html("").attr("disabled", true).val("");
        modal_new.modal("show")

        $.getJSON(urlOTP + routesAPI).done(function(data){
            select_route.removeAttr("disabled")
            data.map(function(item){
                select_route.append('<option value="' + item.shortName + '">' + item.shortName + '</option>')
            })
            select_route.removeAttr("disabled")
            input_bus.removeAttr("disabled")
        }).fail(function(err) {
            //debugger
            //print alert
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> OTP Server non risponde </div>')
            console.log( "OTP Server error: " + JSON.stringify(err));
        })

    })

    update_rfid.click(function (e) {
        e.preventDefault();
        //debugger;
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
            rfid_code: input_rfid.val(),
            autobus: null,
            route: null,
            pattern_id: null,
            pattern_from: null,
            pattern_to: null,
            pattern_from_stop_id: null,
            pattern_to_stop_id: null,
            trip_name: null
        }

        if(input_bus.val() != data.bus){
            new_values.autobus = input_bus.val()
        }
        var pattern_option = select_pattern.find(":selected")
        if((select_trip.val() && select_pattern.val() && select_route.val()) &&
            (select_route.val() != data.route || select_pattern.val() != data.pattern_id || select_trip.val() != data.trip_name)){
            new_values.route = select_route.val()
            new_values.pattern_id = select_pattern.val()
            new_values.pattern_from = pattern_option.data("from")
            new_values.pattern_to = pattern_option.data("to")
            new_values.pattern_from_stop_id = pattern_option.data("from_stop_id")
            new_values.pattern_to_stop_id = pattern_option.data("to_stop_id")
            new_values.trip_name = select_trip.val()
        }
        if(new_values.autobus == null && new_values.trip_name == null){
            alert_modal.html('<div class="alert alert-warning alert-dismissible fade show" role="alert">Valori non modificati<button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            return false;
        }

        $.ajax({
            url: baseURL + "/rfid/tripname/update",
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
                const tr = $("#rfid_code_" + data.rfid_code)
                for(let prop in new_values){
                    if(new_values[prop] != null){
                        data[prop] = new_values[prop]
                        tr.find("td." + prop + "-field").text(new_values[prop])
                    }
                }
                modal_new.modal("hide")
                alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>'+ data.rfid_code +'</strong> è stato modificato con successo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
                tr.find(".edit-button").data("update", data)
                highlightRow(tr)
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
        const rfid_code = $(e.currentTarget).data("delete")

        //check button
        if(update_rfid.attr("disabled")) {
            return false
        }
        //check fields
        if(input_rfid.val() != rfid_code){
            alert_section.html('<div class="alert alert-warning alert-dismissible fade show" role="alert"> <strong>Ops!</strong> C\'è stato un problema. Prova di nuovo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            modal_new.modal("hide")
            return;
        }

        $.ajax({
            url: baseURL + "/rfid/tripname/delete",
            data: JSON.stringify({rfid_code: rfid_code}),
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
                $("#rfid_code_" + rfid_code).remove()
                modal_new.modal("hide")
                alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>'+ rfid_code +'</strong> è stato rimosso con successo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
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

    $("#orderSelect").change(function(e) {
        var order = $(this).val()
        $.getJSON(baseURL + "/api/rfid/tripname?" + "order_by=" + order)
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

    const updateTable = (result) => {
        rfid_table.html("")
        result.map(item => {
            //debugger;
            let tr = $.parseHTML("<tr id='rfid_code_"+item.rfid_code+"'><th scope='row'>"+item.rfid_code+"</th><td class='trip_name-field'>"+item.trip_name+"</td><td class='pattern_from-field'>"+item.from+"</td><td class='pattern_to-field'>"+item.to+"</td><td class='route-field'>"+item.route+"</td><td class='pattern_id-field'>"+item.pattern_id+"</td><td class='autobus-field'>"+item.bus+"</td></tr>")[0]
            let edit_button = $.parseHTML("<a class='edit-button' href='#'>Modifica</a>")[0]
            $(edit_button).attr("data-edit", JSON.stringify(item))
            $(tr).append("<td>"+edit_button.outerHTML+"</td>")
            rfid_table.append(tr)
        })
    }

})