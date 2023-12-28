const THEME = new PackageTestTheme();
let TEST = null;

let getData =
  run(`SELECT name,birth,hash FROM lab_patient WHERE lab_id='${localStorage.getItem(
    "lab_hash"
  )}' and isdeleted='0';
                   SELECT name,hash FROM lab_doctor WHERE lab_id='${localStorage.getItem(
                     "lab_hash"
                   )}' and isdeleted='0';
                   SELECT name,hash FROM lab_visit_status;
                   SELECT name,price,note,catigory_id as type, category_hash,
                          (select DISTINCT name from devices where id=lab_pakage_tests.lab_device_id) as device_name,
                          (select DISTINCT name from kits where id=lab_pakage_tests.kit_id) as kit_name,
                          lab_package.hash as hash
                   FROM lab_package 
                   inner join lab_pakage_tests on lab_package.hash=lab_pakage_tests.package_id 
                   inner join lab_test on lab_pakage_tests.test_id=lab_test.hash
                   WHERE lab_package.lab_id='${localStorage.getItem(
                     "lab_hash"
                   )}' and test_type <>'3' group by hash;
                   SELECT * from lab_invoice_worker where lab_hash='${localStorage.getItem(
                     "lab_hash"
                   )}' and is_available=1 and isdeleted=0 limit 5;
                   select * from lab_invoice where lab_hash='${localStorage.getItem(
                     "lab_hash"
                   )}';SELECT * FROM unimedica_db.lab_test_catigory;`);

let patients = getData.result[0].query0;
let doctors = getData.result[1].query1;
let visitStatus = getData.result[2].query2;
let packages = getData.result[3].query3;
let workers = getData.result[4].query4;
let invoices = getData.result[5].query5[0];
let categories = getData.result[6].query6;

