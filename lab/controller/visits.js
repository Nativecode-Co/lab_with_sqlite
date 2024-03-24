const calcOperator = ["+", "-", "*", "/", "(", ")", "Math.log10("];
let HASH = null;

let __VISIT_TESTS__ = [];

// dom ready with js
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("visit_date").value = TODAY;
  const genderElement = document.getElementById("gender");
  const doctorElement = document.getElementById("doctor_hash");
  doctorElement.innerHTML = `<option value="">اختر الطبيب</option>`;
  for (const doctor of doctors) {
    doctorElement.innerHTML += `<option value="${doctor.hash}">${doctor.name}</option>`;
  }
  $(genderElement).select2({
    width: "100%",
  });
  $(doctorElement).select2({
    width: "100%",
  });
});

const changePatientTag = () => {
  const visitsPatientIdForm = document.getElementById("patient-form");
  const newPatientElement = document.querySelector(`input[name="new_patient"]`);

  visitsPatientIdForm.innerHTML = "";
  if (!newPatientElement.checked) {
    visitsPatientIdForm.innerHTML = `
      <label for="patient">اسم المريض</label>
      <select class="form-control" id="patient" name="patient" onchange="getOldPatient(this.value)">
        <option value="">اختر المريض</option>
        ${patients
          .map(
            (patient) =>
              `<option value="${patient.hash}">${patient.name}</option>`
          )
          .join("")}
      </select>
    `;
    $("#patient").select2({
      width: "100%",
    });
  } else {
    document.getElementById("show_selected_tests").innerHTML = "";
    visitsPatientIdForm.innerHTML = `
      <label for="name">اسم المريض</label>
      <input type="text" class="form-control" name="name" id="name" placeholder="اسم المريض">
    `;
  }
};

// change the patient addEventListener
document
  .querySelector("input[name='new_patient']")
  .addEventListener("change", changePatientTag);

function toggleHeaderAndFooter() {
  const invoiceShow = $(".book-result .header .row:visible").length;
  try {
    invoices.footer_header_show = invoiceShow === 0 ? 1 : 0;
  } catch (error) {
    console.log("يجب اضافة الفورمة");
  }
  fetchApi("/visit/update_invoice", "POST", {
    lab_hash: localStorage.getItem("lab_hash"),
    footer_header_show: invoiceShow === 0 ? 1 : 0,
  });
  const header = $(".book-result .header");
  const footer = $(".book-result .footer2");
  header.each(function () {
    $(this).children().toggle();
  });
  footer.each(function () {
    $(this).children().toggle();
  });
}

function toggleTest() {
  const test = $(this);
  const hash = test.attr("id").split("_")[2];
  const testInvoice = $(`#test_normal_${hash}`);
  const category = testInvoice.attr("data-cat");
  if (test.is(":checked")) {
    if ($(`.category_${category}:visible`).length === 0) {
      $(`.category_${category}`).first().show();
      $(`.category_${category} p`).show();
    }
    testInvoice.show();
  } else {
    testInvoice.hide();
    if ($(`.category_${category}:visible`).length === 1) {
      $(`.category_${category}:visible`).hide();
    }
  }
}

const getAge = (birth) => {
  const ageInMilliseconds = new Date() - new Date(birth);
  const age = ageInMilliseconds / 1000 / 60 / 60 / 24 / 365;
  // get age in years
  const age_year = Math.floor(age);
  // get age in months
  const age_month = Math.floor((age - age_year) * 12);
  // get age in days
  const age_day = Math.floor((age - age_year - age_month / 12) * 365);
  return { year: age_year, month: age_month, day: age_day };
};

const getOldPatient = (hash) => {
  if (hash !== 0) {
    const patient = fetchApi(`/patient/get_patient?hash=${hash}`);
    $("#age_year").val(patient.age_year);
    $("#age_month").val(patient.age_month);
    $("#age_day").val(patient.age_day);
    $("#gender").val(patient.gender).trigger("change");
    $("#phone").val(patient.phone);
    $("#address").val(patient.address);
  }
};

function showPackagesList(hash) {
  const package = tests.find((p) => p.hash == hash);
  $(this)
    .popover({
      template: `<div class="popover popover-light" >
                    <div class="arrow"></div>
                    <h3 class="popover-header"></h3>
                    <div class="popover-body"></div>
                </div>`,
      title: `<p class="text-center">${package.name}</p>`,
      // show price and note
      html: true,
      adaptivePosition: false,
      content: `
            <div class="row">
                ${
                  package.type == "8"
                    ? `<div class="col-md-12">
                    <p class="text-right" style="direction:ltr">${package.tests}</p>
                </div>`
                    : `<div class="col-md-12">
                    <p class="text-left">الجهاز: ${
                      package.device_name ?? "No Device"
                    }</p>
                </div>
                <div class="col-md-12">
                    <p class="text-left">الكت: ${
                      package.kit_name ?? "No Kit"
                    }</p>
                </div>
                `
                }
            </div>
        `,
      placement: package.type == "8" ? "right" : "top",
      offset: 0,
    })
    .popover("show");
}

function visitDetail(hash) {
  HASH = hash;
  $(".itemsActive").removeClass("itemsActive");
  // check if lab_visits is defined
  if (typeof lab_visits != "undefined") {
    lab_visits.resetForm();
  }
  let show_visit_button = $("#show_visit_button");
  let invoice_button = $("#invoice_button");
  let show_add_result = $("#show_add_result");
  show_visit_button.attr(
    "onclick",
    `fireSwalWithoutConfirm(showVisit,'${hash}')`
  );
  invoice_button.attr(
    "onclick",
    `fireSwalWithoutConfirm(showInvoice,'${hash}')`
  );
  show_add_result.attr(
    "onclick",
    `fireSwalWithoutConfirm(showAddResult,'${hash}')`
  );
}

function showVisit(hash) {
  $(".action").removeClass("active");
  $("#show_visit_button").addClass("active");
  const visit = fetchApi(`/visit/get_visit?hash=${hash}`);
  console.log(visit);
  const workSpace = $("#work-sapce");
  workSpace.html("");
  const visitInfo = `
    <div class="col-lg-5 mt-4">
        <div class="statbox widget box box-shadow bg-white py-3">
            <div class="widget-content widget-content-area m-auto" style="width: 95%;">
            <div class="container">
            <div class="custom-card visit-info">
                <div class="custom-card-header hr">
                    <h4 class="title">تفاصيل الزيارة</h4>
                </div>
                <div class="custom-card-body" dir="rtl">
                    <table class="information-1">
                        <tbody>
                            <tr>
                                <td>اسم المريض</td>
                                <td>${visit.name}</td>
                            </tr>
                            <tr>
                                <td>الطبيب المعالج</td>
                                <td>${visit.doctor ?? ""}</td>
                            </tr>
                            <tr>
                                <td>العمر</td>
                                <td>${Number.parseFloat(visit.age).toFixed(
                                  0
                                )} سنة</td>
                            </tr>
                            <tr>
                                <td>التاريخ</td>
                                <td>${visit.date}</td>
                            </tr>
                            <tr>
                                <td>اجمالي المبلغ</td>
                                <td>${visit.total_price} IQD</td>
                            </tr>
                            <tr>
                                <td>صافي الدفع</td>
                                <td>${visit.net_price} IQD</td>
                            </tr>
                            <tr>
                                <td>ملاحظات</td>
                                <td>${visit?.note ?? ""}</td>
                            </tr>
                            <tr>
                                <td>الرمز</td>
                                <td id="visit-code">
                                    <div class="barcode" id="barcode-print">
                                        <div class="title">
                                            <p>${visit.name}</p>
                                        </div>
                                        
                                        <div class="code">	
                                        <svg width="100%" x="0px" y="0px" viewBox="0 0 310 50" xmlns="http://www.w3.org/2000/svg" version="1.1" style="transform: translate(0,0)" id="barcode"></svg>
                                        </div>
                                    </div>
                                    <button class="btn btn-action d-print-none" onclick="printElement('#visit-code', 'A3', 'css/barcode.css')">طباعة</button>
                                </td>
                                <script>
                                    JsBarcode("#barcode", '${visit.hash}', {
                                        width:1.5,
                                        height:18,
                                        fontSize:20,
                                    });
                                </script>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="custom-card-footer d-print-none">
                    <div class="row justify-content-center align-items-center">
                        <button type="button" class="btn btn-outline-print" onclick="printElement('.visit-info', 'A3', 'css/new_style.css', 'css/barcode.css')"><i class="mr-2 fal fa-print"></i>طباعة</button>
                    </div>
                    ${
                      !window.location.pathname.includes("history")
                        ? `<div class="row mt-3">
                        <button type="button" class="btn btn-add mr-3" onclick="lab_visits.updateItem('${visit.hash}')"><i class="far fa-edit mr-2"></i>تعديل بيانات الزيارة</button>
                        <!--<button type="button" class="btn btn-delete" onclick="fireSwalForDelete.call(lab_visits,lab_visits.deleteItem, '${visit.hash}')"><i class="far fa-trash-alt mr-2"></i>حذف بيانات المريض</button>-->
                    </div>`
                        : ""
                    }
                    
                </div>
            </div>
        </div>  
            </div>
        </div>
        <div class="statbox widget box box-shadow bg-white py-3 mt-3">
            <div class="widget-content widget-content-area m-auto" style="width: 95%;">
            <div class="container">
            <div class="custom-card patient-info">
                <div class="custom-card-header hr">
                    <h4 class="title">بيانات المريض</h4>
                </div>
                <div class="custom-card-body" dir="rtl">
                    <table class="information-1">
                        <tbody>
                            <tr>
                                <td>الاسم</td>
                                <td>${visit.name}</td>
                            </tr>
                            <tr>
                                <td>العمر</td>
                                <td>${parseFloat(visit.age).toFixed(0)}</td>
                            </tr>
                            <tr>
                                <td>النوع</td>
                                <td>${visit.gender}</td>
                            </tr>
                            <tr>
                                <td>رقم الهاتف</td>
                                <td>
                                    <div class="input-group my-2">
                                        <input type="text" class="form-control" id="patientPhone" placeholder="${
                                          visit.phone
                                        }" value="${visit.phone}">
                                        <div class="input-group-append">
                                            <button class="btn btn-add" type="button" onclick="updatePhone('${
                                              visit.patient
                                            }')">حفظ</button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="custom-card-footer d-print-none">
                    <div class="row justify-content-center align-items-center">
                        <button type="button" class="btn btn-outline-print" onclick="printElement('.patient-info', 'A3', 'css/new_style.css')"><i class="mr-2 fal fa-print"></i>طباعة</button>
                    </div>
                </div>
            </div>
        </div>  
            </div>
        </div>
    </div>
    `;
  workSpace.append(visitInfo);
  showInvoice(hash);
  $("html, body").animate(
    {
      scrollTop: $("#main-space").offset().top - 75,
    },
    1000
  );
}

