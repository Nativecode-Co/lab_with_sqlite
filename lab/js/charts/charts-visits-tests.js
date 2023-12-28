/*
    ===================================
             الدوال المساعدة 
    ===================================
*/
/*
    ===================================
        البيانات المستخدمه 
    ===================================
*/

let static = exce(`select Count(*) as count from visits_tests where YEAR(insert_record_date) = YEAR(CURRENT_DATE()) and is_done=0;
select Count(*) as count from visits_tests where YEAR(insert_record_date) = YEAR(CURRENT_DATE()) and is_done=1;
select Count(*) as count from visits_tests where MONTH(insert_record_date)= MONTH(CURDATE()) AND YEAR(insert_record_date) = YEAR(CURRENT_DATE()) and is_done=0;
select Count(*) as count from visits_tests where MONTH(insert_record_date)= MONTH(CURDATE()) AND YEAR(insert_record_date) = YEAR(CURRENT_DATE()) and is_done=1;
select Count(*) as count from visits_tests where DATE(insert_record_date) = DATE(NOW()) and is_done=0;
select Count(*) as count from visits_tests where DATE(insert_record_date) = DATE(NOW()) and is_done=1;`).result;
// let query = exce(`SELECT count(*) as count FROM lab.visits where visit_date BETWEEN  DATE_SUB(NOW(), INTERVAL 4 DAY) AND NOW() group by (visit_date);
// SELECT count(*) as count ,visit_date  FROM lab.visits where visit_date BETWEEN  DATE_SUB(NOW(), INTERVAL 4 DAY) AND NOW() and ispayed=1 group by (visit_date);
// SELECT count(*) as count ,year(visit_date) as 'y' , month(visit_date) as 'm'  FROM lab.visits where visit_date BETWEEN  DATE_SUB(NOW(), INTERVAL 4 Month) AND NOW() group by y,m;
// SELECT count(*) as count ,year(visit_date) as 'y' , month(visit_date) as 'm'  FROM lab.visits where visit_date BETWEEN  DATE_SUB(NOW(), INTERVAL 4 Month) AND NOW() and ispayed=1 group by y,m;
// SELECT count(*) as count ,year(visit_date) as 'y' , month(visit_date) as 'm'  FROM lab.visits where visit_date BETWEEN  DATE_SUB(NOW(), INTERVAL 12 Month) AND NOW() group by y,m;
// SELECT count(*) as count ,year(visit_date) as 'y' , month(visit_date) as 'm'  FROM lab.visits where visit_date BETWEEN  DATE_SUB(NOW(), INTERVAL 12 Month) AND NOW() and ispayed=1 group by y,m;`);
// console.log(get_arr_of_data(query.result[0].query0));

