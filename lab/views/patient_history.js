"use strict";

const THEME = new PackageTestTheme();

const urlParams = new URLSearchParams(window.location.search),
  patientHash = urlParams.get("patient");

// id, lab_id, name, address, age_year, age_month, birth, gender, phone, user_id, hash, insert_record_date, isdeleted
let allData =
  run(`select name, birth, gender, phone from lab_patient where hash='${patientHash}';
                    select
                        (select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor_name,
                        net_price, visit_date, dicount,hash
                    from lab_visits where visits_patient_id='${patientHash}' and isdeleted=0
                    order by visit_date desc limit 4;
                    select * from lab_invoice where lab_hash='${localStorage.getItem(
                      "lab_hash"
                    )}';
                    SELECT name,jop, jop_en from lab_invoice_worker where lab_hash='${localStorage.getItem(
                      "lab_hash"
                    )} and is_available=1' and isdeleted=0 limit 2;`);

let patientData = allData.result[0].query0[0],
  visitsData = allData.result[1].query1,
  invoices = allData.result[2].query2[0],
  workers = allData.result[3].query3;

// Dom Elements
let patientName = document.querySelector("#patient_name"),
  patientBirth = document.querySelector("#patient_birth"),
  patientGender = document.querySelector("#patient_gender"),
  patientPhone = document.querySelector("#patient_phone"),
  visitsTable = document.querySelector("#visits_table tbody");

// set patient data
patientName.innerHTML = patientData.name;
patientBirth.innerHTML = patientData.birth;
patientGender.innerHTML = patientData.gender;
patientPhone.innerHTML = patientData.phone;

// insert visits data for table body
visitsData.forEach((visit) => {
  visitsTable.innerHTML += `
    <tr onclick="visitDetail('${
      visit.hash
    }');fireSwalWithoutConfirm(showVisit, '${visit.hash}')">
        <td >${visit.visit_date}</td>
        <td>${visit.doctor_name ?? "بدون دكتور"}</td>
        <td>${visit.net_price}</td>
        <td >عرض <i class="fas fa-eye"></i></td>
    </tr>
    `;
  // let row = visitsTable.insertRow(-1);
  // row.insertCell(0).innerHTML = visit.doctor_name;
  // row.insertCell(1).innerHTML = visit.visit_date;
  // row.insertCell(2).innerHTML = visit.net_price;
  // row.insertCell(3).innerHTML = visit.dicount;
});

$(document).ready(function () {
  set_var("--font_size", `${invoices?.font_size ?? 20}px`);
  set_var("--color-orange", invoices?.color ?? "red");
});
function get_var(_var = "") {
  let r = document.querySelector(":root");
  let rs = getComputedStyle(r);
  alert(`The value of ${_var} is: ` + rs.getPropertyValue(_var));
}

// Create a function for setting a variable value
function set_var(_var, value) {
  let r = document.querySelector(":root");
  // Set the value of variable --blue to another value (in this case "lightblue")
  r.style.setProperty(_var, value);
}

$(document).keydown(function (e) {
  if ($(`input.result`).is(":focus") && (e.keyCode == 40 || e.keyCode == 13)) {
    e.preventDefault();
    focusInput("add");
  } else if ($(`input.result`).is(":focus") && e.keyCode == 38) {
    e.preventDefault();
    focusInput("12");
  }
});