function hideHederelments() {
  // get headers elements has class test and typetest not have class sp
  const headersElements = document.querySelectorAll(".test.typetest:not(.sp)");
  for (const test of headersElements) {
    const classes = test.classList;
    const category = Array.from(classes).find((c) => c.includes("category_"));
    let categoryElements = document.querySelectorAll(`.${category}`);
    // filter if category is visible
    categoryElements = Array.from(categoryElements).filter(
      (c) => c.style.display !== "none"
    );
    if (categoryElements.length <= 1) {
      test.style.display = "none";
    }
  }
}

function showAddResult(hash, animate = true) {
  $(".action").removeClass("active");
  $("#show_add_result").addClass("active");
  const workSpace = $("#work-sapce");
  workSpace.html("");
  const data = fetchApi("/visit/get_visit", "GET", { hash });
  const form = addResult(data);
  const { invoice, buttons } = showResult(data);
  const html = `
    <div class="col-lg-12 mt-4">
        <div class="statbox widget box box-shadow bg-white py-3">
            <div class="widget-content widget-content-area m-auto" style="width: 95%;">
                <div class="row">
                    <div class="col-lg-12">
                    ${buttons}
                    </div>
                    <div class="col-md-6 mt-48 invoice-height" style="overflow-y:scroll;">
                        ${form}
                        <div class="row mt-15 justify-content-center">
                            
                        </div>
                    </div>
                    <div class="col-md-6 mt-48 invoice-height global-border" style="overflow-y:scroll;">
                        ${invoice}
                    </div>
                    <div class="col-lg-12 mt-48">
                        <div class="row mt-15 justify-content-center">
                            <div class="col-md-2 col-6">
                                <button type="button" id="saveResultButton" class="btn btn-add w-100" onclick="fireSwal(saveResult,'${hash}')">حفظ النتائج</button>
                            </div>
                            <div class="col-md-2 col-6">
                                <button type="button" class="btn btn-outline-print w-100" onclick="printAfterSelect('${hash}')">
                                    <i class="mr-2 fal fa-print"></i>طباعة النتائج
                                </button>
                            </div>
                            <div class="col-md-2 col-6">
                                <button type="button" class="btn btn-outline-print w-100" onclick="printAllInvoices('${hash}')">
                                    <i class="mr-2 fal fa-print"></i>طباعة الكل
                                </button>
                            </div>
                            <div class="col-md-2 col-6">
                                <button type="button" class="btn btn-outline-print w-100" onclick="sendWhatsapp('${hash}', '${data.phone}', '${data.name}')">
                                    <i class="mr-2 fab fa-whatsapp"></i>  الواتساب
                                </button>
                            </div>
                            <div class="col-md-2 col-6">
                            <button type="button" class="btn btn-add w-100" onclick="dwonloadInvoice('${hash}')">
                            <i class="mr-2 fas fa-file-pdf"></i>تنزيل pdf
                            </button>
                            </div>
                            <div class="col-md-2 col-6">
                                <button type="button" class="btn btn-outline-print w-100" onclick="toggleHeaderAndFooter.call(this)">
                                    <i class="mr-2 fal fa-print"></i>اظهار - اخفاء الفورمة 
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
  workSpace.append(html);
  setInvoiceStyle();
  $("#invoice-tests-buttons .btn").first().addClass("active");
  $(".book-result").first().show();
  $(".results").hide();
  $(`.test-${$(".book-result").first().attr("id").split("-")[1]}`).show();
  $("#print-invoice-result").attr("onclick", "printOneInvoice()");
  $("#print-all-invoice-result").attr("onclick", "printAll();");
  getCurrentInvoice($(`#${localStorage.getItem("currentInvoice")}`));
  $(".results select").each(function () {
    $(this).select2({
      width: "100%",
      tags: true,
      dropdownParent: $(this).parent().parent(),
    });
  });
  $("form.culture select").each(function () {
    // clear value
    // $(this).val(null).trigger("change");
  });

  $(".results select[multiple]").each(function () {
    // delete Absent if length > 1
    $(this).on("select2:select", function (e) {
      if ($(this).val().length > 1) {
        $(this).val(
          $(this)
            .val()
            .filter((v) => v.toUpperCase() !== "ABSENT")
        );
        $(this).trigger("change");
      }
    });
  });
  Number(invoices?.footer_header_show) === 1 ? null : toggleHeaderAndFooter();
  // animate to main-space with js
  if (animate) {
    $("html, body").animate(
      {
        scrollTop:
          $("#main-space").offset().top *
            ($(window).width() < 2100 ? $(window).width() / 2100 : 1) -
          75,
      },
      1000
    );
  }
  hideHederelments();
}

function manageRange(reference) {
  const { range } = reference;
  const mapingRange = range.map((r) => {
    let normalRange = "";
    const { name = "", low = "", high = "" } = r;
    if (low !== "" && high !== "") {
      normalRange = `${(name ? `${name} : ` : "") + low} - ${high}`;
    } else if (low === "") {
      normalRange = `${name ? `${name} : ` : ""} <= ${high}`;
    } else if (high === "") {
      normalRange = `${(name ? `${name} : ` : "") + low} <= `;
    }
    return normalRange;
  });
  if (mapingRange.length > 0) {
    return mapingRange.join("<br>");
  }
  return "لا يوجد مرجع";
}

function addNormalResult(test, result_test, visit_hash) {
  __VISIT_TESTS__.push({ hash: test.hash, options: test.reference });
  return generateFieldForTest(test, result_test, visit_hash);
}

function generateFieldForTest(test, resultList, visit_hash) {
  const { type: testType, ...reference } = test.option_test;
  const checked = resultList?.[test.name]?.checked === "false" ? false : true;
  return `
  <form class="col-md-11 results test-normalTests mb-15" id="${test.hash}">
      <div class="row align-items-center">
          <div class="col-md-3 h6 text-center">
              ${testType === "normal" ? `${test.kit_name ?? "NO KIT"}` : ""}
              <a 
                class="text-info"
                onclick="updateNormal(
                  '${test.test_id}',
                  '${visit_hash}'
                )"
              >
                <i class="far fa-edit"></i>
              </a>
              <br>
              ${
                testType === "normal"
                  ? `(${test.device_name ?? "NO DEVICE"})`
                  : ""
              }
          </div>
          
          <div class="col-md-6">
              <h4 class="text-center mt-15">${test.name}</h4>
          </div>
          <input type="hidden" value="false" name="checked">
          <div class="col-md-3 text-center">
              <label class="text-dark">عرض النتيجة</label>
              <br>
              <label class="d-inline switch s-icons s-outline s-outline-invoice-slider mr-5">
                  <input type="checkbox" id="check_normal_${
                    test.hash
                  }" name="checked" ${
    checked ? "checked" : ""
  } onclick="toggleTest.call(this)"
    value="true"
  >
                  <span class="slider invoice-slider"></span>
              </label>
          </div>
          <div class="col-md-7 mb-3 text-center" dir="ltr">
              <label for="range" class="text-dark">المرجع</label>
              <h5 class="text-center">${
                reference.result_type.trim() === "result"
                  ? reference.right_options
                  : manageRange(reference)
              }</h5>
          </div>
         
          <div class="col-md-5 mb-3">
              <div class="row">
                  <div class="col-md-4 text-center d-flex justify-content-center align-items-end">
                      <span class="">${test.unit_name ?? ""}</span>
                  </div>
                  <div class="col-md-8">
                      <label for="result" class="w-100 text-center text-dark">النتيجة</label>
                      ${
                        reference?.[0]?.result?.trim() === "result"
                          ? `<select class="form-control result" id="result_${
                              test.hash
                            }" name="${test.name}">
                              ${reference.options
                                .map((option) => {
                                  return `<option value="${option}" ${
                                    resultList?.[test.name]
                                      ? resultList?.[test.name] === option
                                        ? "selected"
                                        : ""
                                      : reference.right_options.includes(option)
                                      ? "selected"
                                      : ""
                                  }>${option}</option>`;
                                })
                                .join("")}
                            </select>`
                          : `<input type="text" class="form-control result text-center" id="result_${
                              test.hash
                            }" dir="ltr" name="${
                              test.name
                            }" placeholder="ادخل النتيجة" ${
                              testType === "calc" ? "readonly" : ""
                            } value="${resultList?.[test.name]?.[test.name]}">`
                      }
                      
                  </div>
              </div>
          </div>
          
      </div>
  </form>
`;
}

