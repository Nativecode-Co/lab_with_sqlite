"usestrict";

let kits = [];
let table = true;
let page = 0;
let testHash = 0;
let allTests = [];
let lab_test;

let THEME = null;

const createTheme = async (kits, units) => {
  if (THEME) {
    return THEME;
  } else {
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
    let theme = setting?.SuperTestTheme ?? "Form";
    console.log(theme);
    // upper case first letter
    theme = theme.charAt(0).toUpperCase() + theme.slice(1);
    switch (theme) {
      case "Form":
        THEME = new FormTheme(kits, units);
        break;
      case "Table":
        THEME = new TableTheme(kits, units);
        break;
      default:
        THEME = new FormTheme(kits, units);
        break;
    }
  }
};

let testNamerefrence = document.querySelector("#name_editor #test_name");
let categoryHash = document.getElementById("category_hash");

let allData = run(`select name,hash from lab_test_units;
             select name as text,hash from lab_test_catigory;`);

let units = allData.result[0].query0;
for (let data of units) {
  let newOption = new Option(data.name, data.hash, false, false);
  $("select[name='unit']").append(newOption);
}

let categories = allData.result[1].query1;

$(document).ready(function () {
  $("#kit").select2({
    dropdownParent: $("#refrence_form"),
    width: "100%",
  });
  $("#category_hash").select2({
    dropdownParent: $("#form_id"),
    width: "100%",
  });
  $("#unit").select2({
    dropdownParent: $("#refrence_form"),
    width: "100%",
  });
  $("#gender").select2({
    dropdownParent: $("#refrence_form"),
    width: "100%",
  });
  $("#age_unit_low").select2({
    dropdownParent: $("#refrence_form"),
    width: "100%",
  });
  $("#age_unit_high").select2({
    dropdownParent: $("#refrence_form"),
    width: "100%",
  });
  $(".dt-buttons").addClass("btn-group");
  $("div.addCustomItem").html(
    `<span class="table-title">قائمة التحاليل</span><!--<button onclick="lab_test.newItem();" class="btn-main-add ml-4"><i class="far fa-users-md mr-2"></i> أضافة تحليل</button>-->`
  );
});

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

new Promise((resolve, reject) => {
  kits = run(`SELECT distinct kits.id, kits.name
    FROM kits
    JOIN device_kit ON kits.id = device_kit.kit_id
    JOIN lab_device ON device_kit.device_id = lab_device.devices_id
    JOIN lab ON lab_device.lab_id = lab.id
    WHERE lab.id = '${localStorage.getItem("lab_hash")}';`).result[0].query0;
  resolve();
})
  .then((res) => {
    let newOption = new Option("No Kit", "", false, false);
    $("select[name='kit']").append(newOption);
    for (let data of kits) {
      let newOption = new Option(data.name, data.id, false, false);
      $("select[name='kit']").append(newOption);
    }
  })
  .then((res) => {
    lab_test = new Test("lab_test", "الفحوصات", [
      { name: "hash", type: null },
      { name: "test_name", type: "text", label: "الاسم" },
      {
        name: "category_hash",
        type: "select",
        label: "الفئة",
        options: categories,
      },
    ]);
  })
  .then((res) => {
    createTheme(kits, units);
    Swal.close();
  });

class Test extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_test-table",
      `${base_url}Tests/getTestsForLab`,
      () => {
        return { lab_id: localStorage.getItem("lab_hash") };
      },
      [
        { data: "test_name" },
        {
          data: null,
          className: "center",
          render: function (data, type, test) {
            return `<span class="row" id="test-${test.hash}">${getRefrences(
              test.option_test,
              test.hash
            )}</span>`;
          },
        },
        { data: "category_name" },
        {
          data: null,
          className: "center",
          render: function (data, type, test) {
            allTests.push(test);
            return `<a class="bs-tooltip text-success" onclick="lab_test.updateItem('${test.hash}');" data-toggle="tooltip" data-placement="top" title="Edit">
                                    <i class="far fa-edit fa-lg mx-2"></i>
                                </a>
                                <a href="#" onclick="fireSwal.call(lab_test,lab_test.deleteItem, '${test.hash}')" class="text-danger">
                                    <i class="far fa-trash fa-lg mx-2"></i>
                                </a>
                                <a class="bs-tooltip text-info" onclick="addRefrence('${test.hash}');" data-toggle="tooltip" data-placement="top" title="Edit">
                                    <i class="far fa-plus-circle fa-lg mx-2"></i>
                                </a>
                                `;
          },
        },
        {
          data: null,
          className: "text-success center",
          defaultContent: '<i class="fas fa-plus"></i>',
        },
      ]
    );
  }

  pageCondition() {
    return "";
  }

  getQuery(query) {
    return `select test_name,category_hash,(select name from lab_test_catigory where hash=lab_test.category_hash) as category_name,hash,option_test from lab_test ${query};`;
  }

  mainCondition() {
    return `where ${this.table}.isdeleted='0'`;
  }

  havingQuery(value) {
    return `having test_name like '%${value}%'`;
  }

  deleteItem(hash) {
    let packageFounded = run(
      `select test_id from lab_pakage_tests where test_id='${hash}';`
    ).result[0].query0;
    if (packageFounded.length > 0) {
      Swal.fire({
        icon: "error",
        title: "لا يمكن حذف التحليل",
        text: "هذا التحليل موجود في بعض التحليلات",
      });
      return;
    }
    run(`update lab_test set isdeleted=1 where hash='${hash}';`);
    this.dataTable
      .row($(`#${hash}`))
      .remove()
      .draw();
  }
}

