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

const selectAllTest = () => {
 //  toggle all tests
  const allTests = $(selectedTestsElement).val();
  if (allTests.length === 0) {
    $(selectedTestsElement)
    .select2("destroy")
    .find("option")
    .prop("selected", "selected")
    .end()
    .select2();
  } else {
    $(selectedTestsElement).val([]).trigger("change");
  }
};

class Tests extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "tests-table",
      `${api_url}/VisitTest/get_tests`,
      () => {
        return {
          tests: $(selectedTestsElement).val().join(","),
          doctor: $(doctorElement).val(),
          start_date: $(startDateElement).val(),
          end_date: $(endDateElement).val(),
        };
      },
      [
        { data: "test_name" },
        {
          data: "count",
          render: (data, type, row) => {
            return Number(data).toLocaleString();
          },
        },
        {
          data: "cost",
          render: (data, type, row) => {
            return Number(data).toLocaleString();
          },
        },
        { data: "price",
          render: (data, type, row) => {
            return Number(data).toLocaleString();
          },
      
        },
        {
          data: "null",
          render: (data, type, row) => {
            return Number(row.price - row.cost).toLocaleString();
          },
        },
      ],
      [[2, "desc"]],
      {
        pageLength: 800,
        columnDefs: [],
      },
      (json) => {
        const totalCost = json.data.reduce((acc, row) => {
          return acc + Number(row.cost);
        }, 0);
        const totalPrice = json.data.reduce((acc, row) => {
          return acc + Number(row.price);
        }, 0);
        const totalProfit = json.data.reduce((acc, row) => {
          return acc + Number(row.price) - Number(row.cost);
        }, 0);
        const totalVisits = json.data.reduce((acc, row) => {
          return acc + Number(row.count);
        }, 0);
        $(".totalVisits").text(totalVisits.toLocaleString());
        $(".totalCost").text(totalCost.toLocaleString());
        $(".totalPrice").text(totalPrice.toLocaleString());
        $(".totalProfit").text(totalProfit.toLocaleString());
      }
    );
  }

  pageCondition() {
    return "";
  }
}

$(() => {
  const { tests, doctors } = fetchApi("/tests/get_tests_report_data");
  $(doctorElement).append(`<option value="">كل الاطباء</option>`);
  for (const doctor of doctors) {
    $(doctorElement).append(
      `<option value="${doctor.hash}">${doctor.name}</option>`
    );
  }
  for (const test of tests) {
    $(selectedTestsElement).append(
      `<option value="${test.test_id}">${test.name}</option>`
    );
  }
  $(selectedTestsElement).select2({
    dropdownParent: $(selectedTestsElement).parent(),
    width: "100%",
    multiple: true,
  });
  // default select []
  $(selectedTestsElement).val([]).trigger("change");

  $(doctorElement).select2({
    dropdownParent: $(doctorElement).parent(),
    width: "100%",
  });

  $(searchButtonElement).click(() => {
    testsTable.dataTable.ajax.reload();
  });

  const testsTable = new Tests("tests", "Report", []);
});
