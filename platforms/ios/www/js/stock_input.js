$(document).ready(function () {

    $("#submit").click(function () {
        localStorage.setItem('symbol', $("#stock").val());
        window.location = "stock.html";
    });
});


