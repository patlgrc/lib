/* -- [ test ] -- */
$(".test-item").click(function () {
    errors = [];
    errorIdx = 0;

    var t = $(this);
    $(".test-item").removeClass("active");
    var content = $(this).addClass("active").find(".test-contents").clone();
    $(".test-content-detail .detail-body").empty().append(content.removeClass("d-none"));

    /* -- [ show/hide expand/collapse all tests in view ] -- */
    if (t.find('.node').length == 0) {
        $('.ct, .et').addClass('d-none');
    } else {
        $('.ct, .et').removeClass('d-none');
    }

    /* -- [ hide next error navi if no errors present ] -- */
    if (t.attr("status").toLowerCase() == "pass") {
        $(".ne").addClass("d-none");
    } else {
        $(".ne").removeClass("d-none");
    }

    /* -- [ dynamically add base64 strings ] -- */
    // this is done to preserve space by avoiding double base64 writes to
    // the image itself, and the other for lightbox
    $(".test-content").scrollTop(0).find(".base64-img").each(function () {
        var t = $(this);
        t.children().attr("src", t.attr("href"));
    });
});

function hashChangeOrLoad() {
    var loc = window.location.href;
    if (loc.indexOf('?test-name') > 0 || loc.indexOf('#test-name') > 0) {
        var name = loc.match(/test-name.*/)[0].replace('test-name=', '');
        name = name.replace(/%22/g, '').replace(/%20/, ' ');
        $('.test-detail .name').filter(function () {
            return $(this).text() == name;
        }).closest('.test-item').click();
    }
    if (loc.indexOf('?test-id') > 0 || loc.indexOf('#test-id') > 0) {
        var id = loc.match(/test-id.*/)[0].replace('test-id=', '');
        $('.test-item').filter(function () {
            return $(this).attr('test-id') == id;
        }).click();
    }
    if (loc.indexOf('?theme') > 0 || loc.indexOf('#theme') > 0) {
        var name = loc.match(/theme.*/)[0].replace('theme=', '');
        $('body').addClass(name);
    }
}
$(window).on('hashchange', function (e) {
    hashChangeOrLoad();
});

$(document).ready(function () {
    if ($(".test-item").length) {
        $(".test-item").first().click();
    }

    // SPA only: hide all views except test on document load
    $(".main-content > .view").addClass("d-none").first().removeClass("d-none");

    // remove links for spa page
    // this prevents invalid navigation to external html files
    $(".spa .side-nav .nav-item>a").attr("href", "#");

    hashChangeOrLoad();
});

var errors = [];
var errorIdx = 0;

/* -- [ current test view/content ] -- */
$(".test-content").click(function (evt) {
    var tc = $(this);
    var target = $(evt.target);
    if (target.is(".card-header")) {
        target.next().toggleClass("collapse")
    }
    if (target.is(".card-title, .card-title *")) {
        var ch = target.closest(".card-header");
        ch.find(".node").toggleClass("collapsed");
        ch.next().toggleClass("collapse");
    }
    if (target.is("textarea") && !target.hasClass("maxxed")) {
        target.addClass("maxxed").height((target.prop("scrollHeight") - 8) + "px");
    }

    /* -- [ expand/collapse all tests in view ] -- */
    if (target.is(".et, .et *")) {
        tc.find(".node").removeClass("collapsed");
        tc.find(".card-header").next().removeClass("collapse");
    }
    if (target.is(".ct, .ct *")) {
        tc.find(".node").addClass("collapsed");
        tc.find(".card-header").next().addClass("collapse");
    }

    /* -- [ navigate to next error ] -- */
    if (target.is(".ne, .ne *")) {
        if (!errors.length) {
            $(tc).find(".log.fail-bg, .log.error-bg").each(function (idx, el) {
                errors.push($(el).offset().top);
            });
        }
        errorIdx = errorIdx >= errors.length ? 0 : errorIdx;
        tc.animate({
            scrollTop: errors[errorIdx++] - 60
        }, 200);
    }

    /* -- [ category view, status filters ] -- */
    if (target.is(".attributes-view .info > span")) {
        var status = target.attr("status");
        $(".test-content .tag-test-status").addClass("d-none");
        $(".test-content .tag-test-status[status=" + status + "]").removeClass("d-none");
    }

    /* -- [ attr view ] -- */
    if (target.is('.linked')) {
        var testId = t.attr('test-id');
        var id = t.attr('id');
        $('#nav-test').click();
        $('.test-item').filter(function () {
            return $(this).attr('test-id') == testId;
        }).click();
        setTimeout(function () {
            var card = $('.test-content-detail .node').filter(function () {
                return $(this).attr('id') == id;
            }).closest('.card');
            card.addClass('border-dark');
            card.find('.card-header').next().removeClass('collapse');
            setTimeout(function () {
                card.removeClass('border-dark');
            }, 1000);
        }, 200);
    }

    if (target.is('.uri-anchor')) {
        var url = window.location.href;
        if (url.indexOf('#') > 0)
            url = url.split('#')[0];
        window.location = url + $(target).text();
    }
});

