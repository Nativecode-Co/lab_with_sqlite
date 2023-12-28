"use strict";
const calcOperator = ["+", "-", "*", "/", "(", ")", "Math.log10("];
let workers;
let invoices;

const urlParams = new URLSearchParams(window.location.search),
  pk = urlParams.get("pk").split("-")[0],
  number = urlParams.get("pk").split("-")[1];

fetch(`${base_url}invoice?pk=${pk}&number=${number}`)
  .then((response) => response.json())
  .then((response) => {
    workers = response.data.workers;
    invoices = response.data.invoices[0];
    showAddResult(response.data.visit, response.data.visitTests);
    // for in .book-result
    $(".book-result").each(function () {
      manageInvoiceHeight($(this));
    });
    set_var("--font_size", `${invoices?.font_size ?? 20}px`);
    set_var("--color-orange", invoices?.color ?? "#ff8800");
  });

function showAddResult(visit, visitTests) {
  let workSpace = $("#root");
  let { invoice } = showResult(visit, visitTests);
  let html = `
    <div class="col-md-12 mt-48">
        ${invoice}
    </div>
        `;
  workSpace.append(html);
  setInvoiceStyle();
}

function get_var(_var = "") {
  let r = document.querySelector(":root");
  let rs = getComputedStyle(r);
  alert(`The value of ${_var} is: ` + rs.getPropertyValue(_var));
}

// Create a function for setting a variable value
function set_var(_var, value) {
  let r = document.querySelector(":root");
  // Set the value of variable --blue to another value (in this case "lightblue")
  r.style.setProperty(_var, value);
}

function manageInvoiceHeight(invoice) {
  let allTestsElements = [];
  let allInvoiceTestsHeight = 0;
  $(invoice)
    .find(".page .center2 .tester .test")
    .each(function () {
      let eleHeight = $(this).outerHeight();
      allTestsElements.push({
        html: $(this).clone(),
        eleHeight,
      });
      allInvoiceTestsHeight += eleHeight;
    });
  let cloneInvoice = $(invoice).find(".page").first().clone();
  cloneInvoice.find(".center2 .tester").empty();
  let center2 = $(".book-result:visible .center2:last");
  let center2Scroll = center2.height() - 200;
  let invoices = addTestToInvoice(
    allInvoiceTestsHeight,
    allTestsElements,
    cloneInvoice,
    center2Scroll
  );
  $(invoice).empty();
  console.log(invoices);
  invoices.map((inv) => {
    $(invoice).append(inv);
  });
}

function addTestToInvoice(
  allInvoiceTestsHeight,
  allTestsElements,
  cloneInvoice,
  center2Scroll
) {
  let invoiceCount = Math.ceil(allInvoiceTestsHeight / center2Scroll);
  let { invoices, lastTestType, testTypeHeight, lastTestHead, testHeadHeight } =
    {
      invoices: [],
      lastTestType: null,
      testTypeHeight: allTestsElements[0]?.eleHeight,
      lastTestHead: null,
      testHeadHeight: allTestsElements[1]?.eleHeight,
    };
  for (let i = 1; i <= invoiceCount; i++) {
    if (allTestsElements[0].html.hasClass("border-test")) {
      if (lastTestType) {
        allTestsElements.unshift(lastTestType);
      }
      // allTestsElements.unshift(lastTestHead);
    }
    let height = 0;
    let invoice = cloneInvoice.clone();
    for (let [index, test] of allTestsElements.entries()) {
      if (
        index == 0 &&
        !test?.html?.hasClass("testhead") &&
        allTestsElements?.[1]?.html
      ) {
        let dataFlag = allTestsElements[1].html.attr("data-flag");
        invoice.find(".center2 .tester").append(manageHead(dataFlag));
      }
      if (test?.html?.hasClass("typetest")) {
        lastTestType = test;
        test.html = test.html.clone();
        if (center2Scroll - height < testTypeHeight + testHeadHeight + 70) {
          // stop loop
          break;
        }
      }
      // else if (test.html.hasClass('testhead')) {
      //     lastTestHead = test;
      // }
      height += test.eleHeight;
      if (height <= center2Scroll) {
        invoice.find(".center2 .tester").append(test.html);
        allTestsElements = allTestsElements.slice(1);
      } else {
        break;
      }
    }
    invoices.push(invoice);
  }
  if (allTestsElements.length > 0) {
    addTestToInvoice(
      allInvoiceTestsHeight,
      allTestsElements,
      cloneInvoice,
      center2Scroll
    );
  }
  return invoices;
}

