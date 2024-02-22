import React from "react";

const InvoiceHeader = ({ invoice }) => {
  const [order, setOrder] = React.useState([]);
  const [workers, setWorkers] = React.useState([]);

  React.useEffect(() => {}, []);

  return (
    <div
      className="header"
      style={{
        height: invoice.header + "px",
      }}
    >
      <div
        className={`row ${
          workers.length > 0
            ? "justify-content-between"
            : "justify-content-center"
        } uk-sortable border border-danger p-1`}
        id="sortable"
        data-uk-sortable
        style={{ display: invoice.footer_header_show == "1" ? "" : "none" }}
      >
        {workers.length > 0 ? (
          workers.map((employee, index) => {
            if (!employee) return;
            if (employee.hash == "logo") {
              return (
                <div
                  className={`logo  border p-2`}
                  id="logo"
                  key={index}
                  style={{
                    flex: `0 0 ${invoice.phone_2}%`,
                    "max-width": `${invoice.phone_2}%`,
                  }}
                >
                  <img src={invoice.logo} alt="" />
                </div>
              );
            }
            return (
              <div
                className={`right  border`}
                id={employee.hash}
                key={employee.hash}
                style={{
                  flex: `0 0 ${invoice.phone_2}%`,
                  "max-width": `${invoice.phone_2}%`,
                }}
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
            <div className={`logo  border p-2`} id="logo">
              <img src={invoice.logo} alt="" />
            </div>
            <div className={`logo  border p-2`} id="logo">
              <h1>{invoice.name_in_invoice}</h1>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default InvoiceHeader;
