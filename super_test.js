"usestrict";

let kits = [];
let table = true;
let page = 0;
let testHash = 0;
let allTests = [];
let lab_test;

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
  // window.onscroll = function(ev) {
  //     if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
  //         page ++;
  //         fetchData(page=page);
  //     }
  // }

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
Database_Open({
  table: "kits",
  hash: "id",
  query: `select name,id from kits;`,
})
  .then((result) => {
    kits = result;
    let newOption = new Option("No Kit", "", false, false);
    $("select[name='kit']").append(newOption);
    for (let data of result) {
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
    Swal.close();
  });

class Test extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_test-table",
      `${base_url}Tests/getTests`,
      { lab_id: localStorage.getItem("lab_hash") },
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
            return `<a href="#" onclick="lab_test.updateItem('${test.hash}')" class="text-success">
                                    <i class="far fa-edit fa-lg mx-2"></i>
                                </a>
                                <a href="#" onclick="fireSwal.call(lab_test,lab_test.deleteItem, '${test.hash}')" class="text-danger">
                                    <i class="far fa-trash fa-lg mx-2"></i>
                                </a>
                                <a class="bs-tooltip text-info" onclick="addRefrence('${test.hash}');" data-toggle="tooltip" data-placement="top" title="Edit">
                                    <i class="far fa-plus-circle fa-lg mx-2"></i>
                                </a>`;
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
  addRow(test) {
    if ($(`#${test.hash}`).length > 0) {
      return;
    }
    this.dataTable.row
      .add({
        0: test.test_name,
        1: `<span class="row" id="test-${test.hash}">${getRefrences(
          test.option_test,
          test.hash
        )}</span>`,
        2: test.category_name,
        3: `<a href="#" onclick="lab_test.updateItem('${test.hash}')" class="text-success">
                    <i class="far fa-edit fa-lg mx-2"></i>
                </a>
                <a href="#" onclick="fireSwal.call(lab_test,lab_test.deleteItem, '${test.hash}')" class="text-danger">
                    <i class="far fa-trash fa-lg mx-2"></i>
                </a>
                <a class="bs-tooltip text-info" onclick="addRefrence('${test.hash}');" data-toggle="tooltip" data-placement="top" title="Edit">
                    <i class="far fa-plus-circle fa-lg mx-2"></i>
                </a>`,
        4: ``,
      })
      .node().id = test.hash;
    this.dataTable.draw();
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
        text: "هذا التحليل موجود في بعض المختبرات",
      });
      return;
    } else {
      run(`update lab_test set isdeleted=1 where hash='${hash}';`);
      this.dataTable.ajax.reload();
    }
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
      return `<span class="badge badge-light border border-info p-2 mr-2 mb-2 col-auto" id="test-${hash}_kit-${(
        kits
          .find((x) => x.id == item.kit)
          ?.name.replace(/[^a-zA-Z0-9]/g, "_") ?? "No Kit"
      )
        .split(" ")
        .join("_")}">
                        ${kits.find((x) => x.id == item.kit)?.name ?? "No Kit"} 
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
  let form = "";
  let test = allTests.filter((item) => item.hash == hash)[0];
  let component = JSON.parse(test.option_test).component;
  let refrence = component[0].reference;
  let newRefrence = refrence.filter((item, index, self) => {
    return self.findIndex((t) => t.kit === item.kit) === index;
  })[refID];
  refrence.map((item, cur) => {
    if (item?.kit == newRefrence?.kit) {
      form += createRefrenceForm(hash, item, cur);
    }
  });
  if (form == "") {
    form = `<div class="alert alert-danger">لا يوجد رينجات</div>`;
  }
  $("#refrence_editor .modal-body").html(form);
  $("#refrence_editor").modal("toggle");
}

function createRefrenceForm(hash, refrence, id) {
  $("#refrence_editor .modal-title").text(
    `${kits.find((x) => x.id == refrence.kit)?.name ?? "No Kit"}`
  );
  return `
    <form class="form-test border-bottom border-info mb-4" novalidate accept-charset="utf-8" id="refrence_form_${id}">
        <div class="form-row justify-content-between">
            <div class="col-md-4 mb-4">
                <label for="kit">Kit</label>
                <select class="form-control" name="kit" id="kit" required>
                    <option value="" ${
                      "" == refrence.kit ? "selected" : ""
                    }>No Kit</option>
                    ${kits
                      .map(
                        (item) =>
                          `<option value="${item.id}" ${
                            item.id == refrence.kit ? "selected" : ""
                          }>${item.name}</option>`
                      )
                      .join(" ")}
                </select>
                <script>
                    $('#refrence_form_${id} #kit').select2({
                        width: '100%',
                        dropdownParent: $("#refrence_form_${id}"),
                    });
                </script>
            </div>
            <div class="col-md-4 mb-4">
                <label for="unit">وحدة القياس</label>
                <select class="form-control" name="unit" id="unit" required ${
                  refrence?.result == "result" ? "disabled" : ""
                }>
                    ${units
                      .map(
                        (item) =>
                          `<option value="${item.hash}" ${
                            item.hash == refrence.unit ? "selected" : ""
                          }>${item.name}</option>`
                      )
                      .join(" ")}
                </select>
                <script>
                    $('#refrence_form_${id} #unit').select2({
                        width: '100%',
                        dropdownParent: $("#refrence_form_${id}"),
                    });
                </script>
            </div>
            <div class="col-md-4 mb-4">
                <label for="gender">الجنس</label>
                <select class="form-control" name="gender" id="gender" required>
                    <option ${
                      "ذكر" == refrence.gender ? "selected" : ""
                    } value="ذكر">ذكر</option>
                    <option ${
                      "انثي" == refrence.gender ? "selected" : ""
                    } value="انثي">انثي</option>
                    <option ${
                      "كلاهما" == refrence.gender ? "selected" : ""
                    } value="كلاهما">كلاهما</option>
                </select>
                <script>
                    $('#refrence_form_${id} #gender').select2({
                        width: '100%',
                        dropdownParent: $("#refrence_form_${id}"),
                    });
                </script>
            </div>
            <div class="border col-md-6 my-4 pb-3 px-3 rounded text-center">
                <label>اقل عمر</label>
                <div class="row">
                    <div class="col-6 pr-0">
                        <input type="number" value="${
                          refrence["age low"]
                        }" name="age low" class="form-control" placeholder="العمر" id="age_low">
                    </div>
                    <div class="col-6 ">
                        <select class="form-control" name="age unit low" id="age_unit_low" required>
                            <option ${
                              "عام" == refrence["age unit low"]
                                ? "selected"
                                : ""
                            } value="عام">عام</option>
                            <option ${
                              "شهر" == refrence["age unit low"]
                                ? "selected"
                                : ""
                            } value="شهر">شهر</option>
                            <option ${
                              "يوم" == refrence["age unit low"]
                                ? "selected"
                                : ""
                            } value="يوم">يوم</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="border col-md-6 my-4 pb-3 px-3 rounded text-center">
                <label>اكبر عمر</label>
                <div class="row">
                    <div class="col-6 pr-0">
                        <input type="number" value="${
                          refrence["age high"]
                        }" name="age high" class="form-control" placeholder="العمر" id="age_high">
                    </div>
                    <div class="col-6 ">
                        <select class="form-control" name="age unit high" id="age_unit_high" required>
                        <option ${
                          "عام" == refrence["age unit high"] ? "selected" : ""
                        } value="عام">عام</option>
                        <option ${
                          "شهر" == refrence["age unit high"] ? "selected" : ""
                        } value="شهر">شهر</option>
                        <option ${
                          "يوم" == refrence["age unit high"] ? "selected" : ""
                        } value="يوم">يوم</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="col-12">
                <div class="row justify-content-around">
                    <div class="align-items-center border col-4 d-flex rounded">
                        <div class="n-chk">
                            <label class="new-control new-radio radio-primary m-0">
                                <input type="radio" class="new-control-input" name="type" value="number" ${
                                  refrence?.result == "number" ||
                                  refrence?.result === undefined
                                    ? "checked"
                                    : ""
                                } onchange="resultTypeChange()">
                                <span class="new-control-indicator mt-1"></span>رقم
                            </label>
                        </div>
                    </div>
                    <div class="align-items-center border col-4 d-flex rounded">
                        <div class="n-chk">
                            <label class="new-control new-radio radio-primary m-0">
                                <input type="radio" class="new-control-input" name="type" value="result" ${
                                  refrence?.result == "result" ? "checked" : ""
                                } onchange="resultTypeChange()">
                                <span class="new-control-indicator mt-1"></span>اختياري
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="border ${
              refrence?.result == "result" ? "d-none" : ""
            } col-md-12 my-4 pb-3 px-3 rounded text-center position-relative ranges" id="ranges_${id}">
                <label>range</label>
                <script>
                    setRange(${JSON.stringify(refrence.range)}, ${id});
                </script>
                <div class="position-absolute text-center rounded-circle bg-info" style="top: -20px;left:-20px;">
                    <label class="switch s-success  mb-4 mr-2" style="top:13px;right:3px;">
                        <input type="checkbox" name="more_range" id="more_range_${id}">
                        <span class="slider"></span>
                    </label>
                </div>
                <div onclick="addRange('ranges_${id}','more_range_${id}');" class="add-range position-absolute text-center rounded-circle bg-info" style="top: -20px;right:-20px;width: 43px;height: 47px;font-size: 30px;z-index: 999;">
                    <i class="fad fa-plus"></i>
                </div>
            </div>
            <div class="col-md-12 select-results border rounded my-4 ${
              refrence?.result == "result" ? "" : "d-none"
            }">
                <div onclick="addNewResult('${id}');" class="add-range position-absolute text-center rounded-circle bg-info" style="top: -20px;right:-20px;width: 43px;height: 47px;font-size: 30px;z-index: 999;">
                    <i class="fad fa-plus"></i>
                </div>
                <div class="row justify-content-center result-container">
                    <div class="col-12 text-center">
                        <label>النتائج</label>
                    </div>
                    <div class="col-9 ">
                        <label>الاسم</label>
                    </div>
                    <div class="col-2 ">
                        <label>range</label>
                    </div>
                    <div class="col-1 ">
                        <label>حذف</label>
                    </div>
                    ${
                      refrence?.options
                        ?.map((option, index) => {
                          return addNewResult(
                            id,
                            option,
                            refrence?.right_options?.includes(option)
                          );
                        })
                        .join("") ?? ""
                    }
                    ${
                      refrence?.options?.[0] === undefined
                        ? addNewResult(id, "", false)
                        : ""
                    }
                </div>

            </div>
            ${
              id === null
                ? ""
                : `
                <div class="col-md-3 mb-4">
                    <button type="button" class="btn btn-danger btn-block" onclick="fireSwal(deleteRefrence, '${hash}','${id}')">حذف</button>
                </div>
            `
            }
            <div class="col-md-3 mb-4">
                <button type="button" class="btn btn-primary btn-block" onclick="fireSwal(saveRefrence, '${hash}', '${id}')">حفظ</button>
            </div>
        </div>
    </form>
    `;
}

function addNewResult(id, value = "", right) {
  let randomID = Math.floor(Math.random() * 999999999999999999999);
  let form = `
    <div class="col-12 mb-3" id="select-result-${randomID}">
        <div class="row justify-content-center">
            <div class="col-9">
                <input type="text" name="select-result-value" class="form-control" placeholder="النتيجة"
                    id="select-result-value-${randomID}" value="${value}">
            </div>
            <div class="col-md-2 align-self-center p-0">
                <!-- that result is true or wroung -->
                <label class="switch s-success  mb-4 mr-2" style="top:13px;right:3px;">
                    <input type="checkbox" name="select-result" id="select-result-${randomID}" ${
    right ? "checked" : ""
  }>
                    <span class="slider"></span>
                </label>
            </div>
            <div class="col-md-1 align-self-center p-0">
                <i class="far fa-trash fa-2x text-danger" style="cursor:pointer;" onclick="$('#select-result-${randomID}').remove()"></i>
            </div>
        </div>
    </div>
    `;
  $(`#refrence_form_${id} .select-results .result-container`).append(form);
  return form;
}

