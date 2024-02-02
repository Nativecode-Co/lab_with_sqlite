let lab_hash = localStorage.getItem("lab_hash"),
  user_hash = localStorage.getItem("hash"),
  patient_hash = null,
  visit_hash = null,
  user_info = {
    user_id: user_hash,
    lab_id: lab_hash,
  },
  table = null,
  pageNumber = 0,
  today = new Date(),
  today_date =
    today.getFullYear() +
    "-" +
    padTo2Digits(today.getMonth() + 1) +
    "-" +
    padTo2Digits(today.getDate()),
  select,
  PackageHASHES = [];

const ALLDATA = run(`
  select name,hash from lab_visit_status;
  select name,hash from lab_patient where lab_id=${lab_hash};
  select name,hash from lab_doctor where lab_id=${lab_hash};
  select name,price,hash from lab_package where lab_id = ${lab_hash} and catigory_id='9';
  select name,price,hash from lab_package where lab_id = ${lab_hash} and catigory_id='8';
`);
let visit_status = ALLDATA,
  patients = ALLDATA.result[1].query1,
  doctors = ALLDATA.result[2].query2,
  packages = ALLDATA.result[3].query3,
  offers = ALLDATA.result[4].query4;

let offersSelect =
  offers
    .map(
      (item) =>
        `<option value="${item.hash}" data-price="${item.price}">${item.name} : ${item.price}$ </option>`
    )
    .join("") +
  packages
    .map(
      (item) =>
        `<option value="${item.hash}" data-price="${item.price}">${item.name} : ${item.price}$ </option>`
    )
    .join("");
/*=============== START COMMENT ===============
===============================================
===============================================
                START PAGE              
===============================================
===============================================
================ END COMMENT ================*/
for (let patient of patients) {
  let newOption = new Option(patient.name, patient.hash, false, false);
  $(`select[name=name]`).append(newOption);
}
for (let doctor of doctors) {
  let newOption = new Option(doctor.name, doctor.hash, false, false);
  $(`select[name=doctor]`).append(newOption);
}

$(document).ready(function () {
  // JsBarcode("#barcode", "3th Test");
  $(document).keydown(function (e) {
    if ($(".mover").is(":focus") && (e.keyCode == 40 || e.keyCode == 13)) {
      e.preventDefault();
      focusInput("add");
    } else if ($(".mover").is(":focus") && e.keyCode == 38) {
      e.preventDefault();
      focusInput("12");
    }
  });
  let condition = 1;
  set_date();
  fetsh_tests();
  if (fetch_visits()) {
    table = SetNewTable("visits");
  }
  createSelect("visits_status_id", "lab_visit_status", "hash", "name");
  $(".submit-all").on("click", function () {
    if ($(".form-patient").valid()) {
      fireSwal(greate_patient);
    } else {
      $("html, body").animate(
        {
          scrollTop: $("#form-patient").offset().top,
        },
        500
      );
    }
  });
  select = $("#select_name").select2().next();
  select.hide();

  document.getElementById("scroll").onclick = function (ev) {
    pageNumber++;
    let data = run(
      `select lab_patient.name as 'patient_name', visits_status_id as 'visit_type',visit_date,ispayed,lab_visits.hash from lab_visits inner join lab_patient on lab_patient.hash = lab_visits.visits_patient_id where lab_id=${lab_hash}
           order 
            by visit_date desc
          limit ${pageNumber * 40},40;`
    ).result[0].query0;
    if (data.length <= 0) {
      pageNumber--;
    }
    drawVisits(data, $("#visits_body"), table);
  };
  $("input[type=search]")
    .off()
    .on("keyup", function (e) {
      if (e.keyCode == 13) {
        filterByColumn(this.value);
      }
    });
});
$("#input-search-2").on("keyup", function () {
  var rex = new RegExp($(this).val(), "i");
  $(".packages-search .items").hide();
  $(".packages-search .items")
    .filter(function () {
      return rex.test($(this).text());
    })
    .slice(0, 10)
    .show();
});
$(".form-patient").validate({
  rules: {
    age_month: {
      maxMonth: true,
    },
  },
  messages: {
    name: "تأكد من الاسم",
    visit_date: "تأكد من التاريخ",
    address: "تأكد من العنوان",
    gander: "تأكد من الجنس",
    phone: "تأكد من رقم الهاتف",
  },
  errorPlacement: function (error, element) {
    element.addClass("border-danger");
    error.insertAfter(element);
    element.parent().removeClass("mb-4");
    error.addClass("text-danger");
  },
  success: function (element) {
    element.siblings("input").removeClass("border-danger");
  },
});

