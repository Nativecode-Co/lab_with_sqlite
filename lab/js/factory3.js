function getMonth(month, type = true) {
  let monthValue = Number(month);
  if (type) {
    monthValue += 1;
  }
  if (monthValue < 10) {
    monthValue = `0${monthValue}`;
  }
  return monthValue;
}

const NOW = new Date();
const TODAY = `${NOW.getFullYear()}-${getMonth(NOW.getMonth())}-${getMonth(
  NOW.getDate(),
  false
)}`;

class Factory {
  constructor(table, tableLabel, fields, options = {}) {
    this.table = table;
    this.tableLabel = tableLabel;
    this.fields = fields;
    this.modalId = `modal-${this.table}`;
    this.formId = `form-${this.table}`;
    this.tableId = `${this.table}-table`;
    this.stop = false;
    this.page = 0;
    this.pageSize = options.pageSize ?? 10;
    this.dataTable = null;
    this.pages = [0];
    this.numberOfPages = Math.ceil(this.size / this.pageSize);
    this.init();
  }

  init() {
    this.createModal();
  }

  newItem() {
    // open modal
    $(`#${this.modalId}`).modal("show");
    // clear form
    clearForm(this.formId, this.fields);
    // change modal title
    $(`#${this.modalId}`).find(".modal-title").text(`اضافة ${this.tableLabel}`);
    // change button text
    $(`#${this.table}-save`).text("اضافة");
    // change button onclick
    $(`#${this.table}-save`).attr(
      "onclick",
      `fireSwal.call(${this.table}, ${this.table}.saveNewItem)`
    );
  }

  updateItem(hash) {
    // open modal
    $(`#${this.modalId}`).modal("show");
    // change modal title
    $(`#${this.modalId}`).find(".modal-title").text(`تعديل ${this.tableLabel}`);
    // change button text
    $(`#${this.table}-save`).text("تعديل");
    // change button onclick
    $(`#${this.table}-save`).attr(
      "onclick",
      `fireSwal.call(${this.table}, ${this.table}.saveUpdateItem, '${hash}')`
    );
  }

  getNewData() {
    return getFormData(this.formId, this.fields);
  }

  getUpdateData() {
    return getFormData(this.formId, this.fields);
  }

  saveNewItem() {}

  saveUpdateItem(hash) {}

  deleteItem(hash) {}

  createModal() {
    const modal = `<div class="modal fade" id="${
      this.modalId
    }" tabindex="-1" role="dialog" aria-labelledby="${
      this.modalId
    }" aria-hidden="true">
                        <div class="modal-dialog modal-lg" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="${
                                      this.modalId
                                    }"></h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <form id="${this.formId}" class="row">
                                        ${setInputsType(this.fields)}
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-main-add" id="${
                                      this.table
                                    }-save">Save changes</button>
                                </div>
                            </div>
                        </div>
                    </div>`;
    $("body").append(modal);
  }
}

function clearForm(formId, fields) {
  for (const field of fields) {
    switch (field.type) {
      case "select":
        $(`#${formId} [name=${field.name}]`).val("").trigger("change");
        break;
      case "textarea":
        $(`#editor_${field.name} .ql-editor`).html("");
        break;
      case "image":
        window[`${field.name}_preview`].clearPreviewPanel();
        break;
      case "checkbox":
        $(`#${formId} [name=${field.name}]`).prop("checked", false);
        break;
      case null:
        break;
      case "ignore":
        if (field.type2 === "select") {
          $(`#${formId} [name=${field.name}]`).val("").trigger("change");
        } else {
          $(`#${formId} [name=${field.name}]`).val("");
        }
        break;
      case "custom":
        field.clearFormFun
          ? field.clearFormFun(field)
          : $(`#${formId} [name=${field.name}]`).val("");
        break;
      default:
        $(`#${formId} [name=${field.name}]`).val("");
        break;
    }
  }
}