function addRefrence(hash) {
  let form = createRefrenceForm(hash, {}, null);
  $("#refrence_editor .modal-body").html(form);
  $("#refrence_editor").modal("toggle");
  // $('#submit-refrence').attr('onclick', `fireSwal(saveRefrence, '${hash}', null)`)
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
  let element = {
    gender: $(`#refrence_form_${refID} #gender`).val(),
    kit: $(`#refrence_form_${refID} #kit`).val(),
    unit: result == "result" ? "" : $(`#refrence_form_${refID} #unit`).val(),
    "age high": $(`#refrence_form_${refID} #age_high`).val(),
    "age low": $(`#refrence_form_${refID} #age_low`).val(),
    "age unit high": $(`#refrence_form_${refID} #age_unit_high`).val(),
    "age unit low": $(`#refrence_form_${refID} #age_unit_low`).val(),
    result: result,
    options: options,
    right_options: rightOptions,
    note: "",
    range: getRanges(refID),
  };
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
      return self.findIndex((t) => t.kit === item.kit) === index;
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
}

function deleteRefrence(hash, refID) {
  let test = allTests.filter((item) => item.hash == hash)[0];
  let test_options = JSON.parse(test.option_test);
  let component = test_options.component;
  let _kit = component[0].reference[refID].kit;
  component[0].reference = component[0].reference.filter(
    (item, cur) => cur != refID
  );
  test_options["component"] = component;
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
    $(
      `#test-${hash}_kit-${(
        kits.find((x) => x.id == _kit)?.name.replace(/[^a-zA-Z0-9]/g, "_") ??
        "No Kit"
      )
        .split(" ")
        .join("_")}`
    ).remove();
    $("#refrence_editor").modal("toggle");
  }
}

