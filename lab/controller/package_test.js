"use strict";

const THEME = new PackageTestTheme();
let TEST = null;

const _allData = run_both(`
    select name,id from kits;
    select device_id,kit_id,id from device_kit;
    select kit,unit,id from lab_kit_unit;
    select name,hash from lab_test_units;
    select hash,test_name as name from lab_test;
`);

let kits = _allData.result[0].query0;
let devices_kits = _allData.result[1].query1;
let kit_units = _allData.result[2].query2;
let _units = _allData.result[3].query3;
_tests = _allData.result[4].query4;

async function getKitsUnitsByTestName(testName, testHash) {
  let formData = new FormData();
  formData.append("name", testName);
  formData.append("hash", testHash);
  return await fetch(
    `${__domain__}app/index.php/Packages/getKitsAndUnitsByTestName`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
    }
  );
}

async function refreshData() {
  Swal.fire({
    title: "الرجاء الانتظار",
    text: "قد تستغرق العملية بعض الوقت",
    showDenyButton: false,
    showCancelButton: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
  });

  let tests = await fetch(`${__domain__}app/index.php/Tests/getTests`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((res) => res.json())
    .catch((err) => {
      localStorage.removeItem("token");
      window.location.href = `${__domain__}lab/login/login.html`;
    });
  if (tests.status === true) {
    localStorage.setItem("token", tests.token);
    // query to delete data from table
    run_both(`delete from lab_test;`);
    let total = tests.data.length / 50;
    let i = 1;
    // query to insert data
    while (i <= total) {
      let query = `INSERT INTO 
        lab_test(category_hash, hash,insert_record_date, isdeleted, option_test, sample_type, short_name, test_name, test_type)
        VALUES 
        `;
      for (let test of tests.data.slice((i - 1) * 50, i * 50)) {
        query += `('${test.category_hash}', '${test.hash}','${test.insert_record_date}', '${test.isdeleted}', '${test.option_test}', '${test.sample_type}', '${test.short_name}', '${test.test_name}', '${test.test_type}'),`;
      }
      run_both(query.slice(0, -1) + ";");
      i += 1;
    }
  } else {
    localStorage.removeItem("token");
    window.location.href = `${__domain__}lab/login/login.html`;
  }
  // refresh page
  // window.location.reload();
}
// id, package_id, test_id, kit_id, lab_device_id, unit, hash, insert_record_date, isdeleted
// functions for Tests

function changeCost(hash) {
  const element = document.querySelector(
    `#row-packages input[type=checkbox][value="${hash}"]`
  );
  const searchPackageElement = document.querySelector(
    "#search_package #testSearch"
  );
  searchPackageElement.value = "";
  searchPackageElement.dispatchEvent(new Event("keyup"));
  searchPackageElement.dispatchEvent(new Event("focus"));
  let cost = Number(document.querySelector("#addPackage #cost").value);
  let currentCost = Number(element.dataset.cost);
  if (
    document.querySelectorAll(`input[type=checkbox][value="${hash}"]`).length <=
    1
  ) {
    console.log("here");
    document.querySelector("#addPackage #cost").value = cost + currentCost;
    if (
      !document.querySelector(
        `#selected-tests input[type=checkbox][value="${hash}"]`
      )
    ) {
      let el = element.parentElement.parentElement.cloneNode(true);
      document.querySelector("#selected-tests").appendChild(el);
      element.checked = true;
    }
  } else {
    document.querySelector("#addPackage #cost").value = cost - currentCost;
    // if el in #selected-tests
    document
      .querySelector(`#selected-tests input[type=checkbox][value="${hash}"]`)
      .parentElement.parentElement.remove();
    element.checked = false;
  }
}

async function changeKitsAndUnits(name, hash) {
  let __data = await getKitsUnitsByTestName(name, hash).then((res) =>
    res.json()
  );
  let testKitsByName = __data.data.kits;
  // delete duplicate kits with same name
  testKitsByName = testKitsByName.filter(
    (thing, index, self) =>
      index === self.findIndex((t) => t.name === thing.name)
  );
  let testUnitsByName = __data.data.units;
  // delete duplicate units with same name
  testUnitsByName = testUnitsByName.filter(
    (thing, index, self) =>
      index === self.findIndex((t) => t.name === thing.name)
  );
  let testDevicesByKit = [];
  if (testKitsByName.length > 0) {
    let kitsIdList = testKitsByName
      .filter((item) => item.kit_id)
      .map((item) => {
        if (item.kit_id) {
          return item.kit_id;
        }
        return false;
      })
      .join(",");
    if (kitsIdList.length != 0) {
      testDevicesByKit = run_both(`
            select 
                DISTINCT devices.name, devices.id
                from 
                    lab_device 
                inner join  devices on lab_device.devices_id = devices.id and lab_device.lab_id = '${localStorage.getItem(
                  "lab_hash"
                )}}'  
                inner join device_kit on devices.id = device_kit.device_id 
                inner join kits on device_kit.kit_id =  kits.id where kits.id in (${kitsIdList});
        `).result[0].query0;
      // push {name: 'name', id: 'id'} to testDevicesByKit at first
    }
    testDevicesByKit.unshift({ name: "No Device", id: "0" });
  }
  $("#lab_device_id").empty();
  $("#kit_id").empty();
  $("#unit").empty();
  $("#unit").append(
    testUnitsByName.map(
      (item, index) => `<option value="${item.unit_id}">${item.name}</option>`
    )
  );
  $("#lab_device_id").append(
    testDevicesByKit.map(
      (item, index) => `<option value="${item.id}">${item.name}</option>`
    )
  );
  $("#kit_id").append(
    testKitsByName.map(
      (item, index) => `<option value="${item.kit_id}">${item.name}</option>`
    )
  );
  return testDevicesByKit;
}

async function setNameAndHash(ele) {
  $("search_test #testSearch").val("");
  const struc = ["stool", "urine", "semen"];
  let name = $(ele).data("name");
  let hash = $(ele).data("hash");
  if (struc.includes(name.toLowerCase().trim())) {
    $("#addTest #lab_device_id").parent().parent().hide();
    $("#addTest #kit_id").parent().parent().hide();
    $("#addTest #unit").parent().parent().hide();
  } else {
    $("#addTest #lab_device_id").parent().parent().show();
    $("#addTest #kit_id").parent().parent().show();
    $("#addTest #unit").parent().parent().show();
  }
  $("#addTest #name").val(name);
  $("#addTest #name").data("hash", hash);
  $("#addTest #lab_device_id").val("").trigger("change");
  let testDevicesByKit = await changeKitsAndUnits(name, hash);
  // store devices in local storage
  localStorage.setItem("testDevicesByKit", JSON.stringify(testDevicesByKit));
}

function addKitsByDevice(ele) {
  let device_id = $(ele).val();
  let deviceKits = devices_kits
    .filter((item) => item.device_id == device_id)
    .map((item) => item.kit_id);
  let kitsResult = kits.filter((item) => {
    return deviceKits.find((x) => x == item.id);
  });
  let kitElement = $("#kit_id");
  kitElement.empty();
  if (kitsResult.length == 0) {
    kitElement.append(`<option value="">No Kits</option>`);
    return false;
  }
  kitElement.append(
    kitsResult
      .map((item) => `<option value="${item.id}">${item.name}</option>`)
      .join("")
  );
  $("#kit_id").val($("#kit_id option:first").val()).trigger("change");
}

function addUnitsByKit(ele) {
  if (1) return false;
  let kit = $(ele).val();
  let kitUnits = kit_units
    .filter((item) => item.kit == kit)
    .map((item) => item.unit);
  let unitsResult = _units.filter((item) => {
    return kitUnits.find((x) => x == item.hash);
  });
  let unitElement = $("#unit");
  unitElement.empty();
  if (unitsResult.length == 0) {
    unitElement.append(`<option value="">No Units</option>`);
    return false;
  }
  unitElement.append(
    unitsResult
      .map((item) => `<option value="${item.hash}">${item.name}</option>`)
      .join("")
  );
  let device_id = getDeviceByKit(kit);
  $("#lab_device_id").val(device_id).trigger("change");
}

function getDeviceByKit(id) {
  let devices_id = devices_kits
    .filter((item) => item.kit_id == id)
    .map((item) => item.device_id);
  // get devicesbykit from local storage
  let testDevicesByKit = JSON.parse(localStorage?.getItem("testDevicesByKit"));
  let device = testDevicesByKit.filter((item) =>
    devices_id.find((x) => x == item.id)
  );
  return device[0]?.id;
}

// empty form
function emptyTestForm() {
  $("#addTest #name").val("");
  $("#addTest #price").val(0);
  $("#addTest #cost").val(0);
  $("#addTest #lab_device_id").val("").trigger("change");
  $("#addTest #kit_id").val("").trigger("change");
  $("#addTest #unit").val("").trigger("change");
}

async function updateTest(hash) {
  let test = lab_test.getItem(hash);
  allTests.addRow(allTests.getItem(test.test_id));

  let testDevicesByKit = await changeKitsAndUnits(test.name, test.test_id);
  // store devices in local storage
  localStorage.setItem("testDevicesByKit", JSON.stringify(testDevicesByKit));
  $("#addTest #name").val(test.name);
  $("#addTest #price").val(test.price);
  $("#addTest #cost").val(test.cost);
  $("#addTest #lab_device_id")
    .val(test.lab_device_id ?? "0")
    .trigger("change");
  $("#addTest #kit_id").val(test.kit_id).trigger("change");
  $("#addTest #unit")
    .val(test.unit ?? "0")
    .trigger("change");
  $(".buttons .btn-action").removeClass("active");
  $('.buttons .btn-action[data-id="addTest"]').addClass("active");
  $(".page").hide();
  $("#addTest").show();
  // change save button
  $("#addTest #save-button").attr(
    "onclick",
    `fireSwal(saveUpdateTest, '${hash}')`
  );
  // change title
  $("#addTest #save-button").text("تعديل");
}

function saveUpdateTest(hash) {
  let price = $("#addTest #price").val();
  let cost = $("#addTest #cost").val();
  let lab_device_id = $("#addTest #lab_device_id").val();
  let kit_id = $("#addTest #kit_id").val();
  let unit = $("#addTest #unit").val();
  let oldTest = run(
    `select lab_device_id,kit_id,unit,test_id from lab_pakage_tests where package_id='${hash}';`
  ).result[0].query0[0];
  // update lab_package
  run_both(`update lab_package set price='${price}',cost='${cost}' where hash='${hash}';
        update lab_pakage_tests 
        set 
            lab_device_id='${lab_device_id}',
            kit_id='${kit_id}',
            unit='${unit}' 
        where 
            lab_device_id='${oldTest.lab_device_id}' 
            and kit_id='${oldTest.kit_id}' 
            and unit='${oldTest.unit}' 
            and test_id='${oldTest.test_id}'
        ;`);
  lab_test.dataTable.draw();
}

async function saveNewTest() {
  let name = $("#addTest #name").val();
  let price = $("#addTest #price").val();
  let cost = $("#addTest #cost").val();
  let lab_device_id = $("#addTest #lab_device_id")?.val() ?? "No Device";
  let kit_id = $("#addTest #kit_id").val();
  let unit = $("#addTest #unit").val();
  let hash = $("#addTest #name").data("hash");
  // validate form
  if (name.length == 0 || price.length == 0) {
    niceSwal("error", "top-end", "يجب ملئ جميع الحقول");
    return false;
  }
  const formData = new FormData();
  formData.append("name", name);
  formData.append("cost", cost);
  formData.append("price", price);
  formData.append("test_id", hash);
  formData.append("lab_device_id", lab_device_id);
  formData.append("kit_id", kit_id);
  formData.append("unit", unit);
  formData.append("lab_id", localStorage.getItem("lab_hash"));

  const result = await fetch(
    `${__domain__}app/index.php/Packages/createNewTest`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
    }
  )
    .then((res) => res.json())
    .then((res) => res)
    .catch((err) => {});
  const { status, message, data } = result;
  if (status === false) {
    niceSwal("error", "top-end", message);
    return false;
  }

  let newPackage = run_both(allPAckages.getQuery(allPAckages.itemQuery(data)))
    .result[0].query0[0];
  allPAckages.addRow(newPackage);
  // empty form
  emptyTestForm();
  niceSwal("success", "top-end", "تم الحفظ بنجاح");
  let newObject = lab_test.getItem(data);
  lab_test.addRow(newObject);
}

