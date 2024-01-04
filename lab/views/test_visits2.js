"use strict";

// Elmemnts
// tests container
const testsElement = document.getElementById("tests");
// start date
const startDateElement = document.getElementById("startDate");
// end date
const endDateElement = document.getElementById("endDate");
// selected tests
const selectedTestsElement = document.getElementById("test_searsh");
// add all tests option

// doctor
const doctorElement = document.getElementById("doctor");
// search button
const searchButtonElement = document.getElementById("searchQ");
// first day of current month
$(startDateElement).val(new Date().toISOString().slice(0, 10));
$(endDateElement).val(new Date().toISOString().slice(0, 10));

const addTest = (test) => {
  // show cost and price
  return `
  <div class="col-12 col-md-4 col-lg-3 col-xl-2 my-4">
    <div class="card">
      <div class="card-header text-center text-capitalize">
        <h5 class="card-title h3">${test.test_name}</h5>
      </div>
      <div class="card-body h5">
      <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <span class="w-50">الزيارات : </span>
        <span class="badge badge-primary badge-pill">${test.count}</span>
      </li>
      <li class="list-group-item">
        <span class="w-50">التكلفة : </span>
        <span class="badge badge-primary badge-pill">${test.cost}</span>
      </li>
      <li class="list-group-item">
        <span class="w-50">السعر : </span>
        <span class="badge badge-primary badge-pill">${test.price}</span>
      </li>
      <li class="list-group-item">
        <span class="w-50">الربح : </span>
        <span class="badge badge-primary badge-pill">${
          test.price - test.cost
        }</span>
      </li>
      </ul>
    </div>
  </div>`;
};

const selectAllTest = () => {
  $(selectedTestsElement)
    .select2("destroy")
    .find("option")
    .prop("selected", "selected")
    .end()
    .select2();
};

const getTests = async () => {
  const startDate = startDateElement.value;
  const endDate = endDateElement.value;
  // selectedTestsElement is a multiple select2 element
  const selectedTests = $(selectedTestsElement).val();

  const doctor = doctorElement.value;

  const formData = new FormData();
  formData.append("startDate", startDate);
  formData.append("endDate", endDate);
  formData.append("tests", selectedTests);
  formData.append("doctor", doctor);
  formData.append("lab_id", localStorage.getItem("lab_hash"));

  await fetch(`${base_url}Tests/getVisitsByTests`, {
    method: "POST",
    body: formData,
    // token
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((json) => {
      if (json.data.length > 0) {
        testsElement.innerHTML = "";
        json.data.reverse().forEach((test) => {
          testsElement.innerHTML += addTest(test);
        });
      } else {
        testsElement.innerHTML = `<h1 class="col-6 my-4 text-center alert alert-danger">
        لا توجد نتائج
      </h1>`;
      }
    })
    .catch((error) => {
      testsElement.innerHTML = `<h1 class="col-6 my-4 tet-center alert alert-danger">
        لا توجد نتائج
      </h1>`;
    });
};

// search button click event
searchButtonElement.addEventListener("click", getTests);

$(function () {
  let data = run(`
        SELECT test_id,(select name from lab_package where package_id=lab_package.hash) as name FROM lab_pakage_tests
        where lab_pakage_tests.lab_id = ${localStorage.getItem("lab_hash")}
        group by name ;
        SELECT name,hash FROM lab_doctor where lab_id = ${localStorage.getItem(
          "lab_hash"
        )} and isdeleted =0;
    `).result;
  let tests = data[0].query0;
  let doctors = data[1].query1;
  $(doctorElement).append(`<option value="">كل الاطباء</option>`);
  doctors.forEach((doctor) => {
    $(doctorElement).append(
      `<option value="${doctor.hash}">${doctor.name}</option>`
    );
  });
  tests.forEach((test) => {
    $(selectedTestsElement).append(
      `<option value="${test.test_id}">${test.name}</option>`
    );
  });
  $(selectedTestsElement).select2({
    dropdownParent: $(selectedTestsElement).parent(),
    width: "100%",
    multiple: true,
  });
  $(doctorElement).select2({
    dropdownParent: $(doctorElement).parent(),
    width: "100%",
  });
  getTests();
});
