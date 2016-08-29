$(document).ready(function () {

    $("#submit").click(function () {

        var json_str = '';

        $(".p-item").each(function () {
            var symbol = $(this).find(".symbol").val();
            var shares = $(this).find(".shares").val();
            var price = $(this).find(".price").val();
            var date = $(this).find(".date").val();
            if (price !== "" && price !== null) {
                json_str += '{"symbol":"' + symbol + '","shares":' + shares + ',"price":' + price + ',"date":"' + date + '"},';
            }
        });

        $.ajax({
            type: 'GET',
            url: 'http://rolldown-computers.site/php/stock/addPort.php',
            data: {
                id: 1,
                list: JSON.stringify(json_str.slice(0, -1)) // remove last comma
            },
            crossDomain: true,
            processData: true,
            success: function (json) {
                alert(json);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Error: " + jqXHR.responseText);
                alert("Error: " + textStatus);
                alert("Error: " + errorThrown);
            }
        });
    });

    $("#add-stock").click(function () {
        $(".p-item").clone().appendTo($("#stock-inputs"));
    });
});