function addStrcResult(test, result_test) {
  const { component } = test.option_test;

  let type = "";
  let results = {};

  let componentMarkup = component
    .map((comp) => {
      let typeDiff = comp.type != type;
      type = typeDiff ? comp.type : type;
      let input = "";
      let editable = "";
      let result = result_test?.[comp.name] ?? "";

      if (comp?.calc) {
        comp.eq = comp.eq.map((item) => {
          if (!isNaN(item)) {
            return item;
          } else if (!calcOperator.includes(item)) {
            item = result_test?.[item] ?? 0;
          }
          return item;
        });

        try {
          result = eval(comp.eq.join("")).toFixed(2);
          result = isFinite(result) ? (isNaN(result) ? "*" : result) : "*";
        } catch (e) {
          result = 0;
        }

        results[comp.name] = result;
        editable = "readonly";
      }

      switch (comp.result) {
        case "result":
          let options = comp.options;
          let htmlOptions = "";
          let multi = comp.multi === true ? "multiple" : "";
          // check if options is array or object
          if (options instanceof Array) {
            htmlOptions = options
              .map((option, index) => {
                let selected = "";

                if (!result) {
                  selected = index == 0 ? "selected" : "";
                } else {
                  if (comp.multi === true) {
                    selected = result.includes(option) ? "selected" : "";
                  } else {
                    selected = result == option ? "selected" : "";
                  }
                }

                return `<option value="${option}" ${selected}>${option}</option>`;
              })
              .join("");
          } else if (options instanceof Object) {
            htmlOptions = Object.keys(options)
              .sort((a, b) => {
                const firstCharA = a.charAt(0).toLowerCase();
                const firstCharB = b.charAt(0).toLowerCase();

                if (firstCharA < firstCharB) {
                  return -1;
                } else if (firstCharA > firstCharB) {
                  return 1;
                } else {
                  // ترتيب إضافي حسب الأرقام إذا كانت الأحرف متساوية
                  const numA = parseInt(a.replace(/\D/g, ""), 10);
                  const numB = parseInt(b.replace(/\D/g, ""), 10);

                  return numA - numB;
                }
              })
              .map((key) => {
                let selected = "";

                if (!result) {
                  selected = key == 0 ? "selected" : "";
                } else {
                  if (comp.multi === true) {
                    selected = result.includes(key) ? "selected" : "";
                  } else {
                    selected = result == key ? "selected" : "";
                  }
                }

                return `<option value="${key}" ${selected}>${key}</option>`;
              })
              .join("");
          }
          input = `
          <select 
            class="form-control result text-center h6"
            ${editable} 
            name="${comp.name}"
            id="result_${test.hash}" 
            ${multi}
          >
            ${htmlOptions}
          </select>`;
          break;
        case "number":
          input = `<input 
                      type="number" 
                      class="form-control result text-center" 
                      ${editable} 
                      id="result_${test.hash}" 
                      name="${comp.name}"
                      placeholder="ادخل النتيجة" 
                      value="${result}"
                  >`;
          break;
        default:
          input = `<input 
                      type="text" 
                      class="form-control result text-center" 
                      dir="ltr"
                      ${editable} 
                      value="${result}" 
                      id="result_${test.hash}" 
                      name="${comp.name}"
                      placeholder="ادخل النتيجة"
                  >`;
          break;
      }

      const typeMarkup =
        typeDiff && comp.type !== "Notes"
          ? `<div class="col-md-12 text-center">${comp.type}</div>`
          : "";

      return `
      ${typeMarkup}
      <div class="${
        comp.type === "Notes" ? "col-md-12" : "col-md-4"
      } mb-3 text-left">
        <label for="result" class="w-100 text-center text-black font-weight-bold h5">${
          comp.name
        } ${comp.unit ? `(${comp.unit})` : ""}</label>
        ${input}
      </div>`;
    })
    .join("");
  const fromId = `test-${test.name
    .replace(/\s/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")}`;
  const resultFormMarkup = `
    <form class="col-md-11 results ${fromId} mb-15" id="${test.hash}">
      <div class="row align-items-center justify-content-center">
        <div class="col-md-12">
          <h4 class="text-center mt-15">${test.name}</h4>
        </div>
        ${componentMarkup}
      </div>
    </form>
  `;

  return resultFormMarkup;
}

function selectInput({ options, result, multi, name }) {
  let htmlOptions = "";
  const multiple = Boolean(multi) === true ? "multiple" : "";
  htmlOptions = options
    .map((option, index) => {
      let selected = "";

      if (!result) {
        // selected = index === 0 ? "selected" : "";
      } else {
        if (Boolean(multi) === true) {
          selected = result.includes(option) ? "selected" : "";
        } else {
          selected = result === option ? "selected" : "";
        }
      }

      return `<option value="${option}" ${selected}>${option}</option>`;
    })
    .join("");
  return `
          <select 
            class="form-control result text-center h6 w-100"
            name="${name}"
            ${multiple}
          >
            ${htmlOptions}
          </select>`;
}

function addSusceptibility(funType, id, type, name, dose) {
  const randomId = Math.random().toString(36).substring(7);
  const component = [
    {
      name: "name",
      type: "result",
      options: [
        "Penicillins",
        "Cephalosporins",
        "Carbapenems",
        "Vancomycin",
        "Clindamycin",
        "Erythromycin",
        "Linezolid",
        "Tetracyclines",
        "Quinolones",
        "Rifampin",
        "Aminoglycosides",
        "Sulfonamides",
        "Trimethoprim",
        "Daptomycin",
        "Glycopeptides",
        "Oxazolidinones",
        "Streptogramins",
        "Fosfomycin",
        "Tedizolid",
        "Bacitracin",
        "Mupirocin",
        "Novobiocin",
        "Rifamycins",
        "Fluoroquinolones",
        "Lipopeptides",
        "Fusidic Acid",
        "Cycloserine",
        "Chloramphenicol",
        "Bactrim (combination of sulfamethoxazole and trimethoprim)",
        "Methicillin",
        "Telithromycin",
        "Rifabutin",
        "Ceftaroline",
        "Tedizolid phosphate",
        "Moxifloxacin",
        "Cephalosporins",
        "Carbapenems",
        "Aminoglycosides",
        "Fluoroquinolones",
        "Tetracyclines",
        "Sulfonamides",
        "Trimethoprim",
        "Monobactams",
        "Polymyxins",
        "Aztreonam",
        "Fosfomycin",
        "Colistin",
        "Glycopeptides (e.g., Vancomycin for certain Gram-negative bacteria with resistant profiles)",
        "Nitrofurans",
        "Quinolones",
        "Tigecycline",
        "Chloramphenicol",
        "Mupirocin",
      ],
    },
    {
      name: "dose",
      type: "result",
      options: ["+", "++", "+++", "++++"],
    },
  ];
  const item = component
    .map((item) => {
      const select = selectInput({
        options: item.options,
        result: item.name === "name" ? name : dose,
        multi: item.multi,
        name: `${type}.${item.name}`,
      });
      const element = `
              <div class="col-md-5">
                <label for="result" class="w-100 text-center text-black font-weight-bold h5">
                  ${item.name}
                </label>
                ${select}
              </div>
              `;
      return element;
    })
    .join("");
  const newItem = `
    <div class="row justify-content-center align-items-center mr-0" id="${type}-${randomId}">
      ${item}
      <div class="col-md-2 text-center w-100 border mt-30 bg-danger border-dark rounded" onclick="deleteElement('${type}-${randomId}')">
        <i class="fal fa-minus-circle" ></i>
      </div>
    </div>
    `;
  if (funType === "return") return newItem;
  const items = document.querySelector(`.${id} #${type}-items`);
  items.insertAdjacentHTML("beforeend", newItem);
  $(`#${type}-${randomId} select`).select2({
    width: "100%",
    tags: true,
    dropdownParent: $(`#${type}-${randomId}`),
  });
}

function deleteElement(id) {
  document.getElementById(id).remove();
}

function addCultureResult(test, result_test) {
  const { component } = test.option_test;
  const baseId = test.name.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "");
  const testId = `test-${baseId}`;

  let type = "";

  const componentMarkup = component
    .map((comp) => {
      let {
        options,
        multi,
        name,
        dependOn,
        hidden,
        type: componentType,
        result: resultType,
      } = comp;
      const typeDiff = componentType !== type;
      type = typeDiff ? componentType : type;
      let input = "";
      const editable = "";
      const result = result_test?.[name] ?? "";

      switch (resultType) {
        case "result":
          input = selectInput({
            options,
            result,
            multi,
            name,
          });
          break;
        case "multi": {
          input = `
          <div id="${name}-items" >
            <div class="text-center w-100 border rounded bg-success border-dark" onclick="addSusceptibility('void','${testId}','${name}','','')">
              <i class="fal fa-plus-circle" ></i>
            </div>
            ${
              Array.isArray(result)
                ? result
                    .map((item) => {
                      return addSusceptibility(
                        "return",
                        testId,
                        name,
                        item.name,
                        item.dose
                      );
                    })
                    .join("")
                : ""
            }
          </div>
          `;
          break;
        }

        default:
          input = `<textarea 
                      class="form-control result text-center" 
                      ${editable} 
                      id="result_${test.hash}" 
                      name="${comp.name}"
                      placeholder="ادخل النتيجة"
                  >${result}</textarea>`;
          break;
      }

      const typeMarkup =
        typeDiff && componentType !== "Notes"
          ? `<div class="col-md-12 text-center">${componentType}</div>`
          : "";

      const size = resultType === "multi" ? "col-md-6" : "col-md-12";
      // remove all .script
      const scripts = document.querySelectorAll(`.script-${testId}`);
      for (const script of scripts) {
        script.remove();
      }
      return `
      ${typeMarkup}
      ${
        dependOn
          ? ` <script class="script-${testId}">
      ${dependOn
        .map((depend) => {
          const { name, when } = depend;
          const dependResult = result_test?.[name] ?? "";
          if (Array.isArray(dependResult)) {
            hidden = dependResult.includes(when) ? "false" : "true";
          } else {
            hidden = dependResult === when ? "false" : "true";
          }
          return `
          $(document).on('change', '.${testId} [name="${name}"]', function(){
            const value = $(this).val();
            const id = "${comp.name.split(" ").join("-")}";
            const item = document.querySelector(".${testId} .dependon-show-" + id);
            const itemFlex = document.querySelector("#invoice-${baseId} .flex-dependon-show-" + id);
            if(value.includes("${when}")){
              item.style.display = "block";
              itemFlex.style.display = "flex";
            }
            else{
              item.style.display = "none";
              itemFlex.style.display = "none";
            }
          });
          `;
        })
        .join("")}

    </script>`
          : ""
      }
      <div class="${size} mb-3 text-left dependon-show-${name
        .split(" ")
        .join("-")}" style="display:${hidden === "true" ? "none" : "block"}">
        <label for="result" class="w-100 text-center text-black font-weight-bold h5">
          ${name} 
        </label>
        ${input}
      </div>`;
    })
    .join("");
  const resultFormMarkup = `
    <form class="col-md-11 results culture ${testId} mb-15" id="${test.hash}">
      <div class="row align-items-start justify-content-center">
        <div class="col-md-12">
          <h4 class="text-center mt-15">${test.name}</h4>
        </div>
        ${componentMarkup}
      </div>
    </form>
  `;

  return resultFormMarkup;
}

