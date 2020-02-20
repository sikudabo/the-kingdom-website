$(document).ready(function() {
    $('#signInBtn').on('click', function() {
        var username = $('#username').val();
        var password = $('#password').val();
        if (username.length >= 6 && password.length >= 6) {
            $.ajax({
                url: "https://thekingdom.servebeer.com/verify-login",
                type: "POST",
                data: JSON.stringify({username: username, password: password}),
                contentType: 'application/json',
                processData: false,
                cache: false,
                success: function(data) {
                    if(data === "success") {
                        window.location = "https://thekingdom.servebeer.com/private-profile-page";
                    }
                    else {
                        alert(data);
                    }
                },
                error: function(data) {
                    alert("Error Logging In. Try Again");
                }
            });
        }
        else {
            alert("Username Or Password Invalid");
        }
    });
})