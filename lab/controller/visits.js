const calcOperator = ["+", "-", "*", "/", "(", ")", "Math.log10("];
let HASH = null;

let units = run(`select name,hash from lab_test_units;`).result[0].query0;
let __VISIT_TESTS__ = [];

const changePatient = function (el) {
  $("#visits_patient_id-form").empty();
  if (!el.is(":checked")) {
    $("#visits_patient_id-form").append(`
            <label for="visits_patient_id">اسم المريض</label>
            <select class="form-control" id="visits_patient_id" onchange="getOldPatient(this.value)">
            <option value="0">اختر المريض</option>
            ${patients
              .map(
                (patient) =>
                  `<option value="${patient.hash}">${patient.name}</option>`
              )
              .join("")}
            </select>
            <script>
                $('#visits_patient_id').select2({
                    width: '100%'
                });
            </script>
            `);
  } else {
    lab_visits.resetForm();
    $("#show_selected_tests").empty();
    $("#visits_patient_id-form").append(`
            <label for="visits_patient_id">اسم المريض</label>
            <input type="text" class="form-control" id="visits_patient_id" placeholder="اسم المريض">
            `);
  }
};

function toggleHeaderAndFooter() {
  const invoiceShow = $(".book-result .header .row:visible").length;
  try {
    invoices.footer_header_show = invoiceShow == 0 ? 1 : 0;
  } catch (error) {
    console.log("يجب اضافة الفورمة");
  }
  run(
    `update lab_invoice set footer_header_show='${
      invoiceShow == 0 ? 1 : 0
    }' where lab_hash='${localStorage.getItem("lab_hash")}';`
  );
  let header = $(".book-result .header");
  let footer = $(".book-result .footer2");
  header.each(function () {
    // toggle all header children
    $(this).children().toggle();
  });
  footer.each(function () {
    $(this).children().toggle();
  });
}

function toggleTest() {
  let test = $(this);
  let hash = test.attr("id").split("_")[2];
  let testInvoice = $(`#test_normal_${hash}`);
  let category = testInvoice.attr("data-cat");
  if (test.is(":checked")) {
    if ($(`.category_${category}:visible`).length == 0) {
      $(`.category_${category}`).first().show();
      $(`.category_${category} p`).show();
    }
    testInvoice.show();
  } else {
    testInvoice.hide();
    if ($(`.category_${category}:visible`).length == 1) {
      $(`.category_${category}:visible`).hide();
    }
  }
  // manageInvoiceHeight();
  // cloneOldInvoice(manageInvoiceHeight());
}

const getAge = function (birth) {
  let ageInMilliseconds = new Date() - new Date(birth);
  let age = ageInMilliseconds / 1000 / 60 / 60 / 24 / 365;
  // get age in years
  let age_year = Math.floor(age);
  // get age in months
  let age_month = Math.floor((age - age_year) * 12);
  // get age in days
  let age_day = Math.floor((age - age_year - age_month / 12) * 365);
  return { year: age_year, month: age_month, day: age_day };
};

const getOldPatient = function (hash) {
  if (hash != 0) {
    let patient = lab_patient.getItem(hash);
    let { year, month, day } = getAge(patient.birth ?? TODAY);
    $("#age_year").val(year);
    $("#age_month").val(month);
    $("#age_day").val(day);
    $("#gender").val(patient.gender).trigger("change");
    $("#phone").val(patient.phone);
    $("#address").val(patient.address);
  }
};

