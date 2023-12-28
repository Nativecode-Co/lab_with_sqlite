const labHash = localStorage.getItem("lab_hash");

const initInvoiceItem = {
  name: "",
  unit: "",
  result: "",
  range: [],
  flag: "",
};

const InvoiceItemReducer = (state, action) => {
  switch (action.type) {
    case "NAMEANDUNIT":
      return { ...state, name: action.payload.name, unit: action.payload.unit };
    case "RESULT":
      if (action.payload)
        return { ...state, result: action.payload[state.name] };
      else return { ...state, result: "" };
    case "RANGE":
      return { ...state, range: action.payload };
    case "FLAG":
      return { ...state, flag: action.payload };
    default:
      return state;
  }
};

const initSetting = {
  testStyle: {
    borderStyle: {
      // transparent
      color: "#000000",
      width: "0",
    },
    border: `0px solid #000000`,
    padding: "0px",
    margin: "0px",
    fontSize: "",
  },
};

const SettingReducer = (state, action) => {
  switch (action.type) {
    case "TESTSTYLE":
      return { ...state, testStyle: action.payload };
    default:
      return state;
  }
};

const InvoiceItem = ({ test, invoice, settingState }) => {
  const [state, dispatch] = React.useReducer(
    InvoiceItemReducer,
    initInvoiceItem
  );
  React.useEffect(() => {
    const {
      hash,
      name,
      unit_name,
      options,
      result_test,
      unit,
      kit_id,
      category,
    } = test;
    dispatch({ type: "NAMEANDUNIT", payload: { name, unit: unit_name } });
    let result = JSON.parse(result_test);
    dispatch({ type: "RESULT", payload: result });
    let component = JSON.parse(options);
    if (component) {
      let { reference } = component.component[0];
      reference = reference.filter((ref, index) => {
        return index == 0; // (ref.unit == unit && ref.kit == kit_id);
      });
      if (reference.length > 0) {
        let { range } = reference[0];
        dispatch({ type: "RANGE", payload: range });
        let correctRange = range.filter((r) => {
          return r.correct;
        });
        if (correctRange.length > 0) {
          let { low, high } = correctRange[0];
          // check if result is in range
          if (state.result < low) {
            dispatch({ type: "FLAG", payload: "L" });
          }
          if (state.result > high) {
            dispatch({ type: "FLAG", payload: "H" });
          }
        }
      }
    }
  }, []);

  return (
    <div
      data-flag="flag"
      className="test row m-0 category_Tests border-test"
      id={`test_normal`}
      data-cat="Tests"
      style={{ display: "flex", ...settingState.testStyle }}
    >
      <div className="testname col-3">
        <p
          className="text-right w-100"
          style={{
            fontSize: settingState.testStyle.fontSize,
            color: invoice.font_color,
          }}
        >
          {state.name}
        </p>
      </div>
      <div className="testresult col-2">
        <p
          className={`w-100 text-center ${
            state.flag ? "p-1 border border-dark" : ""
          } ${
            state.flag == "L"
              ? "text-info"
              : state.flag == "H"
              ? "text-danger"
              : "text-dark"
          }`}
          style={{
            fontSize: settingState.testStyle.fontSize,
            color: invoice.font_color,
          }}
        >
          {state.result}
        </p>
      </div>
      <div className="testresult col-2">
        <p
          className={`w-75 text-center ${
            state.flag == "L"
              ? "text-info"
              : state.flag == "H"
              ? "text-danger"
              : "text-dark"
          }`}
          style={{
            fontSize: settingState.testStyle.fontSize,
            color: invoice.font_color,
          }}
        >
          {state.flag}
        </p>
      </div>
      <div className="testresult col-2">
        <p
          style={{
            fontSize: settingState.testStyle.fontSize,
            color: invoice.font_color,
          }}
        >
          {" "}
          {state.unit}
        </p>
      </div>
      <div className="testnormal col-3">
        {state.range.map((r, index) => {
          const { name, low, high } = r;
          if (low && high) {
            return (
              <p
                className="text-right w-100"
                key={index}
                style={{
                  fontSize: settingState.testStyle.fontSize,
                  color: invoice.font_color,
                }}
              >
                {name && `${name}:`}
                {low} - {high}
              </p>
            );
          } else if (low) {
            return (
              <p
                className="text-right w-100"
                key={index}
                style={{
                  fontSize: settingState.testStyle.fontSize,
                  color: invoice.font_color,
                }}
              >
                {name && `${name}:`} {low} &lt;=
              </p>
            );
          } else if (high) {
            return (
              <p
                className="text-right w-100"
                key={index}
                style={{
                  fontSize: settingState.testStyle.fontSize,
                  color: invoice.font_color,
                }}
              >
                {name && `${name}:`}&lt;= {high}
              </p>
            );
          }
        })}
      </div>
      <div className="testprice col-12 h5 text-right text-info"></div>
    </div>
  );
};