function addRange(id, check, name = "", low = 0, high = 0, correct = false) {
  let ranges = $(`#${id}`);
  let checkValue = check ? $(`#${check}`).is(":checked") : true;
  let range = `
        <div class="row mb-4 range">
            <div class="col-md-4 pr-0">
                <input type="text" name="name" class="form-control" placeholder="الاسم" id="name" value="${name}">
            </div>
            <div class="col-md-3 pr-0">
                <input type="number" name="low" class="form-control" placeholder="الاقل" id="low" value="${low}">
            </div>
            <div class="col-md-3">
                <input type="number" name="high" class="form-control" placeholder="الاكثر" id="high" value="${high}">
            </div>
            <div class="col-md-1 align-self-center p-0">
            <label class="switch s-success  mb-4 mr-2" style="top:13px;right:3px;">
            <input type="radio" name="select-range" id="select-range" ${
              correct ? "checked" : ""
            }>
            <span class="slider"></span>
        </label>
            </div>
            <div class="col-md-1 align-self-center p-0">
                <i class="far fa-trash fa-2x text-danger" style="cursor:pointer;" onclick="deleteRange($(this), '${id}');"></i>
            </div>
        </div>
    `;
  if (checkValue) {
    ranges.append(range);
  }
}

function getRanges(id) {
  let range = [];
  $(`#ranges_${id} .range`).each(function () {
    let name = $(this).find("#name").val();
    let low = $(this).find("#low").val();
    let high = $(this).find("#high").val();
    let correct = $(this).find("#select-range").is(":checked");
    range.push({
      name: name,
      low: low,
      high: high,
      correct: correct,
    });
  });
  return range;
}