function showPackagesList(hash) {
  let package = packages.find((package) => package.hash == hash);
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
  let visit =
    run(`SELECT name,age,visit_date,total_price, net_price, note,visits_patient_id,hash,
                            (select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor 
                     FROM lab_visits WHERE hash = ${hash};`).result[0]
      .query0[0];
  let patient = run(
    `SELECT * FROM lab_patient WHERE hash=${visit.visits_patient_id};`
  ).result[0].query0[0];
  let workSpace = $("#work-sapce");
  workSpace.html("");
  let visitInfo = `
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
                                <td>${visit?.name ?? ""}</td>
                            </tr>
                            <tr>
                                <td>الطبيب المعالج</td>
                                <td>${visit?.doctor ?? ""}</td>
                            </tr>
                            <tr>
                                <td>العمر</td>
                                <td>${
                                  parseFloat(visit?.age).toFixed(0) ?? ""
                                } سنة</td>
                            </tr>
                            <tr>
                                <td>التاريخ</td>
                                <td>${visit?.visit_date ?? ""}</td>
                            </tr>
                            <tr>
                                <td>اجمالي المبلغ</td>
                                <td>${
                                  visit?.total_price?.toLocaleString() ?? ""
                                } IQD</td>
                            </tr>
                            <tr>
                                <td>صافي الدفع</td>
                                <td>${
                                  visit?.net_price?.toLocaleString() ?? ""
                                } IQD</td>
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
                                <td>${patient.name}</td>
                            </tr>
                            <tr>
                                <td>تاريخ الميلاد</td>
                                <td>${patient.birth}</td>
                            </tr>
                            <tr>
                                <td>النوع</td>
                                <td>${patient.gender}</td>
                            </tr>
                            <tr>
                                <td>رقم الهاتف</td>
                                <td>
                                    <div class="input-group my-2">
                                        <input type="text" class="form-control" id="patientPhone" placeholder="${
                                          patient.phone
                                        }" value="${patient.phone}">
                                        <div class="input-group-append">
                                            <button class="btn btn-add" type="button" onclick="updatePhone('${
                                              patient.hash
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

function showAddResult(hash, animate = true) {
  $(".action").removeClass("active");
  $("#show_add_result").addClass("active");
  let workSpace = $("#work-sapce");
  workSpace.html("");
  let data = run(`select age,
                           gender,
                           phone,
                           lab_patient.name,
                           DATE(visit_date) as date,
                           TIME(visit_date) as time,
                           (select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor,
                           visits_patient_id as patient,
                           lab_visits.hash
                        from lab_visits 
                        inner join lab_patient on lab_patient.hash = lab_visits.visits_patient_id
                        where lab_visits.hash = '${hash}';
                    select 
                        option_test as options,
                        test_name as name,
                        kit_id,
                        (select name from devices where devices.id=lab_device_id) as device_name,
                        (select name from kits where kits.id =kit_id) as kit_name,
                        (select name from lab_test_units where hash=lab_pakage_tests.unit) as unit_name,
                        (select name from lab_test_catigory where hash=lab_test.category_hash) as category,
                        unit,
                        result_test,
                        lab_visits_tests.hash as hash,
                        test_id
                    from 
                        lab_visits_tests 
                    left join
                        lab_pakage_tests
                    on 
                        lab_pakage_tests.test_id = lab_visits_tests.tests_id and lab_pakage_tests.package_id = lab_visits_tests.package_id
                    inner join
                        lab_test
                    on
                        lab_test.hash = lab_visits_tests.tests_id
                    where 
                        visit_id = '${hash}'
                    order by sort;`);
  let visit = data.result[0].query0[0];
  let visitTests = data.result[1].query1;

  let form = addResult(visit, visitTests);
  let { invoice, buttons } = showResult(visit, visitTests);
  let html = `
    <div class="col-lg-12 mt-4">
        <div class="statbox widget box box-shadow bg-white py-3">
            <div class="widget-content widget-content-area m-auto" style="width: 95%;">
                <div class="row">
                    <div class="col-lg-12">
                    ${buttons}
                    </div>
                    <div class="col-md-6 mt-48 form-height" style="overflow-y:scroll;">
                        ${form}
                        <div class="row mt-15 justify-content-center">
                            
                        </div>
                    </div>
                    <div class="col-md-6 mt-48 invoice-height global-border" style="overflow-y:scroll;">
                        ${invoice}
                    </div>
                    <div class="col-lg-12 mt-48">
                        <div class="row mt-15 justify-content-center">
                            <div class="col-md-3 col-6">
                                <button type="button" id="saveResultButton" class="btn btn-add w-100" onclick="fireSwal(saveResult,'${hash}')">حفظ النتائج</button>
                            </div>
                            <div class="col-md-3 col-6">
                                <button type="button" class="btn btn-outline-print w-100" onclick="printAfterSelect()">
                                    <i class="mr-2 fal fa-print"></i>طباعة النتائج
                                </button>
                            </div>
                            <!--<div class="col-md-3 col-6">
                                <button type="button" class="btn btn-outline-print w-100" id="print-invoice-result">
                                    <i class="mr-2 fal fa-print"></i>طباعة النتائج
                                </button>
                            </div>
                            <div class="col-md-2 col-6">
                                <button type="button" class="btn btn-outline-print w-100" id="print-all-invoice-result">
                                    <i class="mr-2 fal fa-print"></i>طباعة الكل
                                </button>
                            </div>-->
                            <div class="col-md-3 col-6">
                                <button type="button" class="btn btn-add w-100" onclick="sendByWhatsapp('${hash}','${visit.phone}')">
                                    <i class="mr-2 fab fa-whatsapp"></i>ارسال النتائج
                                </button>
                            </div>
                            <!--<div class="col-md-2 col-6">
                                <a type="button" class="btn btn-outline-print w-100" onclick="printAfterSelect()">
                                    <i class="mr-2 fal fa-file-download"></i>تنزيل الملف
                                </a>
                            </div>-->
                            <div class="col-md-3 col-6">
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
  $("#print-invoice-result").attr("onclick", `printOneInvoice()`);
  $("#print-all-invoice-result").attr("onclick", `printAll();`);
  getCurrentInvoice($(`#${localStorage.getItem("currentInvoice")}`));
  $(".results select").each(function () {
    $(this).select2({
      width: "100%",
      tags: true,
      dropdownParent: $(this).parent().parent(),
    });
  });

  $(".results select[multiple]").each(function () {
    // delete Absent if length > 1
    $(this).on("select2:select", function (e) {
      if ($(this).val().length > 1) {
        $(this).val(
          $(this)
            .val()
            .filter((v) => v.toUpperCase() != "ABSENT")
        );
        $(this).trigger("change");
      }
    });
  });
  invoices?.footer_header_show == "1" ? null : toggleHeaderAndFooter();
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
}

function visitEdit(hash) {
  if ($(this).hasClass("active")) {
    return;
  }
  $(".detail-page").empty();
  $(".action-pan").removeClass("active");
  $(this).addClass("active");
  $(".page-form").append(visit_form);
  $(".detail-page").append(packagesList());
  let data = run(`select * from lab_visits where hash = '${hash}';
                    select * from lab_visits_package where visit_id = '${hash}';`);
  let visit = data.result[0].query0[0];
  let visit_packages = data.result[1].query1;

  // set visit details
  $("#visits_patient_id").val(visit.visits_patient_id).trigger("change");
  $("#visits_status_id").val(visit.visits_status_id).trigger("change");
  $("#visit_date").val(visit.visit_date);
  $("#doctor_hash").val(visit.doctor_hash).trigger("change");
  $("#note").val(visit.note);
  $("#total_price").val(visit.total_price);

  // set visit packages
  visit_packages.forEach((package) => {
    $(`#package_${package.package_id}`).prop("checked", true);
    $(`#package_${package.package_id}`).trigger("change");
  });

  // change button action
  $("#visit-save").attr(
    "onclick",
    `if(lab_visits.validate()){fireSwal.call(lab_visits,lab_visits.saveUpdateItem, '${hash}');}`
  );
}

function convertAgeToDays(age, unit) {
  switch (unit) {
    case "عام":
      return age * 365;
    case "شهر":
      return age * 30;
    case "يوم":
      return age;
  }
}

function filterWithKit(reference, kit) {
  return reference.filter((ref) => {
    if (
      (kit == "" || kit == null || kit == undefined || kit == 0) &&
      (ref?.kit == "" ||
        ref?.kit == null ||
        ref?.kit == undefined ||
        ref?.kit == 0)
    ) {
      return true;
    }
    if (kit == ref?.kit) {
      return true;
    } else {
      return false;
    }
  });
}

function filterWithUnit(reference, unit) {
  return reference.filter((ref) => {
    if (
      unit == ref?.unit ||
      ((unit == "" || unit == null || unit == undefined || unit == 0) &&
        (ref?.unit == "" ||
          ref?.unit == null ||
          ref?.unit == undefined ||
          ref?.unit == 0))
    ) {
      return true;
    }
    // else if (ref.kit == '' || ref.kit == null || ref.kit == undefined) {
    //     return true;
    // } test
    else {
      return false;
    }
  });
}

function filterWithAge(reference, age, unit) {
  let days = convertAgeToDays(age, unit);
  return reference.filter((ref) => {
    let ageLow = convertAgeToDays(ref?.["age low"], ref?.["age unit low"]);
    let ageHigh = convertAgeToDays(ref?.["age high"], ref?.["age unit high"]);

    if (days >= ageLow && days <= ageHigh) {
      return true;
    } else {
      return false;
    }
  });
}

function filterWithGender(reference, gender) {
  return reference.filter((ref) => {
    if (
      gender.trim().replace("ي", "ى") == ref?.gender.trim().replace("ي", "ى")
    ) {
      return true;
    } else if (ref?.gender == "كلاهما") {
      return true;
    } else {
      return false;
    }
  });
}

function manageRange(reference) {
  return (
    reference?.[0]?.range
      .map((range) => {
        let normalRange = "";
        let { name = "", low = "", high = "" } = range;
        if (low != "" && high != "") {
          normalRange = (name ? `${name} : ` : "") + low + " - " + high;
        } else if (low == "") {
          normalRange = (name ? `${name} : ` : "") + " <= " + high;
        } else if (high == "") {
          normalRange = (name ? `${name} : ` : "") + low + " <= ";
        }
        return normalRange;
      })
      .join("<br>") ?? `range : no Range`
  );
}

{
  /* 
<div class="col-md-4 mb-3">
    <label class="radio high mr-2">
        <span class="high-value">High</span>
        <input type="radio" id="color" name="color_${test.hash}" value="danger" ${(resultList?.[`color_${test.name}`])=='danger'?'checked':''}>
    </label>
    <label class="radio low mr-2">
        <span class="low-value">Low</span>
        <input type="radio" id="color" name="color_${test.hash}" value="info" ${(resultList?.[`color_${test.name}`])=='info'?'checked':''}>
    </label>
</div> 
*/
}

function generateFieldForTest(test, resultList, reference, testType) {
  return `
  <div class="col-md-11 results test-normalTests mb-15 ">
      <div class="row align-items-center">
          <div class="col-md-3 h6 text-center">
              ${testType == "normal" ? `${test?.kit_name ?? "NO KIT"}` : ""}
              <a 
                class="text-info"
              onclick="updateNormal('${test.test_id}', '${test.kit_id}', '${
    test.unit
  }')"
              >
                <i class="far fa-edit"></i>
              </a>
              <br>
              ${
                testType == "normal"
                  ? `(${test?.device_name ?? "NO DEVICE"})`
                  : ""
              }
          </div>
          
          <div class="col-md-6">
              <h4 class="text-center mt-15">${test.name}</h4>
          </div>
          <div class="col-md-3 text-center">
              <label class="text-dark">عرض النتيجة</label>
              <br>
              <label class="d-inline switch s-icons s-outline s-outline-invoice-slider mr-5">
                  <input type="checkbox" id="check_normal_${
                    test.hash
                  }" name="check_normal_${test.hash}" ${
    resultList?.checked ?? true ? "checked" : ""
  } onclick="toggleTest.call(this)">
                  <span class="slider invoice-slider"></span>
              </label>
          </div>
          <div class="col-md-7 mb-3 text-center" dir="ltr">
              <label for="range" class="text-dark">المرجع</label>
              <h5 class="text-center">${
                reference?.[0]?.result == "result"
                  ? reference?.[0]?.right_options
                  : manageRange(reference)
              }</h5>
          </div>
         
          <div class="col-md-5 mb-3">
              <div class="row">
                  <div class="col-md-4 text-center d-flex justify-content-center align-items-end">
                      <span class="">${
                        reference?.[0]?.result?.trim() == "result"
                          ? ""
                          : testType == "normal"
                          ? test?.unit_name ?? ""
                          : units.find(
                              (item) => reference?.[0]?.unit == item?.hash
                            )?.name ?? ""
                      }</span>
                  </div>
                  <div class="col-md-8">
                      <label for="result" class="w-100 text-center text-dark">النتيجة</label>
                      ${
                        reference?.[0]?.result?.trim() == "result"
                          ? `<select class="form-control result" id="result_${
                              test.hash
                            }" name="${test.name}">
                              ${reference?.[0]?.options
                                .map((option) => {
                                  return `<option value="${option}" ${
                                    resultList?.[test.name]
                                      ? resultList?.[test.name] == option
                                        ? "selected"
                                        : ""
                                      : reference?.[0]?.right_options.includes(
                                          option
                                        )
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
                              testType == "calc" ? "readonly" : ""
                            } value="${
                              testType == "normal"
                                ? resultList?.[test.name] ?? ""
                                : resultList ?? ""
                            }">`
                      }
                      
                  </div>
              </div>
          </div>
          
      </div>
  </div>
`;
}

function addNormalResult(
  component,
  test,
  visit,
  result_test,
  options,
  resultForm,
  testType = "normal"
) {
  let reference = component?.[0]?.reference ?? [];
  if (result_test?.options !== undefined) {
    reference = result_test.options;
  } else {
    if (reference) {
      reference = filterWithKit(reference, test.kit_id);
      if (options.type != "calc") {
        reference = filterWithUnit(reference, test.unit);
      }
      // filter with age
      reference = filterWithAge(reference, visit.age, "عام");
      // filter with gender
      reference = filterWithGender(reference, visit.gender);
    }
  }
  __VISIT_TESTS__.push({ hash: test.hash, options: reference });
  if ((options.result = "number")) {
    resultForm.push(
      generateFieldForTest(test, result_test, reference, testType)
    );
  } else if (0) {
  }
  return resultForm;
}

function addStrcResult(component, test, result_test, resultForm) {
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

      let typeMarkup = typeDiff
        ? `<div class="col-md-12 text-center">${comp.type}</div>`
        : "";

      return `
      ${typeMarkup}
      <div class="${
        comp.type == "Notes" ? "col-md-12" : "col-md-4"
      } mb-3 text-left">
        <label for="result" class="w-100 text-center text-black font-weight-bold h5">${
          comp.name
        } ${comp.unit ? `(${comp.unit})` : ""}</label>
        ${input}
      </div>`;
    })
    .join("");

  let resultFormMarkup = `
    <div class="col-md-11 results test-${test.name
      .replace(/\s/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")} mb-15 ">
      <div class="row align-items-center justify-content-center">
        <div class="col-md-12">
          <h4 class="text-center mt-15">${test.name}</h4>
        </div>
        ${componentMarkup}
      </div>
    </div>
  `;

  resultForm.push(resultFormMarkup);

  return resultForm;
}

function addResult(visit, visitTests) {
  // clear __VISIT_TESTS__
  __VISIT_TESTS__ = [];
  visitTests = visitTests.sort((a, b) => {
    let type = JSON.parse(a?.options)?.type;
    //if (type == "calc") return 1;
    return a.category > b.category ? 1 : -1;
  });
  let resultForm = [
    `<div class="col-11 my-3">
    <input type="text" class="w-100 form-control search-class test-normalTests results product-search br-30" id="input-search-3" placeholder="ابحث عن التحليل" onkeyup="addTestSearch(this)">
</div>`,
  ];
  let result_tests = [];
  visitTests.forEach((test) => {
    let options = JSON.parse(test.options);
    let { type, component, value } = options;
    let result_test = JSON.parse(test.result_test);
    result_tests.push({
      name: test.name,
      result: result_test?.[test.name],
    });
    if (type == "calc") {
      let result = 0;
      try {
        let equ = value
          .map((item) => {
            // check if item is number
            if (!isNaN(item)) {
              return item;
            } else if (!calcOperator.includes(item)) {
              let finalResult =
                result_tests.find((test) => test.name == item)?.result ?? 0;
              return finalResult == "" ? 0 : finalResult;
            }
            return item;
          })
          ?.join("");

        let result = eval(equ) ?? 0;
        // to fixed 2
        result = result.toFixed(1);
        finalResult = {};
        finalResult[test.name] = result;
        finalResult["checked"] = result_test["checked"];
      } catch (error) {
        // console.log(error);
      }

      addNormalResult(
        component,
        test,
        visit,
        finalResult,
        options,
        resultForm,
        "calc"
      );
    } else if (type == "type") {
      resultForm = addStrcResult(component, test, result_test, resultForm);
    } else {
      resultForm = addNormalResult(
        component,
        test,
        visit,
        result_test,
        options,
        resultForm
      );
    }
  });
  return resultForm.join("");
}

function saveResult(hash) {
  let result = {};
  $(".result").each(function () {
    let name = $(this).attr("name");
    let value = $(this).val();
    let _hash_ = $(this).attr("id").split("_")[1];
    let checked =
      $(`input[type=checkbox][name=check_normal_${_hash_}]`).is(":checked") ??
      undefined;
    if (result[_hash_] == undefined) {
      result[_hash_] = {};
    }
    result[_hash_][name] = value;
    if (checked != undefined) {
      result[_hash_]["checked"] = checked;
    }
    let __visit_test__ = __VISIT_TESTS__.find((test) => test.hash == _hash_);
    if (__visit_test__ != undefined) {
      result[_hash_]["options"] = __visit_test__.options;
    }
  });
  let query = Object.entries(result)
    .map(([hash, result]) => {
      if (hash == "") {
        return;
      }
      return `update lab_visits_tests set result_test = '${JSON.stringify(
        result
      )}' where hash = '${hash}'`;
    })
    .join(";");
  run(query);
  showAddResult(hash, false);
  // $(`#${localStorage.getItem('currentInvoice')}`).click();
}

