const THEME = new PackageTestTheme();
let TEST = null;
TEST = null;
const { patients, units, doctors, tests, packages, categories } = fetchApi(
  "/visit/get_visit_form_data",
  "GET",
  {}
);
let { workers, ...invoices } = fetchApi("/invoice/get");

class Visit extends Factory {
  init() {
    this.createModal();
    const userType = localStorage.getItem("user_type");
    this.dataTable = setServerTable(
      "lab_visits-table",
      `${api_url}/visit/get_visits`,
      () => {
        const checkInput = $("#currentDay");
        let check = 1;
        if (checkInput.length > 0) {
          check = checkInput.is(":checked") ? 1 : 0;
        }
        return {
          today: check,
        };
      },
      [
        {
          data: "lab_patient.name",
          name: "lab_patient.name",
          order: ["lab_patient.name", "asc"],
          render: (data, type, row) => {
            return `
              <div class="d-none d-print-block-inline">
                ${row.name}
              </div>
              <input type="text" id="${row.patient_hash}_patient_name" data_hash="${row.patient_hash}" class="form-control" name="patient_name" value="${row.name}" onblur="updatePatientName('${row.patient_hash}',this)">`;
          },
        },
        {
          data: "visit_date",
          render: (data, type, row) => {
            return `
            <a href="#" class="w-100 d-block" onclick="visitDetail('${row.hash}');fireSwalWithoutConfirm(showAddResult, '${row.hash}')">
              ${row.visit_date}
            </a>`;
          },
        },
        {
          data: null,
          className: "not-print",
          render: (data, type, row) => {
            return `
            <a class="btn-action add" title"تحميل النتائج" onclick="dwonloadInvoice('${row.hash}')">
            <i class="fas fa-file-pdf"></i>
            </a>
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
      ],
      [[1, "desc"]]
    );
  }

  resetForm() {
    const form = document.getElementById("form-lab_visits");
    form.reset();
    // change doctor_hash select2 with
    $("#doctor_hash").val(null).trigger("change");
    $("#gender").val(null).trigger("change");
    const newPatientElement = document.querySelector(
      `input[name="new_patient"]`
    );
    // change new patient checked
    // newPatientElement.checked = true;
    // changePatientTag();
    // change visits_date with today
    document.getElementById("visit_date").value = TODAY;
    document.querySelector("select[name='gender']").value = "ذكر";
    // trigger change event
    $("#gender").trigger("change");

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
    const visit = fetchApi("/visit/get_visit", "GET", { hash });
    $("#work-sapce").empty();
    $("#show_selected_tests div").remove();
    this.resetForm();

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
    changePatientTag();
    for (const p of visit.packages) {
      const testElement = document.getElementById(`package_${p.hash}`);
      if (testElement) {
        testElement.checked = true;
        testElement.parentElement.classList.add("itemsActive");
      }
      // showSelectedTests(p.hash, p.name, true);
    }
    document.getElementById("visit_date").value = visit.date;
    document.getElementById("doctor_hash").value = visit.doctor;
    document.getElementById("dicount").value = visit.dicount;
    document.getElementById("total_price").value = visit.total_price;
    document.getElementById("net_price").value = visit.net_price;

    // fill form with data
    for (const [key, value] of Object.entries(visit)) {
      if (key === "hash") {
      } else if (key === "packages") {
        for (const p of value) {
          // use pure js to check test
          const testElement = document.getElementById(`package_${p.hash}`);
          if (testElement) {
            testElement.checked = true;
            testElement.parentElement.classList.add("itemsActive");
          }
          showSelectedTests(p.hash, p.name, true);
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

    const age = Number.parseInt(data.age_year) + Number.parseInt(data.age_month) + Number.parseInt(data.age_day);
    if( Number.isNaN(age)){
      niceSwal("error", "bottom-end", "خانة العمر يجب ان تكون ارقام فقط");
      return false;
    }
    if (age <= 0) {
      niceSwal("error", "bottom-end", "لا يمكن ادخال عمر اقل من صفر");
      return false;
    }
    

    if (data.tests.length === 0) {
      niceSwal("error", "bottom-end", "يجب اختيار تحاليل");
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
    for (const testSelect of testSelects) {
      tests.push(testSelect.value);
    }
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
    if (!data) return;
    const checked = document.querySelector(`input[name="new_patient"]`).checked;
    const { isExist, hash } = fetchApi("/patient/patientIsExist", "POST", {
      name: data.name,
    });
    if (isExist && checked) {
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
            document.querySelector("input[name='new_patient']").checked = false
            changePatientTag();
            resolve();
          })
            .then(() => {
              $("#patient").val(hash).trigger("change");
              this.saveNewItem();
            })
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
    if (!data) return;
    const visit = fetchApi("/visit/create_visit", "POST", data);
    patients.push({
      hash: visit.patient_hash,
      name: data.name,
    });
    this.dataTable.ajax.reload();
    this.resetForm();
    visitDetail(visit.hash);
    showAddResult(visit.hash);

    document.querySelector(
      `input[name="new_patient"]`
    ).checked = true;
    changePatientTag();
  }

  saveUpdateItem(hash) {
    const data = this.validate();
    if (!data) return;
    const visit = fetchApi("/visit/update_visit", "POST", {
      ...data,
      hash: hash,
    });
    this.dataTable.ajax.reload();
    this.resetForm();
    const newPatientElement = document.querySelector(
      `input[name="new_patient"]`
    );
    newPatientElement.checked = false;
    changePatientTag();
    $(`#${this.table} -save`).attr(
      "onclick",
      `fireSwal.call(${this.table}, ${this.table}.savenewItemaAfterCheckName)`
    );
    visitDetail(hash);
    showAddResult(hash);
    newPatientElement.checked = true;
    changePatientTag();
  }

  createModal() {
    const { visitTestsTheme } = fetchApi("/invoice/get_setting");
    let theme = null;
    switch (visitTestsTheme) {
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
