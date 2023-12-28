function showResult(visit, visitTests) {
  // add category if null
  visitTests = visitTests.map((vt) => {
    vt.category = vt.category ?? "Tests";
    return vt;
  });
  // sort by category
  visitTests = visitTests.sort((a, b) => {
    return a.category > b.category ? 1 : -1;
  });
  console.log(visitTests);
  let category = "";
  let invoices = { normalTests: `` };
  let buttons = {};
  // sort visit tests by category
  visitTests.forEach((test, index) => {
    let options = JSON.parse(test.options);
    let component = options.component;
    let result_test = JSON.parse(test.result_test);
    if (options.type != "type") {
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
                        <div class="test row m-0 category_${category
                          ?.split(" ")
                          ?.join("_")}">
                            <div class="sections col-3">
                                <p class="text-center">Test Name</p>
                            </div>
                            <div class="sections col-2">
                                <p class="text-center">Result</p>
                            </div>
                            <div class="sections col-2">
                                <p class="text-center">Flag</p>
                            </div>
                            <div class="sections col-2">
                                <p class="text-center">Unit</p>
                            </div>
                            <div class="sections col-3">
                                <p class="text-center">Normal</p>
                            </div>
                        </div>`;
        }
      }

      let reference = component?.[0]?.reference;
      if (reference) {
        // filter with kit
        reference = filterWithKit(reference, test.kit_id);
        // filter with unit
        reference = filterWithUnit(reference, test.unit);
        // filter with age
        reference = filterWithAge(reference, visit.age, "عام");
        // filter with gender
        reference = filterWithGender(reference, gender);
      }
      let color = "dark";
      if (reference?.[0]?.range.length == 1) {
        let RANGE = reference?.[0]?.range?.[0];
        // if result low then range low color red else if result high then range high color red else color green
        if (RANGE) {
          if (
            (parseFloat(result_test?.[test.name]) ?? 0) < parseFloat(RANGE.low)
          ) {
            color = "info bg-light-dark p-1 border";
          } else if (
            (parseFloat(result_test?.[test.name]) ?? 0) > parseFloat(RANGE.high)
          ) {
            color = "danger bg-light-dark p-1 border";
          }
        }
      }
      invoices.normalTests += `
                <div class="test row m-0 category_${category
                  ?.split(" ")
                  ?.join("_")} border-test" id="test_normal_${
        test.hash
      }" data-cat="${category?.split(" ")?.join("_")}">
                    <div class="testname col-3">
                        <p>${test.name}</p>
                    </div>
                    <div class="testresult col-2">
                        <p class="text-${color}">${
        result_test?.[test.name] ?? 0
      }</p>
                    </div>
                    <div class="testresult col-2">
                        <p class="text-${color}">${
        color == "dark" ? "" : color == "danger" ? "H" : "L"
      }</p>
                    </div>
                    <div class="testresult col-2">
                        <p> ${test?.unit_name ?? ""}</p>
                    </div>
                    <div class="testnormal col-3">
                        <p>
                            <div class="row w-100">
                                ${
                                  reference?.[0]?.range
                                    .map(
                                      (range) =>
                                        `<div class="col-md-5 text-right " onmouseover="showPopover.call(this,'name', '${
                                          range.name == ""
                                            ? "range"
                                            : range.name
                                        }')" onmouseleave="$(this).popover('hide')">${
                                          range.name == ""
                                            ? "range"
                                            : range.name
                                        } </div>
                                     <div class="col-md-7 text-right" onmouseleave="$(this).popover('hide')" onmouseover="showPopover.call(this,'range', '${
                                       range.low == "" ? 0 : range.low
                                     } - ${
                                          range.high == "" ? 100 : range.high
                                        }')"> : ${
                                          range.low == "" ? 0 : range.low
                                        } - ${
                                          range.high == "" ? 100 : range.high
                                        } </div>`
                                    )
                                    .join("<br>") ?? ""
                                }
                            </div>
                        </p>
                    </div>
                </div>
            `;
    } else {
      buttons[test.name] = `<div class="col-auto">
                    <button class="action btn btn-action mx-2 w-100" id="test-${test.name}" onclick="getCurrentInvoice($(this))">${test.name}</button>
                </div>`;
      let invoiceBody = "";
      invoiceBody += `
            <div class="typetest test ">
                <!-- عنوان التحليل ------------------>
                <p>${test.name}</p>
            </div>
            `;
      let type = "";
      for (let reference of component) {
        if (reference.type != type) {
          type = reference.type;
          invoiceBody += `
                        <div class="test row m-0">
                            <!-- تصنيف الجدول او اقسام الجدول ------------>

                            <div class="sections col-5">
                                <p>${reference.type}</p>
                            </div>
                            <div class="sections col-3">
                                <p>Result</p>
                            </div>
                            <div class="sections col-4">
                                <p>Normal</p>
                            </div>
                        </div>
                    `;
        }
        invoiceBody += `
                <div class="test row m-0">
                    <div class="testname col-5">
                        <p>${reference.name}</p>
                    </div>
                    <div class="testresult col-3">
                        <p>${result_test?.[reference.name] ?? ""}</p>
                    </div>
                    <div class="testnormal col-4">
                        <p>${reference.reference[0].range[0].low ?? ""}</p>
                    </div>
                </div>
                `;
      }
      invoices[test.name] = invoiceBody;
    }
  });
  return `
    <div class="row justify-content-center mb-30" id="invoice-tests-buttons">
        ${Object.values(buttons).join("")}
    </div>
    ${Object.entries(invoices)
      .map(([key, value]) => {
        return createInvoice(visit, key, value);
      })
      .join("")}
    `;
  // return createInvoice(visit,25, resultForm.join(''));
}