function focusInput(type) {
  let list = $(`input.result:visible`);
  let index = list.index($(`input.result:visible:focus`));
  if (type == "add") {
    index = (index + 1) % list.length;
  } else {
    index = (index - 1) % list.length;
  }
  index = index == -1 ? list.length - 1 : index;
  // list.eq(index).focus();
  // focus with animation
  $("html, body").animate(
    {
      scrollTop:
        list.eq(index).parents(".results").offset().top *
          ($(window).width() < 2100 ? $(window).width() / 2100 : 1) -
        100,
    },
    250,
    function () {
      list.eq(index).focus();
    }
  );
}

function changeTotalPrice(hash) {
  let input = document.querySelector(`input[type=checkbox][value="${hash}"]`);
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
  switch (type) {
    case "money":
      title.text("وصــل اســتلام");
      prices.show();
      doctor.show();
      break;
    case "send":
      title.text("قسـيـمة تـحويـل");
      prices.hide();
      doctor.hide();
      break;
    default:
      title.text("وصــل اســتلام");
      break;
  }
};

function showInvoice(hash) {
  let workSpace = $("#work-sapce");
  // workSpace.html('');
  // $('.action').removeClass('active');
  // $('#invoice_button').addClass('active');
  let data = run(`select 
                        age,
                        lab_patient.name as name,
                        gender,
                        lab_patient.id as id,
                        date(lab_visits.insert_record_date) as date,
                        TIME_FORMAT(TIME(lab_visits.insert_record_date), "%l:%i %p") as time,
                        total_price,
                        dicount,
                        (select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor,
                        net_price
                    from 
                        lab_visits 
                    inner join
                        lab_patient
                    on
                        lab_patient.hash=lab_visits.visits_patient_id
                    where 
                    lab_visits.hash = '${hash}';
                    
                    select 
                        (select name from lab_package where hash=lab_visits_package.package_id) as name,
                        GROUP_CONCAT((select test_name from lab_test where lab_test.hash=lab_pakage_tests.test_id)) as tests,
                        price
                    from 
                        lab_visits_package
                    left join lab_pakage_tests on lab_visits_package.package_id=lab_pakage_tests.package_id
                    where 
                        visit_id = '${hash}'
                    group by lab_visits_package.hash;`);
  let visit = data.result[0].query0[0];
  let visitPackages = data.result[1].query1;
  let invoice = `
    <div class="col-md-7 mt-4">
        <div class="statbox widget box box-shadow bg-white py-3">
            <div class="widget-content widget-content-area m-auto" style="width: 95%;">
                <div class="row justify-content-center">
                  <div class="col-5">
                    <button type="button" class="btn btn-outline-print w-100" onclick="changeInvoiceTitle('money')">
                      وصل استلام
                    </button>
                  </div>
                  <div class="col-5">
                    <button type="button" class="btn btn-outline-print w-100" onclick="changeInvoiceTitle('send')">
                      قسيمة تحويل
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
                                    <p><span class="note">${
                                      visit.date
                                    }</span>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;<span
                                            class="note">${
                                              visit.time
                                            }</span></p>
                                </div>
                                <div class="prd doctor-name">
                                    <p class="">Doctor</p>
                                </div>
                                <div class="prdgo doctor-name">
                                    <p>${visit.doctor ?? ""}</p>
                                </div>
                            </div>
                            <div class="tester">
                                <div class="row m-0">
                                    ${visitPackages
                                      .map(
                                        (item, index) => `
                                    <div class="mytest test" style="">
                                        <!--سطر تسعيرة التحليل الذي سيتكرر----------------------------------------------------------------------->
                                        <div class="testname col-1">
                                            <p>${index + 1}</p>
                                        </div>
                                        <div class="testresult col-9">
                                            <p> ${item.name}</p>
                                        </div>
                                        <div class="testnormal col-2">
                                            <p class="money-show">${parseInt(
                                              item.price
                                            )?.toLocaleString()}<span class="note">&nbsp; IQD</span></p>
                                        </div>
                                        
                                    </div>
                                    
                                    ${item.tests
                                      .split(",")
                                      .map((test, index) => {
                                        if (item.name != test) {
                                          return `
                                    <div class="mytest test mr-5 border-0" style="">
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
                            <div class="navtotal">
                                <!--مجموع السعر مع الخصومات والمتبقي --------------------------------------------------------------------->
                                <div class="namett" style="width: 86%;">
                                    <p class="">Total</p>
                                </div>
                                <div class="namegot">
                                    <p class="money-show">${parseInt(
                                      visit.total_price
                                    )?.toLocaleString()}<span class="note">&nbsp; IQD</span></p>
                                </div>
                                <div class="paidt">
                                    <p class="">Discount</p>
                                </div>
                                <div class="paidgot">
                                    <p class="money-show">${parseInt(
                                      visit.dicount
                                    )?.toLocaleString()}<span class="note">&nbsp; IQD</span></p>
                                </div>
                                <div class="vidt">
                                    <p class="">Total Amount</p>
                                </div>
                                <div class="vidgot">
                                    <p class="money-show">${parseInt(
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
                                  invoices?.facebook == ""
                                    ? ""
                                    : `&nbsp;&nbsp;&nbsp;&nbsp;  ${invoices?.facebook}  <i class="fas fa-envelope"></i>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;`
                                }</span>
                                
                                <span class="note">${
                                  invoices?.phone_1 == ""
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
  manageInvoiceHeight();
}

function invoiceHeader(worker) {
  let orderOfHeader = sessionStorage.getItem("orderOfHeader");
  try {
    let setting = JSON.parse(invoices.setting);
    orderOfHeader = JSON.parse(setting?.orderOfHeader ?? "[]") ?? null;
  } catch (e) {
    console.log("setting error =>", e);
  }
  let newWorkers = [];

  try {
    if (typeof orderOfHeader == "string") {
      orderOfHeader = JSON.parse(orderOfHeader);
    }
    orderOfHeader?.forEach((hash) => {
      if (hash == "logo") {
        newWorkers.push({ hash: "logo" });
        return;
      }
      worker.find((employee) => {
        if (employee.hash == hash) {
          newWorkers.push(employee);
        }
      });
    });
    if (newWorkers.length == 1) {
      newWorkers = [...newWorkers, ...worker];
    }
  } catch (e) {
    console.log("orderOfHeader error =>", e);
    newWorkers = [{ hash: "logo" }, ...worker];
  }
  // if (
  //   orderOfHeader?.length > 0 &&
  //   orderOfHeader != "undefined" &&
  //   orderOfHeader != undefined &&
  //   orderOfHeader != null &&
  //   orderOfHeader != "null"
  // ) {
  //   if (typeof orderOfHeader == "string") {
  //     orderOfHeader = JSON.parse(orderOfHeader);
  //   }
  //   orderOfHeader?.forEach((hash) => {
  //     if (hash == "logo") {
  //       newWorkers.push({ hash: "logo" });
  //       return;
  //     }
  //     worker.find((employee) => {
  //       if (employee.hash == hash) {
  //         newWorkers.push(employee);
  //       }
  //     });
  //   });
  //   if (newWorkers.length == 1) {
  //     newWorkers = [...newWorkers, ...worker];
  //   }
  // } else {
  //   newWorkers = [{ hash: "logo" }, ...worker];
  // }
  let size =
    (invoices?.phone_2 == "undefined" || invoices?.phone_2 == ""
      ? 4
      : invoices?.phone_2) ?? "4";
  let hteml = "";
  if (newWorkers.length > 1) {
    html = newWorkers
      .map((worker) => {
        if (worker.hash == "logo") {
          return `
        <div class="logo col-${size}  p-2">
        <img src="${invoices?.logo}" alt="" />
      </div>
      `;
        }
        return `
      <div class="right col-md-${size}">
        <div class="size1">
          <p class="title">${worker?.jop ?? "Jop title"}</p>
          <p class="namet">${worker?.name ?? "Worker name"}</p>
          <p class="certificate">${worker?.jop_en ?? "Jop En title"}</p>
        </div>
      </div>
      `;
      })
      .join("");
  } else {
    html = `
      <div class="logo col-4 p-2">
          <img src="${invoices?.logo ?? ""}" 
          alt="${invoices?.logo ?? "upload Logo"}">
      </div>
      <div class="logo justify-content-end col-4 p-2">
          <h2 class="navbar-brand-name text-center">${
            invoices?.name_in_invoice ?? localStorage.lab_name ?? ""
          }</h2>
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

function createInvoice(visit, type, form) {
  let header = invoiceHeader(workers);
  return `<div class="book-result" dir="ltr" id="invoice-${type}" style="display: none;">
		<div class="page">
			<!-- صفحة يمكنك تكرارها -->
			${header}
			<div class="center2" ${
        invoices?.footer_header_show == 1
          ? 'style="border-top:5px solid #2e3f4c;"'
          : 'style="border-top:none;"'
      }>
                <div class="center2-background"></div>
				<div class="nav">
					<!-- شريط تخصص التحليل -->
					<div class="name">
						<p class="">Name</p>
					</div>
					<div class="namego">
						<p>${
              visit.age > 16
                ? visit.gender == "ذكر"
                  ? "السيد"
                  : "السيدة"
                : visit.gender == "ذكر"
                ? "الطفل"
                : "الطفلة"
            } / ${visit.name}</p>
					</div>
					<div class="paid">
						<p class="">Barcode</p>
					</div>
					<div class="paidgo d-flex justify-content-center align-items-center">
						<svg id="visit-${type}-code"></svg>
					</div>
                    <script>
                        JsBarcode("#visit-${type}-code", '${visit.hash}', {
                            width:2,
                            height:20,
                            displayValue: false
                        });
                    </script>
					<div class="agesex">
						<p class="">Sex / Age</p>
					</div>
					<div class="agesexgo">
						<p><span class="note">${
              visit.gender == "ذكر" ? "Male" : "Female"
            }</span> / <span class="note">${
    parseFloat(visit.age) < 1
      ? parseInt(visit.age * 356) + " Day"
      : parseInt(visit.age) + " Year"
  }</span></p>
					</div>
					<div class="vid">
						<p class="">Date</p>
					</div>
					<div class="vidgo">
						<p><span class="note">${
              visit.date
            }</span><!--&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
                        <span class="note">${visit.time}</span></p>-->
					</div>
					<div class="refby">
						<p class="">By</p>
					</div>
					<div class="refbygo">
						<p>${invoices?.doing_by ?? "التحليل"}</p>
					</div>
					<div class="prd">
						<p class="">Doctor</p>
					</div>
					<div class="prdgo">
						<p><span class="note">${
              visit.doctor == "تحويل من مختبر اخر"
                ? ""
                : `${visit.doctor ?? ""}`
            }</span></p>
					</div>
				</div>

				<div class="tester">
					<!-- دف الخاص بالتحليل الدي سيكرر حسب نوع التحليل ------------------>


					${form}


				</div>


			</div>

			<div class="footer2" ${
        invoices?.footer_header_show == 1
          ? 'style="border-top:5px solid #2e3f4c;"'
          : 'style="border-top:none;"'
      }>
				<div class="f1">
					<p>${
            invoices?.address
              ? `<i class="fas fa-map-marker-alt"></i> ${invoices?.address}`
              : ""
          }</p>
				</div>
				<div class="f2">
					<p><span class="note">${
            invoices?.facebook == ""
              ? ""
              : `<i class="fas fa-envelope"></i>  ${invoices?.facebook}`
          }</span>
                    <span class="note">${
                      invoices?.phone_1 == ""
                        ? ""
                        : `<i class="fas fa-phone"></i> &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;  ${invoices?.phone_1}`
                    }</span></p>
				</div>
			</div>
		</div>


	</div>`;
}

function getNormalRange(finalResult = "", range = []) {
  let { normalRange, color, flag } = {
    normalRange: "No Range",
    color: "dark",
    flag: "",
  };
  let { name = "", low = "", high = "" } = range;
  if (low != "" && high != "") {
    normalRange = (name ? `${name} : ` : "") + low + " - " + high;
  } else if (low == "") {
    normalRange = (name ? `${name} : ` : "") + " <= " + high;
  } else if (high == "") {
    normalRange = (name ? `${name} : ` : "") + low + " <= ";
  }
  let numers = finalResult.match(/\d+/g);
  if (numers) {
    finalResult = numers.join(".");
  }
  if (parseFloat(finalResult) < parseFloat(low)) {
    color = "text-info p-1 border border-dark";
    flag = "L";
  } else if (parseFloat(finalResult) > parseFloat(high)) {
    color = "text-danger p-1 border border-dark";
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
  let { result, right_options, range } = refrence;
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

function showResult(visit, visitTests) {
  const { patient, date } = visit;
  let history = getPatientHistory(patient, date);
  // add category if null
  visitTests = visitTests.map((vt) => {
    vt.category = vt.category ?? "Tests";
    return vt;
  });
  // sort by category
  visitTests = visitTests.sort((a, b) => {
    let type = JSON.parse(a?.options)?.type;
    //if (type == "calc") return 1;
    return a.category > b.category ? 1 : -1;
  });
  let result_tests = [];
  let category = "";
  let invoices = { normalTests: `` };
  let buttons = {};
  // sort visit tests by category
  let results = {};
  visitTests.forEach((test, index) => {
    let options = JSON.parse(test.options);
    let component = options.component;
    let value = options?.value;
    let result_test = JSON.parse(test.result_test);
    result_tests.push({
      name: test.name,
      result: result_test?.[test.name],
    });
    if (options.type == "type") {
      let font = options?.font ?? invoices?.font ?? "14px";
      let typeHistory = history.find((item) => item.name == test.name)?.result;
      // check if typeHistory is nulled
      if (!typeHistory) {
        typeHistory = "{}";
      }
      typeHistory = JSON.parse(typeHistory);
      buttons[
        test.name.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "")
      ] = `<div class="col-auto">
                    <button class="action btn btn-action mx-2 w-100" dir="ltr" id="test-${test.name
                      .replace(/\s/g, "")
                      .replace(
                        /[^a-zA-Z0-9]/g,
                        ""
                      )}" onclick="getCurrentInvoice($(this))">${
        test.name
      }</button>
                </div>
                `;
      let invoiceBody = "";
      let unit = options?.unit ?? "result";
      invoiceBody += `
            <div class="typetest test " data-flag="${unit}">
                <!-- عنوان التحليل ------------------>
                <p>${test.name}</p>
            </div>
            `;
      let type = "";

      for (let reference of component) {
        // let defualt = reference?.reference[0]?.range[0]?.low ?? '';
        let result = result_test?.[reference.name] ?? "";
        let his = typeHistory?.[reference.name] ?? "";
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
        if (infinit != "" || (low && high)) {
          let fResult = normalTestRange(result, reference.reference[0]);
          resultClass = fResult.color;
          defualt = fResult.normalRange;
          flag = fResult.flag;
        } else if (low) {
          defualt = `${low} ${reference?.reference[0]?.unit ?? ""}`;
          let resultCompare = result
            .toString()
            .toUpperCase()
            .replace(/\s+/g, "");
          let defualtCompare = defualt
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
        if (reference.type != type && reference.type != "Notes") {
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
        if (reference.type == "Notes") {
          invoiceBody += `
                        <div class="test strc-test row m-0">
                            <!-- تصنيف الجدول او اقسام الجدول ------------>

                            <div class="testname col-12 data-flag="${unit}"">
                                <p>${reference.name}</p> : <p>${result}</p>
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
            history: his,
          });
        }
      }
      invoices[test.name.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "")] =
        invoiceBody;
    } else {
      if (buttons.normalTests ?? true) {
        buttons.normalTests = `<div class="col-auto">
                        <button class="action btn btn-action mx-2 w-100" id="test-normalTests" onclick="getCurrentInvoice($(this))">التحاليل</button>
                    </div>`;
      }
      if (category != test.category) {
        category = test.category;
        if (category) {
          invoices.normalTests += `
                        <div class="test typetest category_${category
                          ?.split(" ")
                          ?.join("_")}">
                            <p class="w-100 text-center font-weight-bolder h-22">${category}</p>
                        </div>
                        `;
        }
      }
      let reference;
      if (result_test?.options !== undefined) {
        reference = result_test.options;
      } else {
        reference = component?.[0]?.reference;
        if (reference) {
          reference = filterWithKit(reference, test.kit_id);

          // filter with unit
          if (options.type != "calc") {
            reference = filterWithUnit(reference, test.unit);
          }

          // filter with age
          reference = filterWithAge(reference, visit.age, "عام");

          // filter with gender
          reference = filterWithGender(reference, visit.gender);
        }
      }

      let result = 0;
      try {
        result =
          options?.type == "calc"
            ? eval(
                value
                  .map((item) => {
                    if (!isNaN(item)) {
                      return item;
                    } else if (!calcOperator.includes(item)) {
                      let finalResult =
                        result_tests.find((test) => test.name == item)
                          ?.result ?? 0;
                      return finalResult == "" ? 0 : finalResult;
                    }
                    return item;
                  })
                  .join("")
              )
            : result_test?.[test.name];
        // toFixed 2
        result = result.toFixed(1);
      } catch (error) {
        // console.log(error);
      }

      let { color, normalRange, flag } = normalTestRange(
        result,
        reference?.[0]
      );
      invoices.normalTests += manageTestType("flag", {
        name: test.name,
        color: color,
        result: result,
        hash: test.hash,
        category: category,
        checked: result_test?.checked ?? true ? "flex" : "none",
        normal: normalRange,
        flag: flag,
        history: history.find((item) => item.name == test.name)?.result ?? "",
        unit: `${
          reference?.[0]?.result == "result"
            ? ""
            : options?.type != "calc"
            ? test?.unit_name ?? ""
            : units.find((item) => reference?.[0]?.unit == item?.hash)?.name ??
              ""
        }`,
      });
      // invoices.normalTests += `
      //     <div class="test row m-0 category_${category} border-test" id="test_normal_${test.hash}" data-cat="${category}" style="display:${result_test?.checked ?? true ? 'flex' : 'none'}">
      //         <div class="testname col-3">
      //             <p class="text-right w-100">${test.name}</p>
      //         </div>
      //         <div class="testresult col-2">
      //             <p class="text-${color} w-75 text-center">${result ?? 0}</p>
      //         </div>
      //         <div class="testresult col-2">
      //             <p class="text-${color == "dark" || isNaN(parseFloat(result)) ? '' : color} w-75 text-center">${color == "dark" || isNaN(parseFloat(result)) ? '' : (color == "danger p-1 border border-dark" ? 'H' : 'L')}</p>
      //         </div>
      //         <div class="testresult col-2">
      //             <p> ${reference?.[0]?.result == 'result' ? "" : options?.type != 'calc' ? (test?.unit_name ?? '') : (units.find(item => reference?.[0]?.unit == item?.hash)?.name ?? '')}</p>
      //         </div>
      //         <div class="testnormal col-3">
      //             <p class="text-right">
      //             ${normalRange}
      //             </p>
      //         </div>
      //     </div>
      // `;
    }
  });
  return {
    buttons: `<div class="row justify-content-center mb-30" id="invoice-tests-buttons">
                    ${Object.values(buttons).join("")}
                </div>`,
    invoice: `${Object.entries(invoices)
      .map(([key, value]) => {
        return createInvoice(visit, key, value);
      })
      .join("")}`,
  };

  // return `
  // <div class="row justify-content-center mb-30" id="invoice-tests-buttons">
  //     ${Object.values(buttons).join('')}
  // </div>
  // ${Object.entries(invoices).map(([key, value]) => {
  //     return createInvoice(visit, key, value);
  // }).join('')}
  // `
  // return createInvoice(visit,25, resultForm.join(''));
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
  manageInvoiceHeight();
  manageInvoiceHeightForScroll();
  // cloneOldInvoice(manageInvoiceHeight());
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
{
  /* <div class="row justify-content-center m-auto mb-30" id="invoice-tests-buttons">

</div> */
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

function manageInvoiceHeight(invoiceId = null) {
  const elementsWithClasses = document.querySelectorAll(
    '.typetest[class*="category_"]'
  );
  const categoryClasses = Array.from(elementsWithClasses, (element) =>
    element.classList.value
      .split(" ")
      .find((cls) => cls.startsWith("category_"))
  );
  for (let cat of categoryClasses) {
    if ($(`.${cat}:visible`).length == 1) {
      $(`.${cat}`).hide();
    }
  }
  let allTestsElements = [];
  let allInvoiceTestsHeight = 0;
  if (invoiceId) {
    $(`#${invoiceId} .page .center2 .tester .test:visible`).each(function () {
      let eleHeight = $(this).outerHeight();
      allTestsElements.push({
        html: $(this).clone(),
        eleHeight,
      });
      allInvoiceTestsHeight += eleHeight;
    });
  } else {
    $(".book-result:visible .page .center2 .tester .test:visible").each(
      function () {
        let eleHeight = $(this).outerHeight();
        allTestsElements.push({
          html: $(this).clone(),
          eleHeight,
        });
        allInvoiceTestsHeight += eleHeight;
      }
    );
  }

  let cloneInvoice = $(".book-result:visible .page").first().clone();
  let bookResultInvoiceId = $(".book-result:visible").attr("id");
  cloneInvoice.find(".center2 .tester").empty();
  let center2 = $(".book-result:visible .center2:last");
  let center2Scroll;
  // if (bookResultInvoiceId == "invoice-normalTests") {
  //   center2Scroll = center2.height() - 400;
  // } else {
  //   center2Scroll = center2.height() - 200;
  // }
  center2Scroll = center2.height() - 260;
  let invoices = addTestToInvoice(
    center2Scroll,
    allTestsElements,
    cloneInvoice,
    center2Scroll
  );
  if (invoiceId) {
    $(`#${invoiceId}`).empty();
    invoices.map((invoice) => {
      $(`#${invoiceId}`).append(invoice);
    });
  } else {
    $(".book-result:visible").empty();
    invoices.map((invoice) => {
      $(".book-result:visible").append(invoice);
    });
  }
}

function addTestToInvoice(
  allInvoiceTestsHeight,
  allTestsElements,
  cloneInvoice,
  center2Scroll,
  lastTestType = null
) {
  let invoiceCount = Math.ceil(allInvoiceTestsHeight / center2Scroll);
  let { invoices, testTypeHeight, testHeadHeight } = {
    invoices: [],
    lastTestType: null,
    testTypeHeight: allTestsElements[0]?.eleHeight,
    testHeadHeight: allTestsElements[1]?.eleHeight,
  };
  for (let i = 1; i <= invoiceCount; i++) {
    if (allTestsElements?.[0]?.html?.hasClass("border-test")) {
      if (lastTestType) {
        allTestsElements.unshift(lastTestType);
      }
    }
    let height = 0;
    let invoice = cloneInvoice.clone();
    for (let [index, test] of allTestsElements.entries()) {
      if (
        index == 0 &&
        !test?.html?.hasClass("testhead") &&
        allTestsElements?.[1]?.html
      ) {
        let dataFlag = allTestsElements[1].html.attr("data-flag");
        invoice.find(".center2 .tester").append(manageHead(dataFlag));
      }
      if (test?.html?.hasClass("typetest")) {
        lastTestType = test;
        test.html = test.html.clone();
        if (center2Scroll - height < testTypeHeight + testHeadHeight + 70) {
          break;
        }
      }
      height += test.eleHeight;
      if (height <= center2Scroll) {
        invoice.find(".center2 .tester").append(test.html);
        allTestsElements = allTestsElements.slice(1);
      } else {
        break;
      }
    }
    invoices.push(invoice);
  }
  if (allTestsElements.length > 0) {
    invoices = [
      ...invoices,
      ...addTestToInvoice(
        center2Scroll,
        allTestsElements,
        cloneInvoice,
        center2Scroll,
        lastTestType
      ),
    ];
  }
  return invoices;
}

function cloneOldInvoice(newInvoiceBody) {
  if (newInvoiceBody != "") {
    let oldInvoice = $(".book-result:visible .page");
    let newInvoice = oldInvoice.clone();
    newInvoice.find(".tester").html(newInvoiceBody);
    $(".book-result:visible").append(newInvoice);
  }
}

function manageInvoiceHeightForScroll() {
  $(".invoice-height").height(1500);
  $(".form-height").height(1500);
}

function sendByWhatsapp(hash, phone) {
  // check internet connection
  if (!navigator.onLine) {
    Swal.fire({
      icon: "error",
      title: "تأكد من الاتصال بالانترنت",
      text: "لا يوجد اتصال بالانترنت",
    });
    return;
  }
  syncOnline();
  if (phone?.length > 10) {
    if (phone[0] == "0") {
      phone = `964${phone.slice(1)}`;
    } else {
      phone = `964${phone}`;
    }
    let url = `https://api.whatsapp.com/send?phone=${phone}&text=http://umc.native-code-iq.com/lab/downloadInvoice.html?pk=${hash}-${localStorage.getItem(
      "lab_hash"
    )}`;
    window.open(url, "_blank");
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
                <div class="col-3">
                    <p class="text-right">Test Name</p>
                </div>
                <div class="col-3 justify-content-between">
                    <p class="text-center w-100">Result</p>
                </div>
                <div class="col-1 justify-content-between">
                    <p class="text-center w-100">Flag</p>
                </div>
                <div class="col-2">
                    <p class="text-right">Unit</p>
                </div>
                <div class="col-3">
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
                    <p>Price</p>
                </div>
            </div>
            `;
  }
}

function manageTestType(type, test = {}) {
  let {
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
  } = test;
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
                <div class="testnormal col-3">
                    <p class="text-right">
                    ${normal}
                    </p>
                </div>
                ${
                  history != "" && history && history != "{}"
                    ? `<div class="testprice col-12 h5 text-right text-info">
                    ${history} ${history != "" ? unit : ""}
                </div>`
                    : ""
                }
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
                        <p>${normal}</p>
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
                        <p>${normal}</p>
                    </div>
                </div>`;
    default:
      break;
  }
}

const addTestSearch = (e) => {
  let value = $(e).val();
  var rex = new RegExp(value, "i");
  $(".results.test-normalTests:not(.search-class)").hide();
  $(`.results.test-normalTests:not(.search-class)`)
    .filter(function () {
      return rex.test($(this).text());
    })
    .show();
};

const updatePhone = (hash) => {
  let phone = $("#patientPhone").val();
  if (phone.length >= 10) {
    run(`update lab_patient set phone='${phone}' where hash='${hash}';`);
    // niceSwal(type, position, msg)
    niceSwal("success", "top-end", "تم تحديث رقم الموبايل بنجاح");
  } else {
    niceSwal("error", "top-end", "رقم الموبايل غير صحيح");
  }
};

const getPatientHistory = (patient, date) => {
  let his = [];
  $.ajax({
    url: base_url + "Visit/history",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    type: "POST",
    dataType: "JSON",
    data: { patient, date },
    async: false,
    success: function (result) {
      his = result.data;
    },
    error: function () {},
  });
  return his;
};

function downloadPdf() {
  let svgs = $("svg.border-print-hover");
  if (svgs.length == 0)
    return niceSwal("error", "top-end", "يجب عليك اختيار فاتورة اولا");
  let oldId = $(`.book-result:visible`).attr("id");
  $(`#${oldId}`).css("display", "none");
  // get data-id
  svgs.each((i, svg) => {
    let id = $(svg).attr("data-id");
    $(`#${id}`).css("display", "block");
    manageInvoiceHeight(id);
  });
  // .book-result:visible svg is not parent <>,.

  $(`#work-sapce .book-result:visible`).printThis({
    debug: true,
    importCSS: false,
    loadCSS: [
      "lab/bootstrap/css/bootstrap.min.css",
      "lab/css/invoice.css",
      "lab/css/style.css",
      "lab/plugins/font-awesome/css/all.css",
    ],
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
  // update ispayed to 1
  run(`update lab_visits set ispayed="1" where hash='${hash}'`);

  lab_visits.dataTable.ajax.reload();
}

function printAfterSelect() {
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

function hoverInvoice(element) {
  if (element.nodeName.toLowerCase() == "svg") {
    $(element).toggleClass("border-print-hover");
  }
}

const updatePatientName = async (hash, ele) => {
  const name = $(ele).val();
  let formData = new FormData();
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
      if (status == 200) {
        lab_visits.dataTable.ajax.reload();
        niceSwal("success", "top-end", message);
      } else {
        niceSwal("error", "top-end", message);
      }
    });
};
