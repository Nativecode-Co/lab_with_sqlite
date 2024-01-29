function setTable() {
  return $(`#screen`).DataTable({
    processing: true,
    serverSide: true,
    serverMethod: "post",
    ajax: {
      url: `${base_url}Visit/getScreenDetail`,
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      dataSrc: function (json) {
        return json.data;
      },
    },
    columns: [
      {
        data: "name",
        name: "name",
      },
      {
        data: "status",
        name: "status",
        render: function (data, type, row) {
          switch (row.status_id) {
            case "3":
              return ` <span class="badge badge-success">${data}</span>`;
            case "5":
              return `<span class="badge badge-warning">${data}</span>`;

            case "2":
              return `<span class="badge badge-info">${data}</span>`;

            default:
              return ` <span class="badge badge-success">${data}</span>`;
          }
        },
      },
    ],
    // add table title
    dom:
      "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",

    // stop length change
    lengthChange: false,
    // stop search box
    searching: false,
    // stop pagination
    paging: false,
    // stop info
    info: false,
  });
}

const App = () => {
  return (
    <React.Fragment>
      <Header />
      <Table />
    </React.Fragment>
  );
};

const Table = () => {
  const [dataTable, setDataTable] = React.useState(null);
  const [refresh, setRefresh] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      if (dataTable) {
        dataTable.ajax.reload();
      }
      setRefresh(!refresh);
    }, 5000);
  }, [refresh]);

  React.useEffect(() => {
    run("select count(*) from lab_visits;");
    const table = setTable();
    setDataTable(table);
  }, []);
  return (
    <div className="row layout-spacing">
      <div className="col-lg-12">
        <div className="statbox widget box box-shadow bg-white">
          <div
            className="widget-content widget-content-area m-auto"
            style={{ width: "95%" }}
          >
            <table id="screen" className="style1">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const [name, setName] = React.useState("NativeCode");

  React.useEffect(() => {
    const { data } = fetchData("Invoice/getLabName", "Get", {});
    setName(data.name);
    setTable_1("table");
  }, []);
  return (
    <div className="header-container">
      <header className="header navbar navbar-expand-sm">
        <a
          type="button"
          className="sidebarCollapse"
          data-placement="bottom"
        ></a>

        <div className="nav-logo align-self-center">
          <a className="navbar-brand" href="index.html">
            <img
              alt="logo"
              src="assets/image/flask.png"
              className="navbar-logo"
            />
            <span className="navbar-brand-name">{name}</span>
          </a>
        </div>

        <ul className="navbar-item topbar-navigation">
          <div className="topbar-nav header navbar" role="banner">
            <nav id="topbar">
              <ul className="navbar-nav theme-brand flex-row  text-center">
                <li className="nav-item theme-logo">
                  <a href="index.html">
                    <img
                      src="assets/image/90x90.png"
                      className="navbar-logo"
                      alt="logo"
                    />
                  </a>
                </li>
                <li className="nav-item theme-text">
                  <a href="index.html" className="nav-link">
                    {" "}
                    Nativecode{" "}
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </ul>
      </header>
    </div>
  );
};

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render(<App />);
