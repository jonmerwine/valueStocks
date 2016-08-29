var stock_data = {};
var map = {};
var values = {};
stock_data.symbol = [];
stock_data.shares = [];
stock_data.price = [];
stock_data.date = [];

var total_cost = 0;
var total_value = 0;

$(document).ready(function () {

    $.ajax({
        type: 'GET',
        url: 'http://rolldown-computers.site/php/stock/getPortData.php',
        data: {
            id: 1
        },
        crossDomain: true,
        processData: true,
        dataType: "json",
        success: function (json) {
            var data = $.parseJSON(json);
            var html = '';
            var k = 0;
            $.each(data["stocks"], function (i, item) {
                html += '<div class="row">';
                $.each(item, function (key, val) {
                    html += '<div class="col-lg-3 col-xs-3">' + val + '</div>';
                    stock_data[key][k] = val;
                });
                k++;
                html += '</div>';
            });
            getStockData();
            getStockQuote();
            setTimeout(afterQuotes, 400);
            $("#stock").append(html);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error: " + jqXHR.responseText);
            alert("Error: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
});

function afterQuotes() {
    $("#overview").text(total_value + " - " + total_cost + " = " + (total_value - total_cost).toFixed(2));
    var data = [];
    $.each(values, function (key, item) {
        data.push(item);
    });
    $(function () {
        $('#stock-breakdown').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Portfolio Breakdown'
            },
            tooltip: {
                pointFormat: 'Shares: <b>{point.shares}</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f}% - ${point.y:.2f}',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                    name: 'Stock',
                    colorByPoint: true,
                    data: data
                }]
        });
    });
}

function getStockQuote() {
    $.each(map, function (symbol, item) {
        var url = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%3D%22' + symbol + '%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
        $.getJSON(url, function (data) {
            total_value += map[data.query.results.quote.Symbol].shares * data.query.results.quote.LastTradePriceOnly;
            values[data.query.results.quote.Symbol] = {"name": data.query.results.quote.Symbol, "y": map[data.query.results.quote.Symbol].shares * data.query.results.quote.LastTradePriceOnly, "shares": map[data.query.results.quote.Symbol].shares};
        });
    });
}

function getStockData() {
    for (var i = 0; i < stock_data.symbol.length; i++) {
        var current_amount = stock_data.price[i] * stock_data.shares[i];
        total_cost += current_amount;
        if (typeof map[stock_data.symbol[i]] === 'undefined') {
            map[stock_data.symbol[i]] = {"shares": stock_data.shares[i], "amount": current_amount};
        }
        else
            map[stock_data.symbol[i]] = {"shares": map[stock_data.symbol[i]].shares + stock_data.shares[i], "amount": map[stock_data.symbol[i]].amount + current_amount};
    }
    total_cost = total_cost.toFixed(2);
}