function deleteTest(hash) {
  const result = run_both(`
            SELECT 
        name, visit_date
        FROM
            lab_visits_package
        left join lab_visits on lab_visits.hash = lab_visits_package.visit_id
        WHERE
            package_id = '${hash}' and
            lab_visits.isdeleted = 0
    ;`).result[0].query0;

  if (result.length != 0) {
    niceSwal(
      "error",
      "top-end",
      `لا يمكن حذف هذا الاختبار لانه مرتبط بعدد ${
        result.length
      } زيارة هما {${result
        .map((item, index) => {
          return item.name;
        })
        .join(" و ")}}`
    );
    return false;
  }
  // delete lab_package and lab_pakage_tests
  run_both(`delete from lab_package where hash='${hash}';
        delete from lab_pakage_tests where package_id='${hash}';`);
  $(".package-botton").click();
  $(".test-botton").click();
  lab_test.dataTable.draw();
  niceSwal("success", "top-end", "تم الحذف بنجاح");
}
// empty package tests
function emptyPackageTests() {
  $("#row-packages input[type=checkbox]:checked").each(function () {
    $(this).prop("checked", false);
  });
  $("#addPackage #name").val("");
  $("#addPackage #price").val(0);
  $("#addPackage #cost").val(0);
  $("#addPackage #notes").val("");
  $("#selected-tests").empty();
}