/*
    ===================================
        Draw Charts Script
    ===================================
*/
if (Cookies.getCookie('dark_mode') != "") {
    var options_1 = {
        chart: {
            type: 'donut',
            width: '100%',
            height: 300
        },
        colors: ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'],
        dataLabels: {
            enabled: false
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            markers: {
                width: 10,
                height: 10,
            },
            itemMargin: {
                horizontal: 0,
                vertical: 8
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '29px',
                            fontFamily: 'Nunito, sans-serif',
                            color: undefined,
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '26px',
                            fontFamily: 'Nunito, sans-serif',
                            color: '#bfc9d4',
                            offsetY: 16,
                            formatter: function(val) {
                                return val
                            }
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'هذا العام',
                            color: '#888ea8',
                            formatter: function(w) {
                                return w.globals.seriesTotals.reduce(function(a, b) {
                                    return a + b
                                }, 0)
                            }
                        }
                    }
                }
            }
        },
        stroke: {
            show: true,
            width: 25,
            colors: '#0e1726'
        },
        series: [parseInt(static[0].query0[0].count), parseInt(static[1].query1[0].count)],
        labels: ['انتظار', 'اكتمل']
    }
} else {

    var options_1 = {
        chart: {
            type: 'donut',
            width: '100%',
            height: 300
        },
        colors: ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'],
        dataLabels: {
            enabled: false
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            markers: {
                width: 10,
                height: 10,
            },
            itemMargin: {
                horizontal: 0,
                vertical: 8
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '29px',
                            fontFamily: 'Nunito, sans-serif',
                            color: undefined,
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '26px',
                            fontFamily: 'Nunito, sans-serif',
                            color: '20',
                            offsetY: 16,
                            formatter: function(val) {
                                return val
                            }
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'هذا العام',
                            color: '#888ea8',
                            formatter: function(w) {
                                return w.globals.seriesTotals.reduce(function(a, b) {
                                    return a + b
                                }, 0)
                            }
                        }
                    }
                }
            }
        },
        stroke: {
            show: true,
            width: 25,
        },
        series: [parseInt(static[0].query0[0].count), parseInt(static[1].query1[0].count)],
        labels: ['انتظار', 'اكتمل'],

    }

}
if (Cookies.getCookie('dark_mode') != "") {
    var options_2 = {
        chart: {
            type: 'donut',
            width: '100%',
            height: 300
        },
        colors: ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'],
        dataLabels: {
            enabled: false
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            markers: {
                width: 10,
                height: 10,
            },
            itemMargin: {
                horizontal: 0,
                vertical: 8
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '29px',
                            fontFamily: 'Nunito, sans-serif',
                            color: undefined,
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '26px',
                            fontFamily: 'Nunito, sans-serif',
                            color: '#bfc9d4',
                            offsetY: 16,
                            formatter: function(val) {
                                return val
                            }
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'هذا الشهر',
                            color: '#888ea8',
                            formatter: function(w) {
                                return w.globals.seriesTotals.reduce(function(a, b) {
                                    return a + b
                                }, 0)
                            }
                        }
                    }
                }
            }
        },
        stroke: {
            show: true,
            width: 25,
            colors: '#0e1726'
        },
        series: [parseInt(static[2].query2[0].count), parseInt(static[3].query3[0].count)],
        labels: ['انتظار', 'اكتمل']
    }
} else {

    var options_2 = {
        chart: {
            type: 'donut',
            width: '100%',
            height: 300
        },
        colors: ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'],
        dataLabels: {
            enabled: false
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            markers: {
                width: 10,
                height: 10,
            },
            itemMargin: {
                horizontal: 0,
                vertical: 8
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '29px',
                            fontFamily: 'Nunito, sans-serif',
                            color: undefined,
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '26px',
                            fontFamily: 'Nunito, sans-serif',
                            color: '20',
                            offsetY: 16,
                            formatter: function(val) {
                                return val
                            }
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'هذا الشهر',
                            color: '#888ea8',
                            formatter: function(w) {
                                return w.globals.seriesTotals.reduce(function(a, b) {
                                    return a + b
                                }, 0)
                            }
                        }
                    }
                }
            }
        },
        stroke: {
            show: true,
            width: 25,
        },
        series: [parseInt(static[2].query2[0].count), parseInt(static[3].query3[0].count)],
        labels: ['انتظار', 'اكتمل'],

    }

}
if (Cookies.getCookie('dark_mode') != "") {
    var options_3 = {
        chart: {
            type: 'donut',
            width: '100%',
            height: 300
        },
        colors: ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'],
        dataLabels: {
            enabled: false
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            markers: {
                width: 10,
                height: 10,
            },
            itemMargin: {
                horizontal: 0,
                vertical: 8
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '29px',
                            fontFamily: 'Nunito, sans-serif',
                            color: undefined,
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '26px',
                            fontFamily: 'Nunito, sans-serif',
                            color: '#bfc9d4',
                            offsetY: 16,
                            formatter: function(val) {
                                return val
                            }
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'اليوم',
                            color: '#888ea8',
                            formatter: function(w) {
                                return w.globals.seriesTotals.reduce(function(a, b) {
                                    return a + b
                                }, 0)
                            }
                        }
                    }
                }
            }
        },
        stroke: {
            show: true,
            width: 25,
            colors: '#0e1726'
        },
        series: [parseInt(static[4].query4[0].count), parseInt(static[5].query5[0].count)],
        labels: ['انتظار', 'اكتمل']
    }
} else {

    var options_3 = {
        chart: {
            type: 'donut',
            width: '100%',
            height: 300
        },
        colors: ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'],
        dataLabels: {
            enabled: false
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            markers: {
                width: 10,
                height: 10,
            },
            itemMargin: {
                horizontal: 0,
                vertical: 8
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '29px',
                            fontFamily: 'Nunito, sans-serif',
                            color: undefined,
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '26px',
                            fontFamily: 'Nunito, sans-serif',
                            color: '20',
                            offsetY: 16,
                            formatter: function(val) {
                                return val
                            }
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'اليوم',
                            color: '#888ea8',
                            formatter: function(w) {
                                return w.globals.seriesTotals.reduce(function(a, b) {
                                    return a + b
                                }, 0)
                            }
                        }
                    }
                }
            }
        },
        stroke: {
            show: true,
            width: 25,
        },
        series: [parseInt(static[4].query4[0].count), parseInt(static[5].query5[0].count)],
        labels: ['انتظار', 'اكتمل'],

    }

}


/*
    ===================================
        Render Charts Script
    ===================================
*/

// paid Visits
var d_2C_1 = new ApexCharts(document.querySelector("#chart-1"), options_1);
d_2C_1.render();
var d_2C_2 = new ApexCharts(document.querySelector("#chart-2"), options_2);
d_2C_2.render();
var d_2C_3 = new ApexCharts(document.querySelector("#chart-3"), options_3);
d_2C_3.render();