function cloneOldInvoice(newInvoiceBody) {
  if (newInvoiceBody != "") {
    let oldInvoice = $(".book-result:visible .page");
    let newInvoice = oldInvoice.clone();
    newInvoice.find(".tester").html(newInvoiceBody);
    $(".book-result:visible").append(newInvoice);
  }
}

function manageInvoiceHeightForScroll() {
  $(".invoice-height").height(1500);
  $(".form-height").height(1500);
}
function manageHead(type) {
  switch (type) {
    case "result":
      return `
            <div class="testhead row sections m-0 category_category">
                <div class="col-4">
                    <p class="text-right">Test Name</p>
                </div>
                <div class="col-6 justify-content-between">
                    <p class="text-center w-100">Result</p>
                </div>
                <div class="col-2">
                    <p class="text-right">Range</p>
                </div>
            </div>
            `;
    case "unit":
      return `
            <div class="testhead row sections m-0 category_category">
                <div class="col-4">
                    <p class="text-right">Test Name</p>
                </div>
                <div class="col-4 justify-content-between">
                    <p class="text-center w-100">Result</p>
                </div>
                <div class="col-2">
                    <p class="text-right">Unit</p>
                </div>
                <div class="col-2">
                    <p class="text-right">Range</p>
                </div>
            </div>
            `;
    case "flag":
      return `
            <div class="testhead row sections m-0 category_category">
                <div class="col-3">
                    <p class="text-right">Test Name</p>
                </div>
                <div class="col-2 justify-content-between">
                    <p class="text-center w-75">Result</p>
                </div>
                <div class="col-2 justify-content-between">
                    <p class="text-center w-75">Flag</p>
                </div>
                <div class="col-2">
                    <p class="text-right">Unit</p>
                </div>
                <div class="col-3">
                    <p class="text-right">Normal Range</p>
                </div>
            </div>
            `;
    default:
      return `
            <div class="row m-0 sections">
                <!-- تصنيف الجدول او اقسام الجدول --------------------------------------------------------------------------------------->

                <div class="col-1 text-right">
                    <p>#</p>
                </div>
                <div class="col-9 text-right">
                    <p>Analysis Type</p>
                </div>
                <div class="col-2 text-right">
                    <p>Price</p>
                </div>
            </div>
            `;
  }
}

function manageTestType(type, test = {}) {
  let {
    name,
    color,
    result,
    hash,
    category,
    checked,
    normal,
    unit,
    flag,
    font,
  } = test;
  switch (type) {
    case "flag":
      return `
            <div data-flag="flag" class="test row m-0 category_${category
              ?.split(" ")
              ?.join(
                "_"
              )} border-test" id="test_normal_${hash}" data-cat="${category
        ?.split(" ")
        ?.join("_")}">
                <div class="testname col-3">
                    <p class="text-right w-100">${name}</p>
                </div>
                <div class="testresult col-2">
                    <p class="${color} w-75 text-center">${result ?? 0}</p>
                </div>
                <div class="testresult col-2">
                    <p class="${color} w-75 text-center">${flag}</p>
                </div>
                <div class="testresult col-2">
                    <p> ${unit}</p>
                </div>
                <div class="testnormal col-3">
                    <p class="text-right">
                    ${normal}
                    </p>
                </div>
            </div>
            `;
    case "unit":
      return `
            <div style="font-size:${font} !important" data-flag="unit" class="test strc-test row m-0">
                    <div class="testname col-4">
                        <p>${name}</p>
                    </div>
                    <div class="testresult col-4 justify-content-center">
                        <p class="w-75 text-center ${color}">${result.toString()}</p>
                    </div>
                    <div class="testname col-2" >
                        <p>${unit ?? ""}</p>
                    </div>
                    <div class="testnormal col-2">
                        <p>${normal}</p>
                    </div>
                </div>
            `;
    case "result":
      return `
            <div style="font-size:${font} !important" data-flag="result" class="test strc-test row m-0">
                    <div class="testname col-4">
                        <p>${name}</p>
                    </div>
                    <div class="testresult col-6 justify-content-center">
                        <p class="w-75 text-center ${color}">${result.toString()}</p>
                    </div>
                    <div class="testnormal col-2">
                        <p>${normal}</p>
                    </div>
                </div>`;
    default:
      break;
  }
}

