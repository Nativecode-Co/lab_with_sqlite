const THEME = new PackageTestTheme();
let TEST = null;

// when document is ready with pure js
document.addEventListener("DOMContentLoaded", () => {
  const { kits, units, devices } = fetchApi("/tests/get_tests_data");
  const tests = fetchApi("/maintests/get_tests_options");
  const packages = fetchApi("/tests/get_packages_test");
  const kitsSelect = document.getElementById("kit_id");
  const unitsSelect = document.getElementById("unit");
  const devicesSelect = document.getElementById("lab_device_id");
  const testsSelect = document.getElementById("test_id");
  const packagesSelect = document.getElementById("package_id");
  for (const test of packages) {
    const option = document.createElement("option");
    option.value = test.hash;
    option.textContent = ` (device: ${test.device_name}) - (kit: ${test.kit_name}) - (unit: ${test.unit_name}) - ${test.name} `;
    packagesSelect.appendChild(option);
  }
  for (const test of tests) {
    const option = document.createElement("option");
    option.value = test.hash;
    option.textContent = test.name;
    testsSelect.appendChild(option);
  }
  for (const kit of kits) {
    const option = document.createElement("option");
    option.value = kit.id;
    option.textContent = kit.name;
    kitsSelect.appendChild(option);
  }
  for (const unit of units) {
    const option = document.createElement("option");
    option.value = unit.hash;
    option.textContent = unit.name;
    unitsSelect.appendChild(option);
  }
  for (const device of devices) {
    const option = document.createElement("option");
    option.value = device.id;
    option.textContent = device.name;
    devicesSelect.appendChild(option);
  }
});

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
  const cost = Number(document.querySelector("#addPackage #cost").value);
  const currentCost = Number(element.dataset.cost);
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
      const el = element.parentElement.parentElement.cloneNode(true);
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

// empty form
function emptyTestForm() {
  const from = document.getElementById("test-form");
  const inputs = from.querySelectorAll("input");
  const selects = from.querySelectorAll("select");
  for (const input of inputs) {
    input.value = "";
  }
  for (const select of selects) {
    select.value = "";
    const event = new Event("change");
    select.dispatchEvent(event);
  }
}

function updateTest(hash) {
  const form = document.getElementById("test-form");
  const test = lab_test.getItem(hash);
  const formInputs = form.querySelectorAll("input");
  const formSelects = form.querySelectorAll("select");

  for (const input of formInputs) {
    input.value = test[input.name];
  }

  for (const select of formSelects) {
    console.log(select.name, test[select.name]);
    select.value = test[select.name];
    const event = new Event("change");
    select.dispatchEvent(event);
  }

  const buttons = document.querySelectorAll(".buttons .btn-action");
  for (const button of buttons) {
    button.classList.remove("active");
  }

  const addTestButton = document.querySelector(
    '.buttons .btn-action[data-id="addTest"]'
  );
  addTestButton.classList.add("active");

  const pages = document.querySelectorAll(".page");
  for (const page of pages) {
    page.style.display = "none";
  }

  const addTestPage = document.getElementById("addTest");
  addTestPage.style.display = "block";

  const saveButton = document.getElementById("save-button");
  saveButton.setAttribute("onclick", `fireSwal(saveUpdateTest, '${hash}')`);
  saveButton.textContent = "تعديل";
}

function saveUpdateTest(hash) {
  const form = document.getElementById("test-form");
  let formData = new FormData(form);
  formData = Object.fromEntries(formData.entries());
  const testElement = document.querySelector("select[name='test_id']");
  const name = testElement.options[testElement.selectedIndex].text;
  const tests = [
    {
      test_id: formData.test_id,
      lab_device_id: formData.lab_device_id,
      kit_id: formData.kit_id,
      unit: formData.unit,
    },
  ];
  formData = {
    cost: formData.cost,
    price: formData.price,
    hash,
    name,
    catigory_id: 9,
    tests: JSON.stringify(tests),
  };
  fetchApi("/tests/update_test", "post", formData);
  lab_test.dataTable.ajax.reload();
  niceSwal("success", "bottom-end", "تم الحفظ بنجاح");
}

function saveNewTest() {
  const form = document.getElementById("test-form");
  let formData = new FormData(form);
  formData = Object.fromEntries(formData.entries());
  const testElement = document.querySelector("select[name='test_id']");
  const name = testElement.options[testElement.selectedIndex].text;
  const tests = [
    {
      test_id: formData.test_id,
      lab_device_id: formData.lab_device_id,
      kit_id: formData.kit_id,
      unit: formData.unit,
    },
  ];
  formData = {
    cost: formData.cost,
    price: formData.price,
    name,
    catigory_id: 9,
    tests: JSON.stringify(tests),
  };
  fetchApi("/tests/create_test", "post", formData);
  emptyTestForm();
  niceSwal("success", "bottom-end", "تم الحفظ بنجاح");
  lab_test.dataTable.ajax.reload();
}