/* ------------------------------------ */
/* filters */
/* ------------------------------------ */
/* -- [ status filters ] -- */
function toggleByStatus(status) {
    $('.test-item,.tag-test-status').removeClass('d-none');
    if (status != 'clear') {
        if (currentView == 'test-view') {
            $(".test-item[status!='" + status + "']").addClass('d-none');
        } else {
            $('.tag-test-status, .test-item').addClass('d-none');
            var els = $('.tag-test-status > td:first-child > span').filter(function () {
                return ($(this).text().toLowerCase() == status);
            });
            els.closest('.tag-test-status').removeClass('d-none');
            els.closest('.test-item').removeClass('d-none');
        }
    }
    selectFirst();
}
function selectFirst() {
    $("." + currentView + " .test-item:not(.d-none)").first().click();
}

$("#status-toggle>a").click(function () {
    var status = $(this).attr("status");
    toggleByStatus(status);
});

/* -- [ attribute filters ] -- */
function attrToggle(attr, value) {
    $(".test-item").addClass("d-none");
    $(".test-item[" + attr + "*='" + value + "']").removeClass("d-none");
    selectFirst();
}
$("#author-toggle>a").click(function () {
    attrToggle("author", $(this).text());
});
$("#device-toggle>a").click(function () {
    attrToggle("device", $(this).text());
});
$("#tag-toggle>a").click(function () {
    attrToggle("tag", $(this).text());
});

/* ------------------------------------ */
/* SPA side-nav */
/* ------------------------------------ */
var currentView = 'test-view';
function toggleView(v) {
    if ($(".spa").length && v !== currentView) {
        $(".main-content>*").addClass("d-none");
        $("." + v + ",.test-item").removeClass("d-none");
        $("." + v + " .test-item:not(.d-none)").first().click();
    }
    currentView = v;
}

/* ------------------------------------ */
/* search */
/* ------------------------------------ */
/* -- [ filter tests by text in test and categories view ] -- */
$(document).ready(function () {
    $('.test-list-item .test-item').dynamicTestSearch('#search-tests');
    $('.side-nav-menu>li:first-child').click();
});

$.fn.dynamicTestSearch = function (id) {
    var target = $(this);
    var searchBox = $(id);
    searchBox.off('keyup').on('keyup', function () {
        var val = searchBox.val().toLowerCase();
        if (val == '') {
            target.removeClass('d-none');
        } else {
            target.addClass('d-none').each(function () {
                var t = $(this);
                if (t.html().toLowerCase().indexOf(val) >= 0) {
                    t.removeClass('d-none');
                }
            });
        }
    });
    return target;
}

