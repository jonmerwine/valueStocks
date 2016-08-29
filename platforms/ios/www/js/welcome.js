$(document).ready(function () {

    localStorage.setItem("query", "");
    adjustScreen();
    $(window).resize(function () {
        adjustScreen();
    });
});

function adjustScreen() {
    $(".tile").height($(window).height() * 0.8);
    $(".tile-img").height($(window).width() * 0.4);
    $(".tile-img").width($(window).width() * 0.4);
    $("#main").height($(window).height());
    $("#myCarousel").height($(window).height());
    $("#myCarousel div .item").height($(window).height());
    $(".carousel-caption").show();
}