$.validator.addMethod(
  "maxMonth",
  function (value, element, param) {
    if (value) {
      if (value > 11 || value < 0) {
        return false;
      }
    } else {
      if (!$("#age_year").val()) {
        return false;
      }
    }
    return true;
  },
  "تأكد من عدد الشهور"
);

function change_total_price(el) {
  let total_price = Number($(".total-price").text());
  if (el.is(":checked")) {
    $(".total-price").text(total_price + Number(el.data("price")));
  } else {
    $(".total-price").text(total_price - Number(el.data("price")));
  }
}
/*=============== START COMMENT ===============
===============================================
===============================================
                START PATIENT               
===============================================
===============================================
================ END COMMENT ================*/
function greate_patient() {
  let birth_year = today.getFullYear() - $("input[name=age_year]").val() || 0;
  let birth_month =
    today.getMonth() + 1 - $("input[name=age_month]").val() || 0;
  let doctor = $("select[name=doctor]").val();
  let column = {
    name: $("#name").val(),
    age_year: $("#age_year").val(),
    age_month: $("#age_month").val(),
    address: $("#address").val(),
    phone: $("#phone").val(),
    gender: $("#gender").val(),
    birth: `${birth_year}-${birth_month}-01`,
    user_id: user_hash,
    lab_id: lab_hash,
  };
  if ($("input[name=new_patient]").prop("checked")) {
    patient_hash = run({
      action: "insert",
      table: "patient",
      column,
    }).result[0].query0;
  } else {
    patient_hash = $("select[name=name]").val();
  }

  visit_hash = run(
    `insert into visits(name,visit_date,visits_patient_id,visits_status_id,ispayed,doctor_hash) values('${$(
      "input[name=name]"
    ).val()}','${$(
      "input[name='visit_date']"
    ).val()}','${patient_hash}','2','1','${doctor}');`
  ).result[0].query0;
  greate_visits_test();
  fetch_visits();

  Swal.fire({
    title: "لقد تم اضافة",
    html: `<ul class="list-group">
            <li>المريض : ${$("input[name=name]").val()}</li>
            <li>زيارة بتاريخ :${$("input[name=visit_date]").val()}</li>
        </ul>`,
    showDenyButton: true,
    confirmButtonText: "طباعة الفاتورة",
    denyButtonText: `اضافة النتائج`,
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      location.href = `invoice.html?hash=${visit_hash}`;
    } else if (result.isDenied) {
      Swal.fire({
        title: "الرجاء الانتظار",
        text: "يتم الان تحميل التحاليل",
        timer: 100,
        showDenyButton: false,
        showCancelButton: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
        willClose: () => {
          get_visit_result(visit_hash, column.name);
          Swal.close();
        },
      });
    }
  });
  $(".total-price").text(0);
  resetPatientform();
}

function show_tests_swal(hash, name) {
  Swal.fire({
    title: "الرجاء الانتظار",
    text: "يتم الان تحميل التحاليل",
    timer: 100,
    showDenyButton: false,
    showCancelButton: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
    willClose: () => {
      if (get_visit_result(hash, name)) {
        Swal.close();
        Swal.fire({
          title: "لم يتم اضافة اي تحاليل",
          showConfirmButton: false,
        });
      } else {
        Swal.close();
      }
    },
  });
}

