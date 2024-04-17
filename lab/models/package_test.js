const oldTests = [];

const packages = fetchApi("/tests/get_packages_test");
const categories = fetchApi("/visit/get_categories");
class PackageTest extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_test-table",
      `${api_url}/tests/get_tests`,
      () => {
        return { catigory: "9" };
      },
      [
        {
          data: "lab_package.name",
          render: (data, type, row) =>
            `<span onclick="updateTest('${row.hash}')">${row.name}</span>`,
        },
        {
          data: "cost",
          render: (data, type, row) =>
            `<div class="d-none d-print-block-inline">${row.cost}</div><input type="text" id="${row.hash}_cost" data_hash="${row.hash}" class="form-control text-center" name="cost" value="${row.cost}" onblur="updatePackageDetail('${row.hash}')">`,
        },
        {
          data: "price",
          render: (data, type, row) =>
            `<div class="d-none d-print-block-inline">${row.price}</div><input type="text" id="${row.hash}_price" data_hash="${row.hash}" class="form-control text-center" name="price" value="${row.price}" onblur="updatePackageDetail('${row.hash}')">`,
        },
        {
          data: "device_name",
          render: (data, type, row) =>
            `<span onclick="updateTest('${row.hash}')">${
              row.device_name ? row.device_name : "NO device"
            }</span>`,
        },
        {
          data: "kit_name",
          render: (data, type, row) =>
            `<span onclick="updateTest('${row.hash}')">${
              row.kit_name ? row.kit_name : "NO Kit"
            }</span>`,
        },
        {
          data: "unit_name",
          render: (data, type, row) =>
            `<span onclick="updateTest('${row.hash}')">${
              row.unit_name ? row.unit_name : "NO Unit"
            }</span>`,
        },
        {
          data: null,
          sortable: false,
          className: "center not-print",
          render: (data, type, row) => `
                        
                        <a class="text-success" onclick="updateNormal('${row.test_id}', '${row.kit_id}',  '${row.unit}')">
                          <i class="fas fa-syringe fa-lg mx-2"></i>
                        </a>
                        <a class="text-success" onclick="updateTest('${row.hash}')"><i class="fa-lg mx-2 fas fa-edit"></i></a>
                        <a class="text-danger" onclick="fireSwalForDelete(deleteTest, '${row.hash}')"><i class="fa-lg mx-2 far fa-trash-alt"></i></a>
            `,
        },
        {
          data: null,
          sortable: false,
          className: "text-success center",
          defaultContent: '<i class="fas fa-plus"></i>',
        },
      ]
    );
  }

  getItem(hash) {
    return fetchApi(`/tests/get_test?hash=${hash}`);
  }
}

class Package extends PackageTest {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_package-table",
      `${api_url}/tests/get_tests`,
      () => {
        return { catigory: "8" };
      },
      [
        {
          data: "lab_package.name",
          render: (data, type, row) =>
            `<span onclick="updatePackage('${row.hash}')">${row.name}</span>`,
        },
        {
          data: "cost",
          render: (data, type, row) =>
            `<div class="d-none d-print-block-inline">${row.cost}</div><input type="text" id="${row.hash}_cost" data_hash="${row.hash}" class="form-control text-center" name="cost" value="${row.cost}" onblur="updatePackageDetail('${row.hash}')">`,
        },
        {
          data: "price",
          render: (data, type, row) =>
            `<div class="d-none d-print-block-inline">${row.price}</div><input type="text" id="${row.hash}_price" data_hash="${row.hash}" class="form-control text-center" name="price" value="${row.price}" onblur="updatePackageDetail('${row.hash}')">`,
        },
        {
          data: null,
          sortable: false,
          className: "center not-print",
          render: (data, type, row) => `
                        <a class="btn-action" onclick="updatePackage('${row.hash}')"><i class="fas fa-edit"></i></a>
                        <a class="btn-action delete" onclick="fireSwal(deletePackage, '${row.hash}')"><i class="far fa-trash-alt"></i></a>
                        `,
        },
        {
          data: null,
          sortable: false,
          className: "text-success center",
          defaultContent: '<i class="fas fa-plus"></i>',
        },
      ]
    );
  }
}

class PackageTests extends Factory {
  init() {
    const data = fetchApi("/tests/get_packages_test");
    for (const row of data) {
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
    if ($(`#col-package-${firstLetter}`).length === 0) {
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
                    <span class="new-control-indicator m-3"></span><p class="ml-4 mb-0">(<span class="text-danger">${row.device_name}</span>,<span class="text-success">${row.kit_name}</span>,<span class="text-danger">${row.unit_name}</span>)-${row.name}</p>
                    </label>
                </div>
        `);
  }
}

const lab_test = new PackageTest("lab_test", " مجموعة", []);
const lab_package = new Package("lab_package", " مجموعة", []);

