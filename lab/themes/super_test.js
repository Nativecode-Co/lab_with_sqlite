const deafultRefrence = {
  kit: "",
  unit: "",
  range: [],
  result: "",
  right_options: [],
  options: [],
  gender: "ذكر",
  "age high": "0",
  "age low": "0",
  "age unit high": "عام",
  "age unit low": "عام",
};

class Theme {
  constructor(kits, units) {
    this.name = "Super Test";
    this.kits = kits;
    this.units = units;
  }

  getData(refID, resultStyle, options, rightOptions) {
    return {
      gender: $(`#refrence_form_${refID} #gender`).val(),
      kit: $(`#refrence_form_${refID} #kit`).val(),
      unit:
        resultStyle == "result" ? "" : $(`#refrence_form_${refID} #unit`).val(),
      "age high": $(`#refrence_form_${refID} #age_high`).val(),
      "age low": $(`#refrence_form_${refID} #age_low`).val(),
      "age unit high": $(`#refrence_form_${refID} #age_unit_high`).val(),
      "age unit low": $(`#refrence_form_${refID} #age_unit_low`).val(),
      result: resultStyle,
      options: options,
      right_options: rightOptions,
      note: "",
      range: getRanges(refID),
    };
  }

  kitSelectElement(kits, selectedKit) {
    const options = kits
      .map(
        (item) =>
          `<option value="${item.id}" ${
            item.id == selectedKit ? "selected" : ""
          }>${item.name}</option>`
      )
      .join(" ");

    // return element
    return `
    <select class="form-control" name="kit" id="kit" required>
        <option value="">No Kit</option>
        ${options}
    </select>
    <script>
        $('#kit').select2({
            width: '100%',
            dropdownParent: $("#kit").parent(),
        });
    </script>
    `;
  }

  unitSelectElement(units, selectedUnit) {
    const options = units
      .map(
        (item) =>
          `<option value="${item.hash}" ${
            item.hash == selectedUnit ? "selected" : ""
          }>${item.name}</option>`
      )
      .join(" ");

    // return element
    return `
    <select class="form-control" name="unit" id="unit" required>
        ${options}
    </select>
    <script>
        $('#unit').select2({
            width: '100%',
            dropdownParent: $("#unit").parent(),
        });
    </script>
    `;
  }

  genderSelectElement(selectedGender) {
    const options = `
    <option ${
      "ذكر" == selectedGender ? "selected" : ""
    } value="ذكر">ذكر</option>
    <option ${
      "انثي" == selectedGender ? "selected" : ""
    } value="انثي">انثي</option>
    <option ${
      "كلاهما" == selectedGender ? "selected" : ""
    } value="كلاهما">كلاهما</option>
    `;

    return `
    <select class="form-control" name="gender" id="gender" required>
        ${options}
    </select>
    <script>
        $('#gender').select2({
            width: '100%',
            dropdownParent: $("#gender").parent(),
        });
    </script>
    `;
  }

  ageInput(low, lowUnit, high, highUnit) {
    return ``;
  }

  resultInput(resultStyle, id) {
    return `
    <div class="row justify-content-around">
        <div class="align-items-center border col-4 d-flex rounded">
            <div class="n-chk">
                <label class="new-control new-radio radio-primary m-0">
                    <input type="radio" class="new-control-input type_${id}" name="type" value="number" ${
      resultStyle == "number" || !resultStyle ? "checked" : ""
    } onchange="resultTypeChange('${id}')">
                    <span class="new-control-indicator mt-1"></span>
                    <span class="new-radio-content">رقم</span>
                </label>
            </div>
        </div>
        <div class="align-items-center border col-4 d-flex rounded">
            <div class="n-chk">
                <label class="new-control new-radio radio-primary m-0">
                    <input type="radio" class="new-control-input type_${id}" name="type" value="result" ${
      resultStyle == "result" ? "checked" : ""
    } onchange="resultTypeChange('${id}')">
                    <span class="new-control-indicator mt-1"></span>
                    <span class="new-radio-content">اختيار</span>
                </label>
            </div>
        </div>
    </div>
    `;
  }

  inputType(id, range, resultStyle) {
    return `
    <div class="border ${
      resultStyle == "result" ? "d-none" : ""
    } col-md-12 my-4 pb-3 px-3 rounded text-center position-relative rangesClass_${id}" id="ranges_${id}">
        <label>range</label>
        <script>
            setRange(${JSON.stringify(range)}, ${id});
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
    `;
  }