// ==> get all patient in lab
function get_all_patient() {
  $("select[name='visits_patient_id']").empty().trigger("change");
  let patients = run(
    `select hash,name from lab_patient where lab_id=${lab_hash};`
  ).result[0].query0;
  let newOption = new Option("--------------", "null", false, false);
  $("select[name='visits_patient_id']").append(newOption);
  newOption = new Option("اضافة مريض جديد", "new", false, false);
  $("select[name='visits_patient_id']").append(newOption);
  for (let data of patients) {
    let newOption = new Option(data.name, data.hash, false, false);
    $("select[name='visits_patient_id']").append(newOption).trigger("change");
  }
}

// ==>
function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

// ==> set date today
function set_date() {
  $("input[name=visit_date]").val(today_date);
}

// ==>
function fetsh_tests() {
  // let result = run(
  //   `select name,price,hash from package where lab_id = ${lab_hash} and catigory_id='9';
  //    select name,price,hash from package where lab_id = ${lab_hash} and catigory_id='8';`
  // );
  // let packages = result.result[0].query0;
  // let offers = result.result[1].query1;
  for (var [index, package] of packages.entries()) {
    let hide;
    index > 9 ? (hide = `style="display:none"`) : (hide = "");
    $("#packages").append(
      `<div class="items package" ${hide}>
                <div class="n-chk w-50 text-left">
                    <label class="new-control new-checkbox new-checkbox-rounded checkbox-outline-success mb-0">
                        <input type="checkbox" class="new-control-input" data-name="${package.name}" onclick="change_total_price($(this));" data-price="${package.price}" data-hash="${package.hash}">
                        <span class="new-control-indicator"></span>${package.name}
                    </label>
                </div>
                <div class="w-25 text-left">
                    <p class="">${package.price}$</p>
                </div>
            </div>`
    );
  }
  for (var [index, package] of offers.entries()) {
    let hide;
    index > 9 ? (hide = `style="display:none"`) : (hide = "");
    $("#offers").append(
      `<div class="items package" ${hide}>
                <div class="n-chk w-50 text-left">
                    <label class="new-control new-checkbox new-checkbox-rounded checkbox-outline-success mb-0">
                        <input type="checkbox" class="new-control-input" data-name="${package.name}" onclick="change_total_price($(this));" data-price="${package.price}" data-hash="${package.hash}">
                        <span class="new-control-indicator"></span>${package.name}
                    </label>
                </div>
                <div class="w-25 text-left">
                    <p class="">${package.price}$</p>
                </div>
            </div>`
    );
  }
}

// ==>
function greate_visits_test() {
  let query = "";
  let hashs = [];
  // insert visits Package
  $(".package input:checked").each(function () {
    query += `insert into visits_package(visit_id,package_id,price) values(${visit_hash},${$(
      this
    ).data("hash")},${$(this).data("price")});`;
    hashs.push($(this).data("hash"));
    $(this).prop("checked", false);
  });
  if (hashs.length != 0) {
    let package_tests = run(
      `select test_id,kit_id,lab_device_id,unit from pakage_tests where package_id in (${hashs})`
    ).result.query;
    for (let test of package_tests) {
      query += `insert into visits_tests(visit_id,result_test,tests_id) values('${visit_hash}','${JSON.stringify(
        {
          result: [
            {
              name: "",
              range: "",
              result: "",
              kit: test.kit_id,
              device: test.lab_device_id,
              unit: test.unit,
            },
          ],
        }
      )}','${test.test_id}');`;
    }
  }
  run(query);
}

