const THEME = new PackageTestTheme();

const urlParams = new URLSearchParams(window.location.search);
const VisitHash = urlParams.get("visit");

const { workers, invoices } = fetchApi("/visit/getInvoiceHeader", "GET", {});

// document ready
$(document).ready(() => {
  set_var("--font_size", `${invoices?.font_size ?? 20}px`);
  set_var("--color-orange", invoices?.color ?? "red");
  visitDetail(VisitHash);
  fireSwalWithoutConfirm(showVisit, VisitHash);
});
function get_var(_var = "") {
  const r = document.querySelector(":root");
  const rs = getComputedStyle(r);
  alert(`The value of ${_var} is: ${rs.getPropertyValue(_var)}`);
}

// Create a function for setting a variable value
function set_var(_var, value) {
  const r = document.querySelector(":root");
  // Set the value of variable --blue to another value (in this case "lightblue")
  r.style.setProperty(_var, value);
}

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
