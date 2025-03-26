$(function () {
    $('#logout').click(function () {
        $.ajax({
            url: "/logout",
            type: "POST",
        }).done(function (response) {
            if (response.status == "ERR") {
                var err = JSON.parse(response.error);
                $('#errorContainer').append(err.sender + ': ' + err.message);
            } else {
                document.location.href = "/login";
            }
        }).fail(function (xhr, status, errorThrown) {
            //console.log( "Error: " + errorThrown );
            //console.log( "Status: " + status );
            //console.dir( xhr );
        }).always(function (xhr, status) {

        });
    });
})
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});