/*=============== START COMMENT ===============
===============================================
===============================================
                  VISIT               
===============================================
===============================================
================ END COMMENT ================*/
// ==> FETCH VISIT
function fetch_visits() {
  $("#visits_header").empty();
  $("#visits_body").empty();
  let obj = run(
    `select lab_patient.name as 'patient_name', visits_status_id as 'visit_type',visit_date,ispayed,lab_visits.hash from lab_visits inner join lab_patient on lab_patient.hash = lab_visits.visits_patient_id where lab_id=${lab_hash} order by visit_date desc;`
  );
  // var obj = run("select name,(select name from lab_patient where patient.hash = visits.visits_patient_id) as 'patient_name',(select name from lab_visit_status where visit_status.hash = visits.visits_status_id) as 'visit_type',visit_date,ispayed,hash from lab_visits order by visit_date desc");
  if (obj.result[0].query0.length > 0) {
    $("#visits_header").append(`
            <tr>
                <th>المريض</th>
                <th class="text-center">نوع الزيارة</th>
                <th>تاريخ الزيارة</th>
                <th>الانجاز</th>
                <th>مدفوع</th>
                <th></th>
                <th></th>
            </tr>
        `);
    for (let visit of obj.result[0].query0) {
      let badget;
      switch (visit.ispayed) {
        case "0":
          badget = `<span class="badge badge-danger">لم يتم الدفع بعد</span>`;
          break;
        case "1":
          badget = `<span class="badge badge-success">تم الدفع</span>`;
          break;
        default:
          badget = `<span class="badge badge-info">لم يتم الدفع بعد</span>`;
          break;
      }
      $("#visits_body").append(`
            <tr>
                <td onclick="show_tests_swal('${visit.hash}','${
        visit.patient_name
      }')">${visit.patient_name}</td>
                <td>${createVisitStatusSelect(
                  visit_status.result[0]?.query0,
                  visit.hash,
                  visit.visit_type
                )}</td>
                <td>${visit.visit_date}</td>
                <td>
                    <span id="done-${visit.hash}" class="badge badge-${
        visit.visit_type == 3 ? "success" : "info"
      }">
                        ${visit.visit_type == 3 ? "منجز" : "غير منجز"}
                    </span>
                </td>
                <td>${badget}</td>
                <td>
                    <ul class="table-controls">
                        <li>
                            <a class="bs-tooltip" onclick="edit_visits('${
                              visit.hash
                            }')" data-toggle="tooltip" data-placement="top" title="تعديل">
                                <i class="far fa-edit fa-lg mx-2"></i>
                            </a>
                        </li>
                        <li>
                            <a class="bs-tooltip" onclick="location.href='invoice.html?hash=${
                              visit.hash
                            }'" data-toggle="tooltip" data-placement="top" title="طباعة الفاتورة">
                                <i class="fal fa-cash-register fa-lg mx-2"></i>
                            </a>
                        </li>
                        <li>
                            <a class="bs-tooltip" onclick="show_tests_swal('${
                              visit.hash
                            }','${
        visit.patient_name
      }')" data-toggle="tooltip" data-placement="top" title="ادخال النتائج">
                                <i class="far fa-poll fa-lg mx-2"></i>
                            </a>
                        </li>
                        <li>
                            <a class="bs-tooltip" onclick="print_result('${
                              visit.hash
                            }')" data-toggle="tooltip" data-placement="top" title="طباعة النتائج">
                                <i class="far fa-print fa-lg mx-2"></i>
                            </a>
                        </li>
                        <li>
                            <a class="bs-tooltip" onclick="barCodeGenrator('${
                              visit.hash
                            }')" data-toggle="tooltip" data-placement="top" title="طباعة النتائج">
                                <i class="far fa-barcode-scan fa-lg mx-2"></i>
                            </a>
                        </li>
                    </ul>
                </td>
                <td></td>
            </tr>
        `);
    }
    return true;
  }
  return false;
}

