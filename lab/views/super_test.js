const { units, categories, kits } = fetchApi("/maintests/get_main_tests_data");

const table = true;
const page = 0;
const allTests = [];

let THEME = null;

const createTheme = (kits, units) => {
  if (THEME) {
    return THEME;
  }
  const setting = fetchApi("/invoice/get_setting");
  let theme = setting.SuperTestTheme;
  theme = theme.charAt(0).toUpperCase() + theme.slice(1);
  switch (theme) {
    case "Form":
      THEME = new FormTheme(kits, units);
      break;
    case "Table":
      THEME = new TableTheme(kits, units);
      break;
    default:
      THEME = new FormTheme(kits, units);
      break;
  }
};
createTheme(kits, units);

const testNamerefrence = document.querySelector("#name_editor #test_name");
const categoryHash = document.getElementById("category_hash");

for (const data of units) {
  const newOption = new Option(data.text, data.hash, false, false);
  $("select[name='unit']").append(newOption);
}

$(document).ready(() => {
  $("modal select").select2({
    dropdownParent: $(this).parent(),
    width: "100%",
  });
  $(".dt-buttons").addClass("btn-group");
  $("div.addCustomItem").html(
    `<span class="table-title">قائمة التحاليل</span>
    <button onclick="fireSwal(uploadTestsSync)" class="btn-main-add ml-4"><i class="far fa-users-md mr-2"></i> حفظ القيم الطبيعية</button>
    <button onclick="dwonLoadTestsSync()" class="btn-main-add ml-4"><i class="far fa-users-md mr-2"></i> استرجاع القيم الطبيعية</button>
    `
  );
});

