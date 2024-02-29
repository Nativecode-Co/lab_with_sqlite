const THEME = new PackageTestTheme();
let TEST = null;

// when document is ready with pure js
document.addEventListener("DOMContentLoaded", () => {
  const { kits, units, devices } = fetchApi("/tests/get_tests_data");
  const tests = fetchApi("/maintests/get_tests_options");
  const kitsSelect = document.getElementById("kit_id");
  const unitsSelect = document.getElementById("unit");
  const devicesSelect = document.getElementById("lab_device_id");
  const testsSelect = document.getElementById("test_id");
  const packagesSelect = document.querySelector("select[name='tests']");
  for (const test of packages) {
    const option = document.createElement("option");
    option.value = test.hash;
    option.textContent = test.name;
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
  const from = document.getElementById("addPackage");
  const inputs = from.querySelectorAll("input");
  const selects = from.querySelectorAll("select");
  const textArea = from.querySelector("textarea");
  for (const input of inputs) {
    input.value = "";
  }
  for (const select of selects) {
    select.value = "";
    const event = new Event("change");
    select.dispatchEvent(event);
  }
  textArea.value = "";
}

function updatePackage(hash) {
  const form = document.getElementById("package-form");
  const test = lab_test.getItem(hash);
  const formInputs = form.querySelectorAll("input");
  const formSelects = form.querySelectorAll("select");
  const formTextArea = form.querySelector("textarea");
  for (const input of formInputs) {
    input.value = test[input.name];
  }
  for (const select of formSelects) {
    // multiple select
    select.value = "";
    if (select.multiple) {
      for (let i = 0; i < select.options.length; i++) {
        if (test[select.name].includes(select.options[i].value)) {
          select.options[i].selected = true;
        }
      }
      const event = new Event("change");
      select.dispatchEvent(event);
    }
  }
  formTextArea.value = test.note;

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
  const form = document.getElementById("package-form");
  let formData = new FormData(form);
  formData = Object.fromEntries(formData.entries());
  const tests = $("select[name='tests']")
    .val()
    .map((t) => {
      let test = packages.find((item) => item.hash === t);
      test = {
        test_id: test.test_id,
        lab_device_id: test.lab_device_id,
        kit_id: test.kit_id,
        unit: test.unit,
      };
      return test;
    });

  formData = {
    name: formData.name,
    price: formData.price,
    cost: formData.cost,
    note: formData.notes,
    catigory_id: 8,
    tests: JSON.stringify(tests),
  };
  fetchApi("/tests/create_test", "post", formData);
  lab_package.dataTable.ajax.reload();
  emptyPackageTests();
  syncOnline();
  niceSwal("success", "bottom-end", "تم الحفظ بنجاح");
}

function saveUpdatePackage(hash) {
  const form = document.getElementById("package-form");
  let formData = new FormData(form);
  formData = Object.fromEntries(formData.entries());
  const tests = $("select[name='tests']")
    .val()
    .map((t) => {
      let test = packages.find((item) => item.hash === t);
      test = {
        test_id: test.test_id,
        lab_device_id: test.lab_device_id,
        kit_id: test.kit_id,
      };
      return test;
    });

  formData = {
    name: formData.name,
    price: formData.price,
    cost: formData.cost,
    note: formData.notes,
    tests: JSON.stringify(tests),
    hash,
  };
  fetchApi("/tests/update_test", "post", formData);
  lab_package.dataTable.ajax.reload();
  syncOnline();
  niceSwal("success", "bottom-end", "تم الحفظ بنجاح");
}

function deletePackage(hash) {
  fetchApi("/tests/delete_test", "post", { hash });
  lab_package.dataTable.ajax.reload();
  syncOnline();
  niceSwal("success", "bottom-end", "تم الحذف بنجاح");
}

const updateNormal = (test, kit, unit) => {
  TEST = fetchApi("/maintests/get_main_test", "post", { hash });
  try {
    let { reference } = TEST.refrence;
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
  let refrences = TEST?.refrence;
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
  lab_test.dataTable.ajax.reload();
  $("#refrence_editor").modal("hide");
  TEST = null;
}