// ==>
function edit_visits(hash) {
  $("#visits-modal").modal("toggle");
  var query_obj = run(
    `select name,visit_date,visits_patient_id,visits_status_id,note from lab_visits where hash='${hash}';
    select package_id as hash from lab_visits_package where visit_id='${hash}';`
  );
  PackageHASHES = query_obj.result[1].query1.map((item) => item.hash);
  $("#visits_packages").empty();
  for (let package of query_obj.result[1].query1) {
    $("#visits_packages").append(drawPackageSelector(package.hash));
    // get last select package_selector and add onchange event
    let last_select = $("select[name=package_selector]").last();
    last_select.val(package.hash).trigger("change");
    last_select.select2({
      placeholder: "اختر الحزمة",
      width: "100%",
    });
  }

  var attr_key = Object.keys(query_obj.result[0].query0[0]);
  for (var i = 0; i < attr_key.length; i++) {
    $("#form_visit textarea[name='" + attr_key[i] + "']").html(
      query_obj.result[0].query0[0][attr_key[i]]
    );
    $("#form_visit input[name='" + attr_key[i] + "']").val(
      query_obj.result[0].query0[0][attr_key[i]]
    );
    $("#form_visit select[name='" + attr_key[i] + "']")
      .val(query_obj.result[0].query0[0][attr_key[i]])
      .trigger("change");
  }
  visit_hash = hash;
}

// ==>
function save_visits(form_id, table) {
  let query = "";
  run(get_update_object(form_id, table, visit_hash));
  let allHASHES = [];
  let packageTestHashes = [];
  let deleteTestHashes = [];
  fetch_visits();

  $("#visits_packages select").each(function () {
    allHASHES.push({
      hash: $(this).val(),
      price: $(this).find(":selected").data("price"),
    });
  });

  allHASHES.filter((item) => {
    if (!PackageHASHES.includes(item.hash)) {
      query += `insert into visits_package (visit_id,package_id, price) values ('${visit_hash}','${item.hash}','${item.price}');`;
      packageTestHashes.push(item.hash);
    }
  });

  PackageHASHES.filter((hash) => {
    if (!allHASHES.map((item) => item.hash).includes(hash)) {
      query += `delete from lab_visits_package where visit_id='${visit_hash}' and package_id='${hash}';`;
      deleteTestHashes.push(hash);
    }
  });
  if (packageTestHashes.length != 0 || deleteTestHashes.length != 0) {
    let package = run(
      `select test_id,kit_id,lab_device_id,unit from pakage_tests where package_id in (${
        packageTestHashes.length == 0 ? [0] : packageTestHashes
      });
       select test_id from pakage_tests where package_id in (${
         deleteTestHashes.length == 0 ? [0] : deleteTestHashes
       });`
    );
    let package_tests = package.result[0].query0;
    let package_deleted = package.result[1].query1;
    for (let test of package_tests) {
      query += `insert into visits_tests(visit_id,result_test,tests_id) values('${visit_hash}','${JSON.stringify(
        {
          result: [
            {
              name: "",
              range: "",
              result: "",
              kit: test.kit_id,
              device: test.lab_device_id,
              unit: test.unit,
            },
          ],
        }
      )}','${test.test_id}');`;
    }
    for (let test of package_deleted) {
      query += `delete from lab_visits_tests where visit_id='${visit_hash}' and tests_id='${test.test_id}';`;
    }
  }
  // if query != '' run query
  query != "" ? run(query) : "";
  $("#visits-modal").modal("toggle");
  visit_hash = null;
}

