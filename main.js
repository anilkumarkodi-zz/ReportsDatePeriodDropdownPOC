$(document).ready(function () {
    var hidePageAction = function () {
        $(".page-action-wrapper").hide();
    };

    hidePageAction();

    $("#templateSelection").unbind("change").change(function() {
        hidePageAction();
    });
});