const THEME = new PackageTestTheme();
let TEST = null;

const { patients, units, doctors, tests, packages, categories } = fetchApi(
  "/visit/get_visit_form_data",
  "GET",
  {}
);
const { workers, invoices } = fetchApi("/visit/getInvoiceHeader", "GET", {});

class Visit extends Factory {
  init() {
    this.createModal();
    const userType = localStorage.getItem("user_type");
    this.dataTable = setServerTable(
      "lab_visits-table",
      `${base_url}Visit/getVisits`,
      () => {
        const checkInput = $("#currentDay");
        let check = 1;
        if (checkInput.length > 0) {
          check = checkInput.is(":checked") ? 1 : 0;
        }
        return {
          lab_id: localStorage.getItem("lab_hash"),
          current: check,
        };
      },
      [
        {
          data: "null",
          render: (data, type, row) => {
            return `<div class="d-none d-print-block-inline">${row.patient_name}</div><input type="text" id="${row.patient_hash}_patient_name" data_hash="${row.patient_hash}" class="form-control" name="patient_name" value="${row.patient_name}" onblur="updatePatientName('${row.patient_hash}',this)">`;
          },
        },
        {
          data: "null",
          render: (data, type, row) => {
            return `<a href="#" class="w-100 d-block" onclick="visitDetail('${row.hash}');fireSwalWithoutConfirm(showAddResult, '${row.hash}')">${row.visit_date}</a>`;
          },
        },
        {
          data: null,
          className: "not-print",
          render: (data, type, row) => {
            return `
                            <a class="btn-action add" title="عرض الزيارة"  onclick="visitDetail('${
                              row.hash
                            }');fireSwalWithoutConfirm(showAddResult, '${
              row.hash
            }')"><i class="far fa-eye"></i></a>
            <a class="btn-action add" title="تعديل الزيارة" onclick="fireSwalWithoutConfirm.call(lab_visits, lab_visits.updateItem,'${
              row.hash
            }')"><i class="far fa-edit"></i></a>
                            ${
                              userType === "2" && row.ispayed === "0"
                                ? `<a class="btn-action delete" title="حذف الزيارة" onclick="fireSwalForDelete.call(lab_visits,lab_visits.deleteItem, '${row.hash}')"><i class="far fa-trash-alt"></i></a>`
                                : ""
                            }
                        `;
          },
        },
        {
          data: null,
          className: "text-success",
          defaultContent: '<i class="fas fa-plus"></i>',
        },
      ]
    );
  }

  resetForm() {
    const form = document.getElementById("form-lab_visits");
    form.reset();
    // change doctor_hash select2 with
    $("#doctor_hash").val(null).trigger("change");
    // change visits_date with today
    document.getElementById("visit_date").value = TODAY;

    const testsElement = document.getElementsByName("tests[]");
    $(".itemsActive").removeClass("itemsActive");
    for (const test of testsElement) {
      test.checked = false;
    }
    $("#show_selected_tests div").remove();
    document.getElementById("dicount").value = 0;
    document.getElementById("total_price").value = 0;
    document.getElementById("net_price").value = 0;
    // document.getElementById("input-search-2").value = "";
    // change button onclick
    $(`#${this.table}-save`).attr(
      "onclick",
      `fireSwal.call(${this.table},${this.table}.savenewItemaAfterCheckName)`
    );
    $("#show_selected_tests").html("");
  }

  updateItem(hash) {
    const { visit } = fetchApi(`/visit/get_visit?hash=${hash}`, "GET", {});

    $("#work-sapce").empty();
    $("#show_selected_tests div").remove();
    // open modal
    $("html, body").animate(
      {
        scrollTop: $("#visit-form").offset().top,
      },
      500
    );
    const newPatientElement = document.querySelector(
      `input[name="new_patient"]`
    );
    // change new patient checked
    newPatientElement.checked = false;
    changePatientTag(newPatientElement);
    this.resetForm();
    // fill form with data
    for (const [key, value] of Object.entries(visit)) {
      if (key === "hash") {
        continue;
      } else if (key === "tests") {
        for (const test of value) {
          // use pure js to check test
          const testElement = document.getElementById(`package_${test.hash}`);
          if (testElement) {
            testElement.checked = true;
            testElement.parentElement.classList.add("itemsActive");
          }
          showSelectedTests(test.hash, test.name, true);
        }
      } else {
        const element = document.getElementById(key);
        if (element) {
          element.value = value;
          if (element.tagName === "SELECT") {
            $(`#${key}`).val(value).trigger("change");
          }
        }
      }
    }
    $(`#${this.table}-save`).attr(
      "onclick",
      `fireSwal.call(${this.table}, ${this.table}.saveUpdateItem, '${hash}')`
    );
  }

