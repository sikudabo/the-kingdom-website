$(document).ready(function() {
    const socket = io();

    $('#submitBtn').on('click', function() {
        let msg = $('#msgInput').val();
        if(!msg) {
            alert('Must Enter A Message To Send');
            return;
        }
        else {
            socket.emit('sentMsg', {
                username: $('body').data('id'),
                msg: msg
            });
            $('#msgInput').val('');
        }
    });

    socket.on('sentMsg', data => {
        let username = data.username;
        let msg = data.msg;
        let avatar = data.avatar;
        displayMsg(msg, username, avatar);
    });

    function displayMsg(msg, username, avatar) {
        $('#msgList').append(`<li class='list-item media'><img src="${avatar}" class='rounded-circle mr-3' height="64" width="64"><div class="media-body"><h3 class="font-weight-bold">${username}</h3><p class="font-weight-bold">${msg}</p></div></li><hr><br>`);
    }
});