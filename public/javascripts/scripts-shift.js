$(document).ready(function(){

    const modal_new = $("#newShiftModal"),
        add_new_form = $("#addNewShiftForm"),
        update_shift = $("#updateShift"),
        delete_shift = $("#deleteShift"),
        shift_table = $("#shiftTable"),
        new_shift_button = $("#newShiftButton"),
        modal_new_title = $("#newShiftModalTitle")

    const select_schedule = $("#selectSchedule"),
        input_shift = $("#inputShift"),
        input_shift_id = $("#inputShiftId"),
        end_shift_time = $("#endShiftTime"),
        start_shift_time = $("#startShiftTime"),
        add_new_shift = $("#addNewShift"),
        shift_label = $("#shiftIdLabel");

    const edit_labels = $(".edit-label"),
        edit_label_schedule = $("#edit-label-schedule")

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

    new_shift_button.click(function (event) {
        //debugger;
        modal_new_title.text("Nuovo RFID - Turno");
        alert_modal.html("")
        add_new_shift.show();
        update_shift.hide();
        delete_shift.hide();
        edit_labels.hide();
        shift_label.text("")
        input_shift.val("").data("init", "")
        input_shift_id.val("").data("init", "")

        select_schedule.val("").data("init", "")


        add_new_shift.attr("disabled", true);
        modal_new.modal("show")

    })


    add_new_form.submit(function (e) {
        e.preventDefault();
        //debugger;
        //check button
        if(add_new_shift.attr("disabled")) {
            return false
        }
        //check fields
        $(".empty-required-field").removeClass("empty-required-field");
        if(!validation_form(e)){
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Valori non validi!</strong> Controlla i campi richiesti <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            return false;
        }

        var schedule_option = select_schedule.find(":selected")

        let start_time = null
        let end_time = null

        if(start_shift_time.val()){
            start_time = start_shift_time.val().split(":")
        }
        if(end_shift_time.val()){
            end_time = end_shift_time.val().split(":")
        }

        $.ajax({
            url: baseURL + "/rfid/rfidshift/shift/create",
            data: JSON.stringify({
                shift: input_shift.val(),
                shift_id: input_shift_id.val(),
                schedule: select_schedule.val(),
                shift_start: start_time ? Number(start_time[0])*3600 + Number(start_time[1])*60 : 0,
                shift_end: end_time ? Number(end_time[0])*3600 + Number(end_time[1])*60 : 0
            }),
            type: "post",
            contentType: 'application/json'
        }).done((result) => {
            //debugger;
            if(result.cancel_request){
                window.location = baseURL
                return false
            }
            if(result.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
                return false;
            }
            //else it's ok
            //close modal and alert user
            modal_new.modal("hide")
            add_new_shift.hide();
            const schedule_n = select_schedule.find("option[value='" + result.schedule_fk + "']").text();
            alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> Il turno <strong>' + result.shift_code + "</strong> / <strong>" + result.shift_number + '</strong> / <strong>' + schedule_n + '</strong> è stato creato correttamente. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            //add item to table
            let tr = document.createElement("tr")
            tr.id = "shift_" + result.shift_id;
            $(tr).append('<th scope="row">' + result.shift_id + '</th><td class="shift-field">'+result.shift_code+'</td><td class="shift_id-field">'+result.shift_number +'</td><td class="schedule-field">'+ schedule_n + '</td><td class="shift_start-field">'+ (result.shift_start ? moment.utc(result.shift_start*1000).format("HH:mm") : "") + '</td><td class="end_start-field">'+ (result.shift_end ? moment.utc(result.shift_end*1000).format("HH:mm") : "") + '</td><td class="rs_created-field">'+ moment(result.rs_created).format() +'</td>')

            let td = document.createElement("td")
            let a = document.createElement("a")
            a.setAttribute("class", "edit-button")
            a.setAttribute("href", "#");
            a.innerHTML = "Modifica"
            $(a).data("edit", JSON.stringify(result))
            $(tr).append($(td).append(a))
            shift_table.append(tr)
            highlightRow($(tr))
        }).fail(err => {
            //debugger;
            if(err.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
            if(err.responseJSON){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    })

    $(".check-shift").change(function(e){
        validation_check(e.currentTarget.id, $(this))
    })
    const validation_check = (id, target) => {
        //debugger;
        input_shift.text("")
        if(input_shift.data("init") == input_shift.val() || input_shift_id.data("init") == input_shift_id.val() || select_schedule.data("init") == select_schedule.val()){
            return false
        }
        //it means that is editing mode
        if(target.val() == "" || target.attr("disabled")){
            return false
        }
        /*switch(id){
            case  "inputRFID":  if(select_trip.val() == "" || select_trip.attr("disabled")){ return false }; break;
            case "selectTrip":  if(input_rfid.val() == "" || input_rfid.attr("disabled")){ return false }; break;
            default: return false;
        }*/


        $.ajax({
            url: baseURL + "/rfid/rfidshift/shift/check_shift",
            data: JSON.stringify({
                shift: input_shift.val(),
                shift_id: input_shift_id.val(),
                schedule: select_schedule.val()
            }),
            type: "post",
            contentType: 'application/json'
        }).done((result) => {
            //debugger;

            if(result.cancel_request){
                window.location = baseURL
                return false;
            }
            shift_label.text(result.msg)
            if(result.result){
                shift_label.css("color", "red")
                update_shift.attr("disabled", true)
                add_new_shift.attr("disabled", true)
            }else{
                shift_label.css("color", "#28a745")
                add_new_shift.removeAttr("disabled")
                update_shift.removeAttr("disabled")
            }
            //else it's ok
        }).fail(err => {
            debugger;
            add_new_shift.attr("disabled", true)
            if(err.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
            if(err.responseJSON){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    }

    function validation_form(e){
        let validation = [];

        const schedule = select_schedule.val()
        if(!schedule){
            validation.push(select_schedule);
        }
        const shift = input_shift.val();
        if(!shift){
            validation.push(input_shift);
        }
        const shift_id = input_shift_id.val();
        if(!shift_id){
            validation.push(input_shift_id);
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
        //debugger;
        e.preventDefault()
        let data;
        if(typeof($(e.currentTarget).data("edit")) == "object"){
            data = $(e.currentTarget).data("edit");
        }else{
            data = JSON.parse($(e.currentTarget).data("edit"))
        }
        $(e.currentTarget).closest("tr").addClass("highlightedRow")
        modal_new_title.text("Modifica Turno: " + data.shift_id)
        add_new_shift.hide()
        update_shift.show().data("update", data)
        delete_shift.show().data("delete", data.shift_id)
        alert_modal.html("")

        //fill form's fields
        input_shift.val(data.shift_number).removeAttr("disabled").data("init", data.shift_number)
        input_shift_id.val(data.shift_code).removeAttr("disabled").data("init", data.shift_code)
        select_schedule.val(data.schedule_fk).removeAttr("disabled").data("init", data.schedule_fk)

        edit_labels.show()
        shift_label.text("")

        modal_new.modal("show")


    })

    update_shift.click(function (e) {
        e.preventDefault();
        debugger;
        const data = $(e.currentTarget).data("update")

        //check button
        if(update_shift.attr("disabled")) {
            return false
        }
        //check trip_id
        /*if(input_rfid.val() != data.rfid_code){
            alert_section.html('<div class="alert alert-warning alert-dismissible fade show" role="alert"> <strong>Ops!</strong> C\'è stato un problema. Prova di nuovo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            modal_new.modal("hide")
            return;
        }*/
        var trip_option = select_pattern.find(":selected")

        let new_values = {
            id: data.id,
            trip_id: data.trip_id,
            trip_name: data.trip_name,
            departure_time: null,
            from: null,
            arrival_time: null,
            to: null,
            bus: null,
            route: null,
            pattern_id: null,
            shift: null,
            shift_id: null,
            schedule: null
        }
        if(input_shift.val() != data.shift){
            new_values.shift = input_shift.val()
        }
        if(input_bus.val() != data.bus){
            new_values.bus = input_bus.val()
        }

        if(new_values.bus == null && new_values.shift == null && new_values.shift_id == null){
            alert_modal.html('<div class="alert alert-warning alert-dismissible fade show" role="alert">Valori non modificati<button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            return false;
        }

        $.ajax({
            url: baseURL + "/rfid/rfidshift/shift/update",
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
                const tr = $("#shift_" + data.id)
                for(let prop in new_values){
                    if(new_values[prop] != null){
                        data[prop] = new_values[prop]
                        tr.find("td." + prop + "-field").text(new_values[prop])
                    }
                }
                modal_new.modal("hide")
                alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>'+ data.id +'</strong> è stato modificato con successo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
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

    delete_shift.click(function (e) {
        e.preventDefault();
        //debugger;
        const data_id = $(e.currentTarget).data("delete")

        //check button
        if(update_shift.attr("disabled")) {
            return false
        }
        //check fields
        if(!data_id){
            alert_section.html('<div class="alert alert-warning alert-dismissible fade show" role="alert"> <strong>Ops!</strong> C\'è stato un problema. Prova di nuovo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            modal_new.modal("hide")
            return;
        }

        $.ajax({
            url: baseURL + "/rfid/rfidshift/shift/delete",
            data: JSON.stringify({id: data_id}),
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
                $("#shift_" + data_id).remove()
                modal_new.modal("hide")
                alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>'+ data_id +'</strong> è stato rimosso con successo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
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
        $.getJSON(baseURL + "/api/rfid/rfidshift/shift?schedule=" + schedule + "&order_by=" + order)
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

    filter_select_schedule.change(function(e) {
        var schedule = $(this).val()
        var order = order_select.val();
        $.getJSON(baseURL + "/api/rfid/rfidshift/shift?schedule=" + schedule + "&order_by=" + order)
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
        shift_table.html("")
        result.map(item => {
            let tr = document.createElement("tr")
            tr.id = "shift_" + item.shift_id;
            $(tr).append('<th scope="row">' + item.shift_id + '</th><td class="shift-field">'+item.shift_code+'</td><td class="shift_id-field">'+item.shift_number+'</td><td class="schedule-field">'+select_schedule.find("option[value='" + item.schedule_fk + "']").text() + '</td><td class="shift_start-field">'+ (item.shift_start ? moment.utc(item.shift_start*1000).format("HH:mm") : "") + '</td><td class="end_start-field">'+ (item.shift_end ? moment.utc(item.shift_end*1000).format("HH:mm") : "") + '</td><td class="rs_created-field">'+moment(item.rs_created).format()+'</td>')

            let td = document.createElement("td")
            let a = document.createElement("a")
            a.setAttribute("class", "edit-button")
            a.setAttribute("href", "#");
            a.innerHTML = "Modifica"
            $(a).data("edit", JSON.stringify(item))
            $(tr).append($(td).append(a))
            shift_table.append(tr)
        })
    }

})