  selectType(id, resultStyle, options, rightOptions) {
    return `
    <div class="col-md-12 select-results_${id} border rounded my-4 ${
      resultStyle == "result" ? "" : "d-none"
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
              options
                ?.map((option, index) => {
                  return addNewResult(
                    id,
                    option,
                    rightOptions?.includes(option)
                  );
                })
                .join("") ?? ""
            }
            ${options?.[0] === undefined ? addNewResult(id, "", false) : ""}
        </div>

    </div>
    `;
  }

  mainForm(id, hash, refrence) {
    return ``;
  }

  build() {
    return ``;
  }
}

class FormTheme extends Theme {
  constructor(hash, kits, units) {
    super(hash, kits, units);
    this.name = "Form";
  }

  ageInput(low, lowUnit, high, highUnit) {
    // low and high age elements
    const selectOptions = (unit) => {
      return `
        <option ${"عام" == unit ? "selected" : ""} value="عام">عام</option>
        <option ${"شهر" == unit ? "selected" : ""} value="شهر">شهر</option>
        <option ${"يوم" == unit ? "selected" : ""} value="يوم">يوم</option>
        `;
    };

    const lowAge = `
    <div class="col-6 pr-0">
        <input type="number" value="${low}" name="age low" class="form-control" placeholder="العمر" id="age_low">
    </div>
    <div class="col-6 ">
        <select class="form-control" name="age unit low" id="age_unit_low" required>
            ${selectOptions(lowUnit)}
        </select>
    </div>
    `;
    const highAge = `
    <div class="col-6 pr-0">
        <input type="number" value="${high}" name="age high" class="form-control" placeholder="العمر" id="age_high">
    </div>
    <div class="col-6 ">
        <select class="form-control" name="age unit high" id="age_unit_high" required>
            ${selectOptions(highUnit)}
        </select>
    </div>
    `;

    return `
    <div class="border col-md-6 my-4 pb-3 px-3 rounded text-center">
        <label>اقل عمر</label>
        <div class="row">
            ${lowAge}
        </div>
    </div>
    <div class="border col-md-6 my-4 pb-3 px-3 rounded text-center">
        <label>اعلي عمر</label>
        <div class="row">
            ${highAge}
        </div>
    </div>
    `;
  }

  mainForm(id, hash, refrence) {
    const { kit, unit, range, result, right_options, options, gender } =
      refrence;
    const ageLow = refrence?.["age low"] ?? 0;
    const ageLowUnit = refrence?.["age unit low"] ?? "عام";
    const ageHigh = refrence?.["age high"] ?? 0;
    const ageHighUnit = refrence?.["age unit high"] ?? "عام";
    return `
    <form class="form-test border-bottom border-info mb-4" novalidate accept-charset="utf-8" id="refrence_form_${id}">
        <div class="form-row justify-content-between">
            <div class="col-md-4 mb-4">
                <label for="kit">Kit</label>
                ${this.kitSelectElement(this.kits, kit)}
            </div>
            <div class="col-md-4 mb-4">
                <label for="unit">وحدة القياس</label>
                ${this.unitSelectElement(this.units, unit)}
            </div>
            <div class="col-md-4 mb-4">
                <label for="gender">الجنس</label>
                ${this.genderSelectElement(gender)}
            </div>
            ${this.ageInput(ageLow, ageLowUnit, ageHigh, ageHighUnit)}

            <div class="col-12">
                <label for="result"> شكل النتيجة</label>
                ${this.resultInput(result, id)}
            </div>
            ${this.inputType(id, range, result)}
            ${this.selectType(id, result, options, right_options)}
            ${
              id === null
                ? ""
                : `
                <div class="col-md-3 mb-4">
                    <button type="button" class="btn btn-danger btn-block" onclick="fireSwalForDelete(deleteRefrence, '${hash}','${id}')">حذف</button>
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

  build(hash, refrences, selectedKit) {
    let form = "";
    if (refrences) {
      refrences.map((refrence, id) => {
        if (refrence?.kit == selectedKit) {
          form += this.mainForm(id, hash, refrence);
        }
      });
    } else {
      form = this.mainForm(null, hash, deafultRefrence);
    }
    return form;
  }
}

class TableTheme extends Theme {
  constructor(kits, units) {
    super(kits, units);
    this.name = "Table";
  }

