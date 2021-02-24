$(document).ready(function () {
    const save_settings = $("#saveSettings")
    const textarea_settings = $("#textareaSettings")
    const alert_section = $("#alertSection")

    function IsJsonString(text) {
        try {
            JSON.parse(text);
        } catch (e) {
            return false;
        }
        return true;
    }

    save_settings.click(function (e) {
        save_settings.attr("disabled", true)
        e.preventDefault();
        //debugger;
        //check if textarea value is JSON
        if(!IsJsonString(textarea_settings.val())){
            alert_section.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong>Le impostazioni devono essere in formato JSON<button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            save_settings.removeAttr("disabled")
            return
        }
        $.ajax({
            url: baseURL + "/settings/update",
            data: {
                json_settings: textarea_settings.val()
            },
            type: "post"
        }).done((result) => {
            //debugger;
            save_settings.removeAttr("disabled")
            if(result.editing){
                //it's ok
                alert_section.html('<div class="alert alert-success alert-dismissible fade show" role="alert"> <strong>Impostazioni</strong> salvate con successo. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_section.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')

            }
        }).fail(err => {
            //debugger;
            save_settings.removeAttr("disabled")
            if(err.error_name){
                alert_section.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + result.error_name + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
                return;
            }
            if(err.responseJSON){
                alert_section.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> ' + err.responseJSON.errors[0].msg + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }else{
                alert_section.html('<div class="alert alert-danger alert-dismissible fade show" role="alert"> <strong>Ops!</strong> Si è verificato un problema. <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>')
            }
        })
    })
})