const Invoice = ({ tests, invoice, settingState, employees }) => {
  const testerRef = React.useRef(null);

  return (
    <div className="book-result" dir="ltr" id="invoice-normalTests" style={{}}>
      <div className="page">
        <InvoiceHeader invoice={invoice} employees={employees} />

        <div
          className="center2"
          style={{
            borderTop: "5px solid rgb(46, 63, 76)",
            height: invoice.center + "px",
          }} // height: ${center}px;
        >
          <div
            className="center2-background"
            style={{
              backgroundImage: `url(${invoice.logo})`,
              display: invoice.water_mark == "1" ? "" : "none",
            }} // style="background-image: url(&quot;${logo}&quot;); display: none;"
          ></div>
          <div className="nav">
            <div className="name">
              <p className="">Name</p>
            </div>
            <div className="namego">
              <p>السيد / اسم المريض</p>
            </div>
            <div className="paid">
              <p className="">Barcode</p>
            </div>
            <div className="paidgo d-flex justify-content-center align-items-center"></div>
            <div className="agesex">
              <p className="">Sex / Age</p>
            </div>
            <div className="agesexgo">
              <p>
                <span className="note">Male</span> /{" "}
                <span className="note">100 Year</span>
              </p>
            </div>
            <div className="vid">
              <p className="">Date</p>
            </div>
            <div className="vidgo">
              <p>
                <span className="note">2023-01-01</span>
              </p>
            </div>
            <div className="refby">
              <p className="">By</p>
            </div>
            <div className="refbygo">
              <p>{invoice.doing_by}</p>
            </div>
            <div className="prd">
              <p className="">Doctor</p>
            </div>
            <div className="prdgo">
              <p>
                <span className="note">مريض خارجي</span>
              </p>
            </div>
          </div>

          <div
            className="tester"
            style={{
              fontSize: invoice.font_size + "px",
              color: invoice.font_color,
            }}
          >
            <div
              className="testhead row sections m-0 mt-2 category_category"
              style={{
                backgroundColor: invoice.color,
              }}
            >
              <div className="col-3">
                <p
                  className="text-right"
                  style={{
                    fontSize: invoice.font_size + "px",
                    color: invoice.font_color,
                  }}
                >
                  Test Name
                </p>
              </div>
              <div className="col-2 justify-content-between">
                <p
                  className="text-center w-75"
                  style={{
                    fontSize: invoice.font_size + "px",
                    color: invoice.font_color,
                  }}
                >
                  Result
                </p>
              </div>
              <div className="col-2 justify-content-between">
                <p
                  className="text-center w-75"
                  style={{
                    fontSize: invoice.font_size + "px",
                    color: invoice.font_color,
                  }}
                >
                  Flag
                </p>
              </div>
              <div className="col-2">
                <p
                  className="text-right"
                  style={{
                    fontSize: invoice.font_size + "px",
                    color: invoice.font_color,
                  }}
                >
                  Unit
                </p>
              </div>
              <div className="col-3">
                <p
                  className="text-right"
                  style={{
                    fontSize: invoice.font_size + "px",
                    color: invoice.font_color,
                  }}
                >
                  Normal Range
                </p>
              </div>
            </div>
            <div className="test typetest pt-3 category_Tests">
              <p className="w-100 text-center font-weight-bolder h-22">Tests</p>
            </div>
            {tests.map((test, index) => {
              return (
                <InvoiceItem
                  test={test}
                  key={test.hash}
                  invoice={invoice}
                  settingState={settingState}
                />
              );
            })}
          </div>
        </div>

        <div
          className="footer2"
          style={{
            borderTop: " 5px solid rgb(46, 63, 76)",
            height: invoice.footer + "px",
          }}
        >
          <div
            className="f1"
            style={{ display: invoice.footer_header_show == "1" ? "" : "none" }} // "display: ${footer_header_show == '1' ? '' : 'none'};"
          >
            {invoice.address && (
              <p>
                <i className="fas fa-map-marker-alt"></i>
                {invoice.address}
              </p>
            )}
          </div>
          <div
            className="f2"
            style={{ display: invoice.footer_header_show == "1" ? "" : "none" }} // "display: ${footer_header_show == '1' ? '' : 'none'};"
          >
            <p>
              {invoice.facebook && (
                <span className="note">
                  <i className="fas fa-envelope"></i> {invoice.facebook}|
                </span>
              )}
              {invoice.phone_1 && (
                <span className="note">
                  <i className="fas fa-phone"></i> {invoice.phone_1}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Setting = ({ dispatch, state, invoice, setInvoice }) => {
  const [file, setFile] = React.useState(null);
  const [oldFile, setOldFile] = React.useState(null);

  const updateInvoice = async () => {
    let sessionOrderOfHeader = sessionStorage.getItem("orderOfHeader");
    let formData = new FormData();
    let newFile = null;
    if (file) {
      await handelUpload(file)
        .then((e) => e.json())
        .then((res) => {
          newFile = res.data;
          setInvoice({ ...invoice, logo: res.data });
        });
    }
    for (let key in invoice) {
      if (
        key == "setting" &&
        sessionOrderOfHeader !== "null" &&
        sessionOrderOfHeader !== null &&
        sessionOrderOfHeader !== undefined &&
        sessionOrderOfHeader !== "undefined"
      ) {
        let setting = JSON.parse(invoice[key]);
        setting = {
          ...setting,
          orderOfHeader: sessionStorage.getItem("orderOfHeader"),
        };
        formData.append(key, JSON.stringify(setting));
        break;
      }
      formData.append(key, invoice[key]);
    }
    if (newFile) {
      formData.append("logo", newFile);
    }
    await fetch(`${base_url}Invoice/update`, {
      method: "POST",
      body: formData,
    })
      .then((e) => e.json())
      .then((res) => {
        niceSwal("success", "top-end", "تم تحديث الفاتورة بنجاح");
      })
      .catch((e) => console.log(e));
  };

  const handelUpload = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${base_url}Upload/uploadSingle`, {
      method: "POST",
      body: formData,
    });
  };

  React.useEffect(() => {
    setOldFile(invoice.logo);
  }, [invoice]);

  return (
    <div className="row">
      <div className="col-12">
        <div className="statbox widget box box-shadow bg-white h-100">
          <div
            className="widget-content widget-content-area m-auto"
            style={{ width: "95%" }}
          >
            <form id="invoice_form" className="row justify-content-center my-4">
              <div className="form-group col-md-6">
                <label htmlFor="name_in_invoice">اسم الفاتورة</label>
                <input
                  type="text"
                  className="form-control"
                  id="name_in_invoice"
                  name="name_in_invoice"
                  onChange={(e) => {
                    let value = e.target.value;
                    // check if value have ' or ` or " or \ or /
                    if (
                      value.includes("'") ||
                      value.includes("`") ||
                      value.includes('"') ||
                      value.includes("\\") ||
                      value.includes("/")
                    ) {
                      niceSwal(
                        "error",
                        "top-end",
                        "لا يمكن ادخال هذه العلامات"
                      );
                      e.target.value = invoice.name_in_invoice;
                      return;
                    }
                    setInvoice({ ...invoice, name_in_invoice: e.target.value });
                  }}
                  value={invoice.name_in_invoice}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="font_size">حجم الخط</label>
                <input
                  type="number"
                  className="form-control"
                  id="font_size"
                  name="font_size"
                  onChange={(e) => {
                    setInvoice({ ...invoice, font_size: e.target.value });
                    dispatch({
                      type: "TESTSTYLE",
                      payload: {
                        ...state.testStyle,
                        fontSize: e.target.value + "px",
                      },
                    });
                  }}
                  value={invoice.font_size}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="color">لون الفاتورة</label>
                <input
                  type="color"
                  className="form-control"
                  id="color"
                  name="color"
                  onChange={(e) => {
                    setInvoice({ ...invoice, color: e.target.value });
                  }}
                  value={invoice.color}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="font_color">لون الخط</label>
                <input
                  type="color"
                  className="form-control"
                  id="font_color"
                  name="font_color"
                  onChange={(e) => {
                    setInvoice({ ...invoice, font_color: e.target.value });
                  }}
                  value={invoice.font_color}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="doing_by">المسؤول عن الفاتورة</label>
                <input
                  type="text"
                  className="form-control"
                  id="doing_by"
                  name="doing_by"
                  onChange={(e) => {
                    setInvoice({ ...invoice, doing_by: e.target.value });
                  }}
                  value={invoice.doing_by}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="phone_2">
                  حجم عنصر الرأس (
                  <span className="text-danger">علما ان الحجم الكلي 12</span>)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="phone_2"
                  name="phone_2"
                  onChange={(e) => {
                    // max 12 min 0
                    if (e.target.value > 12) {
                      e.target.value = 12;
                    }
                    if (e.target.value < 0) {
                      e.target.value = 0;
                    }
                    setInvoice({ ...invoice, phone_2: e.target.value });
                  }}
                  value={invoice.phone_2}
                />
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="phone_1">رقم الهاتف</label>
                <input
                  type="text"
                  className="form-control"
                  id="phone_1"
                  name="phone_1"
                  onChange={(e) => {
                    setInvoice({ ...invoice, phone_1: e.target.value });
                  }}
                  value={invoice.phone_1}
                />
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="address">العنوان</label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  name="address"
                  onChange={(e) => {
                    setInvoice({ ...invoice, address: e.target.value });
                  }}
                  value={invoice.address}
                />
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="facebook">الايميل</label>
                <input
                  type="text"
                  className="form-control"
                  id="facebook"
                  name="facebook"
                  onChange={(e) => {
                    setInvoice({ ...invoice, facebook: e.target.value });
                  }}
                  value={invoice.facebook}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="header">الرأس</label>
                <input
                  type="number"
                  className="form-control"
                  id="header"
                  name="header"
                  onChange={(e) => {
                    setInvoice({
                      ...invoice,
                      header: e.target.value,
                      center:
                        1495 -
                        (parseInt(e.target.value) + parseInt(invoice.footer)),
                    });
                  }}
                  value={invoice.header}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="footer">الذيل</label>
                <input
                  type="number"
                  className="form-control"
                  id="footer"
                  name="footer"
                  onChange={(e) => {
                    setInvoice({
                      ...invoice,
                      footer: e.target.value,
                      center:
                        1495 -
                        (parseInt(e.target.value) + parseInt(invoice.header)),
                    });
                  }}
                  value={invoice.footer}
                />
              </div>
              <div className="form-group col-md-12">
                <label htmlFor="center">المركز</label>
                <input
                  type="number"
                  className="form-control"
                  id="center"
                  name="center"
                  disabled={true}
                  onChange={(e) => {
                    setInvoice({ ...invoice, center: e.target.value });
                  }}
                  value={invoice.center}
                />
              </div>
              <div className="form-group  col-md-6">
                <label
                  htmlFor="footer_header_show"
                  className="w-100 text-center"
                >
                  اظهار - اخفاء الفورمة
                </label>
                <label className="d-flex switch s-icons s-outline s-outline-success mx-auto mt-2">
                  <input
                    type="checkbox"
                    name="footer_header_show"
                    id="footer_header_show"
                    onChange={(e) => {
                      // print checed value
                      setInvoice({
                        ...invoice,
                        footer_header_show: e.target.checked ? "1" : "0",
                      });
                    }}
                    checked={invoice.footer_header_show == "1" ? true : false}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="form-group  col-md-6">
                <label htmlFor="water_mark" className="w-100 text-center">
                  اظهار واخفاء العلامة المائية
                </label>
                <label className="d-flex switch s-icons s-outline s-outline-success mx-auto mt-2">
                  <input
                    type="checkbox"
                    name="water_mark"
                    id="water_mark"
                    onChange={(e) => {
                      setInvoice({
                        ...invoice,
                        water_mark: e.target.checked ? "1" : "0",
                      });
                    }}
                    checked={invoice.water_mark == "1" ? true : false}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="invoice_about_ar">
                  عنوان فاتورة الدفع(بالغة العربية)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="invoice_about_ar"
                  name="invoice_about_ar"
                  onChange={(e) => {
                    setInvoice({
                      ...invoice,
                      invoice_about_ar: e.target.value,
                    });
                  }}
                  value={invoice.invoice_about_ar}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="invoice_about_en">
                  عنوان فاتورة الدفع(بالغة الانجليزية)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="invoice_about_en"
                  name="invoice_about_en"
                  onChange={(e) => {
                    setInvoice({
                      ...invoice,
                      invoice_about_en: e.target.value,
                    });
                  }}
                  value={invoice.invoice_about_en}
                />
              </div>
              <div className="form-group col-md-12">
                <label htmlFor="logo">شعار الفاتورة</label>
                <input
                  type="file"
                  className="form-control"
                  id="logo"
                  name="logo"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    setOldFile(URL.createObjectURL(e.target.files[0]));
                  }}
                />
                <div className="justify-content-center row">
                  <img src={oldFile} style={{ maxHeight: "400px" }} />
                </div>
              </div>

              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                <button
                  type="button"
                  className="btn btn-primary w-100 mb-3"
                  onClick={() => {
                    updateInvoice();
                  }}
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* <div className="col-12 mt-4">
        <div className="statbox widget box box-shadow bg-white h-100">
          <div
            className="widget-content widget-content-area m-auto"
            style={{ width: "95%" }}
          >
            <form>
              <h1 className="text-center">Test Style</h1>
              <div className="form-group">
                <label htmlFor="testStyle">Border Style</label>
                <div className="row">
                  <div className="col-4">
                    <input
                      type="color"
                      className="form-control"
                      id="testStyle"
                      onChange={(e) =>
                        dispatch({
                          type: "TESTSTYLE",
                          payload: {
                            ...state.testStyle,
                            borderStyle: {
                              ...state.testStyle.borderStyle,
                              color: e.target.value,
                            },
                            border: `${state.testStyle.borderStyle.width}px solid ${e.target.value}`,
                          },
                        })
                      }
                      value={state.testStyle.borderStyle.color}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="number"
                      className="form-control"
                      id="testStyle"
                      onChange={(e) => {
                        dispatch({
                          type: "TESTSTYLE",
                          payload: {
                            ...state.testStyle,
                            borderStyle: {
                              ...state.testStyle.borderStyle,
                              width: e.target.value,
                            },
                            border: `${e.target.value}px solid ${state.testStyle.borderStyle.color}`,
                          },
                        });
                      }}
                      value={state.testStyle.borderStyle.width}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="number"
                      className="form-control"
                      id="testStyle"
                      onChange={(e) => {
                        dispatch({
                          type: "TESTSTYLE",
                          payload: {
                            ...state.testStyle,
                            padding: `${e.target.value}px`,
                          },
                        });
                      }}
                      value={state.testStyle.padding.split("px")[0]}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div> */}
    </div>
  );
};

