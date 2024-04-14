const THEME = new PackageTestTheme();
const urlParams = new URLSearchParams(window.location.search);
const patientHash = urlParams.get("patient");

const patient = fetchApi(`/patient/get_patient?hash=${patientHash}`);
const visits = fetchApi("/patient/get_patient_visits", "POST", {
  hash: patientHash,
});
const { workers, ...invoices } = fetchApi("/invoice/get");

// Dom Elements
const patientName = document.querySelector("#patient_name");
const patientBirth = document.querySelector("#patient_birth");
const patientGender = document.querySelector("#patient_gender");
const patientPhone = document.querySelector("#patient_phone");
const visitsTable = document.querySelector("#visits_table tbody");

// set patient data
patientName.innerHTML = patient.name;
patientBirth.innerHTML = patient.birth;
patientGender.innerHTML = patient.gender;
patientPhone.innerHTML = patient.phone;

// insert visits data for table body
for (const visit of visits) {
  visitsTable.innerHTML += `
    <tr onclick="visitDetail('${
      visit.hash
    }');fireSwalWithoutConfirm(showVisit, '${visit.hash}')">
        <td>${visit.visit_date}</td>
        <td>${visit.doctor_name ?? "بدون دكتور"}</td>
        <td>${visit.net_price}</td>
        <td>عرض <i class="fas fa-eye"></i></td>
    </tr>
    `;
}

$(document).ready(() => {
  set_var("--font_size", `${invoices?.font_size ?? 20}px`);
  set_var("--color-orange", invoices?.color ?? "red");
});

const get_var = (_var = "") => {
  const r = document.querySelector(":root");
  const rs = getComputedStyle(r);
  alert(`The value of ${_var} is: ${rs.getPropertyValue(_var)}`);
};

// Create a function for setting a variable value
const set_var = (_var, value) => {
  const r = document.querySelector(":root");
  // Set the value of variable --blue to another value (in this case "lightblue")
  r.style.setProperty(_var, value);
};

$(document).keydown((e) => {
  if (
    $("input.result").is(":focus") &&
    (e.keyCode === 40 || e.keyCode === 13)
  ) {
    e.preventDefault();
    focusInput("add");
  } else if ($("input.result").is(":focus") && e.keyCode === 38) {
    e.preventDefault();
    focusInput("12");
  }
});