function fillForm(formId, fields, item) {
  for (const field of fields) {
    switch (field.type) {
      case "select":
        $(`#${formId} [name=${field.name}]`)
          .val(item[field.name])
          .trigger("change");
        break;
      case "textarea":
        $(`#editor_${field.name} .ql-editor`).html(item[field.name]);
        break;
      case "image":
        $(`#${field.name}`).val(item[field.name]);
        window[`${field.name}_preview`].clearPreviewPanel();
        window[
          `${field.name}_preview`
        ].imagePreview.style.backgroundImage = `url("${item[field.name]}")`;
        break;
      case "checkbox":
        if (item[field.name] === "1" || item[field.name] === 1) {
          $(`#${formId} [name=${field.name}]`).prop("checked", true);
        } else {
          $(`#${formId} [name=${field.name}]`).prop("checked", false);
        }
        break;
      case null:
        break;
      case "ignore":
        break;
      case "custom":
        field.fillFormFun
          ? field.fillFormFun(item)
          : $(`#${formId} [name=${field.name}]`).val(item[field.name]);
        break;
      default:
        $(`#${formId} [name=${field.name}]`).val(item[field.name]);
        break;
    }
  }
}

function getFormData(formId, fields) {
  const data = {};
  for (const field of fields) {
    switch (field.type) {
      case "select": {
        data[field.name] = $(`#${formId} [name=${field.name}]`).val();
        break;
      }
      case "textarea": {
        data[field.name] = $(`#editor_${field.name} .ql-editor`).html();
        break;
      }
      case "image": {
        let file = window[`${field.name}_preview`].cachedFileArray[0];
        if (file) {
          let imageUrl = uploadFile(file, "users", "user").result[0];
          $(`#${formId} [name=${field.name}]`).val(imageUrl);
        }
        data[field.name] = manageImageSave(field.name);
        break;
      }
      case "checkbox": {
        data[field.name] = $(`#${formId} [name=${field.name}]`).is(":checked")
          ? 1
          : 0;
        break;
      }
      case null: {
        break;
      }
      case "ignore": {
        break;
      }
      case "custom": {
        if (field.getFormDataFun) {
          field.getFormDataFun(data);
        } else {
          data[field.name] = $(`#${formId} [name=${field.name}]`).val();
        }
        break;
      }
      default: {
        data[field.name] = $(`#${formId} [name=${field.name}]`).val();
        break;
      }
    }
  }
  return data;
}

function setInputsType(fields) {
  let inputs = "";
  for (const field of fields) {
    switch (field.type) {
      case "select":
        inputs += selectInput(field);
        break;
      case "textarea":
        inputs += textareaInput(field);
        break;
      case "image":
        inputs += fileInput(field);
        break;
      case "checkbox":
        inputs += checkboxInput(field);
        break;
      case null:
        inputs += "";
        break;
      case "ignore":
        if (field.type2 === "select") {
          inputs += selectInput(field);
        } else {
          inputs += normalInput(field);
        }
        break;
      case "custom":
        inputs += field.setInputsTypeFun ? field.setInputsTypeFun(field) : null;
        break;
      default:
        inputs += normalInput(field);
        break;
    }
  }
  return inputs;
}

