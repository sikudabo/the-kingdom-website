$(document).ready(function() {
    $('.list-link').addClass('font-weight-bold text-dark');

    $('.list-link').on('click', function() {
        let userAttribute = $(this).data('id');
        window.location = '/user-settings-update?update=' + userAttribute;
    })
});