"use strict";

let oldTests = [];

let _tests = run_both(
  `select hash,test_name as name from lab_test where test_type<>'3';`
).result[0].query0.filter((test) => {
  return !oldTests.includes(test.hash);
});
class PackageTest extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_test-table",
      `${base_url}Packages/getPackagesForLab`,
      () => {
        return { lab_id: localStorage.getItem("lab_hash") };
      },
      [
        {
          data: "null",
          render: function (data, type, row) {
            return `<span onclick="updateTest('${row.hash}')">${row.name}</span>`;
          },
        },
        {
          data: "null",
          render: function (data, type, row) {
            return `<div class="d-none d-print-block-inline">${row.cost}</div><input type="text" id="${row.hash}_cost" data_hash="${row.hash}" class="form-control text-center" name="cost" value="${row.cost}" onblur="updatePackageDetail('${row.hash}')">`;
          },
        },
        {
          data: "null",
          render: function (data, type, row) {
            return `<div class="d-none d-print-block-inline">${row.price}</div><input type="text" id="${row.hash}_price" data_hash="${row.hash}" class="form-control text-center" name="price" value="${row.price}" onblur="updatePackageDetail('${row.hash}')">`;
          },
        },
        {
          data: "null",
          render: function (data, type, row) {
            return `<span onclick="updateTest('${row.hash}')">${
              row.device_name ? row.device_name : "NO device"
            }</span>`;
          },
        },
        {
          data: "null",
          render: function (data, type, row) {
            return `<span onclick="updateTest('${row.hash}')">${
              row.kit_name ? row.kit_name : "NO Kit"
            }</span>`;
          },
        },
        {
          data: "null",
          render: function (data, type, row) {
            return `<span onclick="updateTest('${row.hash}')">${
              row.unit_name ? row.unit_name : "NO Unit"
            }</span>`;
          },
        },
        {
          data: null,
          className: "center not-print",
          render: function (data, type, row) {
            return `
                        <a class="text-info" onclick="addRefrence('${row.test_id}','${row.unit}');">
                          <i class="far fa-plus-circle fa-lg mx-2"></i>
                        </a>
                        <a class="text-success" onclick="updateNormal('${row.test_id}','${row.kit_id}','${row.unit}')">
                          <i class="fas fa-syringe fa-lg mx-2"></i>
                        </a>
                        <a class="text-success" onclick="updateTest('${row.hash}')"><i class="fa-lg mx-2 fas fa-edit"></i></a>
                        <a class="text-danger" onclick="fireSwal(deleteTest, '${row.hash}')"><i class="fa-lg mx-2 far fa-trash-alt"></i></a>
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
  addRow(row) {
    oldTests.push(row.test_id);

    if (this.dataTable.row(`#${row.hash}`)[0].length == 0) {
      this.dataTable.row
        .add({
          0: row.name,
          1: row.cost,
          2: row.price,
          3:
            row.device_name == "" || row.device_name == null
              ? "No Device"
              : row.device_name,
          4:
            row.kit_name == "" || row.kit_name == null
              ? "No Kit"
              : row.kit_name,
          5:
            row.unit_name == "" || row.unit_name == null
              ? "No Unit"
              : row.unit_name,
          6: `
                <a class="btn-action" onclick="updateTest('${row.hash}')"><i class="fas fa-edit"></i></a>
                <a class="btn-action delete" onclick="fireSwal(deleteTest, '${row.hash}')"><i class="far fa-trash-alt"></i></a>
                `,
          7: "",
        })
        .node().id = row.hash;
      this.dataTable.draw();
    }
  }

  mainCondition() {
    return `where lab_package.lab_id='${localStorage.getItem(
      "lab_hash"
    )}' and catigory_id ='9' and  lab_package.isdeleted='0'`;
  }

  pageCondition() {
    return `select count(*) as count from lab_package inner join lab_pakage_tests on lab_package.hash=lab_pakage_tests.package_id where lab_package.lab_id='${localStorage.getItem(
      "lab_hash"
    )}' and catigory_id ='9';`;
  }

  orderByQuery() {
    return "";
  }

  getQuery(resetQuery) {
    return `
            select
                lab_package.hash as hash,
                lab_device_id,
                kit_id,
                test_id,
                unit,
                lab_package.name as name,
                lab_package.price as price,
                lab_package.cost as cost,
                (select name from kits where id=lab_pakage_tests.kit_id) as kit_name,
                (select name from devices where id=lab_pakage_tests.lab_device_id) as device_name,
                (select name from lab_test_units where hash = lab_pakage_tests.unit) as unit_name
            from lab_package
            inner join lab_pakage_tests on lab_package.hash=lab_pakage_tests.package_id
            ${resetQuery};
        `;
  }

  itemQuery(hash) {
    return `where lab_package.hash='${hash}'`;
  }

  havingQuery(value) {
    return `having lab_package.name like '%${value}%'`;
  }
}

