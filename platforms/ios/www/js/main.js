var current_index = 0;
var page_limit = 30;
var results = 0;
var sort_bool = true;
var headers = ["symbol", "price", "graham_number", "pe_ttm", "eps_growth", "ncav"];
var minVal = -999999999999999;
var maxVal = 999999999999999;

$.fn.center = function () {
    this.css("position", "absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
            $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
            $(window).scrollLeft()) + "px");
    return this;
};

$(document).ready(function () {

    $(".query-items").each(function () {
        $(this).slider({
            min: -1000,
            max: 1000,
            range: true,
            value: -1000
        });
    });

    $(".query-items").each(function () {
        var vals = $(this).slider('getValue');
        $("#" + $(this).attr("id") + "-range").text("MIN: " + vals[0] + " MAX: " + vals[1]);

        $(this).on('change', function () {
            var vals = $(this).slider('getValue');
            $("#" + $(this).attr("id") + "-range").text("MIN: " + vals[0] + " MAX: " + vals[1]);
        });
    });

    $("#loading").center();
    $("#loading").show();
    var query = localStorage.getItem("query");
    if (query === "" || query === null || typeof query === 'undefined')
        query = "SELECT * FROM stock_data WHERE liquidity>0 and graham_number>0";
    getQueryData(query);

    $("#next").click(function () {
        nextResultSet(results, current_index, page_limit);
    });

    $("#prev").click(function () {
        nextResultSet(results, current_index - 2 * page_limit, page_limit);
    });

    $("th").click(function () {
        sortResults($(this).attr("class"), sort_bool);
        nextResultSet(results, current_index - page_limit, page_limit);
    });

    $("#submit").click(function () {

        localStorage.setItem("query", "");
        var clause = "";

        $(".query-items").each(function () {
            var id = $(this).attr("id");
            var vals = $(this).slider('getValue');
            clause += id + " BETWEEN " + vals[0] + " AND " + vals[1] + " AND ";
        });
        clause = clause.slice(0, -4);
        clause = "SELECT * FROM stock_data WHERE " + clause;
        localStorage.setItem("query", clause);
        $("#loading").show();
        getQueryData(clause);
        $('#filter-modal').modal('toggle');
    });
});


function convertUndefined(num, str) {
    if ((typeof num === 'undefined' || num === "") && str.indexOf('-min') > -1) {
        return minVal;
    }
    else if ((typeof num === 'undefined' || num === "") && str.indexOf('-max') > -1) {
        return maxVal;
    }
    else
        return num;
}


function nextResultSet(results, index, num) {

    if (index < 0) {
        index = 0;
    }
    if (index > results.length)
    {
        index = index - num;
    }

    removeData();
    var trHTML = '';
    trHTML += '<tbody class="temp">';

    $.each(results, function (i, item) {
        if (i >= index && i < num + index) {
            trHTML += '<tr class="row-tr" data-toggle="modal" data-target="#myModal">';
            $.each(item, function (_, o) {
                if ($.inArray(_, headers) > -1) {
                    if ($.isNumeric(parseFloat(o))) {
                        trHTML += '<td>' + (parseFloat(o)).toFixed(3) + '</td>';
                    } else
                        trHTML += '<td>' + o + '</td>';
                }
            });
            trHTML += '</tr>';
        }
    });
    current_index = index + num;
    trHTML += '</tbody>';
    $('#screen').append(trHTML).trigger('create');

    $(".row-tr").click(function () {
        localStorage.setItem('symbol', $(this).find(':first-child').text());
        window.location = "stock.html";
    });
}

function modalBuilder(label, value) {
    var tbl = "";
    var div = "";

    if (label === "dividends") {

        div = $.parseJSON(value);
        for (var i = 0; i < div["dates"].length; i++) {
            tbl += "<tr>";
            tbl += "<td>" + div["dates"][i][0] + "</td><td>" + div["amounts"][i] + "</td>"
            tbl += "</tr>";
        }
        $("#div-tbl").html(tbl);
        tbl = "<tr><td>Dividends</td><td><button data-toggle='modal' data-target='#dividends' type='button' class='btn btn-lg btn-primary'>View</button><td></tr>";
    }
    else {
        tbl += "<tr>";
        tbl += "<td>" + label + "</td><td>" + value + "</td>"
        tbl += "</tr>";
    }
    return tbl;
}

function setModalData(symbol) {

    $.ajax({
        type: 'POST',
        url: 'http://rolldown-computers.site/php/stock/getStockDetails.php',
        data: {
            data: symbol
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
            $("#modal-tbl").html(tbl);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error: " + jqXHR.responseText);
            alert("Error: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

function removeData()
{
    $(".temp").remove();
}

function setPageNumbers(length, num) {
    var data = '';
    var count = 1;
    for (var i = 0; i < length; i = i + num) {
        data += '<td><button class="index-page btn-primary" >';
        data += count;
        data += '</button></td>';
        count++;
    }
    data += '</tr>';
    $('#pages').append(data).trigger('refresh').trigger('create');

    $(".index-page").click(function () {
        $(".index-page").css({
            "background-color": "white",
            "color": "#019875"
        });
        $(this).css({
            "background-color": "#019875",
            "color": "white"
        });
        nextResultSet(results, ($(this).text() - 1) * page_limit, page_limit);
    });
}

function sortResults(prop, asc) {
    if (sort_bool === true) {
        sort_bool = false;
    } else {
        sort_bool = true;
    }

    results = results.sort(function (a, b) {
        if ($.isNumeric(parseFloat(a[prop]))) {
            var num1 = parseFloat(a[prop]);
            var num2 = parseFloat(b[prop]);
            if (asc) {
                return (num1 > num2) ? 1 : ((num1 < num2) ? -1 : 0);
            } else {
                return (num2 > num1) ? 1 : ((num2 < num1) ? -1 : 0);
            }
        }
        else {
            if (asc) {
                return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
            } else {
                return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
            }
        }
    });
}

function getQueryData(queryString) {

    $.ajax({
        type: 'POST',
        url: 'http://rolldown-computers.site/php/stock/getQueryResults.php',
        data: {
            data: queryString
        },
        crossDomain: true,
        processData: true,
        success: function (json) {
            results = $.parseJSON(json);
            //setPageNumbers(results.length, page_limit);
            nextResultSet(results, current_index, page_limit);
            $("#loading").hide();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error: " + jqXHR.responseText);
            alert("Error: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}