function deleteTest(hash) {
  fetchApi("/tests/delete_test", "post", { hash });
  niceSwal("success", "bottom-end", "تم الحذف بنجاح");
  lab_test.dataTable.ajax.reload();
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
  $("#addPackage #name").val(packageItem.name);
  $("#addPackage #price").val(packageItem.price);
  $("#addPackage #cost").val(packageItem.cost);
  $("#addPackage #notes").val(packageItem.note);
  for (const item of tests) {
    $(
      `#row-packages input[type=checkbox][data-test="${item.test_id}"][data-device="${item.lab_device_id}"]`
    ).click();
  }
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
  const name = $("#addPackage #name").val();
  const price = $("#addPackage #price").val();
  const cost = $("#addPackage #cost").val();
  const notes = $("#addPackage #notes").val();
  // vailide form
  if (name.length === 0 || price.length === 0) {
    niceSwal("error", "bottom-end", "يجب ملئ جميع الحقول");
    return;
  }
  if ($("#row-packages input[type=checkbox]:checked").length === 0) {
    niceSwal("error", "bottom-end", "يجب اختيار على الاقل تحليل واحد");
    return;
  }
  const packageHash = run_both({
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
    const kit_id = $(this).data("kit");
    const lab_device_id = $(this).data("device");
    const unit = $(this).data("unit");
    const test_id = $(this).data("test");
    query += `insert into lab_pakage_tests(test_id,lab_device_id,kit_id,unit, package_id,lab_id) values('${test_id}','${lab_device_id}','${kit_id}','${unit}', '${packageHash}','${localStorage.lab_hash}');`;
  });
  run_both(query);
  emptyPackageTests();
  const insertObject = lab_package.getItem(packageHash);
  lab_package.addRow(insertObject);
  syncOnline();
  niceSwal("success", "bottom-end", "تم الحفظ بنجاح");
}

function saveUpdatePackage(hash) {
  const name = $("#addPackage #name").val();
  const price = $("#addPackage #price").val();
  const cost = $("#addPackage #cost").val();
  const notes = $("#addPackage #notes").val();
  run_both(`update lab_package set name='${name}',price='${price}',cost='${cost}',note='${notes}' where hash='${hash}';
        delete from lab_pakage_tests where package_id='${hash}';`);
  let query = "";
  $("#row-packages input[type=checkbox]:checked").each(function () {
    const kit_id = $(this).data("kit");
    const lab_device_id = $(this).data("device");
    const unit = $(this).data("unit");
    const test_id = $(this).data("test");
    query += `insert into lab_pakage_tests(test_id,lab_device_id,kit_id,unit, package_id,lab_id) values('${test_id}','${lab_device_id}','${kit_id}','${unit}', '${hash}','${localStorage.lab_hash}');`;
  });
  run_both(query);
  emptyPackageTests();
  lab_package.dataTable.draw();
  niceSwal("success", "bottom-end", "تم الحفظ بنجاح");
}

function deletePackage(hash) {
  const count = run_both(
    `select Count(*) as count from lab_visits_package where package_id='${hash}';`
  ).result[0].query0[0].count;
  if (count !== 0) {
    niceSwal(
      "error",
      "bottom-end",
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
  niceSwal("success", "bottom-end", "تم الحذف بنجاح");
}

const updateNormal = (test, kit, unit) => {
  TEST = run(`select option_test from lab_test where hash='${test}';`).result[0]
    .query0[0].option_test;
  try {
    TEST = TEST.replace(/\\/g, "");
    TEST = JSON.parse(TEST);
    const { component } = TEST;
    let { reference } = component[0];
    reference = reference.filter((item) => {
      return (
        (kit === item.kit || (isNull(kit) && isNull(item.kit))) &&
        (unit === item.unit || (isNull(unit) && isNull(item.unit)))
      );
    });
    if (reference.length === 0) {
      throw "no refrence";
    }
    const refrenceTable = THEME.build(test, reference, kit, unit);
    $("#refrence_editor .modal-body").html(refrenceTable);
    $("#refrence_editor").modal("show");
  } catch (error) {
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
  const { component } = TEST;
  let refrences = component[0].reference;
  refrences = refrences.filter((refrence, id) => {
    const refUnit = refrence?.unit ?? "";
    if (refUnit === selectedUnit) {
      return true;
    }
    return false;
  });
  const refrence = refrences.find((item, index, self) => index === refID);
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
    TEST = TEST.replace(/\\/g, "");
    TEST = JSON.parse(TEST);
  }
  let { component } = TEST;
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
    }
    const newRefrence = component[0].reference.filter((item, index, self) => {
      return self.findIndex((t) => t?.kit === item?.kit) === index;
    });
  } else {
    component[0].reference[refID] = element;
  }
  const test_options = { component: component };
  const kitUnit = run(`update lab_test set option_test='${JSON.stringify(
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