/*=============== START COMMENT ===============
===============================================
===============================================
                  VISITS TEST               
===============================================
===============================================
================ END COMMENT ================*/
function get_visit_result(hash, name) {
  visit_hash = hash;
  $("#tests_body").empty();
  $("#tests_foot").empty();
  let obj = exce(
    `select lab_visits.hash as lol,(select test_name from lab_test where lab_test.hash = lab_visits_tests.tests_id) as test_name, lab_visits_tests.hash from lab_visits_tests inner join lab_visits on lab_visits.hash=lab_visits_tests.visit_id inner join lab_patient on lab_patient.hash=lab_visits.visits_patient_id where lab_visits_tests.visit_id=${hash} and lab_patient.lab_id=${lab_hash}`
  );
  $(".patient-name").text(name);
  if (obj.result.query.length > 0) {
    $("#tests_foot").append(
      `<tr>
                <td></td>
                <td colspan="2">
                    <a type="button" class="btn btn-success w-100" onclick="save_result('${hash}')">حفظ <i class="fas fa-save"></i></a>
                </td>
                <td></td>
            </tr>`
    );
    for (let package of obj.result.query) {
      $("#tests_body").append(
        `
        <tr>
          <td colspan="5" class="text-center h-22 text-info">${package.test_name}</td>
        </tr>
      `,
        build_result_form(package.hash)
      );
    }
    $("html, body").animate(
      {
        scrollTop: $("#tests").offset().top,
      },
      500
    );
    return false;
  } else {
    return true;
  }
}

function save_result(visit_hash) {
  let results = {},
    query = "";
  for (let input of $(`.result-value`)) {
    input = $(input);
    let input_result = {},
      hash = input.data("hash");
    input_result["result"] = input.val();
    input_result["range"] = input.data("range");
    input_result["type"] = input.data("type");
    input_result["unit"] = input.data("unit");
    input_result["kit"] = input.data("kit");
    input_result["device"] = input.data("device");
    input_result["name"] = input.data("name");
    input_result["notes"] = $(`#notes-${hash}`).val();
    results?.[hash]
      ? results[hash].result.push(input_result)
      : (results[hash] = { result: [input_result] });
  }
  for (let [hash, result] of Object.entries(results)) {
    query += `update visits_tests set result_test='${JSON.stringify(
      result
    )}', is_done=1 where hash=${hash};`;
  }
  run(query);
  let count = run(
    `select count(*) as count from lab_visits_tests where visit_id=${visit_hash} and is_done=0;`
  ).result[0].query0[0].count;
  if (count == 0) {
    run(`update visits set visits_status_id=3 where hash=${visit_hash};`);
    $(`#done-${visit_hash}`)
      .removeClass("badge-info")
      .addClass("badge-success");
    $(`#done-${visit_hash}`).html("منجز");
    $(`#select-${visit_hash}`).val("3").trigger("change");
  }
  Toast.fire({
    icon: "success",
    title: "تم حفظ النتائج",
  });
}

/*=============== START COMMENT ===============
===============================================
===============================================
            SHOW AND PRIN RESULT               
===============================================
===============================================
================ END COMMENT ================*/

function show_tests(hash) {
  $(".visit-tests").empty();
  $("#tests-modal").modal("toggle");
  let tests = exce(
    `select (select test_name from test where test.hash=visits_tests.tests_id) as name,result_test,is_done from lab_visits_tests where visit_id=${hash} and is_done=0 ;`
  ).result.query;
  var color, text;
  for (let test of tests) {
    let html_result = "";
    if (test.result_test != null) {
      let results = JSON.parse(test.result_test).result;
      for (let result of results) {
        html_result += ` <span class="badge badge-info m-1">${result.name}: ${result.result} ${result.unit}</span> `;
      }
    }
    $(".visit-tests").append(
      `
            <tr>
                <td>
                    <div class="td-content product-brand">${test.name}</div>
                </td>
                <td>
                    <div class="td-content product-invoice">${html_result}</div>
                </td>
                <td>
                    <div class="td-content"><span class="badge badge-danger"> لم تظهر النتيجة </span></div>
                </td>
            </tr>
            `
    );
  }
}

function print_result(hash) {
  location.href = `print_invoice.html?hash=${hash}`;
}