/* ------------------------------------ */
/* keyboard events */
/* ------------------------------------ */
function goToView(view) {
    $("#" + view).click();
}
function moveVert(dir) {
    if (dir === 'up')
        $('.test-item.active')
}
$(window).keydown(function (e) {
    var target = null, sibling = null;

    if ($('input').is(':focus') || $('.featherlight').length > 0) {
    } else {
        var target = $("." + currentView + " .test-item.active");
        var sibling = "." + currentView + " .test-item:not(.d-none)";
        if (!e.ctrlKey && !e.altKey && !e.shiftKey && e.which !== 91 && e.which !== 93 && e.which !== 224 && !e.metaKey && !e.which != 17) {
            if (target !== null) {
                (e.which === 40) && target.nextAll(sibling).first().click();
                (e.which === 38) && target.prevAll(sibling).first().click();
            }
            (e.which === 67) && goToView('nav-category');
            (e.which === 68) && goToView('nav-dashboard');
            (e.which === 88) && goToView('nav-exception');
            (e.which === 84) && goToView('nav-test');

            (e.which === 76) && $("body").toggleClass("dark");

            (e.which === 27) && toggleByStatus('clear');
            (e.which === 69) && toggleByStatus('error');
            (e.which === 70) && toggleByStatus('fail');
            (e.which === 80) && toggleByStatus('pass');
            (e.which === 83) && toggleByStatus('skip');
            (e.which === 87) && toggleByStatus('warning');
        }
    }
});

$(".lightsout").click(function () {
    $("body").toggleClass("dark");
});



/**************************/
/********  CHARTS  ********/
/**************************/


var options1 = {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 65,
    plugins: {
        title: {
            display: true,
            position: 'left',
            text: 'TESTS',
            color: '#aaaaaa',
            font: {
                size: 20,
                fontFamily: ["Segoe UI", "Arial"]
            }
        },
        legend: {
            display: true,
            position: 'right',
            fontFamily: ["Segoe UI", "Arial"],
            labels: {
                color: '#aaaaaa',
                boxWidth: 40,
                fontSize: 14,
                lineHeight: 1,
                padding: 5
            }
        }
    }
};

var options2 = {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 65,
    plugins: {
        title: {
            display: true,
            position: 'left',
            text: 'EXIGENCES',
            color: '#aaaaaa',
            font: {
                size: 18,
                fontFamily: ["Segoe UI", "Arial"]
            }
        },
        legend: {
            display: true,
            position: 'right',
            fontFamily: ["Segoe UI", "Arial"],
            labels: {
                color: '#aaaaaa',
                boxWidth: 40,
                fontSize: 14,
                lineHeight: 1,
                padding: 5
            }
        }
    }
};


function drawChart(ctx, config) {
    ctx.width = 100;
    ctx.height = 80;
    new Chart(ctx, config);
}


/* -- [ parent chart ] -- */
(function drawParentChart() {
    var config = {
        type: 'doughnut',
        data: {
            datasets: [{
                borderColor: 'transparent',
                data: [3, 1],
                backgroundColor: ["#00af00", "#F44336"]
            }],
            labels: ["Succès", "Echec"]
        },
        options: options1
    };

    var ctx = document.getElementById("parent-analysis").getContext('2d');
    drawChart(ctx, config);
})();


/* -- [ children chart ] -- */
(function drawChildChart() {
    var config = {
        type: 'doughnut',
        data: {
            datasets: [{
                borderColor: 'transparent',
                data: [2, 2],
                backgroundColor: ["#00af00", "#FF9800"]
            }],
            labels: ["Validée", "Non validée"]
        },
        options: options2
    };

    var ctx = document.getElementById("child-analysis").getContext('2d');
    drawChart(ctx, config);
})();




/* -- [ timeline ] -- */
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

(function drawTimelineChart() {
    if (typeof timeline !== "undefined") {
        var datasets = [];
        for (var key in timeline) {
            datasets.push({ label: key, data: [timeline[key]], backgroundColor: getRandomColor(), borderWidth: 1 });
        }
        var ctx = document.getElementById('timeline').getContext('2d');

        new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'point'
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                        gridLines: false
                    }],
                    yAxes: [{
                        stacked: true,
                        gridLines: false,
                        barThickness: 25
                    }]
                },
                legend: {
                    display: false
                }
            }
        });
    }
})();