function setInvoiceStyle() {
  $(".sections").css("border-bottom", `2px solid ${invoices?.color}`);
  // change .center2-background background-image
  if (invoices?.water_mark == "1") {
    $(".center2-background").css(
      "background-image",
      `url('${invoices?.logo}')`
    );
  } else {
    $(".center2-background").css("background-image", `none`);
  }
  $(".namet").css("color", `${invoices?.color}`);
  $(".page .header").height(invoices?.header);
  $(".page .footer2").height(invoices?.footer - 5);
  $(".page .center2").height(invoices?.center - 15);
  $(".page .center").height(invoices?.center);
}

function getNormalRange(finalResult = 0, range = []) {
  let { normalRange, color, flag } = {
    normalRange: "No Range",
    color: "dark",
    flag: "",
  };
  let { name = "", low = "", high = "" } = range;
  if (low != "" && high != "") {
    normalRange = (name ? `${name} : ` : "") + low + " - " + high;
  } else if (low == "") {
    normalRange = (name ? `${name} : ` : "") + " >= " + high;
  } else if (high == "") {
    normalRange = (name ? `${name} : ` : "") + low + " <= ";
  }
  if (parseFloat(finalResult) < parseFloat(low)) {
    color = "text-info p-1 border border-dark";
    flag = "L";
  } else if (parseFloat(finalResult) > parseFloat(high)) {
    color = "text-danger p-1 border border-dark";
    flag = "H";
  }
  return { normalRange, color, flag };
}

function normalTestRange(finalResult = 0, refrence) {
  let returnResult = {
    color: "text-dark",
    normalRange: "",
    flag: "",
  };
  if (!refrence) return returnResult;
  let { result, right_options, range } = refrence;
  switch (result) {
    case "result":
      if (right_options) {
        returnResult.color = right_options.includes(finalResult)
          ? "text-dark"
          : "text-danger p-1 border border-dark";
        returnResult.normalRange = right_options.join(" , ");
      }
      break;
    default:
      if (range.length == 1) {
        range = range[0];
        returnResult = getNormalRange(finalResult, range);
      } else if (range.length > 1) {
        let correctRange = range.find((item) => item?.correct);
        returnResult = getNormalRange(finalResult, correctRange);
        returnResult = {
          ...returnResult,
          normalRange: range
            .map((item) => {
              let { name = "", low = ">=", high = "<=" } = item;
              if (low != "" && high != "") {
                return (name ? `${name} : ` : "") + low + " - " + high;
              } else if (low == "") {
                return (name ? `${name} : ` : "") + " >= " + high;
              } else if (high == "") {
                return (name ? `${name} : ` : "") + low + " <= ";
              }
            })
            .join("<br>"),
        };
      }
      break;
  }
  return returnResult;
}

