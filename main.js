$(document).ready(function () {
    var hidePageAction = function () {
        $(".page-action-wrapper").hide();
    };

    hidePageAction();

    $("#templateSelection").unbind("change").change(function() {
        hidePageAction();
    });

    $('#backToTop').unbind("click").click(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
        return false;
    });
});