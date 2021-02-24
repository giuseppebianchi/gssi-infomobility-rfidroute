jQuery(function($){
    const basePath = "http://localhost:4000";

    var $modal = $('#editor-modal'),
        $editor = $('#editor'),
        $editorTitle = $('#editor-title'),
        // the below initializes FooTable and returns the created instance for later use
        ft = FooTable.init('#rfidTripNameTable', {
                "filtering": {
                    "position": "center"
                },
                "rows": $.get(basePath + "/api/rfid_tripname"),
                "columns": [
                    {
                        "name":"rfid_code",
                        "title":"#RFID",
                        "breakpoints":"xs sm",
                        "type":"number",
                    },
                    {
                        "name":"trip_name",
                        "title":"TRIP NAME"
                    },
                    {
                        "name":"from",
                        "title":"DA"
                    },
                    {
                        "name":"to",
                        "title":"A"
                    },
                    {
                        "name":"route",
                        "title":"LINEA"
                    },
                    {
                        "name":"pattern_id",
                        "title":"PATTERN"
                    }
                ],
            editing: {
                enabled: true,
                position: 'right',
                alwaysShow: true,
                showText: '<span class="fas fa-pencil-alt" aria-hidden="true"></span> Modifica',
                hideText: 'Annulla',
                addText: 'Aggiungi',
                editText: '<span class="fas fa-pencil-alt" aria-hidden="true"></span>',
                deleteText: '<span class="fas fa-trash" aria-hidden="true"></span>',
                viewText: '<span class="far fa-window-maximize" aria-hidden="true"></span>',
                allowAdd: true,
                allowEdit: true,
                allowDelete: true,
                allowView: false,
                addRow: function(){
                    $modal.removeData('row'); // remove any previous row data
                    $editor[0].reset(); // reset the form to clear any previous row data
                    $editorTitle.text('Add a new row'); // set the modal title
                    $modal.modal('show'); // display the modal
                },
                // the editRow callback is supplied the FooTable.Row object for editing as the first argument.
                editRow: function(row){
                    var values = row.val();
                    // we need to find and set the initial value for the editor inputs
                    $editor.find('#rfid_code_input').val(values.rfid_code);
                    $editor.find('#trip_name_input').val(values.trip_name);
                    $editor.find('#from_input').val(values.from);
                    $editor.find('#to_input').val(values.to);
                    $editor.find('#route_input').val(values.route);
                    $editor.find('#pattern_input').val(values.pattern_id);

                    $modal.data('row', row); // set the row data value for use later
                    //$editorTitle.text('Modifica #' + values.id); // set the modal title
                    $editorTitle.text('Modifica')
                    $modal.modal('show'); // display the modal
                },
                // the deleteRow callback is supplied the FooTable.Row object for deleting as the first argument.
                deleteRow: function(row){
                    // This example displays a confirm popup and then simply removes the row but you could just
                    // as easily make an ajax call and then only remove the row once you retrieve a response.
                    if (confirm('Are you sure you want to delete the row?')){
                        row.delete();
                    }
                }
            }
        }),
        // this example does not send data to the server so this variable holds the integer to use as an id for newly
        // generated rows. In production this value would be returned from the server upon a successful ajax call.
        uid = 10;

    $editor.on('submit', function(e){
        if (this.checkValidity && !this.checkValidity()) return; // if validation fails exit early and do nothing.
        e.preventDefault(); // stop the default post back from a form submit
        var row = $modal.data('row'), // get any previously stored row object
            values = { // create a hash of the editor row values
                rfid_code: $editor.find('#rfid_code_input').val(),
                trip_name: $editor.find('#trip_name_input').val(),
                from: $editor.find('#from_input').val(),
                to: $editor.find('#to_input').val(),
                route: $editor.find('#route_input').val(),
                pattern_id: $editor.find('#pattern_input').val()
            };

        if (row instanceof FooTable.Row){
            // if we have a row object then this is an edit operation
            // here you can execute an ajax call to the server and then only update the row once the result is
            // retrieved. This example simply updates the row straight away.
            row.val(values);
        } else {
            // otherwise this is an add operation
            // here you can execute an ajax call to the server to save the values and get the new row id and then
            // only add the row once the result is retrieved. This example simply adds the row straight away using
            // a basic integer id.
            values.id = uid++;
            ft.rows.add(values);
        }
        $modal.modal('hide');
    });

});