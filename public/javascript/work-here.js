$(document).ready(function() {
    $('#resume').on('change', function() {
        let exts = ['docx', 'DOCX'];
        let ext = $(this).val().split('.').pop().toString();
        if($.inArray(ext, exts) === -1) {
            alert('Must Be A Word File (Usually Ending With A docx Extension');
            $(this).val('');
            return;
        }
    });

    $('#submitBtn').on('click', function() {
        let exts = ['docx', 'DOCX'];
        let ext = $('#resume').val().split('.').pop().toString();
        if($.inArray(ext, exts) === -1) {
            alert('Resume Must Be A Word File (Usually Ending With A docx Extension');
            $('#resume').val('');
            return;
        }
        else {
            $('#application-form').submit();
        }
    })
});