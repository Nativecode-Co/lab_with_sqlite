"use strict";

const THEME = new PackageTestTheme();

const urlParams = new URLSearchParams(window.location.search),
  VisitHash = urlParams.get("visit");

let allData =
  run(`select * from lab_invoice where lab_hash='${localStorage.getItem(
    "lab_hash"
  )}';
    SELECT name,jop, jop_en from lab_invoice_worker where lab_hash='${localStorage.getItem(
      "lab_hash"
    )} and is_available=1' and isdeleted=0 limit 2;`);

let invoices = allData.result[0].query0[0],
  workers = allData.result[1].query1;

// document ready
$(document).ready(function () {
  set_var("--font_size", `${invoices?.font_size ?? 20}px`);
  set_var("--color-orange", invoices?.color ?? "red");
  visitDetail(VisitHash);
  fireSwalWithoutConfirm(showVisit, VisitHash);
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
