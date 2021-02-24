$(document).ready(function(){

    const modal_new = $("#newTripShiftModal"),
        add_new_form = $("#addNewTripShiftForm"),
        update_tripshift = $("#updateTripShift"),
        delete_tripshift = $("#deleteTripShift"),
        tripshift_table = $("#tripshiftTable"),
        new_tripshift_button = $("#newTripShiftButton"),
        modal_new_title = $("#newTripShiftModalTitle")

    const select_route = $("#selectRoute"),
        select_pattern = $("#selectPattern"),
        select_trip = $("#selectTrip"),
        select_schedule = $("#selectSchedule"),
        select_shift = $("#selectShift"),

        add_new_tripshift = $("#addNewTripShift"),
        tripshift_label = $("#tripshiftLabel");

    const edit_labels = $(".edit-label"),
        edit_label_schedule = $("#edit-label-schedule"),
        edit_label_shift = $("#edit-label-tripshift"),
        edit_label_route =  $("#edit-label-route"),
        edit_label_pattern = $("#edit-label-pattern"),
        edit_label_trip = $("#edit-label-trip");

    const alert_modal = $("#alertModal"),
        alert_section = $("#alertSection");

    const filter_select_schedule = $("#filterSelectSchedule"),
        order_select = $("#orderSelect"),
        filter_select_shift = $("#filterSelectShift")

    const highlightRow = (tr) =>{
        tr.addClass("highlightedRow")
        setTimeout(function (tr) {
            tr.removeClass("highlightedRow")
        }, 5000, tr)
    }

    new_tripshift_button.click(function (event) {
        //debugger;
        modal_new_title.text("Aggiungi Corsa - Turno");
        alert_modal.html("")
        add_new_tripshift.show();
        update_tripshift.hide();
        delete_tripshift.hide();
        edit_labels.hide();
        tripshift_label.text("")

        select_route.html("<option></option>").attr("disabled", true).val("");
        select_pattern.html("<option></option>").attr("disabled", true).val("");
        select_trip.html("").attr("disabled", true).val("");
        select_schedule.attr("disabled", true).val("");
        select_shift.html("").attr("disabled", true).val("");

        add_new_tripshift.attr("disabled", true);
        modal_new.modal("show")

        $.getJSON(urlOTP + routesAPI).done(function(data){
            select_route.removeAttr("disabled")
            data.map(function(item){
                select_route.append('<option value="' + item.shortName + '">' + item.shortName + '</option>')
            })
            select_route.removeAttr("disabled")
            select_schedule.removeAttr("disabled").val("");

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
            //debugger;
            select_trip.html("");
            data_.map(function(item){
                select_pattern.append('<option data-from="' + item.busStopStart + '" data-to="' + item.busStopEnd + '" data-from_stop_id="' + item.busStopStartId + '" data-to_stop_id="' + item.busStopEndId + '" value="' + item.id + '">Da ' + item.busStopStart + ' - A ' + item.busStopEnd + " - [ " + item.trip_route.join(", ") + ' ]</option>')
                //bus stop ids
                //select_pattern.append('<option data-trips='+ JSON.stringify(item.trip_route) + ' value=' + item.id + '">Da ' + item.busStopStart + " (" + item.busStopStartId  + ') - A ' + item.busStopEnd + " - " + item.busStopStartId + ')</option>')

            })
            select_pattern.removeAttr("disabled")
        }).fail(function(err) {
            //debugger
            //print alert
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> OTP Server non risponde </div>')
            add_new_tripshift.attr("disabled", true)
            console.log( "OTP Server error: " + JSON.stringify(err));
            console.log( "error: " + JSON.stringify(err));
        })
    });

    select_pattern.change(function (e) {
        //debugger;
        if($(this).attr("disabled")) {
            return false
        }
        $.getJSON(urlOTP + patternsAPI + $(this).val()).done(function(data){
            select_trip.html("")
            data.trips.map(function(item){
                select_trip.append('<option data-trip_name="' + item.tripShortName + '" data-arrival_time="' + item.arrivalStop.scheduledArrival + '" data-departure_time="' + item.departureStop.scheduledDeparture + '" data-from="' + item.departureStop.stopName + '" data-to="' + item.arrivalStop.stopName + '" data-from_stop_id="' + item.departureStop.stopId + '" data-to_stop_id="' + item.arrivalStop.stopId + '" value="' + item.id + '">' + item.tripShortName + " - " + moment.utc(item.departureStop.scheduledDeparture*1000).format("HH:mm") + "/" + moment.utc(item.arrivalStop.scheduledArrival*1000).format("HH:mm") + ' - ID ' + item.id + ' </option>')
            })
            select_trip.removeAttr("disabled")
            add_new_tripshift.removeAttr("disabled")
        }).fail(function(err) {
            //debugger
            //print alert
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> OTP Server non risponde </div>')
            add_new_tripshift.attr("disabled", true)
            console.log( "OTP Server error: " + JSON.stringify(err));
            console.log( "error: " + JSON.stringify(err));
        })

    });

    select_schedule.change(function (e) {
        //debugger;
        if($(this).attr("disabled")) {
            return false
        }
        $.getJSON(baseURL + "/api/rfid/rfidshift/shift?schedule=" + $(this).val()).done(function(data){
            if(data.cancel_request){
                window.location = baseURL
                return false;
            }
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
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> RFID ROUTE Server non risponde </div>')
            add_new_tripshift.attr("disabled", true)
            console.log( "RFID ROUTE Server error: " + JSON.stringify(err));
            console.log( "error: " + JSON.stringify(err));
        })

    });

    add_new_form.submit(function (e) {
        e.preventDefault();
        //debugger;
        //check button
        if(add_new_tripshift.attr("disabled")) {
            return false
        }
        //check fields
        $(".empty-required-field").removeClass("empty-required-field");
        if(!validation_form(e)){
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Valori non validi!</strong> Controlla i campi richiesti <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            return false;
        }

        var pattern_option = select_pattern.find(":selected")
        var trip_option = select_trip.find(":selected")

        $.ajax({
            url: baseURL + "/rfid/rfidshift/tripshift/create",
            data: JSON.stringify({
                trip_id: select_trip.val(),
                trip_name: trip_option.data("trip_name"),
                departure_time: trip_option.data("departure_time"),
                pattern_from: trip_option.data("from"),
                arrival_time: trip_option.data("arrival_time"),
                pattern_to: trip_option.data("to"),
                route: select_route.val(),
                pattern_id: select_pattern.val() == "all" ? trip_option.data("pattern") : select_pattern.val(),
                pattern_from_stop_id: trip_option.data("from_stop_id"),
                pattern_to_stop_id: trip_option.data("to_stop_id"),
                shift_id: select_shift.val()
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
            add_new_tripshift.hide();
            const schedule_option = select_schedule.find(":selected")
            const shift_option = select_shift.find(":selected")

            alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>' + result.trip_id + '</strong> è stato aggiunto correttamente <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            //add item to table
            let tr = document.createElement("tr")
            tr.id = "tripshift_" + result.trip_shift_id;
            $(tr).append('<th scope="row">'+result.trip_shift_id+'</th><td class="trip_id-field">'+result.trip_id+'</td><td class="trip_name-field">'+result.trip_name+'</td><td class="route-field">'+result.route+'</td><td class="shift_id-field">'+shift_option.val()+'</td><td class="shift_code-field">'+shift_option.data("shift_code")+'</td><td class="shift_number-field">'+shift_option.data("shift_number")+'</td><td class="schedule_name-field">'+schedule_option.text()+'</td><td class="departure_time-field">'+ moment.utc(result.departure_time*1000).format("HH:mm") +'</td><td class="arrival_time-field">' + moment.utc(result.arrival_time*1000).format("HH:mm") + '</td><td class="from-field">'+result.from+'</td><td class="to-field">'+result.to+'</td>')

            let td = document.createElement("td")
            let a = document.createElement("a")
            a.setAttribute("class", "edit-button")
            a.setAttribute("href", "#");
            a.innerHTML = "Modifica"
            $(a).data("edit", JSON.stringify(result))
            $(tr).append($(td).append(a))
            tripshift_table.append(tr)
            highlightRow($(tr))
        }).fail(err => {
            debugger;
            if(err.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
            if(err.responseJSON){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + err.responseJSON.errors[0].param + ": " + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    })

    $(".check-tripshift").change(function(e){
        validation_check(e.currentTarget.id, $(this))
    })
    const validation_check = (id, target) => {
        //debugger;
        if(select_shift.val() == null || select_shift.val() == "" || select_trip.val() == null || select_trip.val() == ""){
            return false;
        }

        tripshift_label.text("")

        $.ajax({
            url: baseURL + "/rfid/rfidshift/tripshift/check_tripshift",
            data: JSON.stringify({
                trip_id: select_trip.val(),
                shift_id: select_shift.val()
            }),
            type: "post",
            contentType: 'application/json'
        }).done((result) => {
            //debugger;
            if(result.cancel_request){
                window.location = baseURL
                return false;
            }
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
            if(err.responseJSON && err.responseJSON.errors[0]){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Errore <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    }

    function validation_form(e){
        let validation = [];

        const route = select_route.val()
        if(!route){
            validation.push(select_route);
        }
        const pattern = select_pattern.val()
        if(!pattern){
            validation.push(select_pattern);
        }
        const trip_id = select_trip.val()
        if(!trip_id){
            validation.push(select_trip);
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
        //debugger;
        e.preventDefault()
        let data;
        if(typeof($(e.currentTarget).data("edit")) == "object"){
            data = $(e.currentTarget).data("edit");
        }else{
            data = JSON.parse($(e.currentTarget).data("edit"))
        }
        $(e.currentTarget).closest("tr").addClass("highlightedRow")
        modal_new_title.text("Modifica Corsa Turno - " + data.trip_shift_id)
        add_new_tripshift.hide()
        update_tripshift.show().data("update", data)
        delete_tripshift.show().data("delete", data.trip_shift_id)
        alert_modal.html("")

        //fill form's fields
        select_shift.val("").html("").attr("disabled", true)
        select_schedule.val("")

        if(data.shift){
            edit_label_schedule.html(": " + data.shift.schedule.schedule_name)
            edit_label_shift.html("Codice: " + data.shift.shift_code + " - n. " + data.shift.shift_number)
        }

        //edit_label_trip.text(": " + data.trip_id + ' - ' + data.trip_name + ' - ' + moment.utc(data.departure_time*1000).format("HH:mm"));
        select_route.html("<option>" + data.route + "</option>").attr("disabled", true)
        select_pattern.html("<option>" + data.pattern_desc + "</option>").attr("disabled", true)
        select_trip.val(data.trip_id).html("<option value='" + data.trip_id + "'>" + data.trip_id + ' - ' + data.trip_name + ' - ' + moment.utc(data.departure_time*1000).format("HH:mm") + "</option>").attr("disabled", true)
        edit_labels.show()
        tripshift_label.text("")

        //select_route.html("<option></option>").attr("disabled", true).val("");
        //select_pattern.html("<option></option>").attr("disabled", true).val("");
        //select_trip.html("").attr("disabled", true).val("");
        modal_new.modal("show")

        /*$.getJSON(urlOTP + routesAPI).done(function(data){
            select_route.removeAttr("disabled")
            data.map(function(item){
                select_route.append('<option value="' + item.shortName + '">' + item.shortName + '</option>')
            })
            select_route.removeAttr("disabled")
            input_bus.removeAttr("disabled")
            input_shift.removeAttr("disabled")
        }).fail(function(err) {
            //debugger
            //print alert
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> OTP Server non risponde </div>')
            console.log( "OTP Server error: " + JSON.stringify(err));
        })*/

    })

    update_tripshift.click(function (e) {
        e.preventDefault();
        //debugger;
        const data = $(e.currentTarget).data("update")

        //check button
        if(update_tripshift.attr("disabled")) {
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
            id: data.trip_shift_id,
            shift: null
        }
        if(select_shift.val() != data.shift_fk){
            new_values.shift = select_shift.val()
        }

        if(new_values.shift == null){
            alert_modal.html('<div class="alert alert-warning alert-dismissible fade show" role="alert">Valori non modificati<button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            return false;
        }

        $.ajax({
            url: baseURL + "/rfid/rfidshift/tripshift/update",
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
                if(filter_select_shift.val()){
                    filter_select_shift.trigger("change")
                }else{
                    filter_select_schedule.trigger("change")
                }

                order_select.trigger("change")

                modal_new.modal("hide")
                alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>'+ data.trip_shift_id +'</strong> è stato modificato con successo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
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

    delete_tripshift.click(function (e) {
        e.preventDefault();
        //debugger;
        const data_id = $(e.currentTarget).data("delete")

        //check button
        if(update_tripshift.attr("disabled")) {
            return false
        }
        //check fields
        if(!data_id){
            alert_section.html('<div class="alert alert-warning alert-dismissible fade show" role="alert"> <strong>Ops!</strong> C\'è stato un problema. Prova di nuovo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            modal_new.modal("hide")
            return;
        }

        $.ajax({
            url: baseURL + "/rfid/rfidshift/tripshift/delete",
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
                $("#tripshift_" + data_id).remove()
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
        var shift = filter_select_shift.val() ? filter_select_shift.val() : 0;
        var schedule = filter_select_schedule.val()
        $.getJSON(baseURL + "/api/rfid/rfidshift/tripshift?shift=" + shift + "&order_by=" + order + "&schedule=" + schedule)
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

    filter_select_shift.change(function(e) {
        var shift = $(this).val()
        var order = order_select.val();
        $.getJSON(baseURL + "/api/rfid/rfidshift/tripshift?shift=" + shift + "&order_by=" + order)
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

    filter_select_schedule.change(function(){
        if($(this).attr("disabled")) {
            return false
        }

        var order = order_select.val();

        if($(this).val() == 0) {
            filter_select_shift.html("").val("").attr("disabled", true)
        }else{
            $.getJSON(baseURL + "/api/rfid/rfidshift/shift?schedule=" + $(this).val()).done(function(data){
                filter_select_shift.html("<option></option>");
                //debugger;
                //sort data by busStopStart
                data.map(function(item){
                    filter_select_shift.append('<option data-shift_code="' + item.shift_code + '" data-shift_number="' + item.shift_number + '" value="' + item.shift_id + '">Codice: ' + item.shift_code + "/ n. " + item.shift_number + '</option>')
                    //bus stop ids
                    //select_pattern.append('<option data-trips='+ JSON.stringify(item.trip_route) + ' value=' + item.id + '">Da ' + item.busStopStart + " (" + item.busStopStartId  + ') - A ' + item.busStopEnd + " - " + item.busStopStartId + ')</option>')

                })
                filter_select_shift.removeAttr("disabled")
            }).fail(function(err) {
                //debugger
                //print alert
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> RFID ROUTE Server non risponde </div>')
                add_new_tripshift.attr("disabled", true)
                console.log( "RFID ROUTE Server error: " + JSON.stringify(err));
                console.log( "error: " + JSON.stringify(err));
            })
        }


        $.getJSON(baseURL + "/api/rfid/rfidshift/tripshift?shift=0&schedule=" + $(this).val() + "&order_by=" + order)
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
        tripshift_table.html("")
        result.map(item => {
            let tr = document.createElement("tr")
            tr.id = "tripshift_" + item.trip_shift_id;
            $(tr).append('<th scope="row">'+item.trip_shift_id+'</th><td class="trip_id-field">'+item.trip_id+'</td><td class="trip_name-field">'+item.trip_name+'</td><td class="route-field">'+item.route+'</td><td class="shift_id-field">'+ (item.shift ? item.shift_fk : '') +'</td><td class="shift_code-field">'+ (item.shift ? item.shift.shift_code : '') +'</td><td class="shift_number-field">'+ (item.shift ? item.shift.shift_number : '') +'</td><td class="schedule_name-field">'+ (item.shift ? item.shift.schedule.schedule_name : '') +'</td><td class="departure_time-field">'+ moment.utc(item.departure_time*1000).format("HH:mm") +'</td><td class="arrival_time-field">' + moment.utc(item.arrival_time*1000).format("HH:mm") + '</td><td class="from-field">'+item.from+'</td><td class="to-field">'+item.to+'</td>')

            let td = document.createElement("td")
            let a = document.createElement("a")
            a.setAttribute("class", "edit-button")
            a.setAttribute("href", "#");
            a.innerHTML = "Modifica"
            $(a).data("edit", JSON.stringify(item))
            $(tr).append($(td).append(a))
            tripshift_table.append(tr)
        })
    }

})