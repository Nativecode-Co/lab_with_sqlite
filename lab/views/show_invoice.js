const calcOperator = ["+", "-", "*", "/", "(", ")", "Math.log10("];
let workers;
let invoices;

const urlParams = new URLSearchParams(window.location.search);
const pk = urlParams.get("pk").split("-")[0];
const number = urlParams.get("pk").split("-")[1];
showAddResult(pk);

function getApi(baseLink = "app", url = "", type = "GET", data = {}) {
  let res = null;

  $.ajax({
    url:
      baseLink === "app"
        ? `http://localhost:8807/app/index.php${url}`
        : `${api_url}${url}`,
    type,
    data,
    dataType: "JSON",
    async: false,
    success: (result) => {
      res = result;
    },
    error: (e) => {
      console.log(e.responseText);
    },
  });
  return res;
}

function hideHederelments() {
  // get headers elements has class test and typetest not have class sp
  const headersElements = document.querySelectorAll(".test.typetest:not(.sp)");
  for (const test of headersElements) {
    const classes = test.classList;
    const category = Array.from(classes).find((c) => c.includes("category_"));
    let categoryElements = document.querySelectorAll(`.${category}`);
    // filter if category is visible
    categoryElements = Array.from(categoryElements).filter(
      (c) => c.style.display !== "none"
    );
    if (categoryElements.length <= 1) {
      test.style.display = "none";
    }
  }
}

function createBarCode(code) {
  JsBarcode(`#visit-code`, `${code}`, {
    width: 2,
    height: 20,
    displayValue: false,
  });
}
function showAddResult(hash) {
  const workSpace = document.getElementById("root");
  const invoice = showResult(hash).invoice;
  const invoiceData = getApi("api", "/invoice/get");
  const html = `
    <div class="col-md-12 mt-48">
        ${invoice}
    </div>
        `;
  workSpace.innerHTML = html;
  hideHederelments();
  createBarCode(hash);
  setInvoiceStyle(invoiceData);
}

// Create a function for setting a variable value
function set_var(_var, value) {
  const r = document.querySelector(":root");
  r.style.setProperty(_var, value);
}