function setRange(_renges = [], id) {
  $(`#ranges_${id} .range`).remove();
  if (_renges.length <= 1) {
    $("#more_range").prop("checked", false);
    let range = _renges?.[0];
    addRange(
      `ranges_${id}`,
      "",
      range?.name,
      range?.low,
      range?.high,
      range?.correct
    );
  } else {
    $("#more_range").prop("checked", true);
    for (let range of _renges) {
      addRange(
        `ranges_${id}`,
        "",
        range?.name,
        range?.low,
        range?.high,
        range?.correct
      );
    }
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

function refreshValidation() {
  let result = true;
  let ageLowElement = $("#age_low");
  let ageHighElement = $("#age_high");
  let ageUnitLowElement = $("#age_unit_low");
  let ageUnitHighElement = $("#age_unit_high");
  // check if age low is empty
  if (ageLowElement.val() == "") {
    // add validation class
    ageLowElement.addClass("is-invalid");
    // add error message
    ageLowElement
      .parent()
      .append(`<div class="invalid-feedback">الرجاء ادخال العمر الادنى</div>`);
    // return false
    result = false;
  }
  // check if age high is empty
  if (ageHighElement.val() == "") {
    // add validation class
    ageHighElement.addClass("is-invalid");
    // add error message
    ageHighElement
      .parent()
      .append(`<div class="invalid-feedback">الرجاء ادخال العمر الاعلى</div>`);
    // return false
    result = false;
  }
  // check if age unit low is empty
  if (ageUnitLowElement.val() == "" || ageUnitLowElement.val() == null) {
    // add validation class
    ageUnitLowElement.addClass("is-invalid");
    // add error message
    ageUnitLowElement
      .parent()
      .append(
        `<div class="invalid-feedback">الرجاء ادخال وحدة العمر الادنى</div>`
      );
    // return false
    result = false;
  }
  // check if age unit high is empty
  if (ageUnitHighElement.val() == "" || ageUnitHighElement.val() == null) {
    // add validation class
    ageUnitHighElement.addClass("is-invalid");
    // add error message
    ageUnitHighElement
      .parent()
      .append(
        `<div class="invalid-feedback">الرجاء ادخال وحدة العمر الاعلى</div>`
      );
    // return false
    result = false;
  }
  $(".range").each(function () {
    let low = $(this).find("input[name='low']");
    let high = $(this).find("input[name='high']");
    // check if low is empty
    if (low.val() == "" && high.val() == "") {
      // add validation class
      low.addClass("is-invalid");
      // add error message
      low
        .parent()
        .append(
          `<div class="invalid-feedback">الرجاء ادخال القيمة الادنى او الاعلي علي الاقل</div>`
        );
      // return false
      result = false;
    }
    // check if high is empty
    // if (high.val() == "") {
    //     // add validation class
    //     high.addClass("is-invalid");
    //     // add error message
    //     high.parent().append(`<div class="invalid-feedback">الرجاء ادخال القيمة الاعلى</div>`);
    //     // return false
    //     result = false;
    // }
  });
  $(".is-invalid").on("focus", function () {
    $(this).removeClass("is-invalid");
  });
  $(".is-invalid").on("change", function () {
    $(this).removeClass("is-invalid");
  });
  return result;
}

function resultTypeChange() {
  const typeResultElement = $("input[name='type'][value='result']");
  const typeNumberElement = $("input[name='type'][value='number']");
  const unitElement = $("#unit");
  const selectResultsElement = $(".select-results");
  const rangesElement = $(".ranges");

  if (typeResultElement.prop("checked")) {
    selectResultsElement.removeClass("d-none");
    rangesElement.addClass("d-none");
    // make unit uneditable
    unitElement.prop("disabled", true);
  } else if (typeNumberElement.prop("checked")) {
    selectResultsElement.addClass("d-none");
    rangesElement.removeClass("d-none");
    // make unit editable
    unitElement.prop("disabled", false);
  }
}