  ageInput(low, lowUnit, high, highUnit) {
    const selectOptions = (unit) => {
      return `
        <option ${"عام" == unit ? "selected" : ""} value="عام">عام</option>
        <option ${"شهر" == unit ? "selected" : ""} value="شهر">شهر</option>
        <option ${"يوم" == unit ? "selected" : ""} value="يوم">يوم</option>
        `;
    };
    return `
    <div class="row justify-content-between">
       <div class="col-md-3 mb-4">
          <input type="number" class="form-control" name="age_low" id="age_low" value="${low}" placeholder="الحد الادنى">
        </div>
        <div class="col-md-3 mb-4">
          <select class="form-control" name="age_unit_low" id="age_unit_low">
            ${selectOptions(lowUnit)}
          </select>
        </div>
        <div class="col-md-3 mb-4">
          <input type="number" value="${high}" name="age high" class="form-control" placeholder="العمر" id="age_high">
        </div>
        <div class="col-md-3 mb-4">
          <select class="form-control" name="age_unit_high" id="age_unit_high">
            ${selectOptions(lowUnit)}
          </select>
        </div>
    </div>
    `;
  }

  mainForm(id, hash, refrence) {
    const { kit, unit, range, result, right_options, options, gender } =
      refrence;
    const ageLow = refrence?.["age low"] ?? 0;
    const ageLowUnit = refrence?.["age unit low"] ?? "عام";
    const ageHigh = refrence?.["age high"] ?? 0;
    const ageHighUnit = refrence?.["age unit high"] ?? "عام";

    return `
    <form class="form-test border-bottom border-info mb-4" novalidate accept-charset="utf-8" id="refrence_form_${id}">
        <div class="form-row justify-content-center">
          <div class="col-3">
              <label for="kit">Kit</label>
              ${this.kitSelectElement(this.kits, kit)}
          </div>
          <div class="col-3">
              <label for="unit">وحدة القياس</label>
              ${this.unitSelectElement(this.units, unit)}
          </div>
          <div class="col-2">
            <label for="unit">الجنس</label>
            ${this.genderSelectElement(gender)}
          </div>
          <div class="col-4">
            <label for="unit">العمر</label>
            ${this.ageInput(ageLow, ageLowUnit, ageHigh, ageHighUnit)}
          </div>
          <div class="col-3">
            <label for="result"> شكل النتيجة</label>
            ${this.resultInput(result, id)}
          </div>
          <div class="col-9">
            <label for="result">النتيجة</label>
            ${this.inputType(id, range, result)}
            ${this.selectType(id, result, options, right_options)}
          </div>
          <div class="col-md-3 mb-4">
                <button type="button" class="btn btn-primary btn-block" onclick="fireSwal(saveRefrence, '${hash}', '${id}')">حفظ</button>
            </div>
        </div>
    </form>
    `;
  }

  createRow(id, hash, refrence) {
    const { kit, unit, range, result, right_options, options, gender } =
      refrence;
    const ageLow = refrence?.["age low"] ?? 0;
    const ageLowUnit = refrence?.["age unit low"] ?? "عام";
    const ageHigh = refrence?.["age high"] ?? 0;
    const ageHighUnit = refrence?.["age unit high"] ?? "عام";

    let kitName = "No Kit";
    this.kits.map((k) => {
      if (k.id == kit) {
        kitName = k.name;
      }
    });
    let unitName = "No Unit";
    this.units.map((u) => {
      if (u.hash == unit) {
        unitName = u.name;
      }
    });
    return `
      <tr>
        <td>${kitName}</td>
        <td>${gender}</td>
        <td>${ageLow} ${ageLowUnit} - ${ageHigh} ${ageHighUnit}</td>
        <td
          style="overflow: hidden;"
        >${
          range?.map((r) => {
            return `${r?.name ? `${r?.name} : ` : ""}  <span>${
              r?.high ?? ""
            }</span>-<span>${r?.low ?? ""}</span>`;
          }) ?? "No Range"
        }</td>
        <td>${unitName}</td>
        <td>
          <i class="fas fa-edit text-success" onclick="(updateRefrence('${hash}', '${id}'))"></i>
          <i class="fas fa-trash text-danger" onclick="fireSwalForDelete(deleteRefrence, '${hash}','${id}')"></i>
        </td>
      </tr>
    `;
  }

