$(document).ready(function() {
    let user = $('body').data('id');
    let updateAttribute = $('body').data('attri'); //attri is short for attribute (updateAttribute)
    
    $('#username').on('keyup', function(e) {
        if(e.which === 32) {
            e.preventDefault();
        }
    });

    $('#avatar').on('change', function() {
        let exts = ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG'];
        let ext = $(this).val().split('.').pop().toString();
        if($.inArray(ext, exts) === -1) {
            alert('Photo Must Be In jpeg, jpg, or png format');
            $(this).val('');
        }
    });

    $('.submit-btn').on('click', function() {
        if(updateAttribute === "firstName") {
            let firstName = $('#firstName').val();
            if(!firstName) {
                alert('Must Enter A Name!');
                return;
            }
            else {
                $('form').submit();
            }
        }
        else if(updateAttribute === "lastName") {
            let lastName = $('#lastName').val();
            if(!lastName) {
                alert('Must Enter A Last Name!');
                return;
            }
            else {
                $('form').submit();
            }
        }
        else if(updateAttribute === 'username') {
            let username = $('#username').val();
            if(username.length < 6) {
                alert('Username Must Be At Least 6 Characters Long!');
                return;
            }
            else {
                $.ajax({
                    url: '/unique-username',
                    type: 'POST',
                    data: JSON.stringify({username: username}),
                    contentType: 'application/json',
                    processDate: false,
                    cache: false,
                    success: function(data) {
                        if(data === 'success') {
                            $('form').submit();
                        }
                        else if(data === 'invalid') {
                            alert('Username Taken! Select Another');
                            return;
                        }
                        else {
                            alert('Error Updating Username');
                        }
                    },
                    error: function(err) {
                        alert('Error! ' + err.message);
                    }
                });
            }
        }
        else if(updateAttribute === 'password') {
            let password = $('#password').val();
            if(password.length < 6) {
                alert('Password Must Be At Least 6 Characters Long!');
                return;
            }
            else {
                $('form').submit();
            }
        }

        else if (updateAttribute === 'birthday') {
            var date = $('#birthday').val();
            var pattern = /(0\d{1}|1[0-2])\/([0-2]\d{1}|3[0-1])\/(19|20)\d{2}/g;
            var m = date.match(pattern);
            if(m) {
                $('form').submit();
            }
            else {
                alert("Invalid date format. Must be mm/dd/yyyy format");
                $('#birthday').val('');
            }
        }
        else if(updateAttribute === 'email') {
            let email = $('#email').val();
            if(!email) {
                alert('Must Enter An Email!');
            }
            else {
                $('form').submit();
            }
        }
        else if(updateAttribute === 'gender') {
            $('form').submit();
        }
        else if(updateAttribute === 'phone') {
            let phone = $('#phone').val();
            if(!phone) {
                alert('Must Enter A Phone Number!');
                return;
            }
            else {
                $('form').submit();
            }
        }
        else if(updateAttribute === 'city') {
            let city = $('#city').val();
            if(!city) {
                alert('Must Enter A City!');
                return;
            }
            else {
                $('form').submit();
            }
        }
        else if(updateAttribute === 'state') {
            let state = $('#state').val();
            if(!state) {
                alert('Must Enter A State!');
                return;
            }
            else {
                $('form').submit();
            }
        }
        else if(updateAttribute === 'zip') {
            let zip = $('#zip').val();
            if(!zip) {
                alert('Must Enter A Zip Code!');
                return;
            }
            else {
                $('form').submit();
            }
        }
        else if(updateAttribute === 'bio') {
            let bio = $('#bio').val();
            if(!bio) {
                alert('Must Enter A Bio!');
                return;
            }
            else {
                $('form').submit();
            }
        }
        else if(updateAttribute === 'avatar') {
            let exts = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG'];
            let ext = $('#avatar').val().split('.').pop().toString();
            let path = $('#avatar').val();
            if(!path) {
                alert('Must Enter An Avatar!');
                return;
            }
            else if($.inArray(ext, exts) === -1) {
                alert('Photo Must Be In jpg, jpeg or png format!');
                return;
            }
            else {
                $('#avatarForm').submit();
            }
        }
    });
});