// get birth by float age year
function getBirthByAge(age_year = 0, age_month = 0, age_day = 0) {
  let ageByDay =
    Number(age_year) * 365 + Number(age_month) * 30 + Number(age_day);
  let birth = new Date();
  birth.setDate(birth.getDate() - ageByDay);
  let year = birth.getFullYear();
  let month = birth.getMonth() + 1;
  let day = birth.getDate();
  // month to 2 digit
  month = month.toString().length == 1 ? "0" + month : month;
  // day to 2 digit
  day = day.toString().length == 1 ? "0" + day : day;
  return `${year}-${month}-${day}`;
}
class Visit extends Factory {
  // init() {
  //     super.init();
  //     this.dataTable.column(0).visible(false);
  //     this.orderDataTable();
  // }
  init() {
    this.createModal();
    let userType = localStorage.getItem("user_type");
    this.dataTable = setServerTable(
      "lab_visits-table",
      `${base_url}Visit/getVisits`,
      () => {
        let checkInput = $("#currentDay");
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
          render: function (data, type, row) {
            return `<div class="d-none d-print-block-inline">${row.patient_name}</div><input type="text" id="${row.patient_hash}_patient_name" data_hash="${row.patient_hash}" class="form-control" name="patient_name" value="${row.patient_name}" onblur="updatePatientName('${row.patient_hash}',this)">`;
          },
        },
        {
          data: "null",
          render: function (data, type, row) {
            return `<a href="#" class="w-100 d-block" onclick="visitDetail('${row.hash}');fireSwalWithoutConfirm(showAddResult, '${row.hash}')">${row.visit_date}</a>`;
          },
        },
        {
          data: null,
          className: "not-print",
          render: function (data, type, row) {
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
                              userType == "2" && row.ispayed == "0"
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

  addRow(row) {
    if (this.dataTable.row(`#${row.hash}`)[0].length == 0) {
      let node = this.dataTable.row
        .add({
          0: `<a href="#" class="w-100 d-block" onclick="visitDetail('${row.hash}');fireSwalWithoutConfirm(showAddResult, '${row.hash}')">${row.patient_name}</a>`,
          1: `<a href="#" class="w-100 d-block" onclick="visitDetail('${row.hash}');fireSwalWithoutConfirm(showAddResult, '${row.hash}')">${row.visit_type}</a>`,
          2: `
                    <a class="btn-action add" title="عرض الزيارة"  onclick="visitDetail('${row.hash}');fireSwalWithoutConfirm(showAddResult, '${row.hash}')"><i class="far fa-eye"></i></a>
                    <a class="btn-action add" title="تعديل الزيارة" onclick="fireSwalWithoutConfirm.call(lab_visits, lab_visits.updateItem,'${row.hash}')"><i class="far fa-edit"></i></a>
                    <a class="btn-action delete" title="حذف الزيارة" onclick="fireSwalForDelete.call(lab_visits,lab_visits.deleteItem, '${row.hash}')"><i class="far fa-trash-alt"></i></a>
                    `,
          3: ``,
        })
        .node();
      node.id = row.hash;
      // $(node).attr('onclick', `visitDetail('${row.hash}');fireSwalWithoutConfirm(showAddResult, '${row.hash}')`);
      this.dataTable.draw();
    }
  }

  orderDataTable() {
    this.dataTable.order([[0, "desc"]]).draw();
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

  resetForm() {
    $("#visits_patient_id").val("").trigger("change");
    $("#visit_date").val(TODAY);
    $("#age_year").val(0);
    $("#age_day").val(0);
    $("#age_month").val(0);
    $("#gender").val("").trigger("change");
    $("#phone").val("");
    $("#address").val("");
    $("#visits_status_id").val("").trigger("change");
    $("#doctor_hash").val("").trigger("change");
    $("#note").val("");
    $("#dicount").val(0);
    $("#total_price").val(0);
    $("#net_price").val(0);
    // fill packages
    packages.forEach((x) => {
      $(`#package_${x.hash}`).prop("checked", false);
      $(`#package_${x.hash}`).trigger("change");
    });
    // change button onclick
    $(`#${this.table}-save`).attr(
      "onclick",
      `fireSwal.call(${this.table},${this.table}.saveNewItem)`
    );
    $("#show_selected_tests").html("");
  }

  getQuery(resetQuery) {
    return `select 
            lab_visits.hash as hash,
            lab_patient.name as patient_name,
            visits_patient_id,
            (select name from lab_visit_status where hash=visits_status_id) as visit_type,
            visits_status_id,
            visit_date,
            doctor_hash,
            total_price,
            net_price,
            dicount,
            address,
            age_year,
            age_day,
            age_month,
            gender,
            phone,
            lab_visits.id as id,
            note
        from 
            lab_visits 
        inner join 
            lab_patient 
        on 
            lab_patient.hash = lab_visits.visits_patient_id
        ${resetQuery};`;
  }

  getItem(hash) {
    return this.getQuery(`where lab_visits.hash='${hash}'`);
  }

  mainCondition() {
    return ` where lab_id=${localStorage.getItem("lab_hash")}
        and 
            visit_date = CURDATE() and ${this.table}.isdeleted='0'
        `;
  }

  createTableBody(data, dataTable = false) {
    if (dataTable) {
      this.dataTable = setTable_1(this.tableId, {
        dom:
          `<'dt--top-section'
                <'row flex-row-reverse'
                    <'col-6 col-md-2 d-flex justify-content-md-end justify-content-center mb-md-3 mb-3'l>
                    <'col-6 col-md-2 d-flex justify-content-md-end justify-content-center mb-md-3 mb-3'f>
                    <'col-sm-12 col-md-8 d-flex justify-content-md-start justify-content-center addCustomItem'>
                >
            >` +
          "<'table-responsive'tr>" +
          `<'dt--bottom-section'
                <'row'>
            >`,
        lengthMenu: [300],
      });
    }
    for (let row of data) {
      this.addRow(row);
    }
  }

  orderByQuery() {
    return `order by visit_date desc`;
  }

  updateItem(hash) {
    $("#work-sapce").empty();
    $("#show_selected_tests div").remove();
    // open modal
    $("html, body").animate(
      {
        scrollTop: $("#visit-form").offset().top,
      },
      500
    );
    $(".testSelect").each(function (index, item) {
      // change attr checked
      $(item).prop("checked", false);
    });
    $("#visits_patient_id-form").empty();
    $("#visits_patient_id-form").append(`
            <label for="visits_patient_id"> اسم المريض</label>
            <select class="form-control" id="visits_patient_id">
            <option value="false">اختر المريض</option>
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
            </script>`);
    $('input[name="new_patient"]').prop("checked", false);
    // fill form with item
    let items = run(
      this.getItem(hash) +
        `
        select package_id, (select name from lab_package where lab_visits_package.package_id = lab_package.hash) as name from lab_visits_package where visit_id = '${hash}';
        `
    );
    let item = items.result[0].query0[0];
    let visitPackages = items.result[1].query1;
    $("#visits_patient_id").val(item.visits_patient_id).trigger("change");
    $("#visit_date").val(item.visit_date);
    $("#age_year").val(item.age_year);
    $("#age_day").val(item.age_day);
    $("#age_month").val(item.age_month);
    $("#gender").val(item.gender).trigger("change");
    $("#phone").val(item.phone);
    $("#address").val(item.address);
    $("#visits_status_id").val(item.visits_status_id).trigger("change");
    $("#doctor_hash").val(item.doctor_hash).trigger("change");
    $("#note").val(item.note);
    $("#dicount").val(item.dicount);
    $("#total_price").val(item.total_price);
    $("#net_price").val(item.net_price);
    // fill packages
    visitPackages.forEach((x) => {
      $(`#package_${x.package_id}`).prop("checked", true);
      $(`#package_${x.package_id}`).trigger("change");
      // $(`#package_${x.package_id}`) parent div has class items add class itemsActive
      $(`#package_${x.package_id}`).parent(".items").addClass("itemsActive");
      showSelectedTests(x.package_id, x.name, true);
    });
    // change button onclick
    $(`#${this.table}-save`).attr(
      "onclick",
      `fireSwal.call(${this.table}, ${this.table}.saveUpdateItem, '${hash}')`
    );
  }

  validate() {
    // check if patient is selected
    let patientHash = $("#visits_patient_id").val();
    if (patientHash == "false" || patientHash == "0" || patientHash == "") {
      niceSwal("error", "top-end", "يجب ادخال بيانات المريض اولا");
      return false;
    } else if ($("#visit_date").val() == "") {
      niceSwal("error", "top-end", "يجب اختيار تاريخ الزيارة");
      return false;
    } else if (!$(".testSelect:checked").length) {
      niceSwal("error", "top-end", "يجب اختيار اختبار واحد على الاقل");
      return false;
    } else if (
      parseInt($("#age_year").val()) * 356 +
        parseInt($("#age_day").val()) +
        parseInt($("#age_month").val()) * 30 <=
      0
    ) {
      niceSwal("error", "top-end", "يجب ادخال العمر");
      return false;
    }
    return true;
  }

  getNewData() {
    let age_year = $("#age_year").val();
    let age_month = $("#age_month").val();
    let age_day = $("#age_day").val();
    let birth = getBirthByAge(age_year, age_month, age_day);
    let age = (
      Number(age_year) +
      Number(age_month / 12) +
      Number(age_day / 365)
    ).toFixed(2);
    let name = ($("input[name=new_patient]").is(":checked") ? true : false)
      ? $("#visits_patient_id").val()
      : $(`#visits_patient_id option:selected`).html();
    let data = {
      visits_patient_id: $("#visits_patient_id").val(),
      name: name,
      visit_date: $("#visit_date").val(),
      age_year: age_year,
      age_month: age_month,
      age_day: age_day,
      birth: birth,
      age: age,
      address: $("#address").val(),
      phone: $("#phone").val(),
      gender: $("#gender").val(),
      doctor_hash: $("#doctor_hash").val(),
      note: $("#note").val(),
      dicount: $("#dicount").val(),
      total_price: $("#total_price").val(),
      net_price: $("#net_price").val(),
      lab_id: localStorage.getItem("lab_hash"),
      new_patient: $("input[name=new_patient]").is(":checked") ? true : false,
    };
    return data;
  }

  saveNewItem() {
    // let phone = run(`select phone from lab_patient where phone = '${$('#phone').val()}' and isdeleted = 0;`)?.result[0]?.query0[0]?.phone;
    // if (phone) {
    //     Swal.fire({
    //         title: 'تنبيه',
    //         text: 'هذا الرقم تابع لمريض مسجل بالفعل',
    //         icon: 'warning',
    //         confirmButtonText: 'موافق'
    //     });
    //     return false;
    // }
    if (!this.validate()) {
      return false;
    }
    $(".itemsActive").removeClass("itemsActive");
    let insertedPackages = [];
    $(".testSelect:checked").each(function () {
      insertedPackages.push($(this).val());
    });
    let insertedTests = run(`
        select 
            test_id as id,
            package_id,
            (select test_name from lab_test where lab_test.hash = lab_pakage_tests.test_id limit 1) as name,
            (select catigory_id from lab_package where lab_package.hash = lab_pakage_tests.package_id limit 1) as catigory_id
        from 
            lab_pakage_tests where package_id in (${insertedPackages});`)
      .result[0].query0;
    // delete duplicate tests
    let error = false;
    insertedTests = insertedTests.filter((test, index, array) => {
      return (
        array.findIndex((foundedTest) => {
          if (
            foundedTest.id === test.id &&
            foundedTest.catigory_id != test.catigory_id
          ) {
            niceSwal("error", "top-end", `التحليل ${test.name} مكرر`);
            error = true;
          }
          return (
            foundedTest.id === test.id &&
            foundedTest.catigory_id === test.catigory_id
          );
        }) === index
      );
    });
    if (error) {
      return false;
    }
    let data = this.getNewData();
    // get birth from age_year and age_month
    let patient_hash = null;
    if (data.new_patient) {
      patient_hash = run({
        action: "insert",
        table: "lab_patient",
        column: {
          name: data.visits_patient_id,
          lab_id: data.lab_id,
          phone: data.phone,
          address: data.address,
          gender: data.gender,
          age_year: data.age_year,
          age_day: data.age_day,
          age_month: data.age_month,
          birth: data.birth,
        },
      }).result[0].query0;
      patients.push({
        name: data.name,
        hash: patient_hash,
        birth: data.birth,
      });
    } else {
      run({
        action: "update",
        table: "lab_patient",
        column: {
          address: data.address,
          phone: data.phone,
          gender: data.gender,
          age_year: data.age_year,
          age_day: data.age_day,
          age_month: data.age_month,
          birth: data.birth,
        },
        hash: data.visits_patient_id,
      });
      patient_hash = data.visits_patient_id;
    }

    let newObjectHash = run({
      table: this.table,
      action: "insert",
      column: {
        labID: data.lab_id,
        name: data.name,
        visits_patient_id: patient_hash,
        visit_date: data.visit_date,
        visits_status_id: "2",
        doctor_hash: data.doctor_hash,
        note: data.note,
        dicount: data.dicount,
        total_price: data.total_price,
        net_price: data.net_price,
        age: data.age,
      },
    }).result[0].query0;
    let mainQuery = `${this.getItem(newObjectHash)} `;
    $(".testSelect:checked").each(function () {
      mainQuery += `insert into lab_visits_package(visit_id, package_id, price,lab_id) values('${newObjectHash}', '${$(
        this
      ).val()}', '${$(this).data("price")}','${localStorage.lab_hash}'); `;
    });
    insertedTests.map((test) => {
      mainQuery += `insert into lab_visits_tests(visit_id, package_id, tests_id,lab_id) values('${newObjectHash}', '${test.package_id}', '${test.id}','${localStorage.lab_hash}'); `;
    });
    let newVisit = run(mainQuery).result[0].query0[0];
    // empty show_selected_tests except first column
    $("#show_selected_tests div").remove();
    add_calc_tests(
      insertedTests.map((test) => test.id),
      newObjectHash
    );
    this.addRow(newVisit);
    this.dataTable.draw();
    this.orderDataTable();
    this.resetForm();
    visitDetail(newObjectHash);
    showAddResult(newObjectHash);
    $("#input-search-2").val("");
  }

  saveUpdateItem(hash) {
    if (!this.validate()) {
      return false;
    }
    $(".itemsActive").removeClass("itemsActive");
    let insertedPackages = [];
    $(".testSelect:checked").each(function () {
      insertedPackages.push($(this).val());
    });
    let insertedTests = run(`
        select 
            test_id as id,
            package_id,
            (select test_name from lab_test where lab_test.hash = lab_pakage_tests.test_id limit 1) as name,
            (select catigory_id from lab_package where lab_package.hash = lab_pakage_tests.package_id limit 1) as catigory_id
        from 
            lab_pakage_tests where package_id in (${insertedPackages});`)
      .result[0].query0;
    // delete duplicate tests
    let error = false;
    insertedTests = insertedTests.filter((test, index, array) => {
      return (
        array.findIndex((foundedTest) => {
          if (
            foundedTest.id === test.id &&
            foundedTest.package_id === test.package_id &&
            foundedTest.catigory_id != test.catigory_id
          ) {
            niceSwal("error", "top-end", `التحليل ${test.name} مكرر`);
            error = true;
          }
          return (
            foundedTest.id === test.id &&
            foundedTest.package_id === test.package_id &&
            foundedTest.catigory_id === test.catigory_id
          );
        }) === index
      );
    });
    if (error) {
      return false;
    }
    $("#show_selected_tests div").remove();
    let data = this.getNewData();
    let patientData = {
      age_year: data.age_year,
      age_month: data.age_month,
      age_day: data.age_day,
      address: data.address,
      phone: data.phone,
      gender: data.gender,
      birth: data.birth,
    };

    let visitData = {
      visits_patient_id: data.visits_patient_id,
      visit_date: data.visit_date,
      doctor_hash: data.doctor_hash,
      note: data.note,
      dicount: data.dicount,
      total_price: data.total_price,
      net_price: data.net_price,
      age: data.age,
    };
    let mainQuery = `update lab_patient set ${Object.entries(patientData)
      .map(([key, value]) => `${key}='${value}'`)
      .join(",")} where hash = '${data.visits_patient_id}'; `;
    mainQuery += `update ${this.table} set ${Object.entries(visitData)
      .map(([key, value]) => `${key}='${value}'`)
      .join(",")} where hash = '${hash}'; `;
    mainQuery += `${this.getItem(hash)} `;
    const result = run(`
            select package_id from lab_visits_package where visit_id = '${hash}';
            select package_id, tests_id from lab_visits_tests where visit_id = '${hash}';
        `).result;
    const oldPackages = result[0].query0.map((item) => item.package_id);
    const oldTests = result[1].query1;
    const newPackages = insertedPackages;
    const newTests = insertedTests;
    let tests_hashes = newTests.map((test) => test.id);

    const deletedPackages = oldPackages.filter(
      (_package) => !newPackages.includes(_package)
    );
    const deletedTests = oldTests.filter(
      (_test) =>
        !newTests.some(
          (newTest) =>
            newTest.package_id === _test.package_id &&
            newTest.id === _test.tests_id
        )
    );
    const addedPackages = newPackages.filter(
      (_package) => !oldPackages.includes(_package)
    );
    const addedTests = newTests.filter(
      (_test) =>
        !oldTests.find(
          (_oldTest) =>
            _oldTest.package_id === _test.package_id &&
            _oldTest.tests_id === _test.id
        )
    );
    mainQuery += deletedPackages
      .map(
        (_package) =>
          `delete from lab_visits_package where visit_id = '${hash}' and package_id = '${_package}'; `
      )
      .join("");
    mainQuery += deletedTests
      .map(
        (_test) =>
          `delete from lab_visits_tests where visit_id = '${hash}' and package_id = '${_test.package_id}' and tests_id = '${_test.tests_id}'; `
      )
      .join("");
    mainQuery += addedPackages
      .map(
        (_package) =>
          `insert into lab_visits_package(visit_id, package_id, price,lab_id) values('${hash}', '${_package}', '${$(
            `.testSelect[value=${_package}]`
          ).data("price")}','${localStorage.lab_hash}'); `
      )
      .join("");
    mainQuery += addedTests
      .map(
        (_test) =>
          `insert into lab_visits_tests(visit_id, package_id, tests_id, lab_id) values('${hash}', '${_test.package_id}', '${_test.id}','${localStorage.lab_hash}'); `
      )
      .join("");

    let newVisit = run(mainQuery).result[2].query2[0];
    add_calc_tests(tests_hashes, hash, "update");
    this.dataTable.row(`#${hash} `).remove();
    this.addRow(newVisit);
    this.dataTable.draw();
    this.orderDataTable();
    this.resetForm();
    $(`#${this.table} -save`).attr(
      "onclick",
      `fireSwal.call(${this.table}, ${this.table}.saveNewItem)`
    );
    visitDetail(hash);
    showAddResult(hash);
    $("#input-search-2").val("");
  }

  async createModal() {
    const fetchInvoice = async () => {
      const labHash = localStorage.getItem("lab_hash");
      return await fetch(`${base_url}Invoice/get_or_create?hash=${labHash}`)
        .then((e) => e.json())
        .then((res) => {
          let setting = JSON.parse(res.data.setting);
          return setting;
        });
    };
    const setting = await fetchInvoice();
    const labTheme = setting?.visitTestsTheme ?? "default";
    let theme = null;
    switch (labTheme) {
      case "one":
        theme = new TestsThemeOne(this.table, packages, categories);
        break;
      case "two":
        theme = new TestsThemeTwo(this.table, packages, categories);
        break;
      default:
        theme = new TestsThemeTwo(this.table, packages, categories);
    }
    // append top of div
    $("#testsThemeElement").prepend(theme.build());

    let modal = `<div class="modal fade" id = "${
      this.modalId
    }" tabindex="-1" role="dialog" aria-labelledby="${
      this.modalId
    }" aria-hidden="true" >
            <div class="modal-dialog modal-xl" role="document">
                <div class="modal-content">
                    ${this.createForm()}
                </div>
            </div>
                    </div > `;
    // $('body').append(modal);
  }

  createForm() {
    return `
        <div class="statbox widget box box-shadow bg-white main-visit-form">
            <div class="widget-content widget-content-area m-auto">
                <div class="modal-header d-flex justify-content-center">
                    <h5 class="modal-title" id="${this.modalId}">اضافة مريض</h5>
                </div>
                <div class="modal-body style="width: 95%;"">
                    <form id="${this.formId}">
                        <div class="row justify-content-sm-between">
                        <div class="col-md-12  my-4">
                            <label class="h5 d-inline mr-4">مريض جديد</label>
                            <label class="d-inline switch s-icons s-outline s-outline-invoice-slider mr-2">
                                <input type="checkbox" name="new_patient" checked  onchange="changePatient($(this))">
                                <span class="invoice-slider slider"></span>
                            </label>
                        </div>
                        <div class="col-3">
                            <!-- اسم المريض -->
                            <div class="form-group" id="visits_patient_id-form">
                                <label for="visits_patient_id">اسم المريض</label>
                                <input type="text" class="form-control" id="visits_patient_id" placeholder="اسم المريض">
                            </div>
                        </div>
                        <div class="col-3">
                            <!-- تاريخ الزيارة -->
                            <div class="form-group">
                                <label for="visit_date">تاريخ الزيارة</label>
                                <input type="date" class="form-control" id="visit_date"  placeholder="تاريخ الزيارة">
                            </div>
                        </div>
                        <div class="col-2">
                            <!-- العمر بالسنين -->
                            <div class="form-group">
                                <label for="age_year">العمر بالسنين</label>
                                <input type="number" class="form-control" id="age_year"  placeholder="العمر بالسنين" value="0">
                            </div>
                        </div>
                        <div class="col-2">
                            <!-- العمر بالشهور -->
                            <div class="form-group">
                                <label for="age_month">العمر بالشهور</label>
                                <input type="number" class="form-control" id="age_month"  placeholder="العمر بالشهور" value="0">
                            </div>
                        </div>
                        <div class="col-2">
                            <!-- العمر بالايام -->
                            <div class="form-group">
                                <label for="age_day">العمر بالايام</label>
                                <input type="number" class="form-control" id="age_day"  placeholder="العمر بالايام" value="0">
                            </div>
                        </div>
                        <div class="col-3">
                            <!-- العنوان -->
                            <div class="form-group">
                                <label for="address">العنوان</label>
                                <input type="text" class="form-control" id="address"  placeholder="العنوان">
                            </div>
                        </div>
                        <div class="col-3">
                            <!-- رقم الهاتف -->
                            <div class="form-group">
                                <label for="phone">رقم الهاتف</label>
                                <input type="number" class="form-control" id="phone"  placeholder="رقم الهاتف">
                            </div>
                        </div>
                        <div class="col-3">
                            <!-- الجنس -->
                            <div class="form-group">
                                <label for="gender">الجنس</label>
                                <select class="form-control" id="gender">
                                    <option value="ذكر">ذكر</option>
                                    <option value="انثى">انثى</option>
                                </select>
                                <script>
                                    $('#visit_date').val(TODAY);
                                    $('#gender').select2({
                                        width: '100%'
                                    });
                                </script>
                            </div>
                        </div>
                        <div class="col-3">
                            <!-- الطبيب المعالج -->
                            <div class="form-group" id="doctor_hash-form">
                                <label for="note">الطبيب</label>
                                <select class="form-control" id="doctor_hash">
                                <option value="false">اختر الطبيب</option>
                                    ${doctors
                                      .map(
                                        (doctor) =>
                                          `<option value="${doctor.hash}">${doctor.name}</option>`
                                      )
                                      .join("")}
                                </select>
                                <script>
                                    $('#doctor_hash').select2({
                                        width: '100%'
                                    });
                                </script>
                            </div>
                        </div>
                        
                        <div class="col-12">
                            <!-- ملاحظات -->
                            <div class="form-group">
                                <label for="note">ملاحظات</label>
                                <textarea class="form-control" id="note" style="font-size:14px" rows="3"></textarea>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!--<div class="modal-footer">
        <button type="button" class="btn btn-main-add" onclick="fireSwal.call(${
          this.table
        },${this.table}.saveNewItem)" id="${this.table}-save">حفظ</button>
    </div>-->
    `;
  }

  deleteItem(hash) {
    $("#show_visit_button").attr("onclick", "");
    $("#invoice_button").attr("onclick", "");
    $("#show_add_result").attr("onclick", "");
    $(".action").removeClass("active");
    let workSpace = $("#work-sapce");
    workSpace.html("");
    run({
      table: this.table,
      action: "update",
      column: {
        isdeleted: 1,
      },
      hash: hash,
    });
    this.dataTable.row(`#${hash} `).remove().draw();
  }

  havingQuery(value) {
    return `having lab_patient.name like '%${value}%'`;
  }
}

class Patient extends Factory {
  addRow(row) {}

  getItem(hash) {
    return run(`select * from ${this.table} where hash = '${hash}'; `).result[0]
      .query0[0];
  }

  init() {
    this.createModal();
    this.createTableBody(this.getAll(0), false);
  }

  saveNewItem() {
    if (!validateForm(this.formId, this.fields)) {
      return false;
    }
    let data = this.getNewData();
    data = { ...data, lab_id: localStorage.getItem("lab_hash") };
    let newObjectHash = run({
      table: this.table,
      action: "insert",
      column: data,
    }).result[0].query0;
    let newPatient = run(
      `select name, birth, hash from lab_patient where hash = '${newObjectHash}'; `
    ).result[0].query0[0];
    patients.push(newPatient);
    $("#visits_patient_id").append(
      `< option value = "${newObjectHash}" > ${data.name}</ > `
    );
    $("#visits_patient_id").val(newObjectHash).trigger("change");
    $(`#${this.modalId} `).modal("hide");
  }
}

class Doctor extends Factory {
  addRow(row) {}

  init() {
    this.createModal();
  }

  getNewData() {
    let data = super.getNewData();
    data = { ...data, lab_id: localStorage.getItem("lab_hash") };
    return data;
  }

  saveNewItem() {
    // validate form
    if (!validateForm(this.formId, this.fields)) {
      return false;
    }
    let data = this.getNewData();
    let newObjectHash = run({
      table: this.table,
      action: "insert",
      column: data,
    }).result[0].query0;
    let newDoctor = run(
      `select name, hash FROM lab_doctor where hash = '${newObjectHash}'; `
    ).result[0].query0[0];
    doctors.push(newDoctor);
    $("#doctor_hash").append(
      `< option value = "${newObjectHash}" > ${data.name}</ > `
    );
    $("#doctor_hash").val(newObjectHash).trigger("change");
    $(`#${this.modalId} `).modal("hide");
  }
}

// init lab_visits class
// fields: doctor_hash, age, visit_date, visits_patient_id, visits_status_id, note, total_price, dicount, net_price, ispayed, hash, insert_record_date, isdeleted
let lab_visits = new Visit("lab_visits", " زيارة", [], {
  pageSize: 400,
});

// init lab_patient class
let lab_patient = new Patient("lab_patient", " مريض", [
  { name: "hash", type: null },
  { name: "name", type: "text", label: "الاسم", req: "required" },
  {
    name: "gender",
    type: "select",
    label: "الجنس",
    options: [
      { hash: "ذكر", text: "ذكر" },
      { hash: "أنثى", text: "أنثى" },
    ],
    req: "required",
  },
  { name: "birth", type: "date", label: "تاريخ الميلاد", req: "required" },
  { name: "phone", type: "text", label: "رقم الهاتف", req: "required" },
  { name: "address", type: "text", label: "العنوان", req: "required" },
]);

let lab_doctor = new Doctor("lab_doctor", " طبيب", [
  { name: "hash", type: null },
  { name: "name", type: "text", label: "الاسم", req: "required" },
  {
    name: "commission",
    type: "number",
    label: "نسبة الطبيب %",
    req: "required",
  },
  { name: "jop", type: "text", label: "التخصص", req: "required" },
  { name: "phone", type: "text", label: "رقم الهاتف", req: "required" },
]);

const updateNormal = (test, kit, unit) => {
  TEST = run(`select option_test from lab_test where hash='${test}';`).result[0]
    .query0[0]?.option_test;
  try {
    TEST = JSON.parse(TEST);
    let { component } = TEST;
    let { reference } = component[0];
    // let neededRefrence = reference.filter((item) => {
    //   return (
    //     (kit == item.kit || (isNull(kit) && isNull(item.kit))) &&
    //     (unit == item.unit || (isNull(unit) && isNull(item.unit)))
    //   );
    // });

    let refrenceTable = THEME.build(test, reference, kit, unit);
    $("#refrence_editor .modal-body").html(refrenceTable);
    $("#refrence_editor").modal("show");
  } catch (error) {
    console.log(error);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "لا يوجد رينجات لتعديلها",
      showConfirmButton: false,
      timer: 3000,
    });
  }
};

function updateRefrence(hash, refID) {
  const formContainer = $(`#form_container`);
  // empty from container
  formContainer.empty();
  let { component } = TEST;
  let refrences = component[0].reference;
  let refrence = refrences.find((item, index, self) => index == refID);
  let form = THEME.mainForm(refID, hash, refrence);
  formContainer.append(form);
}

function saveRefrence(hash, refID) {
  if (refreshValidation() == false) {
    return false;
  }
  let result = $(`#refrence_form_${refID} input[name="type"]:checked`).val();
  let rightOptions = [];
  let options = [];
  if (
    $(`#refrence_form_${refID} input[name="type"]:checked`).val() == "result"
  ) {
    $(`#refrence_form_${refID} input[name='select-result-value']`).each(
      function () {
        options.push($(this).val());
        // get right options
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
  let { component } = TEST;
  let element = THEME.getData(refID, result, options, rightOptions);
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
    let newRefrence = component[0].reference.filter((item, index, self) => {
      return self.findIndex((t) => t?.kit === item?.kit) === index;
    });
    // (${element['age low']??0} ${element['age unit low']} - ${element['age high']??100} ${element['age unit high']})
    if (
      $(
        `#test-${hash}_kit-${(
          kits
            .find((x) => x.id == element.kit)
            ?.name.replace(/[^a-zA-Z0-9]/g, "_") ?? "No Kit"
        )
          .split(" ")
          .join("_")}`
      ).length == 0
    ) {
      document.getElementById(
        `test-${hash}`
      ).innerHTML += ` <span class="badge badge-light border border-info p-2 mr-2 mb-2 col-auto" id="test-${hash}_kit-${(
        kits
          .find((x) => x.id == element.kit)
          ?.name.replace(/[^a-zA-Z0-9]/g, "_") ?? "No Kit"
      )
        .split(" ")
        .join("_")}" style="min-width:200px">
            ${kits.find((x) => x.id == element.kit)?.name ?? "No Kit"} 
            <a onclick="editRefrence('${hash}',${
        newRefrence.length - 1
      })"><i class="far fa-edit fa-lg mx-2 text-success"></i></a>
            </span> `;
    }
  } else {
    component[0].reference[refID] = element;
  }
  let test_options = { component: component };
  let kitUnit = run(`update lab_test set option_test='${JSON.stringify(
    test_options
  )}' where hash=${hash};
                    select kit from lab_kit_unit where kit='${
                      element.kit
                    }' and unit='${element.unit}';`).result[1].query1[0];
  if (!kitUnit) {
    run(
      `insert into lab_kit_unit(kit,unit) values('${element.kit}','${element.unit}');`
    );
  }

  $("#refrence_editor").modal("toggle");
  visitDetail(HASH);
  fireSwalWithoutConfirm(showAddResult, HASH);
  TEST = null;
}