  validate() {
    const data = this.getData();
    if (data.patient === "") {
      niceSwal("error", "bottom-end", "يجب اختيار المريض");
      return false;
    }
    if (data.name === "") {
      niceSwal("error", "bottom-end", "يجب ادخال اسم المريض");
      return false;
    }

    if (data.visit_date === "") {
      niceSwal("error", "bottom-end", "يجب اختيار تاريخ الزيارة");
      return false;
    }

    if (data.tests.length === 0) {
      niceSwal("error", "bottom-end", "يجب اختيار تحاليل");
      return false;
    }

    if (
      parseInt(data.age_year) +
        parseInt(data.age_month) +
        parseInt(data.age_day) <=
      0
    ) {
      niceSwal("error", "bottom-end", "يجب ادخال عمر صحيح");
      return false;
    }

    return data;
  }

  getData() {
    const form = document.getElementById("form-lab_visits");
    let formData = new FormData(form);
    formData = Object.fromEntries(formData.entries());
    const tests = [];
    const testSelects = document.querySelectorAll(".testSelect:checked");
    testSelects.forEach(function (testSelect) {
      tests.push(testSelect.value);
    });
    const data = {
      ...formData,
      dicount: document.getElementById("dicount").value,
      total_price: document.getElementById("total_price").value,
      net_price: document.getElementById("net_price").value,
      tests: tests,
    };
    return data;
  }

  savenewItemaAfterCheckName() {
    const data = this.validate();
    const { isExist, hash } = fetchApi("/patient/patientIsExist", "POST", {
      name: data.name,
    });
    if (isExist) {
      Swal.fire({
        title: "تنبيه",
        text: "هذا المريض موجود بالفعل هل تريد اضافة زيارة له ؟",
        icon: "warning",
        confirmButtonText: "أضافة زيارة",
        cancelButtonText: "اغلاق",
        showCancelButton: true,
        showDenyButton: true,
        denyButtonText: "انشاء مريض جديد",
      }).then((result) => {
        if (result.isConfirmed) {
          // new promise
          new Promise((resolve, reject) => {
            changePatient();
            resolve();
          })
            .then(() => {
              $("#patient").val(hash).trigger("change");
              this.saveNewItem();
            })
            .then(() => {
              changePatient();
            });
        } else if (result.isDenied) {
          this.saveNewItem();
        } else {
          return false;
        }
      });
    } else {
      this.saveNewItem();
    }
  }

  saveNewItem() {
    const data = this.validate();
    const { visit } = fetchApi("/visit/create_visit", "POST", data);
    this.dataTable.ajax.reload();
    this.resetForm();
    visitDetail(visit.hash);
    showAddResult(visit.hash);
  }

  saveUpdateItem(hash) {
    const data = this.validate();
    const { visit } = fetchApi("/visit/update_visit", "POST", {
      ...data,
      hash: hash,
    });
    this.dataTable.ajax.reload();
    this.resetForm();
    const newPatientElement = document.querySelector(
      `input[name="new_patient"]`
    );
    newPatientElement.checked = false;
    changePatientTag(newPatientElement);
    $(`#${this.table} -save`).attr(
      "onclick",
      `fireSwal.call(${this.table}, ${this.table}.savenewItemaAfterCheckName)`
    );
    visitDetail(hash);
    showAddResult(hash);
  }

  createModal() {
    const labTheme = "default";
    let theme = null;
    switch (labTheme) {
      case "one":
        theme = new TestsThemeOne(this.table, packages, tests, categories);
        break;
      default:
        theme = new TestsThemeTwo(this.table, packages, tests, categories);
    }
    // append top of div
    $("#testsThemeElement").prepend(theme.build());
  }

  deleteItem(hash) {
    $("#show_visit_button").attr("onclick", "");
    $("#invoice_button").attr("onclick", "");
    $("#show_add_result").attr("onclick", "");
    $(".action").removeClass("active");
    const workSpace = $("#work-sapce");
    workSpace.html("");
    fetchApi("/visit/delete_visit", "POST", { hash });
    this.dataTable.ajax.reload();
  }
}

const lab_visits = new Visit("lab_visits", " زيارة", [], {
  pageSize: 400,
});