class Package extends PackageTest {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_package-table",
      `${base_url}Packages/getOffersForLab`,
      () => {
        return { lab_id: localStorage.getItem("lab_hash") };
      },
      [
        {
          data: "null",
          render: function (data, type, row) {
            return `<span onclick="updatePackage('${row.hash}')">${row.name}</span>`;
          },
        },
        {
          data: "null",
          render: function (data, type, row) {
            return `<div class="d-none d-print-block-inline">${row.cost}</div><input type="text" id="${row.hash}_cost" data_hash="${row.hash}" class="form-control text-center" name="cost" value="${row.cost}" onblur="updatePackageDetail('${row.hash}')">`;
          },
        },
        {
          data: "null",
          render: function (data, type, row) {
            return `<div class="d-none d-print-block-inline">${row.price}</div><input type="text" id="${row.hash}_price" data_hash="${row.hash}" class="form-control text-center" name="price" value="${row.price}" onblur="updatePackageDetail('${row.hash}')">`;
          },
        },
        {
          data: null,
          className: "center not-print",
          render: function (data, type, row) {
            return `
                        <a class="btn-action" onclick="updatePackage('${row.hash}')"><i class="fas fa-edit"></i></a>
                        <a class="btn-action delete" onclick="fireSwal(deletePackage, '${row.hash}')"><i class="far fa-trash-alt"></i></a>
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

  addRow(row) {
    if (this.dataTable.row(`#${row.hash}`)[0].length == 0) {
      this.dataTable.row
        .add({
          0: row.name,
          1: row.cost,
          2: row.price,
          3: `
                <a class="btn-action" onclick="updatePackage('${row.hash}')"><i class="fas fa-edit"></i></a>
                <a class="btn-action delete" onclick="fireSwal(deletePackage, '${row.hash}')"><i class="far fa-trash-alt"></i></a>
                `,
          4: "",
        })
        .node().id = row.hash;
      this.dataTable.draw();
    }
  }

  mainCondition() {
    return `where lab_package.lab_id='${localStorage.getItem(
      "lab_hash"
    )}' and catigory_id ='8' and ${this.table}.isdeleted='0'`;
  }

  getQuery(resetQuery) {
    return `
            select
                hash,
                name,
                price,
                cost
            from lab_package
            ${resetQuery};
        `;
  }
}

class Tests extends Factory {
  addRow(row) {
    // console.log row name first letter;
    let firstLetter = row.name.charAt(0).toUpperCase();
    // if firstLetter is not letter then set it to ' ';
    if (!firstLetter.match(/[a-z]/i)) {
      firstLetter = "التحاليل";
    }
    if ($(`#col-${firstLetter}`).length == 0) {
      $("#row-tests").append(`
                <div class="col-12">
                    <div class="test-col-header">${firstLetter}</div>
                    <div class="row flex-row-reverse" id="col-${firstLetter}">

                    </div>
                </div>
            `);
    }
    // show test name with checkbox
    if ($(`#test_${row.hash}`).length == 0) {
      $(`#col-${firstLetter}`).append(`
                <div class="n-chk col-auto">
                    <label class="new-control new-checkbox new-checkbox-rounded checkbox-success form-check test-col p-3" >
                    <input type="radio" class="new-control-input" type="radio" name="test" value="${row.hash}" id="test_${row.hash}" data-name="${row.name}" data-hash="${row.hash}" onclick="setNameAndHash($(this))">
                    <span class="new-control-indicator m-3"></span><p class="ml-4 mb-0">${row.name}</p>
                    </label>
                </div>
            `);
    }
  }

  init() {
    this.createTableBody(_tests);
    // this.createTableBody(this.getAll());
  }

  orderByQuery() {
    return "order by test_name";
  }

