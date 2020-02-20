$(document).ready(function() {
    var img;
    var imgCrop = $('#image-crop-area').croppie({
        enableExif: true,
        enableOrientation: true, //Allow user to alter orientation
	    enableZoom: true, //Allow user to zoom in on image.
	    showZoomer: true, //Show the zoomer to the user.
	    viewport: {
	        width:200,
	        height:200,
	        type:'circle', //could be square
        },
        boundary:{
            width:300, //boundary has 200px width and 200px height.
            height:300
        }
    });

    $('#avatar').on('change', function() {
        var exts = ['png', 'jpeg', 'jpg', 'PNG', 'JPEG', 'JPG'];
        var ext = $(this).val().split('.').pop().toString();
        if($.inArray(ext, exts) === -1) {
            alert("Invalid File Type");
            $(this).val('');
        }
        else {
            var reader = new FileReader();
            reader.onload = function(event) {
                imgCrop.croppie('bind', {
                    url: event.target.result
                }).then(function() {
                    console.log("Successful Upload");
                });
            }
            reader.readAsDataURL(this.files[0]);
            $('.modal').modal('show');
        }
    });
    $('.birthday').on('change', function() {
        var date = $(this).val();
        var pattern = /(0\d{1}|1[0-2])\/([0-2]\d{1}|3[0-1])\/(19|20)\d{2}/g;
        var m = date.match(pattern);
        if(m) {
            return true;
        }
        else {
            alert("Invalid date format. Must be mm/dd/yyyy format");
            $(this).val('');
        }
    });

    $('.crop-image').on('click', function() {
        imgCrop.croppie('result', {
            size: 'viewport',
            format: 'png',
            type: 'blob'
        }).then(function(blob) {
            img = blob;
            $('.modal').modal('hide');
        });
    });

    $('#username').on('change', function() {
        var username = $(this).val();
        if(username.length >= 6) {
            $.ajax({
                url: "https://thekingdom.servebeer.com/unique-username",
                type: "POST",
                data: JSON.stringify({username: username}),
                contentType: 'application/json',
                dataType: false,
                processData: false,
                success: function(data) {
                    if(data === "success") {
                        return;
                    }
                    else {
                        alert("Username Taken! Select Another");
                        $('#username').val('');
                    }
                }
            });
        }
    });

    $('#username').on('keydown', function(e) {
        if(e.which === 32) {
            e.preventDefault();
        }
    });


    $('.submitBtn').on('click', function() {
        var firstName = $('#firstName').val();
        var lastName = $('#lastName').val();
        var username = $('#username').val();
        var password = $('#password').val();
        var birthday = $('#birthday').val();
        var gender = $('#genderSelect').children('option:selected').val();
        var email = $('#email').val();
        var city = $('#city').val();
        var state = $('#state').val();
        var zip = $('#zip').val();
        var bio = $('#bio').val();
        var phone = $('#phone').val();

        if(firstName && lastName && username && password && birthday && gender && email && city && state && zip && bio && img && phone){
            var fd = new FormData();
            fd.append('newUserAvatar', img, 'avatar.png');
            fd.append('firstName', firstName);
            fd.append('lastName', lastName);
            if(username.length >= 6) {
                fd.append('username', username);
            }
            else{
                alert("Username Length Must Be Greater Than 6 Characters!");
                return false;
            }
            if(password.length >= 6) {
                fd.append('password', password);
            }
            else {
                alert("Password Length Must Be Greater Than 6 Characters");
                return false;
            }
            fd.append('birthday', birthday);
            fd.append('email', email);
            fd.append('city', city);
            fd.append('state', state);
            fd.append('zip', zip);
            fd.append('bio', bio);
            fd.append('phone', phone);
            fd.append('gender', gender);
            $.ajax({
                url: "https://thekingdom.servebeer.com/add-new-user",
                type: "POST",
                enctype: "multipart/form-data",
                data: fd,
                contentType: false,
                processData: false,
                dataType: false,
                success: function(data) {
                    if(data === "success") {
                        window.location = "https://thekingdom.servebeer.com/";
                    }
                    else {
                        alert(data);
                    }
                },
                error: function(data) {
                    alert("Error Uploading Data! Try Again");
                }
            });
        }
        else {
            alert("Must Fill Out All Fields!");
        }
    });
});