function addResult(data) {
  const { tests, ...visit } = data;
  __VISIT_TESTS__ = [];
  const resultForm = [
    `<div class="col-11 my-3">
    <input type="text" class="w-100 form-control search-class test-normalTests results product-search br-30" id="input-search-3" placeholder="ابحث عن التحليل" onkeyup="addTestSearch(this)">
</div>`,
  ];
  const result_tests = tests.reduce((acc, test) => {
    if (test.option_test.type === "type") {
      acc[test.name] = test.result;
    } else {
      acc[test.name] = test.result;
    }
    return acc;
  }, {});
  for (const test of tests) {
    const reference = test.option_test;
    if (reference.type === "calc") {
      let result = test.result[test.name];

      let evaluatedResult = 0;
      try {
        evaluatedResult = eval(
          reference.value
            .map((item) => {
              // check if item is number
              if (!isNaN(item)) {
                return item;
              }
              if (!calcOperator.includes(item)) {
                let newValue = result_tests?.[item]?.[item] ?? 0;
                newValue = newValue === "" ? 0 : newValue;
                return newValue;
              }
              return item;
            })
            .join("")
        );
      } catch (e) {}
      result = evaluatedResult.toFixed(1);
      finalResult = {};
      finalResult[test.name] = result;
      finalResult.checked = test.result.checked;
      resultForm.push(addNormalResult(test, finalResult, visit.hash));
    } else if (reference.type === "type") {
      resultForm.push(addStrcResult(test, result_tests[test.name]));
    } else if (reference.type === "culture") {
      resultForm.push(addCultureResult(test, result_tests[test.name]));
    } else {
      resultForm.push(addNormalResult(test, result_tests, visit.hash));
    }
  }
  return resultForm.join("");
}

function saveResult(hash) {
  const finalResults = [];
  const forms = document.querySelectorAll("form.results");
  for (const form of forms) {
    const data = {};
    const formData = new FormData(form);
    for (const [key, value] of formData) {
      if (key.includes(".")) {
        const [type, name] = key.split(".");
        if (!data[type]) {
          data[type] = [];
        }
        if (data[type].length === 0) {
          data[type].push({ [name]: value });
        } else {
          const lastObject = data[type][data[type].length - 1];
          if (lastObject[name] !== undefined) {
            data[type].push({ [name]: value });
          } else {
            data[type][data[type].length - 1] = {
              ...lastObject,
              [name]: value,
            };
          }
        }
      } else if (data[key] && key !== "checked") {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }
    const hash = form.id;
    finalResults.push({
      hash,
      result_test: JSON.stringify(data),
    });
  }
  fetchApi("/visit/saveTestsResult", "POST", {
    data: JSON.stringify(finalResults),
    visit_hash: hash,
  });
  showAddResult(hash, false);
}

function focusInput(type) {
  const list = $("input.result:visible");
  let index = list.index($("input.result:visible:focus"));
  if (type === "add") {
    index = (index + 1) % list.length;
  } else {
    index = (index - 1) % list.length;
  }
  index = index === -1 ? list.length - 1 : index;
  $("html, body").animate(
    {
      scrollTop:
        list.eq(index).parents(".results").offset().top *
          ($(window).width() < 2100 ? $(window).width() / 2100 : 1) -
        100,
    },
    250,
    () => {
      list.eq(index).focus();
    }
  );
}

function changeTotalPrice(hash) {
  const input = document.querySelector(`input[type=checkbox][value="${hash}"]`);
  let totalPrice = parseInt(document.querySelector("#total_price").value);
  try {
    let searchInput = document.querySelector("#input-search-all");
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("keyup"));
  } catch (e) {}
  try {
    let searchInput = document.querySelector("#input-search-2");
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("keyup"));
  } catch (e) {}
  try {
    let searchInput = document.querySelector("#input-search-3");
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("keyup"));
  } catch (e) {}

  if (input.checked) {
    totalPrice += parseInt(input.dataset.price);
    showSelectedTests(input.value, input.dataset.name, true);
    // add class to input parent
    $(input).parent(".items").addClass("itemsActive");
  } else {
    totalPrice -= parseInt(input.dataset.price);
    showSelectedTests(input.value, input.dataset.name, false);
    // remove class
    $(input).parent(".items").removeClass("itemsActive");
  }
  let discount = parseInt(document.querySelector("#dicount").value) || 0;
  document.querySelector("#total_price").value = totalPrice;
  let netPrice = totalPrice - discount;
  if (netPrice < 0) {
    netPrice = 0;
  }
  document.querySelector("#net_price").value = netPrice;
  // show_selected_test dwon scrool for dwon
  let show_selected_test = document.querySelector("#show_selected_tests");
  show_selected_test.scrollTop = show_selected_test.scrollHeight;
}

function showSelectedTests(hash, name, show = true) {
  const selectedTests = $("#show_selected_tests");
  if (show == true) {
    selectedTests.append(`
            <div class="border col-auto h6 m-3 p-3 rounded" id="show-test-${hash}" style="height:max-content">
                ${name}
                <i class="fa fa-times text-danger" onclick="toggleCheckboxAndSelectedTest('${hash}')"></i>
            </div>
        `);
  } else {
    $(`#show-test-${hash}`).remove();
  }
}

function toggleCheckboxAndSelectedTest(hash) {
  let checkbox = document.querySelector(
    `input[type=checkbox][value="${hash}"]`
  );
  // click checkbox
  checkbox.click();
  // changeTotalPrice(hash);
  // checkbox.checked = !checkbox.checked;
}

function netPriceChange() {
  let total_price = parseFloat($("#total_price").val());
  let discount = parseFloat($("#dicount").val()) || 0;
  let net_price = total_price - discount;
  if (net_price < 0) {
    net_price = 0;
  }
  $("#net_price").val(net_price);
}

const changeInvoiceTitle = (type) => {
  const title = $("#type-title");
  const prices = $(".money-show");
  const doctor = $(".doctor-name");
  const doctorInpot = $(".custom-doctor");
  const buttons = $(".invoicePrice");
  const inputs = $("input-check");
  buttons.toggleClass("active");

  switch (type) {
    case "money":
      title.text("وصــل اســتلام");
      prices.show();
      doctor.show();
      doctorInpot.hide();
      inputs.toggleClass("d-none");
      break;
    case "send":
      title.text("قسـيـمة تـحويـل الي مختبر");
      prices.hide();
      doctor.hide();
      doctorInpot.show();
      inputs.toggleClass("d-none");
      break;
    default:
      title.text("وصــل اســتلام");
      break;
  }
};