function manageHead(type) {
  switch (type) {
    case "result":
      return `
            <div class="testhead row sections m-0 mt-2 category_category">
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
            <div class="testhead row sections m-0 mt-2 category_category">
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
            <div class="testhead row sections m-0 mt-2 category_category">
                <div class="col-3 pr-0">
                    <p class="text-right">Test Name</p>
                </div>
                <div class="col-3 pr-0 justify-content-between">
                    <p class="text-center w-100">Result</p>
                </div>
                <div class="col-1 pr-0 justify-content-between">
                    <p class="text-center w-100">Flag</p>
                </div>
                <div class="col-2 pr-0">
                    <p class="text-right">Unit</p>
                </div>
                <div class="col-3 pr-0">
                    <p class="text-right">Normal Range</p>
                </div>
            </div>
            `;
    default:
      return `
            <div class="row m-0 mt-2 sections">
                <!-- تصنيف الجدول او اقسام الجدول --------------------------------------------------------------------------------------->

                <div class="col-1 text-right">
                    <p>#</p>
                </div>
                <div class="col-9 text-right">
                    <p>Analysis Type</p>
                </div>
                <div class="col-2 text-right">
                    <p class="doctor-name">Price</p>
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
    history,
    hidden,
    dependOn,
    allResults,
  } = test;
  result = result && result !== "undefined" ? result : "";
  let htmlHestory = "";
  if (invoices?.history === "1") {
    if (history !== "" && history && history !== "{}") {
      htmlHestory = `<div class="testprice col-12 h5 text-right text-info">
        ${history} ${history !== "" ? unit : ""}
      </div>`;
    }
  }

  switch (type) {
    case "flag":
      return `
            <div data-flag="flag" class="test row m-0 category_${category
              ?.split(" ")
              ?.join(
                "_"
              )} border-test" id="test_normal_${hash}" data-cat="${category
        ?.split(" ")
        ?.join("_")}" style="display:${checked}">
                <div class="testname col-3">
                    <p class="text-right w-100">${name}</p>
                </div>
                <div class="testresult result-field col-3">
                    <p class="${color} w-100 text-center">${result}</p>
                </div>
                <div class="testresult col-1">
                    ${
                      name == "Blood Group (ABO)"
                        ? ""
                        : `<p class="${
                            color.includes("text-danger")
                              ? "text-danger"
                              : color.includes("text-info")
                              ? "text-info"
                              : ""
                          } w-100 text-center">${flag}</p>`
                    }
                </div>
                <div class="testresult col-2">
                    <p> ${unit}</p>
                </div>
                <div class="testnormal col-3 text-right" contenteditable="true">
                    <p class="text-right" contenteditable="true">${normal}</p>
                </div>
                ${htmlHestory}
            </div>
            `;
    case "unit":
      return `
            <div style="font-size:${font} !important" data-flag="unit" class="test strc-test row m-0">
                    <div class="testname col-4">
                        <p>${name}</p>
                    </div>
                    <div class="testresult result-field col-4 justify-content-center">
                        <p class="w-75 text-center ${color}">${result.toString()} </p>
                        <!--<span class="text-info">${history.toString()}</span>-->
                    </div>
                    <div class="testname col-2" >
                        <p>${unit ?? ""}</p>
                    </div>
                    <div class="testnormal col-2">
                        <p contenteditable="true">${normal}</p>
                    </div>
                </div>
            `;
    case "result":
      return `
            <div style="font-size:${font} !important" data-flag="result" class="test strc-test row m-0">
                    <div class="testname col-4">
                        <p>${name}</p>
                    </div>
                    <div class="testresult result-field col-6 justify-content-center">
                        <p class="w-75 text-center ${color}">${result.toString()} </p>
                        <!--<span class="text-info">${history.toString()}</span>-->
                    </div>
                    <div class="testnormal col-2">
                        <p contenteditable="true">${normal}</p>
                    </div>
                </div>`;
    case "notes":
      return `
            <div class="strc-test row m-0">
                <div class="testname col-12">
                    <p class="text-right pr-2">${result}</p>
                </div>
            </div>
            `;
    case "culture":
      const showClass = `flex-dependon-show-${name.split(" ").join("-")}`;
      const italic = color === "italic" ? "font-style: italic;" : "";
      let hiddenClass = hidden;
      dependOn
        ? dependOn.map((depend) => {
            const { name, when } = depend;
            const d = allResults?.[name] ?? "";
            hiddenClass = d.includes(when) ? "false" : "true";
          })
        : null;
      let isSusceptibility = ["resisteant", "sensitive"].includes(
        name.toLocaleLowerCase()
      );
      return `
            <div 
              style="font-size:${font} !important;display:${
        hiddenClass === "true" ? "none" : "flex"
      }"
              data-flag="result" 
              class="test strc-test row m-0 border-test ${showClass} ${
        isSusceptibility ? "w-50" : ""
      }
            ">
              <div class="testname col-6">
                  <p class="text-right">${name}</p>
              </div>
              <div class="testresult result-field col-6 justify-content-center ">
                  <p style="${italic}" class="w-75 text-right">${result.toString()} </p>
              </div>
            </div>`;
    default:
      break;
  }
}
function setInvoiceStyle(invoice) {
  const style = document.createElement("style");
  // $(".sections").css("border-bottom", `2px solid ${invoice.color}`);
  style.innerHTML = `
    .sections {
      border-bottom: 2px solid ${invoice.color};
    }
  `;

  // change .center2-background background-image
  if (Number(invoice.water_mark) === 1) {
    // $(".center2-background").css("background-image", `url('${invoice.logo}')`);
    style.innerHTML += `
      .center2-background {
        background-image: url('${invoice.logo}');
      }
    `;
  } else {
    style.innerHTML += `
      .center2-background {
        background-image: none;
      }
    `;
  }
  style.innerHTML += `
    .namet {
      color: ${invoice.color};
    }
    .page .header {
      height: ${invoice.header}px;
    }
    .page .footer2 {
      height: ${invoice.footer - 5}px;
    }
    .page .center2 {
      height: ${invoice.center - 15}px;
    }
    .page .center {
      height: ${invoice.center}px;
    }
  `;
  set_var("--color-orange", invoice.color);
  set_var("--invoice-color", invoice.font_color);
  document.head.appendChild(style);
}

function getNormalRange(finalResult = "", range = []) {
  let { normalRange, color, flag } = {
    normalRange: "No Range",
    color: "dark",
    flag: "",
  };
  const { name = "", low = "", high = "" } = range;
  if (low !== "" && high !== "") {
    normalRange = `${(name ? `${name} : ` : "") + low} - ${high}`;
  } else if (low === "") {
    normalRange = `${name ? `${name} : ` : ""} <= ${high}`;
  } else if (high === "") {
    normalRange = `${(name ? `${name} : ` : "") + low} <= `;
  }
  try {
    let numers = finalResult.match(/\d+/g);
    if (numers) {
      finalResult = numers.join(".");
    }
  } catch (e) {
    console.log(e);
  }
  if (parseFloat(finalResult) < parseFloat(low)) {
    color = "text-info bg-dark-75";
    flag = "L";
  } else if (parseFloat(finalResult) > parseFloat(high)) {
    color = "text-danger bg-dark-75";
    flag = "H";
  } else {
    color = "text-dark";
    flag = "";
  }
  return { normalRange, color, flag };
}

function normalTestRange(finalResult, refrence) {
  let returnResult = {
    color: "text-dark",
    normalRange: "",
    flag: "",
  };
  if (!refrence) return returnResult;
  let { result_type: result, right_options, range } = refrence;
  switch (result) {
    case "result":
      finalResult = finalResult === "" ? right_options[0] : finalResult;
      if (right_options) {
        returnResult.color = right_options.includes(finalResult)
          ? "text-dark"
          : "text-danger p-1 border border-dark";
        returnResult.flag = right_options.includes(finalResult) ? "" : "H";
        returnResult.normalRange = right_options.join(" , ");
      }
      break;
    default:
      if (range.length === 1) {
        range = range[0];
        returnResult = getNormalRange(finalResult, range);
      } else if (range.length > 1) {
        const correctRange = range.find((item) => item?.correct);
        returnResult = getNormalRange(finalResult, correctRange);
        returnResult = {
          ...returnResult,
          normalRange: range
            .map((item) => {
              const { name = "", low = "<=", high = "<=" } = item;
              if (low !== "" && high !== "") {
                return `<span>${
                  (name ? `${name} : ` : "") + low
                } - ${high}</span>`;
              }
              if (low === "") {
                return `<span>${name ? `${name} : ` : ""} <= ${high}</span>`;
              }
              if (high === "") {
                return `<span>${(name ? `${name} : ` : "") + low} <= </span>`;
              }
            })
            .join("<br>"),
        };
      }
      break;
  }
  return returnResult;
}

function showResult(hash) {
  const visit = getApi("api", "/visit/get_visit", "GET", { hash });

  const tests = visit.tests;
  const history = getApi("app", "/Visit/history", "POST", {
    date: visit.date,
    patient: visit.patient_hash,
  }).data;

  const { invoice, ...invoiceItems } = createInvoiceItems(visit);
  invoiceItems.invoice = invoice;
  const result_tests = tests.reduce((acc, test) => {
    if (test.option_test.type === "type") {
      acc[test.name] = test.result;
    } else {
      acc[test.name] = test.result[test.name];
    }
    return acc;
  }, {});
  let category = "";
  const invoices = { normalTests: "" };
  const buttons = {};
  const results = {};
  let height = 0;
  let normalTests = manageHead("flag");
  const defaultHeight = (invoice.center ?? 1200) - 250;
  tests.forEach((test, index) => {
    const reference = test.option_test;

    if (reference.type === "type") {
      const result_test = test.result;
      const options = test.option_test;
      const font = options?.font ?? invoices?.font ?? "16px";
      const idName = test.name.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "");
      let invoiceBody = "";
      const unit = options?.unit ?? "result";
      invoiceBody += `
            <div class="typetest test " data-flag="${unit}">
                <p>${test.name}</p>
            </div>
            `;
      let type = "";
      for (const reference of options.component) {
        let result = test.result?.[reference.name] ?? "";
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
            result = isFinite(result) ? (isNaN(result) ? "*" : result) : "*";
          } catch (e) {
            result = 0;
          }
          results[reference.name] = result;
          editable = "readonly";
        }
        let defualt = "";
        let resultClass = "";
        let flag = "";
        let {
          low = "",
          high = "",
          infinit = "",
        } = reference?.reference[0]?.range[0];
        if (infinit !== "" || (low && high)) {
          const fResult = normalTestRange(result, reference.reference[0]);
          resultClass = fResult.color;
          defualt = fResult.normalRange;
          flag = fResult.flag;
        } else if (low) {
          defualt = `${low} ${reference?.reference[0]?.unit ?? ""}`;
          const resultCompare = result
            .toString()
            .toUpperCase()
            .replace(/\s+/g, "");
          const defualtCompare = defualt
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
        if (reference.type !== type && reference.type !== "Notes") {
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
        if (reference.type === "Notes") {
          invoiceBody += `
                        <div class="test strc-test row m-0">
                            <!-- تصنيف الجدول او اقسام الجدول ------------>

                            <div class="testname col-12" data-flag="${unit}">
                                <p>${reference.name}</p> : <p class="text-danger">${result}</p>
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
            history: "",
          });
        }
      }
      invoices[test.name.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "")] =
        invoiceBody;
    } else if (reference.type === "culture") {
      const { name, option_test: options } = test;
      const idName = name.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "");
      let invoiceBody = "";
      invoiceBody += `
            <div class="typetest test">
                <p>${name}</p>
            </div>
            `;
      let type = "";
      for (const reference of options.component) {
        const result = test.result?.[reference.name] ?? "";
        let finalResult = "";
        const typeOfResult = reference?.result ?? "result";
        switch (typeOfResult) {
          case "result":
            if (Array.isArray(result)) {
              finalResult = result.join("<br>");
            } else {
              finalResult = result;
            }
            break;
          case "multi":
            // if result is Array
            if (Array.isArray(result)) {
              finalResult = "";
              for (const obj of result) {
                for (const [key, value] of Object.entries(obj)) {
                  finalResult += ` ${value} `;
                }
                finalResult += "<br>";
              }
            }
            break;
          default:
            finalResult = result;
            break;
        }
        if (reference.type !== type && reference.type !== "Notes") {
          type = reference.type;
          const isSusceptibility = reference.type === "Susceptibility";
          invoiceBody += `
          </div><div class="test strc-test row m-0 typetest sp">
              <div class="col-12 px-0">
                  <p style="font-size: 22px;">${reference.type}</p>
              </div>
          </div> <div class="${isSusceptibility ? "row" : ""}">`;
        }
        if (reference.type === "Notes") {
          invoiceBody += `
          </div><div class="test strc-test row m-0 typetest sp">
              <div class="col-12 px-0">
                  <p style="font-size: 22px;">${reference.name}</p>
              </div>
          </div><div>`;
        }
        const testType = manageTestType(
          reference.type === "Notes" ? "notes" : "culture",
          {
            name: reference.name,
            result: finalResult,
            color: reference.italic,
            normal: "",
            unit: reference?.unit ?? "",
            flag: "",
            font: "18px",
            history: "",
            hidden: reference.hidden,
            dependOn: reference.dependOn,
            allResults: test.result,
          }
        );
        invoiceBody += testType;
      }
      invoices[idName] = invoiceBody;
    } else {
      if (height + reference.height >= defaultHeight) {
        invoices.normalTests += createInvoice(normalTests, invoiceItems);
        normalTests = manageHead("flag");
        if (category !== test.category) {
          height = 50;
        } else {
          if (category) {
            const classCategory = category.split(" ").join("_");
            normalTests += `
                          <div class="test typetest category_${classCategory}">
                              <p class="w-100 text-center font-weight-bolder h-22">${category}</p>
                          </div>
                          `;
          }
          height = 102;
        }
      } else {
        height += Number(reference.height);
      }
      if (buttons?.normalTests ?? true) {
        buttons.normalTests = `<div class="col-auto">
            <button class="action btn btn-action mx-2 w-100" id="test-normalTests" onclick="getCurrentInvoice($(this))">التحاليل</button>
        </div>`;
      }
      if (category !== test.category) {
        height += 51.91;
        category = test.category;
        if (category) {
          const classCategory = category.split(" ").join("_");
          normalTests += `
                        <div class="test typetest category_${classCategory}">
                            <p class="w-100 text-center font-weight-bolder h-22">${category}</p>
                        </div>
                        `;
        }
      }
      let result = test.result[test.name];
      if (reference.type === "calc") {
        let evaluatedResult = 0;
        try {
          evaluatedResult = eval(
            reference.value
              .map((item) => {
                // check if item is number
                if (!isNaN(item)) {
                  return item;
                }
                if (!calcOperator.includes(item)) {
                  let newValue = result_tests?.[item] ?? 0;
                  newValue = newValue === "" ? 0 : newValue;
                  return newValue;
                }
                return item;
              })
              .join("")
          );
        } catch (e) {}
        result = evaluatedResult.toFixed(1);
      }

      const { color, normalRange, flag } = normalTestRange(result, reference);
      normalTests += manageTestType("flag", {
        name: test.name,
        color: color,
        result: result,
        hash: test.hash,
        category: category,
        checked:
          test.result?.checked === "false" || test.result?.checked === false
            ? "none"
            : "flex",
        normal: normalRange,
        flag: flag,
        history: history.find((item) => item.name == test.name)?.result ?? "",
        unit: test.unit_name ?? "",
      });
    }
  });
  return {
    buttons: `<div class="row justify-content-center mb-30" id="invoice-tests-buttons">
                    ${Object.values(buttons).join("")}
                </div>`,
    invoice: `${Object.entries(invoices)
      .map(([key, value]) => {
        if (key === "normalTests") {
          if (normalTests === manageHead("flag")) return "";
          const form = value + createInvoice(normalTests, invoiceItems);
          return createBookResult(form, key);
        }
        return createBookResult(createInvoice(value, invoiceItems), key);
      })
      .join("")}`,
  };
}

