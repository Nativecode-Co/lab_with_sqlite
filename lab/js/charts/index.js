// SELECT sum(total_price) as count ,year(visit_date) as 'y' , monthname(visit_date) as 'm'  FROM unimedica_db.lab_visits where visit_date BETWEEN  DATE_SUB(NOW(), INTERVAL 6 Month) AND NOW() and ispayed=1 group by y,m;
// SELECT sum(total_price) as count,dayname(visit_date) as 'd' FROM unimedica_db.lab_visits where visit_date BETWEEN  DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW() and ispayed=1 group by (visit_date);

let data = run(`SELECT 
                    sum(total_price) as count,
                    year(visit_date) as 'y' ,
                    month(visit_date) as 'm'  
                    FROM 
                        unimedica_db.lab_visits 
                    inner join 
                        lab_patient 
                    on 
                        lab_patient.hash = lab_visits.visits_patient_id
                    where 
                        lab_id=50 and 
                        visit_date BETWEEN  DATE_SUB(NOW(), INTERVAL 6 Month) AND NOW() 
                    group
                        by y,m;
                    select 
                        name,
                        sum(lab_visits_package.price) as total_price,
                        lab_id,
                        Count(*) as count
                    from 
                        lab_visits_package
                    inner join
                        lab_package
                    on
                        lab_package.hash = lab_visits_package.package_id
                    where
                        lab_id='${localStorage.getItem('lab_hash')}' and 
                        lab_package.catigory_id=9
                    group by name;
                    select 
                        name,
                        sum(lab_visits_package.price) as total_price,
                        lab_id,
                        Count(*) as count
                    from 
                        lab_visits_package
                    inner join
                        lab_package
                    on
                        lab_package.hash = lab_visits_package.package_id
                    where
                        lab_id='${localStorage.getItem('lab_hash')}' and 
                        lab_package.catigory_id=8
                    group by name;`
                );

let incomes = data.result[0].query0;
let tests = data.result[1].query1;
let packages = data.result[2].query2;

// dom ready
$(function() {
    for(test of tests){
        $('#tests-solid').append(`
            <tr>
                <td><p class="prd-name">${test.name}</p></td>
                <td><div class=""><span class="pricing">${test.total_price} IQD</span></div></td>
                <td><div class=""><span class="discount-pricing">${test.count}</span></div></td>
            </tr>
        `);
    }
    for(test of packages){
        $('#packages-solid').append(`
            <tr>
                <td><p class="prd-name">${test.name}</p></td>
                <td><div class=""><span class="pricing">${test.total_price} IQD</span></div></td>
                <td><div class=""><span class="discount-pricing">${test.count}</span></div></td>
            </tr>
        `);
    }
});

const MONTHSINCOMES = [
    incomes.find(x=>x.m==1)?.count||0 ,
    incomes.find(x=>x.m==2)?.count||0 ,
    incomes.find(x=>x.m==3)?.count||0 ,
    incomes.find(x=>x.m==4)?.count||0 ,
    incomes.find(x=>x.m==5)?.count||0 ,
    incomes.find(x=>x.m==6)?.count||0 ,
    incomes.find(x=>x.m==7)?.count||0 ,
    incomes.find(x=>x.m==8)?.count||0 ,
    incomes.find(x=>x.m==9)?.count||0 ,
    incomes.find(x=>x.m==10)?.count||0 ,
    incomes.find(x=>x.m==11)?.count||0 ,
    incomes.find(x=>x.m==12)?.count||0
];

var options1 = {
    chart: {
        fontFamily: 'Nunito, sans-serif',
        height: 365,
        type: 'area',
        zoom: {
            enabled: false
        },
        dropShadow: {
            enabled: true,
            opacity: 0.3,
            blur: 5,
            left: -7,
            top: 22
        },
        toolbar: {
            show: false
        },
        events: {
            mounted: function(ctx, config) {
                const highest1 = ctx.getHighestValueInSeries(0);
                const highest2 = ctx.getHighestValueInSeries(1);

                ctx.addPointAnnotation({
                    x: new Date(ctx.w.globals.seriesX[0][ctx.w.globals.series[0].indexOf(highest1)]).getTime(),
                    y: highest1,
                    label: {
                        style: {
                            cssClass: 'd-none'
                        }
                    },
                    customSVG: {
                        SVG: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#1b55e2" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
                        cssClass: undefined,
                        offsetX: -8,
                        offsetY: 5
                    }
                })

                ctx.addPointAnnotation({
                    x: new Date(ctx.w.globals.seriesX[1][ctx.w.globals.series[1].indexOf(highest2)]).getTime(),
                    y: highest2,
                    label: {
                        style: {
                            cssClass: 'd-none'
                        }
                    },
                    customSVG: {
                        SVG: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#e7515a" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
                        cssClass: undefined,
                        offsetX: -8,
                        offsetY: 5
                    }
                })
            },
        }
    },
    colors: ['#1b55e2', '#e7515a'],
    dataLabels: {
        enabled: false
    },
    markers: {
        discrete: [{
            seriesIndex: 0,
            dataPointIndex: 7,
            fillColor: '#000',
            strokeColor: '#000',
            size: 5
        }, {
            seriesIndex: 2,
            dataPointIndex: 11,
            fillColor: '#000',
            strokeColor: '#000',
            size: 4
        }]
    },
    stroke: {
        show: true,
        curve: 'smooth',
        width: 2,
        lineCap: 'square'
    },
    series: [{
        name: 'المداخيل',
        data: MONTHSINCOMES
    }],
    labels: ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'],
    xaxis: {
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false
        },
        crosshairs: {
            show: true
        },
        labels: {
            offsetX: 0,
            offsetY: 5,
            style: {
                fontSize: '12px',
                fontFamily: 'Nunito, sans-serif',
                cssClass: 'apexcharts-xaxis-title',
            },
        }
    },
    yaxis: {
        labels: {
            formatter: function(value, index) {
                // return (value / 1000) + 'K'
                return value
            },
            offsetX: -25,
            offsetY: 0,
            style: {
                fontSize: '12px',
                fontFamily: 'Nunito, sans-serif',
                cssClass: 'apexcharts-yaxis-title',
            },
        }
    },
    grid: {
        borderColor: '#e0e6ed',
        strokeDashArray: 5,
        xaxis: {
            lines: {
                show: true
            }
        },
        yaxis: {
            lines: {
                show: false,
            }
        }
    },
    legend: {
        position: 'top',
        horizontalAlign: 'right',
        offsetY: -50,
        fontSize: '16px',
        fontFamily: 'Nunito, sans-serif',
        markers: {
            width: 10,
            height: 10,
            strokeWidth: 0,
            strokeColor: '#fff',
            fillColors: undefined,
            radius: 12,
            onClick: undefined,
            offsetX: 0,
            offsetY: 0
        },
        itemMargin: {
            horizontal: 0,
            vertical: 20
        }
    },
    tooltip: {
        theme: 'dark',
        marker: {
            show: true,
        },
        x: {
            show: false,
        }
    },
    fill: {
        type: "gradient",
        gradient: {
            type: "vertical",
            shadeIntensity: 1,
            inverseColors: !1,
            opacityFrom: .28,
            opacityTo: .05,
            stops: [45, 100]
        }
    },
    responsive: [{
        breakpoint: 575,
        options: {
            legend: {
                offsetY: -30,
            },
        },
    }]
}

var chart1 = new ApexCharts(
    document.querySelector("#revenueMonthly"),
    options1
);

chart1.render();