function showResult(visit, visitTests) {
  // add category if null
  visitTests = visitTests.map((vt) => {
    vt.category = vt.category ?? "Tests";
    return vt;
  });
  // sort by category
  visitTests = visitTests.sort((a, b) => {
    let type = JSON.parse(a?.options)?.type;
    //if (type == "calc") return 1;
    return a.category > b.category ? 1 : -1;
  });
  let result_tests = [];
  let category = "";
  let invoices = { normalTests: `` };
  // sort visit tests by category
  visitTests.forEach((test, index) => {
    let options = JSON.parse(test.options);
    let component = options.component;
    let value = options?.value;
    let result_test = JSON.parse(test.result_test);
    result_tests.push({
      name: test.name,
      result: result_test?.[test.name],
    });
    if (options.type == "type") {
      let font = options?.font ?? invoices?.font ?? "14px";
      let invoiceBody = "";
      let unit = options?.unit ?? "result";
      invoiceBody += `
            <div class="typetest test " data-flag="${unit}">
                <!-- عنوان التحليل ------------------>
                <p>${test.name}</p>
            </div>
            `;
      let type = "";

      for (let reference of component) {
        let editable = "";
        // let defualt = reference?.reference[0]?.range[0]?.low ?? '';
        let result = result_test?.[reference.name] ?? "";
        // reasult is array
        if (Array.isArray(result)) {
          result = result.slice(0, 3).join("<br>");
        }
        if (reference?.calc) {
          reference.eq = reference.eq.map((item) => {
            if (!isNaN(item)) {
              return item;
            } else if (!calcOperator.includes(item)) {
              item = result_test?.[item] ?? 0;
            }
            return item;
          });
          try {
            result = eval(reference.eq.join("")).toFixed(2);
          } catch (e) {
            result = 0;
          }
          editable = "readonly";
        }
        let defualt = "";
        let resultClass = "";
        let flag = "";
        let low = reference?.reference[0]?.range[0]?.low ?? "";
        let high = reference?.reference[0]?.range[0]?.high ?? "";
        if (low && high) {
          let fResult = normalTestRange(result, reference.reference[0]);
          resultClass = fResult.color;
          defualt = fResult.normalRange;
          flag = fResult.flag;
        } else if (low) {
          defualt = `${low} ${reference?.reference[0]?.unit ?? ""}`;
          let resultCompare = result
            .toString()
            .toUpperCase()
            .replace(/\s+/g, "");
          let defualtCompare = defualt
            .toString()
            .toUpperCase()
            .replace(/\s+/g, "");
          if (
            resultCompare === defualtCompare ||
            resultCompare === "" ||
            resultCompare === "ABSENT"
          ) {
            resultClass = "";
          } else {
            resultClass = "text-danger border border-dark";
            flag = "H";
          }
        }
        if (reference.type != type && reference.type != "Notes") {
          type = reference.type;
          invoiceBody += `
                        <div class="test strc-test row m-0 typetest sp" data-flag="${unit}">
                            <!-- تصنيف الجدول او اقسام الجدول ------------>

                            <div class="col-12" >
                                <p>${reference.type}</p>
                            </div>
                            
                        </div>
                    `;
        }
        if (reference.type == "Notes") {
          invoiceBody += `
                        <div class="test strc-test row m-0">
                            <!-- تصنيف الجدول او اقسام الجدول ------------>

                            <div class="testname col-12 data-flag="${unit}"">
                                <p>${reference.name}</p> : <p>${result}</p>
                            </div>
                        </div>
                    `;
        } else {
          invoiceBody += manageTestType(unit, {
            name: reference.name,
            result: result,
            color: resultClass,
            normal: defualt,
            unit: reference?.unit ?? "",
            flag: flag,
            font: font,
          });
        }
      }
      invoices[test.name.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "")] =
        invoiceBody;
    } else {
      if (category != test.category) {
        category = test.category;
        if (category) {
          invoices.normalTests += `
                        <div class="test typetest pt-3 category_${category
                          ?.split(" ")
                          ?.join("_")}">
                            <p class="w-100 text-center font-weight-bolder h-22">${category}</p>
                        </div>
                        `;
        }
      }

      let reference;
      if (result_test?.options !== undefined) {
        reference = result_test.options;
      } else {
        reference = component?.[0]?.reference;
        if (reference) {
          reference = filterWithKit(reference, test.kit_id);

          // filter with unit
          if (options.type != "calc") {
            reference = filterWithUnit(reference, test.unit);
          }

          // filter with age
          reference = filterWithAge(reference, visit.age, "عام");

          // filter with gender
          reference = filterWithGender(reference, visit.gender);
        }
      }

      let result = 0;
      try {
        result =
          options?.type == "calc"
            ? eval(
                value
                  .map((item) => {
                    if (!isNaN(item)) {
                      return item;
                    } else if (!calcOperator.includes(item)) {
                      let finalResult =
                        result_tests.find((test) => test.name == item)
                          ?.result ?? 0;
                      return finalResult == "" ? 0 : finalResult;
                    }
                    return item;
                  })
                  .join("")
              )
            : result_test?.[test.name];
        // toFixed 2
        result = result.toFixed(1);
      } catch (error) {
        // console.log(error);
      }

      let { color, normalRange, flag } = normalTestRange(
        result,
        reference?.[0]
      );
      invoices.normalTests += manageTestType("flag", {
        name: test.name,
        color: color,
        result: result,
        hash: test.hash,
        category: category,
        checked: result_test?.checked ?? true ? "flex" : "none",
        normal: normalRange,
        flag: flag,
        unit: `${
          reference?.[0]?.result == "result"
            ? ""
            : options?.type != "calc"
            ? test?.unit_name ?? ""
            : units.find((item) => reference?.[0]?.unit == item?.hash)?.name ??
              ""
        }`,
      });
    }
  });
  return {
    invoice: `${Object.entries(invoices)
      .map(([key, value]) => {
        return createInvoice(visit, key, value);
      })
      .join("")}`,
  };
}