function validateForm(formId, fields) {
  let valid = true;
  for (const field of fields) {
    switch (field.type) {
      case "select":
        if (field.req && $(`#${formId} [name=${field.name}]`).val() === "") {
          $(`#${formId} [name=${field.name}]`).addClass("is-invalid");
          valid = false;
        } else {
          $(`#${formId} [name=${field.name}]`).removeClass("is-invalid");
        }
        break;
      case "textarea":
        if (field.req && $(`#editor_${field.name} .ql-editor`).html() === "") {
          $(`#editor_${field.name}`).addClass("is-invalid");
          valid = false;
        } else {
          $(`#editor_${field.name}`).removeClass("is-invalid");
        }
        break;
      case "image":
        if (field.req && $(`#${formId} [name=${field.name}]`).val() === "") {
          $(`#${formId} [name=${field.name}]`).addClass("is-invalid");
          valid = false;
        } else {
          $(`#${formId} [name=${field.name}]`).removeClass("is-invalid");
        }
        break;
      case "checkbox":
        if (
          field.req &&
          $(`#${formId} [name=${field.name}]`).is(":checked") === false
        ) {
          $(`#${formId} [name=${field.name}]`).addClass("is-invalid");
          valid = false;
        } else {
          $(`#${formId} [name=${field.name}]`).removeClass("is-invalid");
        }
        break;
      case null:
        break;
      case "ignore":
        if (field.type2 === "select") {
          if (field.req && $(`#${formId} [name=${field.name}]`).val() === "") {
            $(`#${formId} [name=${field.name}]`).addClass("is-invalid");
            valid = false;
          } else {
            $(`#${formId} [name=${field.name}]`).removeClass("is-invalid");
          }
        } else {
          if (field.req && $(`#${formId} [name=${field.name}]`).val() === "") {
            $(`#${formId} [name=${field.name}]`).addClass("is-invalid");
            valid = false;
          } else {
            $(`#${formId} [name=${field.name}]`).removeClass("is-invalid");
          }
        }
        break;
      case "custom":
        if (field.validateFormFun) {
          valid = field.validateFormFun(valid);
        }
        break;
      default:
        if (field.req && $(`#${formId} [name=${field.name}]`).val() === "") {
          $(`#${formId} [name=${field.name}]`).addClass("is-invalid");
          valid = false;
        }
        break;
    }
  }
  return valid;
}

function normalInput(field) {
  return `<div class="form-group ${
    field?.size ? `col-md-${field?.size}` : "col-md-12"
  }">
                <label for="${field.name}">${field.label}</label>
                <input type="${field.type}" class="form-control" id="${
    field.name
  }" name="${field.name}" ${field.req ? field.req : ""}>
            </div>`;
}

function checkboxInput(field) {
  return `<div class="form-group  ${
    field?.size ? `col-md-${field?.size}` : "col-md-12"
  }">
                <label for="${field.name}" class="w-100 text-center">${
    field.label
  }</label>
                <label class="d-flex switch s-icons s-outline s-outline-success mx-auto mt-2">
                    <input type="checkbox" name="${field.name}" value="1" id="${
    field.name
  }" ${field.req ? field.req : ""}>
                    <span class="slider round"></span>
                </label>
            </div>`;
}

function selectInput(field) {
  $(document).ready(() => {
    $(`#${field.name}`).select2({
      placeholder: `${field.label}`,
      width: "100%",
      dropdownParent: $(`#${field.name}`).closest("form"),
    });
  });
  return `<div class="form-group  ${
    field?.size ? `col-md-${field?.size}` : "col-md-12"
  }">
                <label for="${field.name}">${field.label}</label>
                <select class="form-control" id="${field.name}" name="${
    field.name
  }" ${field.req ? field.req : ""}>
                    ${field.options
                      .map((option) => {
                        return `<option value="${option.hash}">${option.text}</option>`;
                      })
                      .join("")}
                </select>
            </div>`;
}

function textareaInput(field) {
  $(document).ready(() => {
    const myToolbar = [
      ["bold", "italic", "underline", "strike"],
      [{ font: [] }],
      [{ align: [] }],

      ["clean"],
      [{ direction: "rtl" }],
    ];
    new Quill(`#editor_${field.name}`, {
      theme: "snow",
      modules: {
        toolbar: {
          container: myToolbar,
          handlers: {
            image: imageHandler,
          },
        },
        imageResize: {
          displaySize: true,
        },
      },
    });
  });
  return `<label for="${field.name}" class="w-100">${field.label}</label><div id="editor_${field.name}" class="form-group"></div>
            <input type="hidden" id="${field.name}">`;
}

function imageHandler() {
  const range = this.quill.getSelection();
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.click();

  // Listen upload local image and save to server
  input.onchange = () => {
    const file = input.files[0];

    // file type is only image.
    if (/^image\//.test(file.type)) {
      const value = uploadFile(file).result[0];
      if (value) {
        this.quill.insertEmbed(range.index, "image", value, Quill.sources.USER);
      }
    } else {
      console.warn("You could only upload images.");
    }
  };
}