function invoiceHeader(invoice) {
  let html = "";
  const {
    size,
    workers,
    logo,
    name_in_invoice,
    show_name,
    show_logo,
    invoice_about_ar,
    invoice_about_en,
  } = invoice;
  if (workers.length > 0) {
    html = workers
      .map((worker) => {
        if (worker.hash == "logo") {
          return `
          <div 
            class="logo p-2 ${show_logo == "1" ? "d-flex" : "d-none"}" 
            style="flex: 0 0 ${size}%;max-width: ${size}%;"
          >
          <img src="${logo}" alt="" />
        </div>
        `;
        }
        if (worker.hash == "name") {
          return `
          <div class="right ${show_name == "1" ? "d-flex" : "d-none"}" style="
          flex: 0 0 ${size}%;
          max-width: ${size}%;
        ">
            <!-- عنوان جانب الايمن -->
            <div class="size1">
                <p class="title">${name_in_invoice}</p>
                <p class="namet">${invoice_about_ar}</p>
                <p class="certificate">${invoice_about_en}</p>
            </div>
        </div>
          
        `;
        }
        return `
        <div class="right" style="
        flex: 0 0 ${size}%;
        max-width: ${size}%;
      ">
          <div class="size1">
            <p class="title">${worker.jop ?? "Jop title"}</p>
            <p class="namet">${worker.name ?? "Worker name"}</p>
            <p class="certificate">${worker.jop_en ?? "Jop En title"}</p>
          </div>
        </div>
        `;
      })
      .join("");
  } else {
    html = `
        <div class="logo col-6 p-2 ${show_logo == "1" ? "d-flex" : "d-none"}">
            <img src="${logo ?? ""}"
            alt="${logo ?? "upload Logo"}">
        </div>
        <div class="right col-6 ${show_name == "1" ? "d-flex" : "d-none"}">
            <!-- عنوان جانب الايمن -->
            <div class="size1">
                <p class="title">${
                  invoices?.name_in_invoice ??
                  localStorage?.lab_name ??
                  "اسم التحليل"
                }</p>
                <p class="namet">${
                  localStorage?.invoice_about_ar ?? "للتحليلات المرضية المتقدمة"
                }</p>
                <p class="certificate">${
                  localStorage?.invoice_about_en ??
                  "Medical Lab for Pathological Analyses"
                }</p>
            </div>
        </div>`;
  }
  return `
    <div class="header">
        <div class="row justify-content-between align-items-center h-100">
            ${html}
        </div>
    </div>
  `;
}