function createInvoice(visit, type, form) {
  let header = invoiceHeader(workers);
  return `<div class="book-result" dir="ltr" id="invoice-${type}">
		<div class="page">
			<!-- صفحة يمكنك تكرارها -->
			${header}
			<div class="center2" ${
        invoices?.footer_header_show == 1
          ? 'style="border-top:5px solid #2e3f4c;"'
          : 'style="border-top:none;"'
      }>
                <div class="center2-background"></div>
				<div class="nav">
					<!-- شريط تخصص التحليل -->
					<div class="name">
						<p class="">Name</p>
					</div>
					<div class="namego">
						<p>${
              visit.age > 16
                ? visit.gender == "ذكر"
                  ? "السيد"
                  : "السيدة"
                : visit.gender == "ذكر"
                ? "الطفل"
                : "الطفلة"
            } / ${visit.name}</p>
					</div>
					<div class="paid">
						<p class="">Barcode</p>
					</div>
					<div class="paidgo d-flex justify-content-center align-items-center">
						<svg id="visit-${type}-code"></svg>
					</div>
                    <script>
                        JsBarcode("#visit-${type}-code", '${visit.hash}', {
                            width:1,
                            height:10,
                            displayValue: false
                        });
                    </script>
					<div class="agesex">
						<p class="">Sex / Age</p>
					</div>
					<div class="agesexgo">
						<p><span class="note">${
              visit.gender == "ذكر" ? "Male" : "Female"
            }</span> / <span class="note">${
    parseFloat(visit.age) < 1
      ? parseInt(visit.age * 356) + " Day"
      : parseInt(visit.age) + " Year"
  }</span></p>
					</div>
					<div class="vid">
						<p class="">Date</p>
					</div>
					<div class="vidgo">
						<p><span class="note">${
              visit.date
            }</span>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;<span
								class="note">${visit.time}</span></p>
					</div>
					<div class="refby">
						<p class="">By</p>
					</div>
					<div class="refbygo">
						<p>${invoices?.doing_by ?? "التحليل"}</p>
					</div>
					<div class="prd">
						<p class="">Doctor</p>
					</div>
					<div class="prdgo">
						<p><span class="note">${visit.doctor ?? ""}</span></p>
					</div>
				</div>

				<div class="tester">
					<!-- دف الخاص بالتحليل الدي سيكرر حسب نوع التحليل ------------------>


					${form}


				</div>


			</div>

			<div class="footer2" ${
        invoices?.footer_header_show == 1
          ? 'style="border-top:5px solid #2e3f4c;"'
          : 'style="border-top:none;"'
      }>
				<div class="f1">
					<p>${
            invoices?.address
              ? `<i class="fas fa-map-marker-alt"></i> ${invoices?.address}`
              : ""
          }</p>
				</div>
				<div class="f2">
					<p><span class="note">${
            invoices?.facebook == ""
              ? ""
              : `&nbsp;&nbsp;&nbsp;&nbsp;<i class="fas fa-envelope"></i>  ${invoices?.facebook} &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;`
          }</span>
                    <span class="note">${
                      invoices?.phone_1 == ""
                        ? ""
                        : `<i class="fas fa-phone"></i>  ${invoices?.phone_1}`
                    }</span></p>
				</div>
			</div>
		</div>


	</div>`;
}