function fileInput(field) {
  window[`${field.name}_preview`] = null;
  // dom ready
  $(document).ready(() => {
    window[`${field.name}_preview`] = new FileUploadWithPreview(field.name);
  });
  return `<div class="form-group  ${
    field?.size ? `col-md-${field?.size}` : "col-md-12"
  }">
                <div class="custom-file-container" data-upload-id="${
                  field.name
                }">
                    <label>${
                      field.label
                    } <a href="javascript:void(0)" class="custom-file-container__image-clear" title="حذف الملف">x</a></label>
                    <label class="custom-file-container__custom-file" >
                        <input type="file" class="custom-file-container__custom-file__custom-file-input" accept="/*" ${
                          field.req ? field.req : ""
                        }>
                        <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                        <span class="custom-file-container__custom-file__custom-file-control"></span>
                    </label>
                    <div class="custom-file-container__image-preview"></div>
                </div>
                <input dir="ltr" type="hidden" class="form-control" name="${
                  field.name
                }" id="${field.name}"/>
            </div>
            `;
}
// how wait while function finish

const waitElement = `<div id="alert_screen" class="alert_screen"> 
<div class="loader">
    <div class="loader-content">
        <div class="card" style="width: 30rem; height: 15rem;">
            <div class="card-body text-center">
              <h1 class="card-title">الرجاء الانتظار </h1>
              <h4>يتم الان اجراء العملية</h4>
              <img class="spinner-grow-alert" src="${front_url}assets/image/flask.png" width="100" height="100" alt="alert_screen">
            </div>
          </div>
    </div>
</div>
</div>`;

async function fireSwal(fun = null, ...args) {
  if (!fun) {
    return flase;
  }
  const diffTimeInMin =
    (-1 *
      (new Date(localStorage?.getItem("lastSync") ?? "2023-01-01 00:00:00") -
        new Date())) /
    1000 /
    60;
  if (diffTimeInMin > 0.1) {
    syncOnline();
    localStorage.setItem("lastSync", new Date());
  }
  const body = document.getElementsByTagName("body")[0];
  body.insertAdjacentHTML("beforeend", waitElement);
  setTimeout(async () => {
    new Promise((resolve, reject) => {
      fun.call(this, ...args);
      resolve();
    }).then(() => {
      document.getElementById("alert_screen").remove();
    });
  }, 100);
}

function fireSwalWithoutConfirm(fun, ...args) {
  if (!fun) {
    niceSwal("error", "خطأ", "لا يوجد اي عملية");
    return false;
  }
  const body = document.getElementsByTagName("body")[0];
  body.insertAdjacentHTML("beforeend", waitElement);
  setTimeout(() => {
    new Promise((resolve, reject) => {
      console.log("start");
      fun.call(this, ...args);
      resolve();
    }).then(() => {
      document.getElementById("alert_screen").remove();
      console.log("done");
    });
  }, 100);
}

// fire swal for delete function
function fireSwalForDelete(fun, ...args) {
  if (!fun) {
    niceSwal("error", "خطأ", "لا يوجد اي عملية");
    return false;
  }
  let condition = 1;
  Swal.fire({
    icon: "question",
    html: "هل انت متاكد من الحذف ",
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "نعم",
    cancelButtonText: "كلا",
    didClose: () => {
      if (condition) {
        Swal.close();
        Swal.fire({
          title: "الرجاء الانتظار",
          text: "يتم الان اجراء العملية",
          timer: 100,
          showDenyButton: false,
          showCancelButton: false,
          showConfirmButton: false,
          timerProgressBar: true,
          willOpen: () => {
            Swal.showLoading();
          },
          willClose: () => {
            if (fun.call(this, ...args) !== false) {
              swal.fire({
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 3000,
                padding: "2em",
                icon: "success",
                title: "تم الحذف بنجاح",
              });
            }
          },
        });
      }
    },
  }).then((result) => {
    if (result.isDismissed) {
      condition = 0;
    }
  });
}