const InvoiceSetting = () => {
  const [state, dispatch] = React.useReducer(SettingReducer, initSetting);

  const [invoice, setInvoice] = React.useState({});
  const [tests, setTests] = React.useState([]);
  const [employees, setEmployees] = React.useState([]);

  const fetchTests = () => {
    // let data = run(`select
    //               option_test as options,
    //               test_name as name,
    //               kit_id,
    //               (select name from devices where devices.id=lab_device_id) as device_name,
    //               (select name from kits where kits.id =kit_id) as kit_name,
    //               (select name from lab_test_units where hash=lab_pakage_tests.unit) as unit_name,
    //               (select name from lab_test_catigory where hash=lab_test.category_hash) as category,
    //               unit,
    //               result_test,
    //               lab_visits_tests.hash as hash
    //           from
    //               lab_visits_tests
    //           left join
    //               lab_pakage_tests
    //           on
    //               lab_pakage_tests.test_id = lab_visits_tests.tests_id and lab_pakage_tests.package_id = lab_visits_tests.package_id
    //           inner join
    //               lab_test
    //           on
    //               lab_test.hash = lab_visits_tests.tests_id
    //           where
    //               visit_id = '16921880982072694'
    //           order by sort;`).result[0].query0;
    let data = [
      {
        category: null,
        device_name: null,
        hash: "16926989898618351",
        kit_id: "0",
        kit_name: null,
        name: "Anti-GAD",
        options: `{"component": [{"name": "Anti-GAD", "unit": "", "result": "number", "options": [], "shortcut": "", "reference": [{"kit": "374", "note": "", "unit": "16532504169056114", "range": [{"low": "", "high": "10", "name": "Nonreactive", "correct": true}, {"low": "10", "high": "", "name": "Reactive", "correct": false}], "gender": "كلاهما", "result": "number", "age low": "0", "options": [], "age high": "100", "age unit low": "عام", "age unit high": "عام", "right_options": []}, {"kit": "", "note": "", "unit": "16538664737994960", "range": [{"low": "", "high": "5", "name": "", "correct": false}], "gender": "كلاهما", "result": "number", "age low": "0", "options": [], "age high": "1000", "age unit low": "عام", "age unit high": "عام", "right_options": []}]}]}`,
        result_test: `{"checked": true, "options": [{"kit": "", "note": "", "unit": "16538664737994960", "range": [{"low": "", "high": "5", "name": "", "correct": false}], "gender": "كلاهما", "result": "number", "age low": "0", "options": [], "age high": "1000", "age unit low": "عام", "age unit high": "عام", "right_options": []}], "Anti-GAD": "8"}`,
        unit: "16538664737994960",
        unit_name: "U/mL",
      },
    ];
    setTests(data);
  };

  const fetchEmployees = () => {
    let data = run(
      `SELECT * from lab_invoice_worker where lab_hash='${labHash}' and is_available=1 and isdeleted=0 limit 5;`
    ).result[0].query0;
    setEmployees(data);
  };

  const fetchInvoice = async () => {
    let data = await fetch(`${base_url}Invoice/get_or_create?hash=${labHash}`)
      .then((e) => e.json())
      .then((res) => {
        if (!res.data.phone_2) {
          res.data.phone_2 = 4;
        }
        setInvoice(res.data);
        let setting = JSON.parse(res.data.setting);
        sessionStorage.setItem("orderOfHeader", setting.orderOfHeader);
      });
  };

  React.useEffect(() => {
    fetchInvoice();
    fetchEmployees();
    fetchTests();
  }, []);
  return (
    <div
      className="row invoice layout-spacing justify-content-center"
      dir="rtl"
    >
      <div className="col-6">
        <Setting
          dispatch={dispatch}
          state={state}
          invoice={invoice}
          setInvoice={setInvoice}
        />
      </div>
      <div className="col-6">
        <Invoice
          tests={tests.slice(0, 1)}
          invoice={invoice}
          settingState={state}
          employees={employees}
        />
      </div>
    </div>
  );
};

