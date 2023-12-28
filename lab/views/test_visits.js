"use strict";

$("#startDate").val(new Date().toISOString().slice(0, 10));
$("#endDate").val(new Date().toISOString().slice(0, 10));
// override Factory class
class Visit extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_visits-table",
      `${base_url}Tests/getVistsByTest`,
      () => {
        return {
          lab_id: localStorage.getItem("lab_hash"),
          test_id: $("#test").val(),
          doctor: $("#doctor").val(),
          startDate: $("#startDate").val(),
          endDate: $("#endDate").val(),
        };
      },
      [
        {
          data: "null",
          render: function (data, type, row) {
            return `
                        <a  onclick="location.href='visit_history.html?visit=${row.hash}'">${row.name}</i></a>
                    
                        `;
          },
        },
        { data: "doctor" },
        { data: "visit_date" },
        { data: "cost" },

        { data: "price" },

        {
          data: null,
          className: "center not-print",
          render: function (data, type, row) {
            return `
                        <a class="btn-action add" title="تفاصيل الزيارة" onclick="location.href='visit_history.html?visit=${row.hash}'"><i class="far fa-external-link"></i></a>
                        <a class="btn-action delete" title="حذف" onclick="lab_visits.deleteItem('${row.hash}')"><i class="fas fa-trash"></i></a>
                        `;
          },
          sorter: function (a, b) {
            return a.length - b.length;
          },
        },
        {
          data: null,
          className: "text-success center",
          defaultContent: '<i class="fas fa-plus"></i>',
        },
      ],
      {},
      (json) => {
        $("#cost").text(json?.cost ?? 0);
        $("#price").text(json?.price ?? 0);
        $("#total").text(json?.recordsTotal ?? 0);
      }
    );
  }

  pageCondition() {
    return `
        select count(*) as count from ${this.table}
        inner join 
            lab_patient 
        on 
            lab_patient.hash = lab_visits.visits_patient_id
        where 
            lab_id=${localStorage.getItem("lab_hash")} and 
            visit_date = CURDATE()`;
  }
}

// init lab_patient class

let lab_visits = new Visit("lab_visits", " مريض", []);

// dom ready
$(function () {
  $(".dt-buttons").addClass("btn-group");
  $("div.addCustomItem").html(
    `<span class="table-title">قائمة التحاليل</span>`
  );
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
  $("#doctor").append(`<option value="">كل الاطباء</option>`);
  doctors.forEach((doctor) => {
    $("#doctor").append(
      `<option value="${doctor.hash}">${doctor.name}</option>`
    );
  });
  tests.forEach((test) => {
    $("#test").append(`<option value="${test.test_id}">${test.name}</option>`);
  });
  $("#test").select2({
    dropdownParent: $("#test").parent(),
    width: "100%",
  });
  $("#doctor").select2({
    dropdownParent: $("#doctor").parent(),
    width: "100%",
  });
});

$("#test").on("change", function () {
  lab_visits.dataTable.ajax.reload();
});

const search = () => {
  lab_visits.dataTable.ajax.reload();
};
