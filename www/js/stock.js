var dates = [];
var amounts = [];
var years = [];
var eps = [];
var db_labels = ["current_ratio", "graham_number", "price_per_bv",
    "liquidity", "eps_growth", "pe_ttm", "metric_1",
    "metric_2", "sales", "shares", "ncav"];

$(document).ready(function () {
    var sym = localStorage.getItem('symbol');
    $.ajax({
        type: 'POST',
        url: 'http://rolldown-computers.site/php/stock/getStockDetails.php',
        data: {
            data: sym
        },
        crossDomain: true,
        processData: true,
        success: function (json) {
            var tbl = "";
            var data = $.parseJSON(json);
            $.each(data, function (i, item) {
                $.each(item, function (_, o) {
                    tbl += modalBuilder(_, o);
                });
            });
            $("#stock-data").html(tbl);
            divChart();
            epsChart();

        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error: " + jqXHR.responseText);
            alert("Error: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
});

function modalBuilder(label, value) {
    var tbl = "";
    var div = "";

    if (label === "dividends") {

        div = $.parseJSON(value);
        for (var i = 0; i < div["dates"].length; i++) {
            dates[i] = div["dates"][i][0];
            amounts[i] = parseFloat(div["amounts"][i]);
        }
    }
    else if (label === "all_eps") {

        div = $.parseJSON(value);
        var i = 0;
        var year = "year1";
        while (typeof div[year] !== 'undefined') {
            years[i] = (i + 1) + " year(s) ago";
            eps[i] = parseFloat(div[year]);
            i++;
            year = "year" + (i + 1);
        }
    }
    else if (label === "symbol") {
        $(".symbol").text(value);
    }
    else if (label === "price") {
        $(".price").text(value);
    }
    else if ($.inArray(label, db_labels) > -1) {
        label = label.replace("_", " ").toUpperCase();
        tbl += "<tr>";
        tbl += "<td>" + label + "</td><td>" + value + "</td>"
        tbl += "</tr>";
    }
    return tbl;
}

function divChart() {
    $('#dividends').highcharts({
        chart: {
            type: 'line'
        },
        xAxis: {
            categories: dates
        },
        title: {
            text: 'Dividend History'
        },
        series: [{
                name: "Dividends",
                data: amounts
            }],
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return Highcharts.numberFormat(this.y, 2);
                    }
                },
                enableMouseTracking: false
            }
        }
    });
}

function epsChart() {
    $('#eps').highcharts({
        chart: {
            type: 'line'
        },
        xAxis: {
            categories: years
        },
        title: {
            text: 'EPS History'
        },
        series: [{
                name: "EPS",
                data: eps
            }],
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return Highcharts.numberFormat(this.y, 2);
                    }
                },
                enableMouseTracking: false
            }
        }
    });
}

function goBack() {
    window.history.back();
}