function showInvoice(hash) {
  const workSpace = $("#work-sapce");
  const { packages: visitPackages, ...visit } = fetchApi(
    `/visit/get_visit?hash=${hash}`
  );
  const invoice = `
    <div class="col-md-7 mt-4">
        <div class="statbox widget box box-shadow bg-white py-3">
            <div class="widget-content widget-content-area m-auto" style="width: 95%;">
                <div class="row justify-content-center">
                  <div class="col-5">
                  <button type="button" class="action btn btn-action mx-2 w-100 active invoicePrice" onclick="changeInvoiceTitle('money')">                      وصل استلام
                    </button>
                  </div>
                  <div class="col-5">
                  <button type="button" class="action btn btn-action mx-2 w-100 invoicePrice" onclick="changeInvoiceTitle('send')">                      قسيمة تحويل
                    </button>
                  </div>
                </div>
                <div class="book-result" dir="ltr" id="pdf">
                    <div class="page">
                        <!-- صفحة يمكنك تكرارها ----------------------------------------------------------------------------------------------------------------------->
                        <div class="header money">
                            <div class="row justify-content-between">
                                

                                <div class="left">
                                    <!-- عنوان جانب الايسر ------------------------------------------------------------------------------------------------------------->
                                    <div class="size1">
                                        <p class="title" id="type-title" style="font-size: 18px; margin-block-end: -5px;">وصــل اســتلام</p>
                                        <p class="namet" style="font-size: 18px; margin-block-end: -5px;">Return Receipt</p>
                                    </div>
                                </div>
                                <div class="right">
                                    <!-- عنوان جانب الايمن -->
                                    <div class="size1">
                                        <p class="title">${
                                          invoices?.name_in_invoice ??
                                          localStorage?.lab_name ??
                                          "اسم التحليل"
                                        }</p>
                                        <p class="namet">${
                                          localStorage?.invoice_about_ar ??
                                          "للتحليلات المرضية المتقدمة"
                                        }</p>
                                        <p class="certificate">${
                                          localStorage?.invoice_about_en ??
                                          "Medical Lab for Pathological Analyses"
                                        }</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="center2">
                            <div class="center2-background"></div>
                            <div class="nav">
                                <!-- شريط معلومات طالب التحليل --------------------------------------------------------------------------------------------->
                                <div class="name">
                                    <p class="">Name</p>
                                </div>
                                <div class="namego">
                                    <p>${visit.name}</p>
                                </div>
                                <div class="paid">
                                    <p class="">Barcode</p>
                                </div>
                                <div class="paidgo d-flex justify-content-center align-items-center">
                            <svg id="visit-${visit.id}-code"></svg>
                        </div>
                        <script>
                            JsBarcode("#visit-${visit.id}-code", '${
    visit.hash
  }', {
                                width:2,
                                height:18,
                                displayValue: false
                            });
                        </script>
                                <div class="vid">
                                    <p class="">Date</p>
                                </div>
                                <div class="vidgo">
                                    <p><span class="note">${visit.date}
                                </div>
                                <div class="prd">
                                <p class="doctor-name">Doctor</p>
                                <p class="custom-doctor" style="display: none;">Lab</p>
                                </div>
                                <div class="prdgo doctor-name">
                                    <p>${visit.doctor ?? ""}</p>
                                </div>
                                <input type="text" class="prdgo text-center custom-doctor"  style="display: none;z-index: 999;background-color: transparent">
                            </div>
                            <div class="tester">
                                ${manageHead()}
                                <div class="row m-0">
                                    ${visitPackages
                                      .map(
                                        (item, index) => `
                                        <div class="mytest test testprice-${
                                          item.hash
                                        }" id="testprice-${item.hash}">
                                        <!--سطر تسعيرة التحليل الذي سيتكرر----------------------------------------------------------------------->
                                        <div class="testname col-1">
                                            <p>${index + 1}</p>
                                        </div>
                                        <div class="testresult col-9">
                                            <p> ${item.name}</p>
                                        </div>
                                        <div class="testnormal col-2">
                                            <p class="money-show">${Number.parseInt(
                                              item.price
                                            )?.toLocaleString()}<span class="note">&nbsp; IQD</span></p>
                                            <label class="d-inline switch s-icons s-outline s-outline-invoice-slider custom-doctor d-print-none" style="display: none;">
                                                <input 
                                                  type="checkbox" 
                                                  name="new_patient" 
                                                  onchange="$('.testprice-${
                                                    item.hash
                                                  }').toggleClass('d-print-none opicty__4')"
                                                  id="check-${item.hash}"
                                                  checked
                                                  class="input-check d-none"
                                                >
                                                <span class="invoice-slider slider custom-doctor" style="display: none;"></span>
                                            </label>
                                        </div>
                                        
                                    </div>
                                    
                                    ${item.tests
                                      .split(",")
                                      .map((test, index) => {
                                        if (item.name !== test) {
                                          return `
                                    <div class="mytest test mr-5 border-0 testprice-${item.hash}" style="">
                                        <div class="testname col-1">
                                            <p></p>
                                        </div>
                                        <div class="testresult col-9">
                                            <p> ${test}</p>
                                        </div>
                                    </div>
                                    `;
                                        }
                                      })
                                      .join("")}
                                    `
                                      )
                                      .join("")}
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <div class="navtotal money-show">
                                <!--مجموع السعر مع الخصومات والمتبقي --------------------------------------------------------------------->
                                <div class="namett" style="width: 86%;">
                                    <p class="">Total</p>
                                </div>
                                <div class="namegot">
                                    <p class="">${Number.parseInt(
                                      visit.total_price
                                    )?.toLocaleString()}<span class="note">&nbsp; IQD</span></p>
                                </div>
                                <div class="paidt">
                                    <p class="">Discount</p>
                                </div>
                                <div class="paidgot">
                                    <p class="">${Number.parseInt(
                                      visit.dicount
                                    )?.toLocaleString()}<span class="note">&nbsp; IQD</span></p>
                                </div>
                                <div class="vidt">
                                    <p class="">Total Amount</p>
                                </div>
                                <div class="vidgot">
                                    <p class="">${Number.parseInt(
                                      visit.net_price
                                    )?.toLocaleString()}<span class="note">&nbsp; IQD</span></p>
                                </div>
                                <!--<div class="prdt">
                                    <p class="">Paid amount</p>
                                </div>
                                <div class="prdgot">
                                    <p>0<span class="note">&nbsp; IQD</span></p>
                                </div>
                                <div class="prdt">
                                    <p class="">Remaining amount</p>
                                </div> 
                                <div class="prdgot">
                                    <p>0<span class="note">&nbsp; IQD</span></p>
                                </div>-->
                            </div>
                            <div class="f2">
                                <!--عنوان او ملاحظات ---------------------------------------------------------------------------------------------------->

                                <p>${
                                  invoices?.address
                                    ? `${invoices?.address} <i class="fas fa-map-marker-alt"></i> &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;`
                                    : ""
                                }
                                <span class="note">${
                                  invoices?.facebook === ""
                                    ? ""
                                    : `&nbsp;&nbsp;&nbsp;&nbsp;  ${invoices?.facebook}  <i class="fas fa-envelope"></i>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;`
                                }</span>
                                
                                <span class="note">${
                                  invoices?.phone_1 === ""
                                    ? ""
                                    : `${invoices?.phone_1} <i class="fas fa-phone"></i>`
                                }</span></p>
                            </div>

                        </div>
                    </div>
                </div>
                <div class="row mt-15 justify-content-center">
                    <div class="col-3">
                        <button type="button" class="btn btn-outline-print w-100" onclick="printElement('.book-result', 'A3', 'css/invoice.css')">
                            <i class="mr-2 fal fa-print"></i>طباعة الفاتورة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
  workSpace.append(invoice);
  setInvoiceStyle();
  $("html, body").animate(
    {
      scrollTop: $("#main-space").offset().top - 75,
    },
    1000
  );
}

function invoiceHeader(invoice) {
  let html = "";
  const { size, workers, logo, name_in_invoice, show_name, show_logo } =
    invoice;
  if (workers.length > 0) {
    html = workers
      .map((worker) => {
        if (worker.hash == "logo") {
          return `
          <div 
            class="logo p-2 ${show_logo == "1" ? "d-flex" : "d-none"}" 
            style="flex: 0 0 ${size}%;max-width: ${size}%;"
          >
          <img src="${logo}" alt="" />
        </div>
        `;
        }
        if (worker.hash == "name") {
          return `
          <div style="
          flex: 0 0 ${size}%;
          max-width: ${size}%;
        " class="logo text-center  justify-content-center align-content-center ${
          show_name == "1" ? "d-flex" : "d-none"
        }">
              <h1 class="navbar-brand-name text-center">${
                name_in_invoice ?? localStorage.lab_name ?? ""
              }</h1>
          </div>
        `;
        }
        return `
        <div class="right" style="
        flex: 0 0 ${size}%;
        max-width: ${size}%;
      ">
          <div class="size1">
            <p class="title">${worker.jop ?? "Jop title"}</p>
            <p class="namet">${worker.name ?? "Worker name"}</p>
            <p class="certificate">${worker.jop_en ?? "Jop En title"}</p>
          </div>
        </div>
        `;
      })
      .join("");
  } else {
    html = `
        <div class="logo col-4 p-2 ${show_logo == "1" ? "d-flex" : "d-none"}">
            <img src="${logo ?? ""}"
            alt="${logo ?? "upload Logo"}">
        </div>
        <div class="logo border p-2 text-center  justify-content-center align-content-center ${
          show_name == "1" ? "d-flex" : "d-none"
        }">
            <h1 class="navbar-brand-name text-center">${
              name_in_invoice ?? localStorage.lab_name ?? ""
            }</h1>
        </div>`;
  }
  return `
    <div class="header">
        <div class="row justify-content-between">
            ${html}
        </div>
    </div>
  `;
}

function createBookResult(invoices, type) {
  return `<div class="book-result" dir="ltr" id="invoice-${type}" style="display: none;">
            ${invoices}
          </div>`;
}

function createInvoiceItems(visit) {
  const { invoice } = fetchData("Visit/getInvoice", "GET", {});
  const random = Math.floor(Math.random() * 1000000);
  const header = invoiceHeader(invoice);
  const nav = `
  <div class="nav">
    <div class="name">
      <p class="">Name</p>
    </div>
    <div class="namego">
      <p>
        ${
          visit.age > 16
            ? visit.gender === "ذكر"
              ? "السيد"
              : "السيدة"
            : visit.gender === "ذكر"
            ? "الطفل"
            : "الطفلة"
        } / ${visit.name}
      </p>
    </div>
    <div class="paid">
      <p class="">Barcode</p>
    </div>
    <div class="paidgo d-flex justify-content-center align-items-center">
      <svg id="visit-${random}-code"></svg>
    </div>
    <script>
        JsBarcode("#visit-${random}-code", '${visit.hash}', {
            width:2,
            height:20,
            displayValue: false
        });
    </script>
    <div class="agesex">
      <p class="">Sex / Age</p>
    </div>
    <div class="agesexgo">
      <p>
        <span class="note">
        ${
          visit.gender === "ذكر" ? "Male" : "Female"
        }</span> / <span class="note">${
    parseFloat(visit.age) < 1
      ? `${parseInt(visit.age * 356)} Day`
      : `${parseFloat(visit.age)} Year`
  }
        </span>
      </p>
    </div>
    <div class="vid">
      <p class="">Date</p>
    </div>
    <div class="vidgo">
      <p>
        <span class="note">${visit.date}</span>
      </p>
    </div>
    <div class="refby">
      <p class="">By</p>
    </div>
    <div class="refbygo">
      <p>${invoice.doing_by ?? "التحليل"}</p>
    </div>
    <div class="prd">
      <p class="">Doctor</p>
    </div>
    <div class="prdgo">
      <p><span class="note">${
        visit.doctor === "تحويل من مختبر اخر" ? "" : `${visit.doctor ?? ""}`
      }</span></p>
    </div>
  </div>
  `;
  const footer = `
  <div class="footer2">
    <div class="f1">
      <p>${
        invoice.address
          ? `<i class="fas fa-map-marker-alt"></i> ${invoice.address}`
          : ""
      }</p>
    </div>
    <div class="f2">
      <p>
        <span class="note">${
          invoice.facebook === ""
            ? ""
            : `<i class="fas fa-envelope"></i>  ${invoice.facebook}`
        }</span>
        <span class="note">${
          invoice.phone_1 === ""
            ? ""
            : `<i class="fas fa-phone"></i> &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;  ${invoice.phone_1}`
        }</span>
      </p>
    </div>
  </div>
  `;
  return { header, nav, footer, invoice };
}

function createInvoice(form, items) {
  const { header, nav, footer, invoice } = items;
  return `
		<div class="page">
			${header}
			<div class="center2">
        <div class="center2-background"></div>
        ${nav}
				<div class="tester">
					${form}
				</div>
			</div>
      ${footer}
		</div>`;
}

function getNormalRange(finalResult = "", range = []) {
  let { normalRange, color, flag } = {
    normalRange: "No Range",
    color: "dark",
    flag: "",
  };
  const { name = "", low = "", high = "" } = range;
  if (low !== "" && high !== "") {
    normalRange = `${(name ? `${name} : ` : "") + low} - ${high}`;
  } else if (low === "") {
    normalRange = `${name ? `${name} : ` : ""} <= ${high}`;
  } else if (high === "") {
    normalRange = `${(name ? `${name} : ` : "") + low} <= `;
  }
  try {
    let numers = finalResult.match(/\d+/g);
    if (numers) {
      finalResult = numers.join(".");
    }
  } catch (e) {
    console.log(e);
  }
  if (parseFloat(finalResult) < parseFloat(low)) {
    color = "text-info bg-dark-75";
    flag = "L";
  } else if (parseFloat(finalResult) > parseFloat(high)) {
    color = "text-danger bg-dark-75";
    flag = "H";
  } else {
    color = "text-dark";
    flag = "";
  }
  return { normalRange, color, flag };
}

function normalTestRange(finalResult = "", refrence) {
  let returnResult = {
    color: "text-dark",
    normalRange: "",
    flag: "",
  };
  if (!refrence) return returnResult;
  let { result_type: result, right_options, range } = refrence;
  switch (result) {
    case "result":
      finalResult = finalResult == "" ? right_options[0] : finalResult;
      if (right_options) {
        returnResult.color = right_options.includes(finalResult)
          ? "text-dark"
          : "text-danger p-1 border border-dark";
        returnResult.flag = right_options.includes(finalResult) ? "" : "H";
        returnResult.normalRange = right_options.join(" , ");
      }
      break;
    default:
      if (range.length == 1) {
        range = range[0];
        returnResult = getNormalRange(finalResult, range);
      } else if (range.length > 1) {
        let correctRange = range.find((item) => item?.correct);
        returnResult = getNormalRange(finalResult, correctRange);
        returnResult = {
          ...returnResult,
          normalRange: range
            .map((item) => {
              let { name = "", low = "<=", high = "<=" } = item;
              if (low != "" && high != "") {
                return (name ? `${name} : ` : "") + low + " - " + high;
              } else if (low == "") {
                return (name ? `${name} : ` : "") + " <= " + high;
              } else if (high == "") {
                return (name ? `${name} : ` : "") + low + " <= ";
              }
            })
            .join("<br>"),
        };
      }
      break;
  }
  return returnResult;
}

function addInviceButton(id, name) {
  return `
  <div class="col-auto">
    <button class="action btn btn-action mx-2 w-100" dir="ltr" id="test-${id}" onclick="getCurrentInvoice($(this))">
      ${name}
    </button>
  </div>`;
}

function showResult(data) {
  const { tests, ...visit } = data;
  const { data: history } = fetchData("Visit/history", "POST", {
    date: visit.date,
    patient: visit.patient_hash,
  });
  const { invoice, ...invoiceItems } = createInvoiceItems(visit);
  invoiceItems.invoice = invoice;
  const result_tests = tests.reduce((acc, test) => {
    if (test.option_test.type === "type") {
      acc[test.name] = test.result;
    } else {
      acc[test.name] = test.result[test.name];
    }
    return acc;
  }, {});
  let category = "";
  const invoices = { normalTests: "" };
  const buttons = {};
  const results = {};
  let height = 0;
  let normalTests = manageHead("flag");
  const defaultHeight = (invoice.center ?? 1200) - 250;
  tests.forEach((test, index) => {
    const reference = test.option_test;

    if (reference.type === "type") {
      const result_test = test.result;
      const options = test.option_test;
      const font = options?.font ?? invoices?.font ?? "16px";
      const idName = test.name.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "");
      buttons[idName] = addInviceButton(idName, test.name);
      let invoiceBody = "";
      const unit = options?.unit ?? "result";
      invoiceBody += `
            <div class="typetest test " data-flag="${unit}">
                <p>${test.name}</p>
            </div>
            `;
      let type = "";
      for (const reference of options.component) {
        let result = test.result?.[reference.name] ?? "";
        // reasult is array
        if (Array.isArray(result)) {
          result = result.slice(0, 3).join("<br>");
        }
        if (reference?.calc) {
          reference.eq = reference.eq.map((item) => {
            if (!isNaN(item)) {
              return item;
            } else if (!calcOperator.includes(item)) {
              item = result_test?.[item] ?? 0;
            }
            return item;
          });
          try {
            result = eval(reference.eq.join("")).toFixed(2);
            result = isFinite(result) ? (isNaN(result) ? "*" : result) : "*";
          } catch (e) {
            result = 0;
          }
          results[reference.name] = result;
          editable = "readonly";
        }
        let defualt = "";
        let resultClass = "";
        let flag = "";
        let {
          low = "",
          high = "",
          infinit = "",
        } = reference?.reference[0]?.range[0];
        if (infinit !== "" || (low && high)) {
          const fResult = normalTestRange(result, reference.reference[0]);
          resultClass = fResult.color;
          defualt = fResult.normalRange;
          flag = fResult.flag;
        } else if (low) {
          defualt = `${low} ${reference?.reference[0]?.unit ?? ""}`;
          const resultCompare = result
            .toString()
            .toUpperCase()
            .replace(/\s+/g, "");
          const defualtCompare = defualt
            .toString()
            .toUpperCase()
            .replace(/\s+/g, "");
          if (
            resultCompare === defualtCompare ||
            resultCompare === "" ||
            resultCompare === "ABSENT"
          ) {
            resultClass = "";
          } else {
            resultClass = "text-danger border border-dark";
            flag = "H";
          }
        }
        if (reference.type !== type && reference.type !== "Notes") {
          type = reference.type;
          invoiceBody += `
                        <div class="test strc-test row m-0 typetest sp" data-flag="${unit}">
                            <!-- تصنيف الجدول او اقسام الجدول ------------>

                            <div class="col-12" >
                                <p>${reference.type}</p>
                            </div>

                        </div>
                    `;
        }
        if (reference.type === "Notes") {
          invoiceBody += `
                        <div class="test strc-test row m-0">
                            <!-- تصنيف الجدول او اقسام الجدول ------------>

                            <div class="testname col-12" data-flag="${unit}">
                                <p>${reference.name}</p> : <p class="text-danger">${result}</p>
                            </div>
                        </div>
                    `;
        } else {
          invoiceBody += manageTestType(unit, {
            name: reference.name,
            result: result,
            color: resultClass,
            normal: defualt,
            unit: reference?.unit ?? "",
            flag: flag,
            font: font,
            history: "",
          });
        }
      }
      invoices[test.name.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "")] =
        invoiceBody;
    } else if (reference.type === "culture") {
      const { name, option_test: options } = test;
      const idName = name.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "");
      buttons[idName] = addInviceButton(idName, name);
      let invoiceBody = "";
      invoiceBody += `
            <div class="typetest test">
                <p>${name}</p>
            </div>
            `;
      let type = "";
      for (const reference of options.component) {
        const result = test.result?.[reference.name] ?? "";
        let finalResult = "";
        const typeOfResult = reference?.result ?? "result";
        switch (typeOfResult) {
          case "result":
            if (Array.isArray(result)) {
              finalResult = result.join("<br>");
            } else {
              finalResult = result;
            }
            break;
          case "multi":
            // if result is Array
            if (Array.isArray(result)) {
              finalResult = "";
              for (const obj of result) {
                for (const [key, value] of Object.entries(obj)) {
                  finalResult += ` ${value} `;
                }
                finalResult += "<br>";
              }
            }
            break;
          default:
            finalResult = result;
            break;
        }
        if (reference.type !== type && reference.type !== "Notes") {
          type = reference.type;
          invoiceBody += `
          <div class="test strc-test row m-0 typetest sp">
              <div class="col-12 px-0">
                  <p style="font-size: 22px;">${reference.type}</p>
              </div>
          </div>`;
        }
        if (reference.type === "Notes") {
          invoiceBody += `
          <div class="test strc-test row m-0 typetest sp">
              <div class="col-12 px-0">
                  <p style="font-size: 22px;">${reference.name}</p>
              </div>
          </div>`;
        }
        const testType = manageTestType(
          reference.type === "Notes" ? "notes" : "culture",
          {
            name: reference.name,
            result: finalResult,
            color: reference.italic,
            normal: "",
            unit: reference?.unit ?? "",
            flag: "",
            font: "18px",
            history: "",
            hidden: reference.hidden,
            dependOn: reference.dependOn,
            allResults: test.result,
          }
        );
        invoiceBody += testType;
      }
      invoices[idName] = invoiceBody;
    } else {
      if (height + reference.height >= defaultHeight) {
        invoices.normalTests += createInvoice(normalTests, invoiceItems);
        normalTests = manageHead("flag");
        if (category !== test.category) {
          height = 50;
        } else {
          if (category) {
            const classCategory = category.split(" ").join("_");
            normalTests += `
                          <div class="test typetest category_${classCategory}">
                              <p class="w-100 text-center font-weight-bolder h-22">${category}</p>
                          </div>
                          `;
          }
          height = 102;
        }
      } else {
        height += Number(reference.height);
      }
      if (buttons?.normalTests ?? true) {
        buttons.normalTests = `<div class="col-auto">
            <button class="action btn btn-action mx-2 w-100" id="test-normalTests" onclick="getCurrentInvoice($(this))">التحاليل</button>
        </div>`;
      }
      if (category !== test.category) {
        height += 51.91;
        category = test.category;
        if (category) {
          const classCategory = category.split(" ").join("_");
          normalTests += `
                        <div class="test typetest category_${classCategory}">
                            <p class="w-100 text-center font-weight-bolder h-22">${category}</p>
                        </div>
                        `;
        }
      }
      let result = test.result[test.name];
      if (reference.type === "calc") {
        let evaluatedResult = 0;
        try {
          evaluatedResult = eval(
            reference.value
              .map((item) => {
                // check if item is number
                if (!isNaN(item)) {
                  return item;
                }
                if (!calcOperator.includes(item)) {
                  let newValue = result_tests?.[item] ?? 0;
                  newValue = newValue === "" ? 0 : newValue;
                  return newValue;
                }
                return item;
              })
              .join("")
          );
        } catch (e) {}
        result = evaluatedResult.toFixed(1);
      }

      const { color, normalRange, flag } = normalTestRange(result, reference);
      normalTests += manageTestType("flag", {
        name: test.name,
        color: color,
        result: result,
        hash: test.hash,
        category: category,
        checked: test.result?.checked === "false" ? "none" : "flex",
        normal: normalRange,
        flag: flag,
        history: history.find((item) => item.name == test.name)?.result ?? "",
        unit: test.unit_name ?? "",
      });
    }
  });
  return {
    buttons: `<div class="row justify-content-center mb-30" id="invoice-tests-buttons">
                    ${Object.values(buttons).join("")}
                </div>`,
    invoice: `${Object.entries(invoices)
      .map(([key, value]) => {
        if (key === "normalTests") {
          const form = value + createInvoice(normalTests, invoiceItems);
          return createBookResult(form, key);
        }
        return createBookResult(createInvoice(value, invoiceItems), key);
      })
      .join("")}`,
  };
}

function getCurrentInvoice(ele) {
  if (ele && ele.length == 0) {
    ele = $("#invoice-tests-buttons").find("button").first();
  }
  let elementId = ele.attr("id");
  localStorage.setItem("currentInvoice", elementId);
  let id = elementId?.split("-")[1];
  // get invoice
  let invoice = $(`#invoice-${id}`);
  // hide all invoices
  $(".book-result").hide();
  $(".results").hide();
  $(`.test-${id}`).show();
  // show current invoice
  invoice.show();
  // change active button
  $("#invoice-tests-buttons .btn").removeClass("active");
  $(`#test-${id}`).addClass("active");
  $("#print-invoice-result").attr("onclick", `printOneInvoice('${id}')`);
}