const InvoiceHeader = ({ invoice, employees }) => {
  const [order, setOrder] = React.useState([]);
  const [employeesOrder, setEmployeesOrder] = React.useState([]);

  React.useEffect(() => {
    $(function () {
      $("#sortable").sortable({
        update: function (event, ui) {
          let newOrder = $("#sortable").sortable("toArray", {
            attribute: "data-hash",
          });
          setOrder(newOrder);
          sessionStorage.setItem("orderOfHeader", JSON.stringify(newOrder));
        },
      });
    });
  }, []);

  React.useEffect(() => {
    let numburs = 0;
    if (
      sessionStorage.getItem("orderOfHeader") != undefined &&
      sessionStorage.getItem("orderOfHeader") != "undefined"
    ) {
      numburs = JSON.parse(sessionStorage.getItem("orderOfHeader"));
      if (numburs) {
        numburs = numburs.length;
      } else {
        numburs = 0;
      }
    }

    if (employees.length + 1 == numburs) {
      let newOrder = JSON.parse(sessionStorage.getItem("orderOfHeader"));
      setOrder(newOrder);
      // order employees in employeesOrder
      let newEmployeesOrder = [];
      newOrder.forEach((hash) => {
        if (hash == "logo") {
          newEmployeesOrder.push({ hash: "logo" });
          return;
        }
        employees.find((employee) => {
          if (employee.hash == hash) {
            newEmployeesOrder.push(employee);
          }
        });
      });
      if (newEmployeesOrder.length == 1) {
        newEmployeesOrder = [...newEmployeesOrder, ...employees];
      }
      setEmployeesOrder(newEmployeesOrder);
    } else {
      let newEmployeesOrder = [{ hash: "logo" }, ...employees];
      setEmployeesOrder(newEmployeesOrder);
    }
  }, [employees]);

  return (
    <div
      className="header"
      style={{
        height: invoice.header + "px",
      }}
    >
      <div
        className={`row ${
          employees.length > 0
            ? "justify-content-between"
            : "justify-content-center"
        }`}
        id="sortable"
        style={{ display: invoice.footer_header_show == "1" ? "" : "none" }}
      >
        {employeesOrder.length > 1 ? (
          employeesOrder.map((employee, index) => {
            if (!employee) return;
            if (employee.hash == "logo") {
              return (
                <div
                  className={`logo col-${invoice.phone_2}  p-2`}
                  data-hash="logo"
                  key={index}
                >
                  <img src={invoice.logo} alt="" />
                </div>
              );
            }
            return (
              <div
                className={`right col-${invoice.phone_2}`}
                data-hash={employee.hash}
                key={employee.hash}
              >
                <div className="size1">
                  <p className="title">{employee.jop}</p>
                  <p
                    className="namet"
                    style={{
                      color: invoice.color,
                    }}
                  >
                    {employee.name}
                  </p>
                  <p className="certificate">{employee.jop_en}</p>
                </div>

                <div className="size2"></div>
              </div>
            );
          })
        ) : (
          <React.Fragment>
            <div
              className={`logo col-${invoice.phone_2}  p-2`}
              data-hash="logo"
            >
              <img src={invoice.logo} alt="" />
            </div>
            <div
              className={`logo col-${invoice.phone_2}  p-2`}
              data-hash="logo"
            >
              <h1>{invoice.name_in_invoice}</h1>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render(<InvoiceSetting />);