function createBookResult(invoices, type) {
  return `<div class="book-result" dir="ltr" id="invoice-${type}">
            ${invoices}
          </div>`;
}

function createInvoiceItems(visit) {
  const invoice = getApi("api", "/invoice/get");
  const displayHeaderAndFooter = invoice.footer_header_show === "1";
  const random = Math.floor(Math.random() * 1000000);
  const header = invoiceHeader(invoice);
  const nav = `
  <div class="nav">
    <div class="name">
      <p class="">Name</p>
    </div>
    <div class="namego">
      <p>
        ${
          visit.age > 16
            ? visit.gender === "ذكر"
              ? "السيد"
              : "السيدة"
            : visit.gender === "ذكر"
            ? "الطفل"
            : "الطفلة"
        } / ${visit.name}
      </p>
    </div>
    <div class="paid">
      <p class="">Barcode</p>
    </div>
    <div class="paidgo d-flex justify-content-center align-items-center">
      <svg id="visit-code"></svg>
    </div>
    <div class="agesex">
      <p class="">Sex / Age</p>
    </div>
    <div class="agesexgo">
      <p>
        <span class="note">
        ${
          visit.gender === "ذكر" ? "Male" : "Female"
        }</span> / <span class="note">${
    parseFloat(visit.age) < 1
      ? `${parseInt(visit.age * 356)} Day`
      : `${parseInt(visit.age)} Year`
  }
        </span>
      </p>
    </div>
    <div class="vid">
      <p class="">Date</p>
    </div>
    <div class="vidgo">
      <p>
        <span class="note">${visit.date}</span>
      </p>
    </div>
    <div class="refby">
      <p class="">By</p>
    </div>
    <div class="refbygo">
      <p>${invoice.doing_by ?? "التحليل"}</p>
    </div>
    <div class="prd">
      <p class="">Doctor</p>
    </div>
    <div class="prdgo">
      <p><span class="note">${
        visit.doctor === "تحويل من مختبر اخر" ? "" : `${visit.doctor ?? ""}`
      }</span></p>
    </div>
  </div>
  `;
  const footer = `
  <div class="footer2">
    <div class="f1" style="display: ${
      displayHeaderAndFooter ? "flex" : "none"
    }">
      <p>${
        invoice.address
          ? `<i class="fas fa-map-marker-alt"></i> ${invoice.address}`
          : ""
      }</p>
    </div>
    <div class="f2" style="display: ${
      displayHeaderAndFooter ? "flex" : "none"
    }">
      <p>
        <span class="note">${
          invoice.facebook === ""
            ? ""
            : `<i class="fas fa-envelope"></i>  ${invoice.facebook}`
        }</span>
        <span class="note">${
          invoice.phone_1 === ""
            ? ""
            : `<i class="fas fa-phone"></i> &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;  ${invoice.phone_1}`
        }</span>
      </p>
    </div>
  </div>
  `;
  return { header, nav, footer, invoice };
}

function createInvoice(form, items) {
  const { header, nav, footer, invoice } = items;
  return `
		<div class="page">
			${header}
			<div class="center2">
        <div class="center2-background"></div>
        ${nav}
				<div class="tester">
					${form}
				</div>
			</div>
      ${footer}
		</div>`;
}