function fetchData(page = 0, numerPerPage = 30, term = null) {
  term = term ? `having test_name like '%${term}%'` : "";
  let tests = run(
    `select test_name,hash,option_test,test_type from lab_test ${term} limit ${
      numerPerPage * page
    }, ${numerPerPage};`
  ).result[0].query0;
  let body = $(`#user_body`);
  for (let test of tests) {
    allTests.push(test);
    body.append(
      `<tr>
                <td class="w-25">${test.test_name}</td>
                <td class="w-50" id="test-${test.hash}">${getRefrences(
        test.option_test,
        test.hash
      )}</td>
                <td class="w-25">
                    <a class="bs-tooltip" onclick="editTest('${
                      test.hash
                    }');" data-toggle="tooltip" data-placement="top" title="Edit">
                        <i class="far fa-edit fa-lg mx-2"></i>
                    </a>
                    <a class="bs-tooltip" onclick="fireSwal(deleteTest,'${
                      test.hash
                    }')" data-toggle="tooltip" data-placement="top" title="Edit">
                        <i class="far fa-trash fa-lg mx-2"></i>
                    </a>
                    <a class="bs-tooltip" onclick="addRefrence('${
                      test.hash
                    }');" data-toggle="tooltip" data-placement="top" title="Edit">
                        <i class="far fa-plus-circle fa-lg mx-2"></i>
                    </a>
                </td>
                <td></td>
            </tr>`
    );
  }
  if (table) {
    setTable();
    table = false;
  }
}

function getStatus(options) {
  if (options == '{"": ""}' || options == "") {
    return '<span class="badge badge-danger"> لا يوجد رينجات </span>';
  } else {
    return '<span class="badge badge-success"> يوجد رينجات </span>';
  }
}

function getKits(options) {
  let kit = "";
  if (options == '{"": ""}' || options == "") {
    kit = '<span class="badge badge-danger"> لا يوجد kits </span>';
  } else {
    let refrence = JSON.parse(options)?.component?.[0]?.reference ?? [];
    newRefrence = refrence.map((item) => item.kit);
    newRefrence = [...new Set(newRefrence)];
    for (let ref of newRefrence) {
      let kitItem = kits.filter((item) => item.id == ref);
      kit += ` <span class="badge badge-info">${kitItem[0].name}</span> `;
    }
  }
  return kit;
}

// [${item?.range.map(range=>`(${range.name != ''?`${range.name} : `:''}${range.low}-${range.high})`).join(' ')}]

function getRefrences(options, hash) {
  if (
    options == '{"": ""}' ||
    options == "" ||
    options == '{"component": []}'
  ) {
    return '<span class="badge badge-danger"> لا يوجد Ranges </span>';
  } else if (
    (JSON.parse(options)?.component?.[0]?.reference ?? []).length <= 0
  ) {
    return '<span class="badge badge-danger"> لا يوجد Ranges </span>';
  } else {
    let refrence = JSON.parse(options)?.component?.[0]?.reference ?? [];
    // delete refrence if refrence.kit duplicate in refrence
    let newRefrence = refrence.filter((item, index, self) => {
      return self.findIndex((t) => t.kit === item.kit) === index;
    });
    newRefrence = newRefrence.map((item, cur) => {
      let br = "";
      if ((cur + 1) % 4 == 0) {
        br = "<br>";
      }
      let _kit = kits.find((x) => x.id == item.kit);
      if (_kit == undefined && item.kit != "") {
        return;
      }
      return `<span class="badge badge-light border border-info p-2 mr-2 mb-2 col-auto" id="test-${hash}_kit-${(
        _kit?.name.replace(/[^a-zA-Z0-9]/g, "_") ?? "No Kit"
      )
        .split(" ")
        .join("_")}">
                        ${_kit?.name ?? "No Kit"} 
                        <a onclick="editRefrence('${hash}',${cur})"><i class="far fa-edit fa-lg mx-2 text-success"></i></a>
                </span>${br}`;
    });
    return newRefrence.join(" ");
  }
}

// ${item['age low']??0} ${item['age unit low']} - ${item['age high']??100} ${item['age unit high']}

function deleteTest(hash) {
  run(`delete from lab_test where hash='${hash}';`);
  $(`#test-${hash}`).parents("tr").remove();
}

