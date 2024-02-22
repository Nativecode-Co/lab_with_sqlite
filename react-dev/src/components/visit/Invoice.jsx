import React from "react";
import InvoiceHeader from "./InvoiceHeader";
import { getInvoice } from "../../services/invoice";

const Invoice = () => {
  const [invoice, setInvoice] = React.useState({});
  const [tests, setTests] = React.useState([]);

  React.useEffect(() => {
    getInvoice().then((res) => {
      setInvoice(res.data);
    });
  }, []);
  return (
    <div className="book-result" dir="ltr" id="invoice-normalTests">
      <div className="page">
        <InvoiceHeader invoice={invoice} />
        <div
          className="center2"
          style={{
            borderTop: "5px solid rgb(46, 63, 76)",
            height: invoice.center + "px",
          }}
        >
          <div
            className="center2-background"
            style={{
              backgroundImage: `url(${invoice.logo})`,
              display: invoice.water_mark == "1" ? "" : "none",
            }}
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
            style={{ display: invoice.footer_header_show == "1" ? "" : "none" }}
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
            style={{ display: invoice.footer_header_show == "1" ? "" : "none" }}
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

export default Invoice;