function SetNewTable(id) {
  let table = $(`#${id}`).DataTable({
    ordering: false,
    paging: false,
    responsive: {
      details: {
        type: "column",
        target: -1,
      },
    },
    columnDefs: [
      {
        className: "dtr-control text-start",
        orderable: false,
        targets: -1,
      },
    ],
    dom:
      "<'dt--top-section'<'row'<'col-12 col-sm-6 d-flex justify-content-sm-start justify-content-center mt-sm-0 mt-3'f><'col-12 col-sm-6 d-flex justify-content-sm-start justify-content-center'l>>>" +
      "<'table-responsive'tr>",
    search: false,

    oLanguage: {
      oPaginate: {
        sPrevious:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
        sNext:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
      },
      sInfo: "Showing page _PAGE_ of _PAGES_",
      sSearch:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      sSearchPlaceholder: "بحث...",
      sLengthMenu: "النتائج :  _MENU_",
    },
    stripeClasses: [],
    bLengthChange: false,
  });
  return table;
}

const changePatient = function (el) {
  el.prop("checked") === true ? inputPatient() : selectPatient();
};

const selectPatient = function () {
  select.show();
  select.width("100%");
  $("input[name=name]").addClass("d-none");
  patientDetail();
};

const inputPatient = function () {
  select.hide();
  $("input[name=name]").removeClass("d-none");
};

const patientDetail = function () {
  let patient = run(
    `select name,address,age_year,age_month,gender,phone from lab_patient where hash=${$(
      "select[name=name]"
    ).val()};`
  ).result[0].query0[0];
  $("#name").val(patient.name);
  $("#address").val(patient.address);
  $("#age_year").val(patient.age_year);
  $("#age_month").val(patient.age_month);
  $("#gender").val(patient.gender);
  $("#phone").val(patient.phone);
};

const resetPatientform = function () {
  $("#name").val("");
  $("#age_year").val("");
  $("#age_month").val("");
  $("#address").val("");
  $("#phone").val("");
  $("#gender").val("");
};

const createVisitStatusSelect = function (query, visit_hash, hash) {
  let option = "";
  for (let status of query) {
    option += `<option value="${status.hash}" ${
      hash == status.hash ? "selected" : ""
    }>${status.name}</option>`;
  }
  return `
        <select id="select-${visit_hash}" onchange="changeVisitStatus('${visit_hash}',$(this))" class="form-control">
            ${option}
        </select>
    `;
};

const changeVisitStatus = function (visit_hash, el) {
  run(
    `update visits set visits_status_id=${el.val()} where hash=${visit_hash};`
  );
  Toast.fire({
    icon: "success",
    title: "تم تحديث الزيارة",
  });
};

const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const drawVisits = function (data, tableID, table) {
  for (let visit of data) {
    let badget = visitType(visit.ispayed);
    tableID.append(`
          <tr>
              <td onclick="show_tests_swal('${visit.hash}','${
      visit.patient_name
    }')">${visit.patient_name}</td>
              <td>${createVisitStatusSelect(
                visit_status.result[0]?.query0,
                visit.hash,
                visit.visit_type
              )}</td>
              <td>${visit.visit_date}</td>
              <td>
                  <span id="done-${visit.hash}" class="badge badge-${
      visit.visit_type == 3 ? "success" : "info"
    }">
                      ${visit.visit_type == 3 ? "منجز" : "غير منجز"}
                  </span>
              </td>
              <td>${badget}</td>
              <td>
                  <ul class="table-controls">
                      <li>
                          <a class="bs-tooltip" onclick="edit_visits('${
                            visit.hash
                          }')" data-toggle="tooltip" data-placement="top" title="تعديل">
                              <i class="far fa-edit fa-lg mx-2"></i>
                          </a>
                      </li>
                      <li>
                          <a class="bs-tooltip" onclick="location.href='invoice.html?hash=${
                            visit.hash
                          }'" data-toggle="tooltip" data-placement="top" title="طباعة الفاتورة">
                              <i class="fal fa-cash-register fa-lg mx-2"></i>
                          </a>
                      </li>
                      <li>
                          <a class="bs-tooltip" onclick="show_tests_swal('${
                            visit.hash
                          }','${
      visit.patient_name
    }')" data-toggle="tooltip" data-placement="top" title="ادخال النتائج">
                              <i class="far fa-poll fa-lg mx-2"></i>
                          </a>
                      </li>
                      <li>
                          <a class="bs-tooltip" onclick="print_result('${
                            visit.hash
                          }')" data-toggle="tooltip" data-placement="top" title="طباعة النتائج">
                              <i class="far fa-print fa-lg mx-2"></i>
                          </a>
                      </li>
                  </ul>
              </td>
              <td></td>
          </tr>
      `);
  }
};