function saveTest() {
  $("input[name=user_id]").val(localStorage.getItem("hash"));
  if (testHash == 0) {
    run(
      `insert into lab_test(test_name,category_hash) values('${testNamerefrence.value}','${categoryHash.value}');`
    );
  } else {
    run(
      `update lab_test set test_name="${testNamerefrence.value}", category_hash='${categoryHash.value}' where hash=${testHash};`
    );
  }
  $("#name_editor").modal("toggle");
  testHash = 0;
}

function editTest(hash) {
  let query_obj = run(
    `select test_name,category_hash from lab_test where hash=${hash};`
  ).result[0].query0[0];
  testNamerefrence.value = query_obj.test_name;
  // change category hash in select
  $("#category_hash").val(query_obj.category_hash).trigger("change");
  testHash = hash;
  $("#name_editor").modal("toggle");
}

function editRefrence(hash, refID) {
  let test = allTests.filter((item) => item.hash == hash)[0];
  let component = JSON.parse(test.option_test).component;
  let refrence = component[0].reference;
  let newRefrence = refrence.filter((item, index, self) => {
    return self.findIndex((t) => t.kit === item.kit) === index;
  })[refID];
  let form = THEME.build(hash, refrence, newRefrence?.kit);
  if (form == "") {
    form = `<div class="alert alert-danger">لا يوجد رينجات</div>`;
  }
  $("#refrence_editor .modal-body").html(form);
  $("#refrence_editor").modal("toggle");
}

function updateRefrence(hash, refID) {
  const formContainer = $(`#form_container`);
  // empty from container
  formContainer.empty();
  let test = allTests.filter((item) => item.hash == hash)[0];
  let component = JSON.parse(test.option_test).component;
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
  let test = allTests.filter((item) => item.hash == hash)[0];
  let test_options = JSON.parse(test.option_test);
  let component = test_options.component;
  let element = THEME.getData(refID, result, options, rightOptions);
  console.log(element);
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
    // document.getElementById(`test-${hash}_ref-${refID}`).innerHTML =
    // `
    //     ${kits.find(x => x.id == element.kit)?.name ?? "No Kit"}
    //     <a onclick="editRefrence('${hash}',${refID})"><i class="far fa-edit fa-lg mx-2 text-success"></i></a>
    // `
  }
  test_options["component"] = component;
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
  allTests.filter((item, cur) => {
    if (item.hash == hash) {
      allTests[cur].option_test = JSON.stringify(test_options);
    }
  });
  $("#refrence_editor").modal("toggle");
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: "قد تحتاج الى التعديل في صفحة التحاليل لتطبيق التغييرات  ",
    showConfirmButton: false,
    timer: 3000,
  });
}

function deleteRefrence(hash, refID) {
  let test = allTests.filter((item) => item.hash == hash)[0];
  let test_options = JSON.parse(test.option_test);
  let component = test_options.component;
  let _kit = component[0].reference[refID].kit;
  // get refrence i want to delete
  let deletedRefrence = component[0].reference[refID];
  let { unit } = deletedRefrence;
  let checkFoundedInLabTests =
    run(
      `select * from lab_pakage_tests where test_id='${hash}' and kit_id='${_kit}' and unit='${unit}';`
    ).result[0].query0.length > 0;
  if (checkFoundedInLabTests) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "لا يمكن حذف هذا المرجع لانه مرتبط ببعض الفحوصات",
      showConfirmButton: false,
      timer: 3000,
    });
    return false;
  }
  component[0].reference = component[0].reference.filter(
    (item, cur) => cur != refID
  );
  test_options["component"] = component;
  console.log;
  run(
    `update lab_test set option_test='${JSON.stringify(
      test_options
    )}' where hash=${hash};`
  );
  allTests.filter((item, cur) => {
    if (item.hash == hash) {
      allTests[cur].option_test = JSON.stringify({ component: component });
    }
  });
  $(`#refrence_form_${refID}`).remove();
  if ($("#refrence_editor form").length == 0) {
    // $(
    //   `#test-${hash}_kit-${(
    //     kits.find((x) => x.id == _kit)?.name.replace(/[^a-zA-Z0-9]/g, "_") ??
    //     "No Kit"
    //   )
    //     .split(" ")
    //     .join("_")}`
    // ).remove();
    $("#refrence_editor").modal("toggle");
  }
}

function deleteRange(e, id) {
  let num = $(`#${id} .range`).length;
  if (num > 1) {
    e.parents(".range").remove();
  }
}

function refreshKits() {
  let req = indexedDB.deleteDatabase("kits");
  req.onsuccess = function () {
    console.log("Deleted database successfully");
  };
  req.onerror = function () {
    console.log("Couldn't delete database");
  };
  req.onblocked = function () {
    console.log("Couldn't delete database due to the operation being blocked");
  };
  Database_Open({
    table: "kits",
    hash: "id",
    query: `select name,id from kits;`,
  }).then((result) => {
    kits = result;
    $("select[name='kit']").empty();
    let newOption = new Option("No Kit", "", false, false);
    $("select[name='kit']").append(newOption);
    for (let data of result) {
      let newOption = new Option(data.name, data.id, false, false);
      $("select[name='kit']").append(newOption);
    }
  });
}