function fireSwalConfirm(msg, fun, ...args) {
  if (!fun) {
    niceSwal("error", "خطأ", "لا يوجد اي عملية");
    return false;
  }
  let condition = 1;
  Swal.fire({
    icon: "question",
    html: msg,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "نعم",
    cancelButtonText: "كلا",
    didClose: () => {
      if (condition) {
        Swal.close();
        Swal.fire({
          title: "الرجاء الانتظار",
          text: "يتم الان اجراء العملية",
          timer: 100,
          showDenyButton: false,
          showCancelButton: false,
          showConfirmButton: false,
          timerProgressBar: true,
          willOpen: () => {
            Swal.showLoading();
          },
          willClose: () => {
            const data = fun.call(this, ...args);
            if (data !== false) {
              return data;
            }
          },
        });
      }
    },
  }).then((result) => {
    if (result.isDismissed) {
      condition = 0;
    }
  });
}

function setServerTable(
  id,
  endPoint,
  attrFun = () => {
    return {};
  },
  columns = [],
  order = [[0, "desc"]],
  options = {},
  afterRequest = (json) => {}
) {
  const _id = id ? id : "table";
  return $(`#${_id}`).DataTable({
    processing: true,
    serverSide: true,
    serverMethod: "post",
    order: order,
    ajax: {
      url: endPoint,
      data: (data) => {
        const attr = attrFun();
        return {
          ...data,
          ...attr,
        };
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      dataSrc: (json) => {
        afterRequest(json);
        return json.data;
      },
    },
    columns: columns,
    columnDefs: [
      {
        className: "dtr-control text-center",
        orderable: false,
        targets: -1,
      },
    ],
    responsive: {
      details: {
        type: "column",
        target: -1,
      },
    },
    dom:
      `<'dt--top-section'
                <'row flex-row-reverse'
                    <'col-6 col-md-2 d-flex justify-content-md-end justify-content-center mb-md-3 mb-3'l>
                    <'col-6 col-md-2 d-flex justify-content-md-end justify-content-center mb-md-3 mb-3'f>
                    <'col-sm-12 col-md-8 d-flex justify-content-md-start justify-content-center addCustomItem'>
                >
            >` +
      "<'table-responsive'tr>" +
      `<'dt--bottom-section'
                <'row'
                    <'col-sm-12 col-md-6 d-flex justify-content-md-start justify-content-center mb-md-3 mb-3'i>
                    <'col-sm-12 col-md-6 d-flex justify-content-md-end justify-content-center mb-md-3 mb-3'p>
                    <'col-12 d-flex justify-content-center mb-md-3 mb-3'B>
                >
            >`,
    language: {
      oPaginate: {
        sPrevious: '<i class="fas fa-caret-right"></i>',
        sNext: '<i class="fas fa-caret-left"></i>',
      },
      lengthMenu: "عرض _MENU_  شريحة",
      sSearch:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      sSearchPlaceholder: "بحث...",
      sInfo: "عرض _PAGE_ من اصل _PAGES_ صفحة",
      processing: `
                <div class="text-center" >
                    <img class="spinner-grow-alert" src="${front_url}assets/image/flask.png" width="50" height="50" alt="alert_screen">
                    <h5 class="text-center">جاري التحميل</h5>
                </div>
            `,
      emptyTable: `
            <div class="text-center">
                <img class="" src="${front_url}assets/image/flask.png" width="50" height="50" alt="alert_screen">
                <h5 class="text-center">لا يوجد بيانات</h5>
            </div>`,
    },
    lengthMenu: [10, 50, 100, 200, 400, 800, 1000, 2000],
    buttons: {
      buttons: [
        {
          extend: "excel",
          className: "btn btn-sm btn-outline-print print-excel",
          text: '<i class="far fa-file-spreadsheet"></i> تصدير إكسيل',
          exportOptions: {
            columns: ":visible:not(.not-print)",
          },
        },
        {
          extend: "print",
          className: "btn btn-sm btn-outline-print print-page",
          text: '<i class="far fa-print"></i> طباعة',
          exportOptions: {
            // expect col 1 and 2
            columns: ":visible:not(.not-print)",
          },
        },
      ],
    },
    ...options,
  });
}

$(".dt-buttons").addClass("btn-group");

function manageImageSave(imageId) {
  const ImageElement = $(`#${imageId}`);
  let value = null;
  if (
    ImageElement.val().includes(`${__domain__}app`) ||
    ImageElement.val().includes(`${__domain__}lab`) ||
    ImageElement.val().includes("http://umc.native-code-iq.com/")
  ) {
    value = ImageElement.val();
  } else {
    if (ImageElement.val() === "") {
      value = "";
    } else {
      value = `${__domain__}app/${ImageElement.val()}`;
    }
  }
  return value;
}

function niceSwal(type, position, msg) {
  swal.fire({
    toast: true,
    position: position ?? "bottom-end",
    showConfirmButton: false,
    timer: 5000,
    icon: type ?? "success",
    title: msg ?? "تم اجراء العملية بنجاح",
  });
}

function uploadFiles(files, folder, name) {
  const form_data = new FormData();
  for (const file of files) {
    form_data.append("files[]", file);
  }
  form_data.append("token", localStorage.token);
  form_data.append("hash_lab", localStorage.lab_hash);
  form_data.append("name", name);
  form_data.append("folder_location", folder);
  try {
    return upload(form_data);
  } catch (e) {
    return e;
  }
}

function uploadFile(file, folder, name) {
  const form_data = new FormData();
  form_data.append("files[]", file);
  form_data.append("token", localStorage.token);
  form_data.append("hash_lab", localStorage.lab_hash);
  form_data.append("name", name);
  form_data.append("folder_location", folder);
  try {
    return upload(form_data);
  } catch (e) {
    return e;
  }
}

const Database_Open = async (options) => {
  return new Promise((resolve, reject) => {
    const dbReq = indexedDB.open(options.table, 1);
    dbReq.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create DB Table
      db.createObjectStore(options.table, { keyPath: options.hash });
      console.log(
        `upgrade is called database name: ${db.name} version : ${db.version}`
      );
    };
    dbReq.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(options.table, "readwrite");
      tx.onerror = (e) => alert(` Error! ${e.target.error}`);
      const _req = tx.objectStore(options.table);
      const req = _req.getAll();
      req.onsuccess = (e) => {
        if (e.target.result?.[0]) {
          resolve(e.target.result);
        } else {
          const data = run(options.query).result[0].query0;
          for (const i of data) {
            _req.add(i);
          }
          resolve(data);
        }
      };
    };
    dbReq.onerror = (event) => {
      reject("error opening database");
    };
  });
};