function convertAgeToDays(age, unit) {
  switch (unit) {
    case "عام":
      return age * 365;
    case "شهر":
      return age * 30;
    case "يوم":
      return age;
  }
}

function filterWithKit(reference, kit) {
  return reference.filter((ref) => {
    if (
      kit == "" ||
      kit == null ||
      kit == undefined ||
      ref.kit == "" ||
      ref.kit == null ||
      ref.kit == undefined
    ) {
      return true;
    }
    if (kit == ref.kit) {
      return true;
    } else {
      return false;
    }
  });
}

function filterWithUnit(reference, unit) {
  return reference.filter((ref) => {
    if (
      unit == ref.unit ||
      ref.unit == "" ||
      ref.unit == null ||
      ref.unit == undefined
    ) {
      return true;
    } else if (ref.kit == "" || ref.kit == null || ref.kit == undefined) {
      return true;
    } else {
      return false;
    }
  });
}

function filterWithAge(reference, age, unit) {
  let days = convertAgeToDays(age, unit);
  return reference.filter((ref) => {
    let ageLow = convertAgeToDays(ref["age low"], ref["age unit low"]);
    let ageHigh = convertAgeToDays(ref["age high"], ref["age unit high"]);

    if (days >= ageLow && days <= ageHigh) {
      return true;
    } else {
      return false;
    }
  });
}

function filterWithGender(reference, gender) {
  return reference.filter((ref) => {
    if (gender == ref.gender) {
      return true;
    } else if (ref.gender == "كلاهما") {
      return true;
    } else {
      return false;
    }
  });
}

function manageRange(reference) {
  return (
    reference?.[0]?.range
      .map((range) => {
        let normalRange = "";
        let { name = "", low = "", high = "" } = range;
        if (low != "" && high != "") {
          normalRange = (name ? `${name} : ` : "") + low + " - " + high;
        } else if (low == "") {
          normalRange = (name ? `${name} : ` : "") + " >= " + high;
        } else if (high == "") {
          normalRange = (name ? `${name} : ` : "") + low + " <= ";
        }
        return normalRange;
      })
      .join("<br>") ?? `range : no Range`
  );
}