  resizeModal() {
    const modalSize = document.querySelector(
      "#refrence_editor .modal-dialog.modal-xl"
    );
    modalSize.style.maxWidth = "90%";
  }

  build(hash, refrences, selectedKit) {
    this.resizeModal();

    let form = "";
    let table = "";
    if (refrences && refrences.length > 0) {
      table = `
      <table class="table table-striped table-bordered table-hover" style="table-layout: fixed;">
        <thead>
          <tr>
            <th>Kit</th>
            <th>الجنس </th>
            <th>العمر</th>
            <th>Range</th>
            <th>وحدة القياس</th>
            <th>الاجراء</th>
          </tr>
        </thead>
        <tbody>
          ${refrences
            .map((refrence, id) => {
              const kit = refrence?.kit ?? "";
              // check if kit in this kits
              if (kit == selectedKit) {
                return this.createRow(id, hash, refrence);
              }
            })
            .join("")}
        </tbody>
      </table>

      `;
    } else {
      form = this.mainForm(null, hash, deafultRefrence);
    }
    return `
      <div id="form_container">
      ${form}
      </div>
      <div id="table_container">
        ${table}
      </div>
    `;
  }
}

class PackageTestTheme extends TableTheme {
  constructor() {
    super();
    this.name = "PackageTest";
  }
  getData(refID, resultStyle, options, rightOptions) {
    return {
      gender: $(`#refrence_form_${refID} #gender`).val(),
      kit: $(`#refrence_editor #kit`).val(),
      unit: resultStyle == "result" ? "" : $(`#refrence_editor #unit`).val(),
      "age high": $(`#refrence_form_${refID} #age_high`).val(),
      "age low": $(`#refrence_form_${refID} #age_low`).val(),
      "age unit high": $(`#refrence_form_${refID} #age_unit_high`).val(),
      "age unit low": $(`#refrence_form_${refID} #age_unit_low`).val(),
      result: resultStyle,
      options: options,
      right_options: rightOptions,
      note: "",
      range: getRanges(refID),
    };
  }

  mainForm(id, hash, refrence) {
    const { kit, unit, range, result, right_options, options, gender } =
      refrence;
    const ageLow = refrence?.["age low"] ?? 0;
    const ageLowUnit = refrence?.["age unit low"] ?? "عام";
    const ageHigh = refrence?.["age high"] ?? 0;
    const ageHighUnit = refrence?.["age unit high"] ?? "عام";

    return `
    <form class="form-test border-bottom border-info mb-4" novalidate accept-charset="utf-8" id="refrence_form_${id}">
        <div class="form-row justify-content-center">
        <input type="hidden" name="kit" value="${kit}" id="kit">
        <input type="hidden" name="unit" value="${unit}" id="unit">
          <div class="col-4">
            <label for="unit">الجنس</label>
            ${this.genderSelectElement(gender)}
          </div>
          <div class="col-8">
            <label for="unit">العمر</label>
            ${this.ageInput(ageLow, ageLowUnit, ageHigh, ageHighUnit)}
          </div>
          <div class="col-3">
            <label for="result"> شكل النتيجة</label>
            ${this.resultInput(result, id)}
          </div>
          <div class="col-9">
            <label for="result">النتيجة</label>
            ${this.inputType(id, range, result)}
            ${this.selectType(id, result, options, right_options)}
          </div>
          <div class="col-md-3 mb-4">
                <button type="button" class="btn btn-primary btn-block" onclick="fireSwal(saveRefrence, '${hash}', '${id}')">حفظ</button>
            </div>
        </div>
    </form>
    `;
  }

  createRow(id, hash, refrence) {
    const { range, gender } = refrence;
    const ageLow = refrence?.["age low"] ?? 0;
    const ageLowUnit = refrence?.["age unit low"] ?? "عام";
    const ageHigh = refrence?.["age high"] ?? 0;
    const ageHighUnit = refrence?.["age unit high"] ?? "عام";

    return `
      <tr>
        <td>${gender}</td>
        <td>${ageLow} ${ageLowUnit} - ${ageHigh} ${ageHighUnit}</td>
        <td
          style="overflow: hidden;"
        >${
          range?.map((r) => {
            return `${r?.name ? `${r?.name} : ` : ""}  <span>${
              r?.high ?? ""
            }</span>-<span>${r?.low ?? ""}</span>`;
          }) ?? "No Range"
        }</td>
        <td>
          <i class="fas fa-edit text-success" onclick="(updateRefrence('${hash}', '${id}'))"></i>
        </td>
      </tr>
    `;
  }

