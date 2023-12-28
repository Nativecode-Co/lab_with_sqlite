'use strict';

// jQuery dom ready 
$(function () {
    $(".submit-all").on("click", function () {
        if ($(".form-patient").valid()) {
            fireSwal(createPatient);
        }
    });
});

// create new patient
function createPatient() {
    // get month and year to calculate age
    let birth_year = today.getFullYear() - $("input[name=age_year]").val() || 0;
    let birth_month = today.getMonth() + 1 - $("input[name=age_month]").val() || 0;

    // get doctor hash
    let doctor = $('select[name=doctor]').val();

    // get all fields from form
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

    // check af patient is new patient or old patient
    // insert or get patient hash
    if ($("input[name=new_patient]").prop("checked")) {
        patient_hash = run({
            action: "insert",
            table: "patient",
            column,
        }).result[0].query0;
    } else {
        patient_hash = $("select[name=name]").val();
    }

    // create new visit
    visit_hash = run(`insert into 
                        visits(name,visit_date,visits_patient_id,visits_status_id,ispayed,doctor_hash) 
                        values('${$("input[name=name]").val()}','${$("input[name='visit_date']").val()}','${patient_hash}','2','1','${doctor}')
                    ;`).result[0].query0;
    
    createVisitTests();
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
    resetPatientForm();
}

// create visit Tests
function createVisitTests() {
    let query = "";
    let hashes = [];
    // insert visits Package
    $(".package input:checked").each(function () {
      query += `insert into visits_package(visit_id,package_id,price) values(${visit_hash},${$(this).data("hash")},${$(this).data("price")});`;
      hashes.push($(this).data("hash"));
      $(this).prop("checked", false);
    });
    if (hashes.length != 0) {
      let package_tests = run(
        `select test_id,kit_id,lab_device_id,unit from pakage_tests where package_id in (${hashes})`
      ).result.query;
      for (let test of package_tests) {
        query += `insert into visits_tests(visit_id,result_test,tests_id) values('${visit_hash}','${JSON.stringify({ "result": [{ "name": "", "range": "", "result": "", "kit": test.kit_id, "device": test.lab_device_id, "unit": test.unit }] })}','${test.test_id}');`;
      }
    }
    run(query);
  }

// form patient validation
// fields name visit_date address gander phone
$(".form-patient").validate({
    rules: {
        age_month: {
            maxMonth: true
        }
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

// empty patient form
const resetPatientForm = function () {
    $("#name").val("");
    $("#age_year").val("");
    $("#age_month").val("");
    $("#address").val("");
    $("#phone").val("");
    $("#gender").val("");
  };