function printAll() {
  new Promise((resolve, reject) => {
    saveResult($("#saveResultButton").attr("onclick").split(`'`)[1]);
    resolve();
  }).then(() => {
    let normalTestsButton = $("#test-normalTests");
    let currentInvoice =
      localStorage.getItem("currentInvoice") == "undefined" ||
      !localStorage.getItem("currentInvoice")
        ? $("#invoice-tests-buttons").find("button").first().attr("id")
        : localStorage.getItem("currentInvoice");
    if (normalTestsButton.length) {
      normalTestsButton.click();
    }
    printElement(".book-result", "A4", "css/invoice.css");
    if (currentInvoice) {
      $(`#${currentInvoice}`).click();
    }
  });
}
function printOneInvoice(id = null) {
  new Promise((resolve, reject) => {
    saveResult($("#saveResultButton").attr("onclick").split(`'`)[1]);
    resolve();
  }).then(() => {
    if (id) {
      printElement(`#invoice-${id}`, "A4", "css/invoice.css");
    } else {
      printElement(
        `#invoice-${$(".book-result").first().attr("id").split("-")[1]}`,
        "A4",
        "css/invoice.css"
      );
    }
  });
}

function setInvoiceStyle() {
  $(".sections").css("border-bottom", `2px solid ${invoices?.color}`);
  if (invoices?.water_mark == "1") {
    $(".center2-background").css(
      "background-image",
      `url('${invoices?.logo}')`
    );
  } else {
    $(".center2-background").css("background-image", `none`);
  }
  $(".namet").css("color", `${invoices?.color}`);
  $(".page .header:not(.money)").height(invoices?.header);
  $(".page .footer2").height(invoices?.footer - 5);
  $(".page .center2").height(invoices?.center - 15);
  $(".page .center").height(invoices?.center);
}