function updatePackage(hash) {
  $("#selected-tests").empty();
  let data =
    run_both(`select name,price,cost,note from lab_package where hash='${hash}';
                    select test_id,lab_device_id from lab_pakage_tests where package_id='${hash}';`);
  let packageItem = data.result[0].query0[0];
  let tests = data.result[1].query1;
  $("#addPackage #name").val(packageItem.name);
  $("#addPackage #price").val(packageItem.price);
  $("#addPackage #cost").val(packageItem.cost);
  $("#addPackage #notes").val(packageItem.note);
  tests.forEach((item) => {
    $(
      `#row-packages input[type=checkbox][data-test="${item.test_id}"][data-device="${item.lab_device_id}"]`
    ).click();
  });
  $("#selected-tests input[type=checkbox]").each(function () {
    $(this).prop("checked", true);
  });
  $(".buttons .btn-action").removeClass("active");
  $('.buttons .btn-action[data-id="addPackage"]').addClass("active");
  $(".page").hide();
  $("#addPackage").show();
  // change save button
  $("#addPackage #save-package").attr(
    "onclick",
    `fireSwal(saveUpdatePackage, '${hash}')`
  );
  // change title
  $("#addPackage #save-package").text("تعديل");
}

function saveNewPackage() {
  let name = $("#addPackage #name").val();
  let price = $("#addPackage #price").val();
  let cost = $("#addPackage #cost").val();
  let notes = $("#addPackage #notes").val();
  // vailide form
  if (name.length == 0 || price.length == 0) {
    niceSwal("error", "top-end", "يجب ملئ جميع الحقول");
    return;
  } else if ($("#row-packages input[type=checkbox]:checked").length == 0) {
    niceSwal("error", "top-end", "يجب اختيار على الاقل تحليل واحد");
    return;
  }
  let packageHash = run_both({
    action: "insert",
    table: "lab_package",
    column: {
      name: name,
      price: price,
      cost: cost,
      lab_id: localStorage.getItem("lab_hash"),
      catigory_id: 8,
      note: notes,
    },
  }).result[0].query0;
  let query = "";
  $("#row-packages input[type=checkbox]:checked").each(function () {
    let kit_id = $(this).data("kit");
    let lab_device_id = $(this).data("device");
    let unit = $(this).data("unit");
    let test_id = $(this).data("test");
    query += `insert into lab_pakage_tests(test_id,lab_device_id,kit_id,unit, package_id,lab_id) values('${test_id}','${lab_device_id}','${kit_id}','${unit}', '${packageHash}','${localStorage.lab_hash}');`;
  });
  run_both(query);
  emptyPackageTests();
  let insertObject = lab_package.getItem(packageHash);
  lab_package.addRow(insertObject);
  niceSwal("success", "top-end", "تم الحفظ بنجاح");
}