function showPopover(title, content, color = "light") {
  $(this)
    .popover({
      template: `<div class="popover popover-${color}" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>`,
      title: `<p class="text-center">${title}</p>`,
      // show price and note
      html: true,
      content: `
            ${content}
        `,
      placement: "top",
    })
    .popover("show");
}

function printElement(Id, pageZise = "A4", ...args) {
  $(`${Id}`).printThis({
    importCSS: false,
    loadCSS: [
      "lab/bootstrap/css/bootstrap.min.css",
      "lab/css/invoice.css",
      "lab/css/style.css",
      "lab/plugins/font-awesome/css/all.css",
    ],
    printDelay: 1000,
  });
}

//dom ready
let code = "";
let reading = false;

document.addEventListener("keypress", (e) => {
  //usually scanners throw an 'Enter' key at the end of read
  if (e.keyCode === 13) {
    if (code.length > 10) {
      // get current page
      const page = window.location.pathname.split("/").pop();
      // check if page visits
      if (page === "visits.html") {
        visitDetail(`${code}`);
        showAddResult(`${code}`);
        $("html, body").animate(
          {
            scrollTop: $("#main-space").offset().top,
          },
          500
        );
      } else {
        // redirect to visits page
        window.location.href = `visits.html?barcode=${code}`;
      }
      /// code ready to use
      code = "";
    }
  } else {
    code += e.key; //while this is not an 'enter' it stores the every key
  }

  //run a timeout of 200ms at the first read and clear everything
  if (!reading) {
    reading = true;
    setTimeout(() => {
      code = "";
      reading = false;
    }, 200); //200 works fine for me but you can adjust it
  }
});