const waitDwonloadElement = `<div id="alert_screen" class="alert_screen"> 
<div class="loader">
    <div class="loader-content">
        <div class="card" style="width: 40rem;">
            <div class="card-body text-center">
              <h1 class="card-title">الرجاء الانتظار </h1>
              <h4>جاري تحميل الفاتورة</h4>
              <img class="spinner-grow-alert" src="${front_url}assets/image/flask.png" width="100" height="100" alt="alert_screen">
              <div class="w-100 mt-5"></div>
            </div>
          </div>
    </div>
</div>
</div>`;

function dwonloadInvoice(hash) {
  const body = document.getElementsByTagName("body")[0];
  body.insertAdjacentHTML("beforeend", waitDwonloadElement);
  let lab_hash = localStorage.getItem("lab_hash");

  fetch(`${base_url}Pdf/dwonload?pk=${hash}&lab=${lab_hash}`).then((res) => {
    $("#alert_screen").remove();
    Swal.fire({
      icon: "success",
      title: "تم تحميل النتائج",
      showCancelButton: true,
      cancelButtonText: "الغاء",
      confirmButtonText: "عرض مجلد النتائج",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${base_url}Pdf/openFolder?pk=${hash}&lab=${lab_hash}`);
      }
    });
  });
}

const waitSendElement = `<div id="alert_screen" class="alert_screen"> 
<div class="loader">
    <div class="loader-content">
        <div class="card" style="width: 40rem;">
            <div class="card-body text-center">
              <h1 class="card-title">الرجاء الانتظار </h1>
              <h4>جاري تهيئة النتائج للارسال</h4>
              <img class="spinner-grow-alert" src="${front_url}assets/image/flask.png" width="100" height="100" alt="alert_screen">
              <div class="w-100 mt-5"></div>
            </div>
          </div>
    </div>
</div>
</div>`;

async function sendWhatsapp(hash, phone, name) {
  let text = `نتائج تحليل المختبري للمريض ${name}`;
  if (!navigator.onLine) {
    Swal.fire({
      icon: "error",
      title: "تأكد من الاتصال بالانترنت",
      text: "لا يوجد اتصال بالانترنت",
    });
    return;
  }
  if (phone?.length > 10) {
    if (phone[0] == "0") {
      phone = `964${phone.slice(1)}`;
    } else {
      phone = `964${phone}`;
    }
    const body = document.getElementsByTagName("body")[0];
    body.insertAdjacentHTML("beforeend", waitSendElement);
    let lab_hash = localStorage.getItem("lab_hash");
    await fetch(
      `${base_url}Pdf/path?pk=${hash}&lab=${lab_hash}&phone=${phone}&name=${name}`
    ).then((res) => {
      // window.open(
      //   `https://api.whatsapp.com/s end?phone=${phone}&text=${text}`,
      //   "_blank"
      // );
      $("#alert_screen").remove();
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "تأكد من رقم الموبايل",
      text: "لا يوجد رقم موبايل للمريض",
    });
  }
}

function manageHead(type) {
  switch (type) {
    case "result":
      return `
            <div class="testhead row sections m-0 mt-2 category_category">
                <div class="col-4">
                    <p class="text-right">Test Name</p>
                </div>
                <div class="col-6 justify-content-between">
                    <p class="text-center w-100">Result</p>
                </div>
                <div class="col-2">
                    <p class="text-right">Range</p>
                </div>
            </div>
            `;
    case "unit":
      return `
            <div class="testhead row sections m-0 mt-2 category_category">
                <div class="col-4">
                    <p class="text-right">Test Name</p>
                </div>
                <div class="col-4 justify-content-between">
                    <p class="text-center w-100">Result</p>
                </div>
                <div class="col-2">
                    <p class="text-right">Unit</p>
                </div>
                <div class="col-2">
                    <p class="text-right">Range</p>
                </div>
            </div>
            `;
    case "flag":
      return `
            <div class="testhead row sections m-0 mt-2 category_category">
                <div class="col-3 pr-0">
                    <p class="text-right">Test Name</p>
                </div>
                <div class="col-3 pr-0 justify-content-between">
                    <p class="text-center w-100">Result</p>
                </div>
                <div class="col-1 pr-0 justify-content-between">
                    <p class="text-center w-100">Flag</p>
                </div>
                <div class="col-2 pr-0">
                    <p class="text-right">Unit</p>
                </div>
                <div class="col-3 pr-0">
                    <p class="text-right">Normal Range</p>
                </div>
            </div>
            `;
    default:
      return `
            <div class="row m-0 mt-2 sections">
                <!-- تصنيف الجدول او اقسام الجدول --------------------------------------------------------------------------------------->

                <div class="col-1 text-right">
                    <p>#</p>
                </div>
                <div class="col-9 text-right">
                    <p>Analysis Type</p>
                </div>
                <div class="col-2 text-right">
                    <p class="doctor-name">Price</p>
                </div>
            </div>
            `;
  }
}

function manageTestType(type, test = {}) {
  const {
    name,
    color,
    result,
    hash,
    category,
    checked,
    normal,
    unit,
    flag,
    font,
    history,
    hidden,
    dependOn,
    allResults,
  } = test;
  let htmlHestory = "";
  if (invoices?.history === "1") {
    if (history != "" && history && history != "{}") {
      htmlHestory = `<div class="testprice col-12 h5 text-right text-info">
        ${history} ${history != "" ? unit : ""}
      </div>`;
    }
  }

  switch (type) {
    case "flag":
      return `
            <div data-flag="flag" class="test row m-0 category_${category
              ?.split(" ")
              ?.join(
                "_"
              )} border-test" id="test_normal_${hash}" data-cat="${category
        ?.split(" ")
        ?.join("_")}" style="display:${checked}">
                <div class="testname col-3">
                    <p class="text-right w-100">${name}</p>
                </div>
                <div class="testresult result-field col-3">
                    <p class="${color} w-100 text-center">${result ?? ""}</p>
                </div>
                <div class="testresult col-1">
                    ${
                      name == "Blood Group (ABO)"
                        ? ""
                        : `<p class="${
                            color.includes("text-danger")
                              ? "text-danger"
                              : color.includes("text-info")
                              ? "text-info"
                              : ""
                          } w-100 text-center">${flag}</p>`
                    }
                </div>
                <div class="testresult col-2">
                    <p> ${unit}</p>
                </div>
                <div class="testnormal col-3 text-right" contenteditable="true">
                    <p class="text-right" contenteditable="true">${normal}</p>
                </div>
                ${htmlHestory}
            </div>
            `;
    case "unit":
      return `
            <div style="font-size:${font} !important" data-flag="unit" class="test strc-test row m-0">
                    <div class="testname col-4">
                        <p>${name}</p>
                    </div>
                    <div class="testresult result-field col-4 justify-content-center">
                        <p class="w-75 text-center ${color}">${result.toString()} </p>
                        <!--<span class="text-info">${history.toString()}</span>-->
                    </div>
                    <div class="testname col-2" >
                        <p>${unit ?? ""}</p>
                    </div>
                    <div class="testnormal col-2">
                        <p contenteditable="true">${normal}</p>
                    </div>
                </div>
            `;
    case "result":
      return `
            <div style="font-size:${font} !important" data-flag="result" class="test strc-test row m-0">
                    <div class="testname col-4">
                        <p>${name}</p>
                    </div>
                    <div class="testresult result-field col-6 justify-content-center">
                        <p class="w-75 text-center ${color}">${result.toString()} </p>
                        <!--<span class="text-info">${history.toString()}</span>-->
                    </div>
                    <div class="testnormal col-2">
                        <p contenteditable="true">${normal}</p>
                    </div>
                </div>`;
    case "notes":
      return `
            <div class="strc-test row m-0">
                <div class="testname col-12">
                    <p class="text-right pr-2">${result}</p>
                </div>
            </div>
            `;
    case "culture":
      const showClass = `flex-dependon-show-${name.split(" ").join("-")}`;
      const italic = color === "italic" ? "font-style: italic;" : "";
      let hiddenClass = hidden;
      dependOn
        ? dependOn.map((depend) => {
            const { name, when } = depend;
            const d = allResults?.[name] ?? "";
            hiddenClass = d.includes(when) ? "false" : "true";
          })
        : null;

      return `
            <div style="font-size:${font} !important;display:${
        hiddenClass === "true" ? "none" : "flex"
      }" data-flag="result" class="test strc-test row m-0 border-test ${showClass}" >
                    <div class="testname col-6">
                        <p style="${italic}" class="text-right">${name}</p>
                    </div>
                    <div class="testresult result-field col-6 justify-content-center ">
                        <p style="${italic}" class="w-75 text-right">${result.toString()} </p>
                    </div>
            </div>`;
    default:
      break;
  }
}

const addTestSearch = (e) => {
  const value = $(e).val();
  const rex = new RegExp(value, "i");
  $(".results.test-normalTests:not(.search-class)").hide();
  $(".results.test-normalTests:not(.search-class)")
    .filter(function () {
      return rex.test($(this).text());
    })
    .show();
};

const updatePhone = (hash) => {
  const phone = $("#patientPhone").val();
  if (phone.length >= 10) {
    fetchApi("/patient/update_patient", "POST", { hash, phone });
    niceSwal("success", "bottom-end", "تم تحديث رقم الموبايل بنجاح");
  } else {
    niceSwal("error", "bottom-end", "رقم الموبايل غير صحيح");
  }
};

function downloadPdf() {
  const svgs = $("svg.border-print-hover");
  if (svgs.length === 0)
    return niceSwal("error", "bottom-end", "يجب عليك اختيار فاتورة اولا");
  const oldId = $(".book-result:visible").attr("id");
  $(`#${oldId}`).css("display", "none");
  // get data-id
  svgs.each((i, svg) => {
    const id = $(svg).attr("data-id");
    $(`#${id}`).css("display", "block");
  });
  // .book-result:visible svg is not parent <>,.

  $("#work-sapce .book-result:visible").printThis({
    importCSS: false,
    loadCSS: [
      "lab/bootstrap/css/bootstrap.min.css",
      "lab/css/invoice.css",
      "lab/css/style.css",
      "lab/plugins/font-awesome/css/all.css",
    ],
    printDelay: 2000,
    afterPrint: () => {
      $("iframe").remove();
      svgs.each((i, svg) => {
        let id = $(svg).attr("data-id");
        $(`#${id}`).css("display", "none");
      });
      $(`#${oldId}`).css("display", "block");
    },
  });

  // get onclick attr from saveResultButton
  let onclick = $("#saveResultButton").attr("onclick");
  //get hash from onclick attr
  let hash = onclick.split("'")[1];

  lab_visits.dataTable.ajax.reload();
}