function saveUpdatePackage(hash) {
  let name = $("#addPackage #name").val();
  let price = $("#addPackage #price").val();
  let cost = $("#addPackage #cost").val();
  let notes = $("#addPackage #notes").val();
  run_both(`update lab_package set name='${name}',price='${price}',cost='${cost}',note='${notes}' where hash='${hash}';
        delete from lab_pakage_tests where package_id='${hash}';`);
  let query = "";
  $("#row-packages input[type=checkbox]:checked").each(function () {
    let kit_id = $(this).data("kit");
    let lab_device_id = $(this).data("device");
    let unit = $(this).data("unit");
    let test_id = $(this).data("test");
    query += `insert into lab_pakage_tests(test_id,lab_device_id,kit_id,unit, package_id,lab_id) values('${test_id}','${lab_device_id}','${kit_id}','${unit}', '${hash}','${localStorage.lab_hash}');`;
  });
  run_both(query);
  emptyPackageTests();
  lab_package.dataTable.draw();
  niceSwal("success", "top-end", "تم الحفظ بنجاح");
}

function deletePackage(hash) {
  const count = run_both(
    `select Count(*) as count from lab_visits_package where package_id='${hash}';`
  ).result[0].query0[0].count;
  if (count != 0) {
    niceSwal(
      "error",
      "top-end",
      "لا يمكن حذف هذا الاختبار لانه مرتبط ببعض الفواتير"
    );
    return false;
  }
  // delete lab_package and lab_pakage_tests
  run_both(`delete from lab_package where hash='${hash}';
        delete from lab_pakage_tests where package_id='${hash}';`);
  $(".package-botton").click();
  $(".test-botton").click();
  lab_package.dataTable.draw();
  niceSwal("success", "top-end", "تم الحذف بنجاح");
}

const updateNormal = (test, kit, unit) => {
  TEST = run(`select option_test from lab_test where hash='${test}';`).result[0]
    .query0[0].option_test;
  TEST = JSON.parse(TEST);
  let { component } = TEST;
  let { reference } = component[0];
  let refrenceTable = THEME.build(test, reference, kit, unit);
  $("#refrence_editor .modal-body").html(refrenceTable);
  $("#refrence_editor").modal("show");
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
  if (!TEST) {
    TEST = run(`select option_test from lab_test where hash='${hash}';`)
      .result[0].query0[0].option_test;
    TEST = JSON.parse(TEST);
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
    }
    let newRefrence = component[0].reference.filter((item, index, self) => {
      return self.findIndex((t) => t?.kit === item?.kit) === index;
    });
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
  TEST = null;
}
