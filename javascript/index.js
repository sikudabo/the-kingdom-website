$(document).ready(function() {
    setTimeout(function() {
        $('#subscribe-modal').modal('show');
    }, 3000);

    $('#subscribe-btn').on('click', function() {
        let email = $('#subscribe-email').val();
        if(email) {
            $.ajax({
                url: '/handle-subscribe-email',
                type: 'POST',
                data: JSON.stringify({email: email}),
                contentType: 'application/json',
                processData: false,
                cache: false,
                success: function(data) {
                    if(data === 'success') {
                        alert('Successfully Subscribed. We Will Send You Email Updates!');
                        $('#subscribe-modal').modal('hide');
                    }
                    else {
                        alert('There Was An Error Processing Your Email Address. Try Again Later!');
                    }
                },
                error: function(err) {
                    alert('There Was An Error Processing Your Email Address. Try Again Later!')
                }
            });
        }
        else {
            alert('Must Enter An Email Address!');
        }
    });
});