function printAfterSelect(hash) {
  fetchApi("/visit/update_visit_status", "POST", { hash: hash, status: 3 });
  let __invoces = $("#work-sapce .book-result");
  // modal body
  let body = $("#print-dialog .modal-body");
  // empty body
  body.empty();
  // loop over all invoices
  __invoces.each(function (index, invoice) {
    // invice clone
    if (invoice.querySelector(".tester").childElementCount <= 1) {
      return;
    }
    let clone = $(invoice).clone();
    let id = clone.attr("id");
    clone.removeAttr("id");
    // add style to clone zoom 25%
    clone.css("zoom", "33.33%");
    // remove display none from clone
    clone.css("display", "block");
    // PUT INVOCES IN SVG
    let svg = `
        <div class="col-md-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="500px" style="direction:ltr" data-id="${id}" onclick="hoverInvoice(this)">
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml">
                        ${clone[0].outerHTML}
                    </div>
                </foreignObject>
            </svg>
        </div>
        `;
    // put svg in body
    body.append(svg);
  });
  // show modal
  $("#print-dialog").modal("show");
}

async function printAllInvoices(hash) {
  fireSwal(saveResult, hash);
  setTimeout(() => {
    fetchData(`Pdf/print?pk=${hash}&lab=${localStorage.getItem("lab_hash")}`);
  }, 1000);
}

function hoverInvoice(element) {
  if (element.nodeName.toLowerCase() === "svg") {
    $(element).toggleClass("border-print-hover");
  }
}

const updatePatientName = async (hash, ele) => {
  const name = $(ele).val();
  const formData = new FormData();
  formData.append("hash", hash);
  formData.append("name", name);
  await fetch(`${base_url}Patient/updateName`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.token}`,
    },
  })
    .then((res) => res.json())
    .then((res) => {
      const { status, message } = res;
      if (status === 200) {
        lab_visits.dataTable.ajax.reload();
        niceSwal("success", "bottom-end", message);
      } else {
        niceSwal("error", "bottom-end", message);
      }
    });
};

const updateNormal = (test, visit_hash) => {
  TEST = fetchApi("/maintests/get_by_patient_and_test", "post", {
    hash: test,
    visit_hash,
  });
  try {
    let { refrence } = TEST;
    reference = [refrence];
    if (reference.length === 0) {
      throw "no refrence";
    }
    const refrenceTable = THEME.build(
      test,
      reference,
      refrence?.kit ?? "",
      refrence?.unit ?? ""
    );
    $("#refrence_editor .modal-body").html(refrenceTable);
    $("#refrence_editor").modal("show");
  } catch (error) {
    console.log(error);
    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "error",
      title: "لا يوجد رينجات لتعديلها يرجي اضافة رينجات اولا",
      showConfirmButton: false,
      timer: 3000,
    });
  }
};

function updateRefrence(hash, refID, selectedUnit) {
  const formContainer = $("#form_container");
  // empty from container
  formContainer.empty();
  let refrence = TEST?.refrence;
  const form = THEME.mainForm(refID, hash, refrence);
  formContainer.append(form);
}

function saveRefrence(hash, refID) {
  if (refreshValidation() === false) {
    return false;
  }
  const result = $(`#refrence_form_${refID} input[name="type"]:checked`).val();
  const rightOptions = [];
  const options = [];
  if (
    $(`#refrence_form_${refID} input[name="type"]:checked`).val() === "result"
  ) {
    $(`#refrence_form_${refID} input[name='select-result-value']`).each(
      function () {
        options.push($(this).val());
        if (
          $(this)
            .parent()
            .parent()
            .find('input[name="select-result"]')
            .is(":checked")
        ) {
          rightOptions.push($(this).val());
        }
      }
    );
  }
  const { refrence, name } = fetchApi("/maintests/get_main_test", "post", {
    hash,
  });
  let component = [
    {
      name: name,
      reference: refrence,
    },
  ];
  const element = THEME.getData(refID, result, options, rightOptions);
  if (refID === "null") {
    if (component?.[0]) {
      component[0].reference.push(element);
    } else {
      component = [
        {
          name: test.test_name,
          reference: [element],
        },
      ];
      document.getElementById(`test-${hash}`).innerHTML = "";
    }
    const newRefrence = component[0].reference.filter((item, index, self) => {
      return self.findIndex((t) => t?.kit === item?.kit) === index;
    });
    // (${element['age low']??0} ${element['age unit low']} - ${element['age high']??100} ${element['age unit high']})
    if (
      $(
        `#test-${hash}_kit-${(
          kits
            .find((x) => x.id === element.kit)
            ?.name.replace(/[^a-zA-Z0-9]/g, "_") ?? "No Kit"
        )
          .split(" ")
          .join("_")}`
      ).length === 0
    ) {
      document.getElementById(
        `test-${hash}`
      ).innerHTML += ` <span class="badge badge-light border border-info p-2 mr-2 mb-2 col-auto" id="test-${hash}_kit-${(
        kits
          .find((x) => x.id === element.kit)
          ?.name.replace(/[^a-zA-Z0-9]/g, "_") ?? "No Kit"
      )
        .split(" ")
        .join("_")}" style="min-width:200px">
            ${kits.find((x) => x.id === element.kit)?.name ?? "No Kit"} 
            <a onclick="editRefrence('${hash}',${
        newRefrence.length - 1
      })"><i class="far fa-edit fa-lg mx-2 text-success"></i></a>
            </span> `;
    }
  } else {
    component[0].reference[refID] = element;
  }
  fetchApi("/maintests/update_main_test", "post", {
    hash,
    option_test: JSON.stringify({ component }),
  });
  $("#refrence_editor").modal("hide");
  TEST = null;
}

function deleteRange(e, id) {
  const num = $(`#${id} .range`).length;
  if (num > 1) {
    e.parents(".range").remove();
  }
}
