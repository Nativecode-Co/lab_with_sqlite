"use strict";

$("#startDate").val(new Date().toISOString().slice(0, 10));
$("#endDate").val(new Date().toISOString().slice(0, 10));
// override Factory class
class Patient extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "incomes-table",
      `${base_url}reports/financialReports`,
      () => {
        return {
          doctor: $("#doctor").val(),
          user: $("#user").val(),
          startDate: $("#startDate").val(),
          endDate: $("#endDate").val(),
        };
      },
      [
        { data: "name" },
        { data: "doctor" },
        { data: "visit_date" },
        { data: "net_price" },
        { data: "dicount" },
        { data: "total_price" },
        {
          data: null,
          className: "text-success center",
          defaultContent: '<i class="fas fa-plus"></i>',
        },
      ],
      {},
      (json) => {
        $("#totalPrice").text(json?.total_price ?? 0);
        $("#totalDiscount").text(json?.dicount ?? 0);
        $("#totalFinalPrice").text(json?.net_price ?? 0);
        $("#total").text(json?.recordsTotal ?? 0);
      }
    );
  }

  pageCondition() {
    return "";
  }
}

// init incomes class

let incomes = new Patient("incomes", "Reports", []);

// document ready function
$(function () {
  let data = run(`
        SELECT name,hash FROM system_users where lab_id = ${localStorage.getItem(
          "lab_hash"
        )} and is_deleted =0;
        SELECT name,hash FROM lab_doctor where lab_id = ${localStorage.getItem(
          "lab_hash"
        )} and isdeleted =0;
    `).result;

  let users = data[0].query0;
  let doctors = data[1].query1;
  $("#user").append(`<option value="">كل المستخدمين</option>`);
  $("#doctor").append(`<option value="">كل الاطباء</option>`);
  users.forEach((user) => {
    $("#user").append(`<option value="${user.hash}">${user.name}</option>`);
  });
  doctors.forEach((doctor) => {
    $("#doctor").append(
      `<option value="${doctor.hash}">${doctor.name}</option>`
    );
  });
  $("#doctor").select2({
    dropdownParent: $("#doctor").parent(),
    width: "100%",
  });
  $("#user").select2({
    dropdownParent: $("#user").parent(),
    width: "100%",
  });
});

const search = () => {
  incomes.dataTable.ajax.reload();
};