  getQuery(resetQuery) {
    return `
            select
                hash,
                test_name as name
            from lab_test
            ${resetQuery};
        `;
  }

  // havingQuery(value){
  //     return `having test_name like '%${value}%'`;
  // }

  pageCondition() {
    return ``;
  }
}

class PackageTests extends Tests {
  createTableBody(data, dataTable = false) {
    for (let row of data) {
      this.addRow(row);
    }
  }
  addRow(row) {
    // console.log row name first letter;
    let firstLetter = row.name.charAt(0).toUpperCase();
    // if firstLetter is not letter then set it to ' ';
    if (!firstLetter.match(/[a-z]/i)) {
      firstLetter = "التحاليل";
    }
    if ($(`#col-package-${firstLetter}`).length == 0) {
      $("#row-packages").append(`
                <div class="col-12">
                    <div class="test-col-header">${firstLetter}</div>
                    <div class="row flex-row-reverse" id="col-package-${firstLetter}">

                    </div>
                </div>
            `);
    }
    // show test name with checkbox
    $(`#col-package-${firstLetter}`).append(`
                <div class="n-chk col-auto">
                    <label class="new-control new-checkbox new-checkbox-rounded checkbox-success form-check test-col p-3" >
                    <input type="checkbox" class="new-control-input" onclick="changeCost('${row.hash}', this)" type="checkbox" value="${row.hash}" id="test_${row.hash}" data-kit="${row.kit_id}" data-cost="${row.cost}" data-device="${row.lab_device_id}" data-test="${row.test_id}" data-unit="${row.unit}">
                    <span class="new-control-indicator m-3"></span><p class="ml-4 mb-0">(<span class="text-danger">${row.device_name}</span>)-${row.name}</p>
                    </label>
                </div>
        `);
  }

  limitQuery(page = 0) {
    return ``;
  }

  init() {
    // this.createTableBody(_tests);
    this.createTableBody(this.getAll());
  }

  orderByQuery() {
    return "order by name";
  }

  mainCondition() {
    return `where lab_package.lab_id='${localStorage.getItem(
      "lab_hash"
    )}' and catigory_id ='9' and lab_package.isdeleted='0'`;
  }

  getQuery(resetQuery) {
    return `
            select
                lab_package.hash as hash,
                name, price, cost,
                test_id, unit, lab_device_id, kit_id,
                (select DISTINCT name from devices where id=lab_pakage_tests.lab_device_id) as device_name
            from lab_package
            inner join lab_pakage_tests on lab_package.hash = lab_pakage_tests.package_id
            ${resetQuery};
        `;
  }

  havingQuery(value) {
    return `having name like '%${value}%'`;
  }

  itemQuery(hash) {
    return `where lab_package.hash='${hash}'`;
  }
}

let lab_test = new PackageTest("lab_test", " مجموعة", []);
let lab_package = new Package("lab_package", " مجموعة", []);
let allTests = new Tests("lab_test", " اختبار", []);
let allPAckages = new PackageTests("lab_test", " اختبار", []);

$(document).ready(function () {
  $("div.addCustomItem").html(`
    <button onclick="fireSwal(uploadTestsSync)" class="btn-main-add ml-4"><i class="far fa-users-md mr-2"></i> حفظ القيم الطبيعية</button>
    <button onclick="dwonLoadTestsSync()" class="btn-main-add ml-4"><i class="far fa-users-md mr-2"></i> استرجاع القيم الطبيعية</button>
    `);
});

const uploadTestsSync = async () => {
  fetchData("LocalApi/getTestsQueries", "POST", {
    lab_id: localStorage.getItem("lab_hash"),
  });
  niceSwal("success", "bottom-end", "تم الرفع بنجاح");
};

const dwonLoadTestsSync = () => {
  swal
    .fire({
      title: "هل انت متأكد من السحب",
      text: "سيتم استرجاع القيم الطبيعية السابقة",
      icon: "warning",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم",
      cancelButtonText: "كلا",
    })
    .then((res) => {
      if (res.isConfirmed) {
        fireSwal(fetchTests);
      }
    });
};

const fetchTests = async () => {
  let data = fetchData("LocalApi/installTests", "POST", {
    lab_id: localStorage.getItem("lab_hash"),
  });
  if (data.status) niceSwal("success", "top-right", data.message);
  else niceSwal("error", "top-right", data.message);
};
