$(document).ready(function() {
    $('form').on('click', '.commentBtn', function() {
        let message = $(this).siblings('.commentPost').val();
        let targetUser = $('body').data('priv');
        let senderUser = $('body').data('cur');
        let postId = $(this).data('id');
        if(!message) {
            alert('Must Enter A Comment!');
            return;
        }
        else {
            $.ajax({
                url: '/handle-public-comment',
                type: 'POST',
                data: JSON.stringify({message: message, targetUser: targetUser, senderUser: senderUser, postId: postId}),
                contentType: 'application/json',
                processData: false,
                cache: false,
                success: function(data) {
                    if(data === 'success') {
                        alert('Comment Successfully Posted');
                        window.location = 'https://thekingdom.servebeer.com/public-profile-page?userProfile=' + targetUser;
                    }
                    else {
                        alert(data);
                        return;
                    }
                },
                error: function(err) {
                    alert('Error! ' + err.message);
                    return;
                }
            });
        }
    });

    $('body').on('click', '.like-btn', function() {
        let postId = $(this).data('id');
        let targetUser = $('body').data('priv');
        let senderUser = $('body').data('cur');
        $.ajax({
            url: '/handle-public-like',
            type: 'POST',
            data: JSON.stringify({postId: postId, targetUser: targetUser, senderUser: senderUser}),
            contentType: 'application/json',
            processData: false,
            cache: false,
            success: function(data) {
                if(data === 'liked') {
                    alert('Post Successfully Liked!');
                    window.location = '/public-profile-page?userProfile=' + targetUser;
                }
                else if(data === 'unliked') {
                    alert('Post Successfully Unliked!');
                    window.location = '/public-profile-page?userProfile=' + targetUser;
                }
                else {
                    alert(data);
                    return;
                }
            },
            error: function(err) {
                alert('Error! ' + err.message);
            }
        });
    });
});