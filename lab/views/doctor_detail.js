'use strict';

// jQuery Elements
const pageName = $('.doctor-name'),
    header = $('#doctor_header'),
    body = $('#doctor_body');

// Patient History IDS
const urlParams = new URLSearchParams(window.location.search),
    doctorHash = urlParams.get('doctor');

let data = exce(`select name,commission from doctor where hash=${doctorHash};
                 select name,visit_date,net_price from visits where doctor_hash=${doctorHash} and net_price<>'0';`)

let doctor = data.result[0].query0[0],
    visits = data.result[1].query1;

$(document).ready(function () {
    pageName.html(`د / ${doctor.name}`);
    header.append(
        `
        <tr>
            <th>اسم المريض</th>
            <th>تاريخ الزيارة</th>
            <th>فاتورة الزيارة</th>
            <th>نسبة الطبيب</th>
            <th></th>
            <th></th>
        </tr>
        `
    );

    for (let visit of visits) {
        body.append(
            `
            <tr>
                <td>${visit.name}</td>
                <td>${visit.visit_date}</td>
                <td>${parseInt(visit.net_price)?.toLocaleString()} IQD </td>
                <td>${(parseInt(visit.net_price) * (doctor.commission / 100))?.toLocaleString()} IQD </td>
                <td></td>
                <td></td>
            </tr>
            `
        );
    }
    setTable();

})


