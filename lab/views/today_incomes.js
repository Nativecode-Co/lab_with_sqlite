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
        {
          data: "net_price",
          render: (data) => {
            return Number(data).toLocaleString();
          },
        },
        {
          data: "dicount",
          render: (data) => {
            return Number(data).toLocaleString();
          },
        },
        {
          data: "total_price",
          render: (data) => {
            return Number(data).toLocaleString();
          },
        },
      ],
      [[2, "desc"]],
      {
        pageLength: 800,
        columnDefs: [],
      },
      (json) => {
        console.log("json", json);
        $(".totalPrice").text(Number(json?.total_price).toLocaleString());
        $(".totalDiscount").text(Number(json?.dicount).toLocaleString());
        $(".totalFinalPrice").text(Number(json?.net_price).toLocaleString());
        $(".total").text(
          Number(json?.total_price - json?.dicount).toLocaleString()
        );
      }
    );
  }

  pageCondition() {
    return "";
  }
}

// init incomes class

const incomes = new Patient("incomes", "Reports", []);

// document ready function
$(() => {
  const { users, doctors } = fetchApi("/users/get_today_incomes_data");
  $("#user").append(`<option value="">كل المستخدمين</option>`);
  $("#doctor").append(`<option value="">كل الاطباء</option>`);

  for (const user of users) {
    $("#user").append(`<option value="${user.hash}">${user.name}</option>`);
  }

  for (const doctor of doctors) {
    $("#doctor").append(
      `<option value="${doctor.hash}">${doctor.name}</option>`
    );
  }

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
