$(document).ready(function() {
    $('#text-post-btn').on('click', function() {
        var txt = $('#text-post').val();
        if(txt) {
            var time = new Date();
            var month = time.getMonth() + 1;
            var day = time.getDate();
            var year = time.getFullYear();
            var dateString =  `${month}-${day}-${year}`;
            var username = $('body').data('username');
            $.ajax({
                url: "https://thekingdom.servebeer.com/handle-text-post",
                type: "POST",
                data: JSON.stringify({text: txt, date: dateString, username: username}),
                contentType: "application/json",
                processData: false,
                cache: false,
                success: function(data) {
                    if(data === "session expired") {
                        alert("Session Expired. Sign In");
                        window.location = "https://thekingdom.servebeer.com/sign-in";
                    }
                    else {
                        alert("Post Uploaded");
                        window.location = "https://thekingdom.servebeer.com/private-profile-page";
                    }
                },
                failure: function(data) {
                    alert("Failure Uploading Post");
                }
            });
        }
    });
    $('#photo-upload-btn').on('click', function() {
        var exts = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];
        var ext = $('#photo-post-pic').val().split('.').pop().toString();
        if($.inArray(ext, exts) === -1) {
            alert("Invalid Photo Type. Must be .png, .jpg, or .jpeg");
            return;
        }
        else {
            if($('#photo-post-caption').val().length > 1) {
                $('#photo-post').submit();
            }
            else {
                alert("Must add a photo caption!");
                return;
            }
        }
    });
    $('#video-upload-btn').on('click', function() {
        var exts = ['mov', 'mp4', 'MOV', 'MP4'];
        var ext = $('#video-post-video').val().split('.').pop().toString();
        if($.inArray(ext, exts) === -1) {
            alert("Invalid Video Type. Must Be .mov or .mp4");
            return;
        }
        else {
            if($('#video-post-caption').val()) {
                $('#video-post').submit();
            }
            else {
                alert("Must Enter A Caption For The Video");
                return;
            }
        }
    });

    $('.comment-btn').on('click', function() {
        let parent = $(this).parent();
        let superParent = parent.parent();
        let finalParent = superParent.parent();
        //alert(finalParent.data('id'));
    });

    $('form').on('click', '.commentBtn', function() {
        let message = $(this).siblings('.commentPost').val();
        let user = $('body').data('username');
        let postId = $(this).data('id');
        if(!message) {
            alert('Must Enter A Comment');
            return;
        }
        else {
            $.ajax({
                url: '/handle-private-comment',
                type: 'POST',
                data: JSON.stringify({message: message, user: user, postId: postId}),
                contentType: 'application/json',
                processData: false,
                cache: false,
                success: function(data) {
                    if(data === 'success') {
                        window.location = '/private-profile-page';
                    }
                    else {
                        alert(data);
                        return;
                    }
                },
                error: function(err) {
                    alert('Error!: ', err.message);
                }
            });
        }
    });

    $('.delete-post-btn').on('click', function() {
        let postId = $(this).data('id');
        let user = $('body').data('username');
        $.ajax({
            url: '/handle-delete-post',
            type: 'POST',
            data: JSON.stringify({'postId': postId, username: user}),
            contentType: 'application/json',
            processData: false,
            cache: false,
            success: function(data) {
                if(data === 'success') {
                    alert('Post Successsfully Deleted');
                    window.location = '/private-profile-page';
                }
                else {
                    alert(data);
                    return;
                }
            },
            error: function(err) {
                alert('Error!:', err.message);
                return;
            }
        });
    });

    $('.like-btn').on('click', function() {
        let postId = $(this).data('id');
        let user = $('body').data('username');
        $.ajax({
            url: '/handle-private-like',
            type: 'POST',
            data: JSON.stringify({postId: postId, username: user}),
            contentType: 'application/json',
            processData: false,
            cache: false,
            success: function(data) {
                if(data === 'liked') {
                    alert('Post Successfully Liked');
                    window.location = '/private-profile-page';
                }
                else if (data === 'unliked') {
                    alert('Post Successfully Unliked');
                    window.location = '/private-profile-page';
                }
                else {
                    alert(data);
                    return;
                }
            },
            error: function(err) {
                alert('Error!:', err.message);
            }
        });
    });

    $('#user-search-btn').on('click', function() {
        if(!$('#searchInput').val()) {
            alert('Must Enter A Username To Search!');
            return;
        }
        else {
            let searchName = $('#searchInput').val();
            let userSearching = $('body').data('username');
            $.ajax({
                url: '/handle-user-search',
                type: 'POST',
                data: JSON.stringify({searcher: userSearching, searchName: searchName}),
                contentType: 'application/json',
                processData: false,
                cache: false,
                success: function(data) {
                    if(data === 'could not find user') {
                        alert('Could Not Find That User. Try Another Username!');
                        return;
                    }
                    else { 
                        window.location = '/public-profile-page?userProfile=' + data;
                    }
                },
                error: function(data) {
                    alert('There Was An Error When Searching! Try Again!');
                }
            });
        }
    });
});