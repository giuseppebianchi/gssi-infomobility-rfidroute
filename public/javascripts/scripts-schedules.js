$(document).ready(function(){

    const modal_new = $("#newUserModal"),
          add_new_form = $("#addNewUserForm"),
          add_new_user = $("#addNewUser"),
          update_user = $("#updateUser"),
          delete_user = $("#deleteUser"),
          user_table = $("#userTable"),
          new_user_button = $("#newUserButton"),
          modal_new_title = $("#newUserModalTitle");

    const input_username = $("#inputUsername"),
          input_email = $("#inputEmail"),
          input_password = $("#inputPassword"),
          input_confirm_password = $("#inputConfirmPassword"),
          input_first_name = $("#inputFirstName"),
          input_last_name = $("#inputLastName"),
          select_role = $("#selectRole"),
          username_label = $("#usernameLabel"),
          email_label = $("#emailLabel"),
          password_label = $("#passwordLabel");

    const edit_labels = $(".edit-label"),
          edit_label_route =  $("#edit-label-route"),
          edit_label_pattern = $("#edit-label-pattern"),
          edit_label_trip = $("#edit-label-trip");

    const alert_modal = $("#alertModal"),
          alert_section = $("#alertSection");

    const password_pattern = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    let email_flag = false,
    editing_email = null;

    const highlightRow = (tr) =>{
        //debugger;
        tr.addClass("highlightedRow")
        setTimeout(function (tr) {
            tr.removeClass("highlightedRow")
        }, 5000, tr)
    }

    new_user_button.click(function (event) {
        //debugger;
        modal_new_title.text("Nuovo Utente");
        add_new_user.show();
        update_user.hide();
        delete_user.hide();
        //empty fields
        editing_email = null;
        add_new_form.find("input").val("")
        input_username.removeAttr("disabled")
        alert_modal.html("")
        username_label.text("")
        email_label.text("")
        password_label.text("")

        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.

        modal_new.modal("show")
    })


    add_new_form.submit(function (e) {
        e.preventDefault();
        //debugger;
        //check button
        if(add_new_user.attr("disabled")) {
            return false
        }
        //check fields
        $(".empty-required-field").removeClass("empty-required-field");
        if(!validation_form(e)) {
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Valori non validi!</strong> Controlla i campi richiesti <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            return false;
        }

        $.ajax({
            url: baseURL + "/users/register",
            data: JSON.stringify({
                username: input_username.val(),
                email: input_email.val(),
                password: input_password.val(),
                first_name: input_first_name.val(),
                last_name: input_last_name.val(),
                role: select_role.val()
            }),
            type: "post",
            contentType: 'application/json'
        }).done((result) => {
            //debugger;
            if(result.cancel_request){
                window.location = baseURL
                return false;
            }
            if(result.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
                return false;
            }
            if(result.username){
                //else it's ok
                //close modal and alert user
                modal_new.modal("hide")
                add_new_user.hide();
                alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>' + result.username + '</strong> è stato aggiunto correttamente <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
                //add item to table
                user_table.append('<tr id="user_'+result.username+'"><th scope="row">'+result.username+'</th><td class="email-field">'+result.email+'</td><td class="first_name-field">'+result.first_name+'</td><td class="last_name-field">'+result.last_name+'</td><td class="role-field">'+result.role+'</td><td class="created-field">'+result.formatted_created+'</td><td><a class="edit-button" href="#" data-edit=\''+JSON.stringify(result)+'\'>Modifica</a></td></tr>')
                highlightRow($('#user_'+result.username))
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }

        }).fail(err => {
            debugger;
            if(err.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
            if(err.responseJSON){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> Valore: <strong>' + err.responseJSON.errors[0].value + '</strong> - ' + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    })

    input_username.change(function(e){
        //debugger;
        username_label.text("")
        $(this).val($(this).val().toLowerCase())
        if($(this).val() == "" || $(this).attr("disabled")){
            return false
        }
        if($(this).val().length < 5){
            username_label.text("almeno 5 caratteri").css("color", "red")
            return false;
        }
        $.ajax({
            url: baseURL + "/users/check/username?q=" + $(this).val(),
            type: "get"
        }).done((result) => {
            //debugger;
            if(result.cancel_request){
                window.location = baseURL
                return false;
            }
            username_label.text(result.msg)
            if(result.result){
                username_label.css("color", "red")
            }else{
                username_label.css("color", "#28a745")
            }
            //else it's ok
        }).fail(err => {
            //debugger;
            if(err.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
            if(err.responseJSON){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> Valore: <strong>' + err.responseJSON.errors[0].value + '</strong> - ' + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    })

    input_email.change(function(e){
        //debugger;

        email_label.text("")
        $(this).val($(this).val().toLowerCase())
        if($(this).val() == "" || $(this).attr("disabled") || editing_email == $(this).val()){
            return false
        }
        $.ajax({
            url: baseURL + "/users/check/email?q=" + $(this).val(),
            type: "get"
        }).done((result) => {
            //debugger;
            if(result.cancel_request){
                window.location = baseURL
                return false;
            }
            if(result.result){
                //email è già presente
                email_flag = false
                email_label.text(result.msg).css("color", "red")
            }else{
                email_flag = true;
            }
            //else it's ok
        }).fail(err => {
            debugger;
            email_flag = false;
            if(err.error_name){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
            if(err.responseJSON){
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> Valore: <strong>' + err.responseJSON.errors[0].value + '</strong> - ' + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    })

    function validation_form(e){
        let validation = [];

        const username = input_username.val();
        if(!username){
            validation.push(input_username);
        }else{
            if(username.length < 5){
                validation.push(input_username);
                username_label.text("Min 5 Caratteri").css("color", "red")
            }
        }


        const email = input_email.val();
        if(!email){
            validation.push(input_email);
        }else{
            if(!email_flag){
                validation.push(input_email);
                email_label.text(" già presente nel sistema")
            }
        }

        password_label.text("")
        const pass1 = input_password.val()
        if(!pass1){
            validation.push(input_password);
        }else{
            if(pass1.length < 8 || !password_pattern.test(pass1)){
                validation.push(input_password);
                password_label.text("La password deve essere lunga ameno 8 caratteri e includere un carattere minuscolo, un carattere maiuscolo, un numero, e un carattere speciale").css("color", "red")
            }
        }
        const pass2 = input_confirm_password.val()
        if(!pass2){
            validation.push(input_confirm_password);
        }else{
            if(pass1 && pass1 != pass2 && password_label.text() == ""){
                validation.push(input_confirm_password);
                password_label.text("Le password non corrispondono").css("color", "red")
            }
        }
        const role = select_role.val()
        if(!role){
            validation.push(select_role);
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
    function validation_update_form(data){
        let validation = [];
        //debugger;
        const email = input_email.val();
        if(!email){
            validation.push(input_email);
        }else{
            if(email != data.email && !email_flag){
                validation.push(input_email);
                email_label.text(" già presente nel sistema")
            }
        }

        password_label.text("")
        const pass1 = input_password.val()
        if(pass1 && (pass1.length < 8 || !password_pattern.test(pass1))){
            validation.push(input_password);
            password_label.text("La password deve essere lunga ameno 8 caratteri e includere un carattere minuscolo, un carattere maiuscolo, un numero, e un carattere speciale").css("color", "red")
        }
        const pass2 = input_confirm_password.val()
        if(pass1 && pass1 != pass2 && password_label.text() == ""){
            validation.push(input_confirm_password);
            password_label.text("Le password non corrispondono").css("color", "red")
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

    $("body").on("click", ".edit-button", function (e) {
        e.preventDefault()
        //debugger;
        const data = $(e.currentTarget).data("edit")
        editing_email = data.email;
        modal_new_title.text("Modifica Utente - " + data.username)
        add_new_user.hide()
        update_user.show().data("update", data)
        delete_user.show().data("delete", data.username)

        add_new_form.find("input").val("")
        alert_modal.html("")
        username_label.text("")
        email_label.text("")
        password_label.text("")

        //fill form's fields
        input_username.val(data.username).attr("disabled", true);
        input_email.val(data.email)
        input_first_name.val(data.first_name)
        input_last_name.val(data.last_name)
        select_role.val(data.role)

        modal_new.modal("show")


    })

    update_user.click(function (e) {
        e.preventDefault();
        //debugger;
        const data = $(e.currentTarget).data("update")

        //check button
        if(update_user.attr("disabled")) {
            return false
        }
        //check fields
        $(".empty-required-field").removeClass("empty-required-field");
        if(!validation_update_form(data)) {
            alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Valori non validi!</strong> Controlla i campi modificati <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            return false;
        }

        //check fields
        if(input_username.val() != data.username){
            alert_section.html('<div class="alert alert-warning alert-dismissible fade show" role="alert"> <strong>Ops!</strong> C\'è stato un problema. Prova di nuovo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            modal_new.modal("hide")
            return;
        }

        let new_values = {
            username: data.username,
            email: null,
            password: "",
            first_name: null,
            last_name: null,
            role: null
        }

        if(input_email.val() != data.email){
            new_values.email = input_email.val()
        }
        if(input_password.val() != ""){
            new_values.password = input_password.val()
        }
        if(input_first_name.val() != data.first_name){
            new_values.first_name = input_first_name.val()
        }
        if(input_last_name.val() != data.last_name){
            new_values.last_name = input_last_name.val()
        }
        if(select_role.val() != data.role){
            new_values.role = select_role.val();
        }

        if(new_values.first_name == null &&
            new_values.last_name == null &&
            new_values.email == null &&
            new_values.password == "" &&
            new_values.role == null){
            alert_modal.html('<div class="alert alert-warning alert-dismissible fade show" role="alert">Valori non modificati<button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            return false;
        }

        $.ajax({
            url: baseURL + "/users/update",
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
                const tr = $("#user_" + data.username)
                for(let prop in new_values){
                    if(new_values[prop] != null && prop != "password"){
                        data[prop] = new_values[prop]
                        tr.find("td." + prop + "-field").text(new_values[prop])
                    }
                }
                modal_new.modal("hide")
                alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>'+ data.username +'</strong> è stao modificato con successo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
                tr.find(".edit-button").data("update", data)
                highlightRow(tr)
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        }).fail(err => {
            debugger;
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

    delete_user.click(function (e) {
        e.preventDefault();
        //debugger;
        const username = $(e.currentTarget).data("delete")

        //check button
        if(update_user.attr("disabled")) {
            return false
        }
        //check fields
        if(input_username.val() != username){
            alert_section.html('<div class="alert alert-warning alert-dismissible fade show" role="alert"> <strong>Ops!</strong> C\'è stato un problema. Prova di nuovo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            modal_new.modal("hide")
            return;
        }

        $.ajax({
            url: baseURL + "/users/delete",
            data: JSON.stringify({username: username}),
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
                $("#user_" + username).remove()
                modal_new.modal("hide")
                alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>'+ username +'</strong> è stato rimosso con successo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        }).fail(err => {
            debugger;
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

    $(".set-active-schedule").click(function(e){
        //debugger;
        e.preventDefault();
        const id = $(this).data("id")
        if(!id){
            return false;
        }

        $.ajax({
            url: baseURL + "/schedules/active/" + id,
            type: "get",
            contentType: 'application/json'
        }).done((result) => {
            //debugger;
            if(result.editing){
                location.reload();
            }else{
                alert_modal.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
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


})