  build(hash, refrences, selectedKit, selectedUnit) {
    this.resizeModal();
    let form = "";
    let table = "";
    if (refrences && refrences.length > 0) {
      table = `
      <table class="table table-striped table-bordered table-hover" style="table-layout: fixed;">
        <thead>
          <tr>
            <th>الجنس </th>
            <th>العمر</th>
            <th>Range</th>
            <th>الاجراء</th>
          </tr>
        </thead>
        <tbody>
          ${refrences
            .map((refrence, id) => {
              const kit = refrence?.kit;
              const unit = refrence?.unit;
              if (
                (kit == selectedKit || (isNull(kit) && isNull(selectedKit))) &&
                (unit == selectedUnit || (isNull(unit) && isNull(selectedUnit)))
              ) {
                return this.createRow(id, hash, refrence);
              }
            })
            .join("")}
        </tbody>
      </table>

      `;
    } else {
      form = this.mainForm(null, hash, deafultRefrence);
    }
    return `
      <div id="form_container">
      ${form}
      </div>
      <div id="table_container">
        ${table}
      </div>
    `;
  }
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
  $(`#refrence_form_${id} .select-results_${id} .result-container`).append(
    form
  );
  return form;
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

function refreshValidation() {
  let result = true;
  let ageLowElement = $("#age_low");
  let ageHighElement = $("#age_high");
  let ageUnitLowElement = $("#age_unit_low");
  let ageUnitHighElement = $("#age_unit_high");

  // check if age low is empty
  if (ageLowElement.val() == "") {
    niceSwal("error", "top-end", "الرجاء ادخال العمر الادنى");
    return false;
  }
  // check if age high is empty
  if (ageHighElement.val() == "") {
    niceSwal("error", "top-end", "الرجاء ادخال العمر الاعلى");
    result = false;
  }
  // check if age unit low is empty
  if (ageUnitLowElement.val() == "" || ageUnitLowElement.val() == null) {
    niceSwal("error", "top-end", "الرجاء ادخال وحدة العمر الادنى");

    result = false;
  }
  // check if age unit high is empty
  if (ageUnitHighElement.val() == "" || ageUnitHighElement.val() == null) {
    niceSwal("error", "top-end", "الرجاء ادخال وحدة العمر الاعلى");

    result = false;
  }
  $(".range").each(function () {
    let low = $(this).find("input[name='low']");
    let high = $(this).find("input[name='high']");
    // check if low is empty
    if (low.val() == "" && high.val() == "") {
      niceSwal(
        "error",
        "top-end",
        "الرجاء ادخال القيمة الادنى او الاعلي علي الاقل"
      );

      result = false;
    }
  });
  return result;
}

const isNull = (value) => {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "null" ||
    value === "undefined" ||
    value === 0 ||
    value === "0"
  );
};

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

function resultTypeChange(id) {
  const typeResultElement = $(`input[name='type'][value='result'].type_${id}`);
  const typeNumberElement = $(`input[name='type'][value='number'].type_${id}`);
  // const unitElement = $("#unit");
  const selectResultsElement = $(`.select-results_${id}`);
  const rangesElement = $(`.rangesClass_${id}`);

  if (typeResultElement.prop("checked")) {
    selectResultsElement.removeClass("d-none");
    rangesElement.addClass("d-none");
    // make unit uneditable
    // unitElement.prop("disabled", true);
  } else if (typeNumberElement.prop("checked")) {
    selectResultsElement.addClass("d-none");
    rangesElement.removeClass("d-none");
    // make unit editable
    // unitElement.prop("disabled", false);
  }
}

function createRefrenceForm(hash, refrence, id) {
  $("#refrence_editor .modal-title").text(
    `${kits.find((x) => x.id == refrence.kit)?.name ?? "No Kit"}`
  );
  return THEME.build(hash, null, null);
}

function addRefrence(hash, unit) {
  let form = createRefrenceForm(hash, {}, null);
  $("#refrence_editor .modal-body").html(form);
  $("#refrence_editor").modal("show");
  if (unit) {
    $("#refrence_editor .modal-body #unit").val(`${unit}`);
  }
  // $('#submit-refrence').attr('onclick', `fireSwal(saveRefrence, '${hash}', null)`)
}