const uploadTestsSync = () => {
  fetchData("LocalApi/getTestsQueries", "POST", {
    lab_id: localStorage.getItem("lab_hash"),
  });

  Swal.fire({
    title: "تم النسخ الاحتياطي بنجاح",
    icon: "success",
    showCancelButton: false,
    confirmButtonColor: "#3085d6",
    confirmButtonText: "حسنا",
  });
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

const fetchTests = () => {
  const data = fetchData("LocalApi/installTests", "POST", {
    lab_id: localStorage.getItem("lab_hash"),
  });
  if (data.status) niceSwal("success", "top-right", data.message);
  else niceSwal("error", "top-right", data.message);
};

class Test extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_test-table",
      "http://localhost:8807/api/app/index.php/maintests/get_main_tests",
      () => {
        return { lab_id: localStorage.getItem("lab_hash") };
      },
      [
        { data: "test_name" },
        {
          data: null,
          className: "center",
          render: (data, type, test) =>
            `<span class="row" id="test-${test.hash}">
              ${getRefrences(test.refrence, test.hash)}
            </span>`,
        },
        { data: "category_name" },
        {
          data: null,
          className: "center",
          render: (data, type, test) => {
            allTests.push(test);
            return `<a class="bs-tooltip text-success" onclick="lab_test.updateItem('${test.hash}');" data-toggle="tooltip" data-placement="top" title="Edit">
                                    <i class="far fa-edit fa-lg mx-2"></i>
                                </a>
                                <a href="#" onclick="fireSwal.call(lab_test,lab_test.deleteItem, '${test.hash}')" class="text-danger">
                                    <i class="far fa-trash fa-lg mx-2"></i>
                                </a>
                                <a class="bs-tooltip text-info" onclick="addRefrence('${test.hash}');" data-toggle="tooltip" data-placement="top" title="Edit">
                                    <i class="far fa-plus-circle fa-lg mx-2"></i>
                                </a>
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

  deleteItem(hash) {
    const { isExist } = fetchApi("/maintests/isExist", "post", { id: hash });
    if (isExist) {
      Swal.fire({
        icon: "error",
        title: "لا يمكن حذف التحليل",
        text: "هذا التحليل موجود في بعض التحليلات",
      });
      return;
    }
    fetchApi("/maintests/delete_main_test", "post", { hash });
    this.dataTable.ajax.reload();
  }

  saveUpdateItem(hash) {
    super.saveUpdateItem(hash);
    const data = this.getUpdateData();
    fetchApi("/maintests/update_main_test", "post", { ...data, hash });
    this.dataTable.ajax.reload();
  }

  saveNewItem() {
    const data = this.getUpdateData();
    fetchApi("/maintests/add_main_test", "post", data);
    this.dataTable.ajax.reload();
  }
}

const lab_test = new Test("lab_test", "الفحوصات", [
  { name: "hash", type: null },
  { name: "test_name", type: "text", label: "الاسم" },
  {
    name: "category_hash",
    type: "select",
    label: "الفئة",
    options: categories,
  },
]);

function getKits(options) {
  const sanitizedOptions = options.replace(/\\/g, "");
  let kit = "";
  if (sanitizedOptions === '{"": ""}' || sanitizedOptions === "") {
    kit = '<span class="badge badge-danger"> لا يوجد kits </span>';
  } else {
    const refrence =
      JSON.parse(sanitizedOptions)?.component?.[0]?.reference ?? [];
    let newRefrence = refrence.map((item) => item.kit);
    newRefrence = [...new Set(newRefrence)];
    for (const ref of newRefrence) {
      const kitItem = kits.filter((item) => item.id === ref);
      kit += ` <span class="badge badge-info">${kitItem[0].name}</span> `;
    }
  }
  return kit;
}

function getRefrences(reference, hash) {
  if (reference.length <= 0) {
    return '<span class="badge badge-danger"> لا يوجد Ranges </span>';
  }
  let newRefrence = reference.filter((item, index, self) => {
    return self.findIndex((t) => t.kit === item.kit) === index;
  });
  newRefrence = newRefrence.map((item, cur) => {
    let br = "";
    if ((cur + 1) % 4 === 0) {
      br = "<br>";
    }
    const _kit = kits.find((x) => x.id === item.kit);
    if (_kit === undefined && item.kit !== "") {
      return;
    }
    return `<span class="badge badge-light border border-info p-2 mr-2 mb-2 col-auto" id="test-${hash}_kit-${(
      _kit?.name.replace(/[^a-zA-Z0-9]/g, "_") ?? "No Kit"
    )
      .split(" ")
      .join("_")}">
                      ${_kit?.name ?? "No Kit"} 
                      <a onclick="editRefrence('${hash}',${cur})"><i class="far fa-edit fa-lg mx-2 text-success"></i></a>
              </span>${br}`;
  });
  return newRefrence.join(" ");
}

function editRefrence(hash, refID) {
  const { refrence } = fetchApi("/maintests/get_main_test", "post", { hash });
  const newRefrence = refrence.filter((item, index, self) => {
    return self.findIndex((t) => t.kit === item.kit) === index;
  })[refID];
  let form = THEME.build(hash, refrence, newRefrence?.kit);
  if (form === "") {
    form = `<div class="alert alert-danger">لا يوجد رينجات</div>`;
  }
  $("#refrence_editor .modal-body").html(form);
  $("#refrence_editor").modal("toggle");
}

function updateRefrence(hash, refID) {
  const formContainer = $("#form_container");
  // empty from container
  formContainer.empty();
  let { refrence } = fetchApi("/maintests/get_main_test", "post", { hash });
  refrence = refrence.find((item, index, self) => index === Number(refID));
  const form = THEME.mainForm(refID, hash, refrence);
  formContainer.append(form);
}

function saveRefrence(hash, refID) {
  if (refreshValidation() === false) {
    return false;
  }
  const result = $(`#refrence_form_${refID} input[name="type"]:checked`).val();
  const rightOptions = [];
  const options = [];
  if (
    $(`#refrence_form_${refID} input[name="type"]:checked`).val() === "result"
  ) {
    $(`#refrence_form_${refID} input[name='select-result-value']`).each(
      function () {
        options.push($(this).val());
        if (
          $(this)
            .parent()
            .parent()
            .find('input[name="select-result"]')
            .is(":checked")
        ) {
          rightOptions.push($(this).val());
        }
      }
    );
  }
  const { refrence, name } = fetchApi("/maintests/get_main_test", "post", {
    hash,
  });
  let component = [
    {
      name: name,
      reference: refrence,
    },
  ];
  const element = THEME.getData(refID, result, options, rightOptions);
  if (refID === "null") {
    if (component?.[0]) {
      component[0].reference.push(element);
    } else {
      component = [
        {
          name: test.test_name,
          reference: [element],
        },
      ];
      document.getElementById(`test-${hash}`).innerHTML = "";
    }
    const newRefrence = component[0].reference.filter((item, index, self) => {
      return self.findIndex((t) => t?.kit === item?.kit) === index;
    });
    // (${element['age low']??0} ${element['age unit low']} - ${element['age high']??100} ${element['age unit high']})
    if (
      $(
        `#test-${hash}_kit-${(
          kits
            .find((x) => x.id === element.kit)
            ?.name.replace(/[^a-zA-Z0-9]/g, "_") ?? "No Kit"
        )
          .split(" ")
          .join("_")}`
      ).length === 0
    ) {
      document.getElementById(
        `test-${hash}`
      ).innerHTML += ` <span class="badge badge-light border border-info p-2 mr-2 mb-2 col-auto" id="test-${hash}_kit-${(
        kits
          .find((x) => x.id === element.kit)
          ?.name.replace(/[^a-zA-Z0-9]/g, "_") ?? "No Kit"
      )
        .split(" ")
        .join("_")}" style="min-width:200px">
            ${kits.find((x) => x.id === element.kit)?.name ?? "No Kit"} 
            <a onclick="editRefrence('${hash}',${
        newRefrence.length - 1
      })"><i class="far fa-edit fa-lg mx-2 text-success"></i></a>
            </span> `;
    }
  } else {
    component[0].reference[refID] = element;
  }
  fetchApi("/maintests/update_main_test", "post", {
    hash,
    option_test: JSON.stringify({ component }),
  });
  lab_test.dataTable.ajax.reload();
  $("#refrence_editor").modal("hide");
  Swal.fire({
    toast: true,
    position: "bottom-end",
    icon: "success",
    title: "قد تحتاج الى التعديل في صفحة التحاليل لتطبيق التغييرات  ",
    showConfirmButton: false,
    timer: 3000,
  });
}

function deleteRefrence(hash, refID) {
  const { refrence, name } = fetchApi("/maintests/get_main_test", "post", {
    hash,
  });
  refrence.splice(refID, 1);
  const component = [
    {
      name: name,
      reference: refrence,
    },
  ];
  fetchApi("/maintests/update_main_test", "post", {
    hash,
    option_test: JSON.stringify({ component }),
  });
  lab_test.dataTable.ajax.reload();
  $("#refrence_editor").modal("hide");
  Swal.fire({
    toast: true,
    position: "bottom-end",
    icon: "success",
    title: "قد تحتاج الى التعديل في صفحة التحاليل لتطبيق التغييرات  ",
    showConfirmButton: false,
    timer: 3000,
  });
}

function deleteRange(e, id) {
  const num = $(`#${id} .range`).length;
  if (num > 1) {
    e.parents(".range").remove();
  }
}