function invoiceHeader(worker) {
  const workersCount = worker.length;
  switch (workersCount) {
    case 0:
      return `
            <div class="header">
                <div class="row justify-content-around">
                    <div class="logo col-4 p-2">
                        <!-- شعار التحليل -->
                        <img src="${invoices?.logo ?? ""}" alt="${
        invoices?.logo ?? "upload Logo"
      }">
                    </div>
                    <div class="logo justify-content-end col-4 p-2">
                        <!-- شعار التحليل -->
                        <h2 class="navbar-brand-name text-center">${
                          invoices?.name_in_invoice ??
                          localStorage.lab_name ??
                          ""
                        }</h2>
                    </div>
                </div>
            </div>
            `;
    case 1:
      return `
            <div class="header">
                <div class="row justify-content-between">
                    <div class="logo col-4 p-2">
                        <!-- شعار التحليل -->
                        <img src="${invoices?.logo ?? ""}" alt="${
        invoices?.logo ?? "upload Logo"
      }">
                    </div>
                    <div class="right col-4">
                        <!-- عنوان جانب الايمن -->
                        <div class="size1">
                        <p class="title">${workers?.[0]?.jop ?? "Jop title"}</p>
                        <p class="namet">${
                          workers?.[0]?.name ?? "Worker name"
                        }</p>
                        <p class="certificate">${
                          workers?.[0]?.jop_en ?? "Jop En title"
                        }</p>
                        </div>

                        <div class="size2">

                        </div>
                    </div>
                </div>
            </div>
            `;
    case 2:
      return `
            <div class="header">
                <div class="row">
                    <div class="left col-4">
                        <!-- عنوان جانب الايسر -->
                        <div class="size1">
                            <p class="title">${
                              workers?.[1]?.jop ?? "Jop title"
                            }</p>
                            <p class="namet">${
                              workers?.[1]?.name ?? "Worker name"
                            }</p>
                            <p class="certificate">${
                              workers?.[1]?.jop_en ?? "Jop En title"
                            }</p>
                        </div>

                        <div class="size2">

                        </div>
                    </div>

                    <div class="logo col-4 p-2">
                        <!-- شعار التحليل -->
                        <img src="${invoices?.logo ?? ""}" alt="${
        invoices?.logo ?? "upload Logo"
      }">
                    </div>
                    <div class="right col-4">
                        <!-- عنوان جانب الايمن -->
                        <div class="size1">
                        <p class="title">${workers?.[0]?.jop ?? "Jop title"}</p>
                        <p class="namet">${
                          workers?.[0]?.name ?? "Worker name"
                        }</p>
                        <p class="certificate">${
                          workers?.[0]?.jop_en ?? "Jop En title"
                        }</p>
                        </div>

                        <div class="size2">

                        </div>
                    </div>
                </div>
            </div>
            `;
    case 3:
      return `
            <div class="header">
                <div class="row">
                    <div class="logo col-3 p-2">
                        <!-- شعار التحليل -->
                        <img src="${invoices?.logo ?? ""}" alt="${
        invoices?.logo ?? "upload Logo"
      }">
                    </div>
                    ${workers
                      ?.map((worker, index) => {
                        return `
                                <div class="col-cus-md-4 my-3">
        
                                    <p class="title">${
                                      worker?.jop ?? "Jop title"
                                    }</p>
                                    <p class="namet">${
                                      worker?.name ?? "Worker name"
                                    }</p>
                                    <p class="certificate">${
                                      worker?.jop_en ?? "Jop En title"
                                    }</p>
                                </div>
                                `;
                      })
                      .join("")}
                    
                </div>
            </div>
            `;
    case 4:
      return `
            <div class="header d-flex justify-content-center">
                <div class="row">
                    <div class="logo col-cus-md-5 p-2">
                        <!-- شعار التحليل -->
                        <img src="${invoices?.logo ?? ""}" alt="${
        invoices?.logo ?? "upload Logo"
      }">
                    </div>
                    ${workers
                      ?.map((worker, index) => {
                        return `
                        <div class="col-cus-md-5 my-3">

                            <p class="title">${worker?.jop ?? "Jop title"}</p>
                            <p class="namet">${
                              worker?.name ?? "Worker name"
                            }</p>
                            <p class="certificate">${
                              worker?.jop_en ?? "Jop En title"
                            }</p>
                        </div>
                        `;
                      })
                      .join("")}
                </div>
            </div>
            `;

    case 5:
      return `
            <div class="header d-flex justify-content-center">
                <div class="row">
                    <div class="logo col-cus-md-6 p-2">
                        <!-- شعار التحليل -->
                        <img src="${invoices?.logo ?? ""}" alt="${
        invoices?.logo ?? "upload Logo"
      }">
                    </div>
                    ${workers
                      ?.map((worker, index) => {
                        return `
                        <div class="col-cus-md-6 my-3">

                            <p class="title">${worker?.jop ?? "Jop title"}</p>
                            <p class="namet">${
                              worker?.name ?? "Worker name"
                            }</p>
                            <p class="certificate">${
                              worker?.jop_en ?? "Jop En title"
                            }</p>
                        </div>
                        `;
                      })
                      .join("")}
                </div>
            </div>
            `;
    default:
      break;
  }
}