const visitType = function (type) {
  let badget;
  switch (type) {
    case "0":
      badget = `<span class="badge badge-danger">لم يتم الدفع بعد</span>`;
      break;
    case "1":
      badget = `<span class="badge badge-success">تم الدفع</span>`;
      break;
    default:
      badget = `<span class="badge badge-info">لم يتم الدفع بعد</span>`;
      break;
  }
  return badget;
};

function filterByColumn(term) {
  let data = run(`select
                    lab_patient.name as 'patient_name',
                    visits_status_id as 'visit_type',
                    visit_date,
                    ispayed,
                    lab_visits.hash
                  from 
                    visits
                  inner join 
                    patient on lab_patient.hash = lab_visits.visits_patient_id 
                  where
                    lab_id=${lab_hash} 
                  having
                    patient_name like '%${term}%'
                  order by 
                    visit_date desc
                  limit 40;`).result[0].query0;
  $("#visits_body").empty();
  drawVisits(data, $("#visits_body"), table);
  $("#visits_body").append(
    `<tr>
      <td></td>
      <td></td>
      <td colsapn="6" class="text-center" ><span class="badge badge-success">نهاية البحث</span></td>
      <td></td>
      <td></td>
      <td></td>
     </tr>`
  );
  pageNumber = -1;
}

document.addEventListener("keypress", function (e) {
  if (e.data.length >= 0) {
    console.log(
      "%c========== Start  ==========",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px"
    );
    console.log("=====>", e.data);
    console.log(
      "%c=========== End  ===========",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px"
    );
    e.preventDefault();
  }
});

function barCodeGenrator(code) {
  JsBarcode("#barcode", code);
  let prtContent = document.getElementById("barcode");
  let WinPrint = window.open(
    "",
    "",
    "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0"
  );
  WinPrint.document.write(
    `<div style="display: flex;justify-content: center;">${prtContent.outerHTML}</div>`
  );
  // document.write(`<div style="display: flex;justify-content: center;">${prtContent.outerHTML}</div>`);
  WinPrint.document.close();
  WinPrint.focus();
  WinPrint.print();
  // WinPrint.close();
}

function focusInput(type) {
  let list = $(".mover");
  let index = list.index($(".mover:focus"));
  if (type == "add") {
    index = (index + 1) % list.length;
  } else {
    index = (index - 1) % list.length;
  }
  list.eq(index).focus();
}

// function to draow packages
function drawPackageSelector(hash = 0) {
  let id = 0;
  if (hash == 0) {
    // random id 16 digit number
    hash = Math.floor(Math.random() * 100000000000000000);
  } else {
    id = hash;
  }
  return `
    <div class="col-md-12" id="${hash}">
      <div class="row align-items-center">
        <div class="col-md-10">
          <div class="form-group">
            <label for="package_selector">اختر التحليل</label>
            <select class="form-control" name="package_selector" id="package_selector-hash" value="${hash}">
              <option value="0">اختر التحليل</option>
              ${offersSelect}
            </select>
          </div>
        </div>
        <div class="col-md-2">
          <a class="btn btn-danger btn-block" onclick="fireSwal(removePackage,'${hash}')">حذف</a>
        </div>
      </div>
    </div>
  `;
}

// remove package from table
function removePackage(hash) {
  $("#" + hash).remove();
}
