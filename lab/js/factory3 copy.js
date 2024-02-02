"use strict";

function getMonth(month, type = true) {
  if (type) {
    month = Number(month) + 1;
  } else {
    month = Number(month);
  }
  if (month < 10) {
    month = "0" + month;
  }
  return month;
}

const NOW = new Date();
const TODAY =
  NOW.getFullYear() +
  "-" +
  getMonth(NOW.getMonth()) +
  "-" +
  getMonth(NOW.getDate(), false);
const firstDayOfMonth = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
const lastDayOfMonth = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 0);
const FIRSTDAYOFMONTH =
  firstDayOfMonth.getFullYear() +
  "-" +
  getMonth(firstDayOfMonth.getMonth()) +
  "-" +
  getMonth(firstDayOfMonth.getDate(), false);
const LASTDAYOFMONTH =
  lastDayOfMonth.getFullYear() +
  "-" +
  getMonth(lastDayOfMonth.getMonth()) +
  "-" +
  getMonth(lastDayOfMonth.getDate(), false);

// custom pagination dataTables
function customPagination() {
  $(`#${this.tableId}_wrapper .pagination`).empty();
  let pages = "";
  for (let i = 0; i < this.numberOfPages ?? 5; i++) {
    pages += ` <li class="page-item ${i == 0 ? "active" : ""} ${
      i >= 2 ? "d-none" : ""
    } page_${i}"  onclick="goToPage.call(${
      this.table
    }, '${i}')" style="cursor: pointer;"><a class="page-link" >${
      i + 1
    }</a></li>`;
  }

  $(`#${this.tableId}_wrapper .pagination`).append(`
    <nav aria-label="Page navigation example">
        <ul class="pagination">
            <li class="page-item page_prev"  onclick="goToPage.call(${this.table}, 'prev')" style="cursor: pointer;"><a class="page-link" ><</a></li>
            ${pages}
            <li class="page-item page_next"  onclick="goToPage.call(${this.table}, 'next')" style="cursor: pointer;"><a class="page-link" >></a></li>
        </ul>
    </nav>
    `);
}

function goToPage(page) {
  if (page == "next") {
    page = $(`#${this.tableId}_wrapper .pagination .active`).index();
    if (page > this.numberOfPages - 1) {
      page = this.numberOfPages - 1;
      return false;
    }
  } else if (page == "prev") {
    page = $(`#${this.tableId}_wrapper .pagination .active`).index() - 2;
    if (page < 0) {
      page = 0;
      return false;
    }
  }

  page = Number(page);
  // hide all .page_item
  $(`#${this.tableId}_wrapper .pagination .page-item`).addClass("d-none");
  // show current page and next 2 page and previous 2 page
  $(`#${this.tableId}_wrapper .pagination .page_${page}`).removeClass("d-none");
  $(`#${this.tableId}_wrapper .pagination .page_prev`).removeClass("d-none");
  $(`#${this.tableId}_wrapper .pagination .page_next`).removeClass("d-none");
  $(
    `#${this.tableId}_wrapper .pagination .page_${Number(page) + 1}`
  ).removeClass("d-none");
  $(
    `#${this.tableId}_wrapper .pagination .page_${Number(page) - 1}`
  ).removeClass("d-none");
  // if page in this.pages array
  if (!this.pages.includes(page)) {
    Swal.fire({
      title: "الرجاء الانتظار",
      text: "يتم الان اجراء العملية",
      timer: 100,
      showDenyButton: false,
      showCancelButton: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {
        this.pages.push(page);
        this.createTableBody(this.getAll(page), false);
        // go to page
        console.log(page);
        this.dataTable.page(page).draw(false);
      },
    });
  } else {
    this.dataTable.page(page).draw(false);
  }
  $(`#${this.tableId}_wrapper .pagination .page-item`).removeClass("active");
  $(`#${this.tableId}_wrapper .pagination .page_${page}`).addClass("active");
}

class Query {
  constructor() {}

  pageCondition() {
    return ``;
  }

  mainCondition() {
    return `where ${this.table}.isdeleted=0`;
  }

  orderByQuery() {
    return "order by id desc";
  }

  limitQuery(page = 0) {
    return ``;
  }

  whereQuery() {
    return "";
  }

  groupByQuery() {
    return "";
  }

  havingQuery(value) {
    return "";
  }

  filterQuery() {
    return "";
  }

  itemQuery(hash) {
    return `where hash='${hash}'`;
  }

  getQuery(resetQuery) {
    return ``;
  }

  searchQuery(value) {
    return this.getQuery(
      `${this.mainCondition()} ${this.havingQuery(
        value
      )} ${this.groupByQuery()} ${this.orderByQuery()} limit 15`
    );
  }

  getAll(page = 0) {
    return run(
      this.getQuery(
        `${this.mainCondition()} ${this.groupByQuery()} ${this.orderByQuery()} ${this.limitQuery(
          page
        )}`
      )
    ).result[0].query0;
  }

  getItem(hash) {
    return run(this.getQuery(this.itemQuery(hash))).result[0].query0[0];
  }
}

class Factory extends Query {
  constructor(table, tableLabel, fields, options = {}) {
    super();
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
    if (this.pageCondition() != "") {
      this.size =
        run(`${this.pageCondition()};`).result[0].query0[0].count ?? 0;
    } else {
      this.size = 0;
    }
    this.pages = [0];
    this.numberOfPages = Math.ceil(this.size / this.pageSize);
    this.init();
  }

  init() {
    this.createModal();
    this.createTableBody(this.getAll(0), true);
    $("body").append(`
        <script>
            $(document).ready(() => {
                customPagination.call(${this.table});
                // window.onscroll = function(ev) {
                //     if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
                //         ${this.table}.page += 1;
                //         if(!${this.table}.stop){
                //             let data = ${this.table}.getAll();
                //             if(data.length > 0){
                //                 ${this.table}.createTableBody(data);
                //             }else{
                //                 ${this.table}.stop = true;
                //             }
                //         }
                //     }
                // };
            })
            $('#${this.tableId}_wrapper .active-print-excel').click(function(){
                function printExcel(){
                    ${this.table}.print();
                    $('#${this.tableId}_wrapper .print-excel').click();
                }
                fireSwal(printExcel);
            })
            $('#${this.tableId}_wrapper .active-print-page').click(function(){
                function printPage(){
                    ${this.table}.print();
                    $('#${this.tableId}_wrapper .print-page').click();
                }
                fireSwal(printPage);
            })

            $('#${
              this.table
            }-table_wrapper input[type=search]').off().on('keyup', function(e) {
                ${this.table}.dataTable.search($(this).val()).draw();
                if(${this.table}.havingQuery('') != ''){
                    if($(this).val()){
                        let dataBaseLabs = run(${
                          this.table
                        }.searchQuery($(this).val())).result[0].query0;
                        ${this.table}.createTableBody(dataBaseLabs);
                        ${this.table}.dataTable.search($(this).val()).draw();
                        // delete duplicate rows
                        ${this.table}.resetPageForSearch(dataBaseLabs.length);
                        customPagination.call(${this.table});
                    }else{
                        ${this.table}.resetPageForSearch(${
      run(`${this.pageCondition()};`).result[0].query0[0].count ?? 0
    });
                        customPagination.call(${this.table});
                    }
                }
            });

            $('input').on('focus',function(){
                if($(this).hasClass('is-invalid')){
                    $(this).removeClass('is-invalid');
                }
            });
        </script>
        `);
  }

  resetPageForSearch(size) {
    this.size = size;
    this.page = 0;
    this.pages = [0];
    this.numberOfPages = Math.ceil(this.size / this.pageSize);
  }

  pageCondition() {
    return `select count(*) as count from ${
      this.table
    } where lab_id='${localStorage.getItem("lab_hash")}'`;
  }

  limitQuery(page = 0) {
    return `limit ${page * this.pageSize},${this.pageSize}`;
  }

  getQuery(resetQuery) {
    return `SELECT ${this.fields.map((item) => item.name).join(",")} FROM ${
      this.table
    } ${resetQuery};`;
  }

  print() {
    this.page = 0;
    this.pageSize = 1000;
    this.stop = true;
    let data = this.getAll();
    // clear the table
    this.dataTable.clear();
    // add the rows
    this.createTableBody(data);
  }

  // getUpdateItem(hash){
  //     return run(`select ${this.fields.map(field => field.name).join(',')} from ${this.table} where hash='${hash}';`).result[0].query0[0];
  // }

  newItem() {
    // open modal
    $(`#${this.modalId}`).modal("show");
    // clear form
    clearForm(this.formId, this.fields);
    // change modal title
    $(`#${this.modalId}`)
      .find(".modal-title")
      .text(`اضافة` + this.tableLabel);
    // change button text
    $(`#${this.table}-save`).text("اضافة");
    // change button onclick
    $(`#${this.table}-save`).attr(
      "onclick",
      `fireSwal.call(${this.table},${this.table}.saveNewItem)`
    );
  }

  updateItem(hash) {
    // open modal
    $(`#${this.modalId}`).modal("show");
    // fill form with item
    fillForm(this.formId, this.fields, this.getItem(hash));
    // change modal title
    $(`#${this.modalId}`)
      .find(".modal-title")
      .text(`تعديل` + this.tableLabel);
    // change button text
    $(`#${this.table}-save`).text("تعديل");
    // change button onclick
    $(`#${this.table}-save`).attr(
      "onclick",
      `fireSwal.call(${this.table},${this.table}.saveUpdateItem,'${hash}')`
    );
  }

  getNewData() {
    return getFormData(this.formId, this.fields);
  }

  getUpdateData() {
    return getFormData(this.formId, this.fields);
  }

  saveNewItem() {
    // validate form
    if (!validateForm(this.formId, this.fields)) {
      return false;
    }
    let data = this.getNewData();
    let newObjectHash = run({
      table: this.table,
      action: "insert",
      column: data,
    }).result[0].query0;
    let newObject = this.getItem(newObjectHash);
    $(`#${this.modalId}`).modal("hide");
    this.dataTable.draw();
    return newObject;
  }

  saveUpdateItem(hash) {
    // validate form
    if (!validateForm(this.formId, this.fields)) {
      return false;
    }
    let data = this.getUpdateData();
    run({
      table: this.table,
      action: "update",
      column: data,
      hash: hash,
    });
    let updateObject = this.getItem(hash);
    $(`#${this.modalId}`).modal("hide");
    this.dataTable.draw();
    return updateObject;
  }

  deleteItem(hash) {
    run({
      table: this.table,
      action: "update",
      column: {
        isdeleted: 1,
      },
      hash: hash,
    });
    this.dataTable.draw();
  }

  createModal() {
    let modal = `<div class="modal fade" id="${
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
                                    <form id="${this.formId}">
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

  createTableBody(data, dataTable = false) {
    if (dataTable) {
      this.dataTable = setTable_1(this.tableId);
    }
    for (let row of data) {
      if (!$(`tr#${row.hash}`).length > 0) {
        this.addRow(row);
      }
    }
  }

  addRow(row) {
    return false;
  }

  filterData() {
    // get the values
    let user_q = $("#nameQ").val();
    // check if the user_q is empty
    if (user_q == "") {
      // update the table
      user_q = null;
    }
    let start_date = $("#minQ").val();
    // check start date empty
    if (start_date === "") {
      // set start date to today
      start_date = "2000-07-30";
    }
    let end_date = $("#maxQ").val();
    // check end date empty
    if (end_date === "") {
      // set end date to today
      end_date = "2100-07-30";
    }
    this.page = 0;
    this.filterTable(user_q, start_date, end_date);
  }

  filterTable(user_q, start_date, end_date) {
    // get the data
    let data = run(
      this.getQuery(`${this.filterQuery(user_q, start_date, end_date)}`)
    ).result[0].query0;
    // clear the table
    this.dataTable.clear();
    // add the rows
    this.createTableBody(data);
  }
}

function clearForm(formId, fields) {
  fields.forEach((field) => {
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
        if (field.type2 == "select") {
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
  });
}

function fillForm(formId, fields, item) {
  fields.forEach((field) => {
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
        console.log(window[`${field.name}_preview`]);
        window[`${field.name}_preview`].clearPreviewPanel();
        window[
          `${field.name}_preview`
        ].imagePreview.style.backgroundImage = `url("${item[field.name]}")`;
        break;
      case "checkbox":
        if (item[field.name] == 1) {
          console.log(item[field.name]);
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
  });
}

function getFormData(formId, fields) {
  let data = {};
  fields.forEach((field) => {
    switch (field.type) {
      case "select":
        data[field.name] = $(`#${formId} [name=${field.name}]`).val();
        break;
      case "textarea":
        data[field.name] = $(`#editor_${field.name} .ql-editor`).html();
        break;
      case "image":
        let file = window[`${field.name}_preview`].cachedFileArray[0];
        if (file) {
          let imageUrl = uploadFile(file, "users", "user").result[0];
          $(`#${formId} [name=${field.name}]`).val(imageUrl);
        }
        data[field.name] = manageImageSave(field.name);
        break;
      case "checkbox":
        data[field.name] = $(`#${formId} [name=${field.name}]`).is(":checked")
          ? 1
          : 0;
        break;
      case null:
        break;
      case "ignore":
        break;
      case "custom":
        field.getFormDataFun
          ? field.getFormDataFun(data)
          : (data[field.name] = $(`#${formId} [name=${field.name}]`).val());
        break;
      default:
        data[field.name] = $(`#${formId} [name=${field.name}]`).val();
        break;
    }
  });
  return data;
}

function setInputsType(fields) {
  let inputs = "";
  fields.forEach((field) => {
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
        if (field.type2 == "select") {
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
  });
  return inputs;
}

function validateForm(formId, fields) {
  let valid = true;
  fields.forEach((field) => {
    switch (field.type) {
      case "select":
        if (field.req && $(`#${formId} [name=${field.name}]`).val() == "") {
          $(`#${formId} [name=${field.name}]`).addClass("is-invalid");
          valid = false;
        } else {
          $(`#${formId} [name=${field.name}]`).removeClass("is-invalid");
        }
        break;
      case "textarea":
        if (field.req && $(`#editor_${field.name} .ql-editor`).html() == "") {
          $(`#editor_${field.name}`).addClass("is-invalid");
          valid = false;
        } else {
          $(`#editor_${field.name}`).removeClass("is-invalid");
        }
        break;
      case "image":
        if (field.req && $(`#${formId} [name=${field.name}]`).val() == "") {
          $(`#${formId} [name=${field.name}]`).addClass("is-invalid");
          valid = false;
        } else {
          $(`#${formId} [name=${field.name}]`).removeClass("is-invalid");
        }
        break;
      case "checkbox":
        if (
          field.req &&
          $(`#${formId} [name=${field.name}]`).is(":checked") == false
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
        if (field.type2 == "select") {
          if (field.req && $(`#${formId} [name=${field.name}]`).val() == "") {
            $(`#${formId} [name=${field.name}]`).addClass("is-invalid");
            valid = false;
          } else {
            $(`#${formId} [name=${field.name}]`).removeClass("is-invalid");
          }
        } else {
          if (field.req && $(`#${formId} [name=${field.name}]`).val() == "") {
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
        if (field.req && $(`#${formId} [name=${field.name}]`).val() == "") {
          $(`#${formId} [name=${field.name}]`).addClass("is-invalid");
          valid = false;
        }
        break;
    }
  });
  return valid;
}

function normalInput(field) {
  return `<div class="form-group">
                <label for="${field.name}">${field.label}</label>
                <input type="${field.type}" class="form-control" id="${
    field.name
  }" name="${field.name}" ${field.req ? field.req : ""}>
            </div>`;
}

function checkboxInput(field) {
  return `<div class="form-group">
                <label for="${field.name}">${field.label}</label>
                <label class="d-flex switch s-icons s-outline s-outline-success mr-2">
                    <input type="checkbox" name="${field.name}" value="1" id="${
    field.name
  }" ${field.req ? field.req : ""}>
                    <span class="slider round"></span>
                </label>
            </div>`;
}

function selectInput(field) {
  $(document).ready(function () {
    $(`#${field.name}`).select2({
      placeholder: `${field.label}`,
      width: "100%",
      dropdownParent: $(`#${field.name}`).closest("form"),
    });
  });
  return `<div class="form-group">
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
  $(document).ready(function () {
    let myToolbar = [
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
  let range = this.quill.getSelection();
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.click();

  // Listen upload local image and save to server
  input.onchange = () => {
    const file = input.files[0];

    // file type is only image.
    if (/^image\//.test(file.type)) {
      let value = uploadFile(file).result[0];
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
  $(document).ready(function () {
    window[`${field.name}_preview`] = new FileUploadWithPreview(field.name);
  });
  return `<div class="form-group">
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
              <img class="spinner-grow-alert" src="assets/image/flask.png" width="100" height="100" alt="alert_screen">
            </div>
          </div>
    </div>
</div>
</div>`;

function fireSwal(fun, ...args) {
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
  }, 0);
}

function fireSwalWithoutConfirm(fun, ...args) {
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
  }, 0);
}

// fire swal for delete function
function fireSwalForDelete(fun, ...args) {
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
            if (fun.call(this, ...args) != false) {
              swal.fire({
                toast: true,
                position: "top-end",
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

function setServerTable(
  id = "table",
  endPoint,
  attrFun = () => {
    return {};
  },
  columns = [],
  options = {}
) {
  return $(`#${id}`).DataTable({
    processing: true,
    serverSide: true,
    serverMethod: "post",
    ajax: {
      url: endPoint,
      data: function (data) {
        let attr = attrFun();
        data = {
          ...data,
          ...attr,
        };
        return data;
      },
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
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
      lengthMenu: `عرض _MENU_  شريحة`,
      sSearch:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      sSearchPlaceholder: "بحث...",
      sInfo: "عرض _PAGE_ من اصل _PAGES_ صفحة",
      processing: `
                <div class="text-center" >
                    <img class="spinner-grow-alert" src="assets/image/flask.png" width="50" height="50" alt="alert_screen">
                    <h5 class="text-center">جاري التحميل</h5>
                </div>
            `,
      emptyTable: `
            <div class="text-center">
                <img class="" src="assets/image/flask.png" width="50" height="50" alt="alert_screen">
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

function setTable(id = "table", table, options = {}) {
  return $(`#${id}`).DataTable({
    // columnDefs: [{
    //     className: 'dtr-control text-center',
    //     orderable: false,
    //     targets: -1
    // }],
    responsive: {
      details: {
        type: "column",
        target: -1,
      },
    },
    // order: [[3, 'desc']],

    dom:
      "<'dt--top-section'<'row'<'col-sm-12 col-md-4 d-flex justify-content-md-start justify-content-center'B><'col-sm-12 col-md-4 d-flex justify-content-md-center justify-content-center'l><'col-sm-12 col-md-4 d-flex justify-content-md-end justify-content-center mt-md-0 mt-3'f>>>" +
      "<'table-responsive'tr>" +
      "<'dt--bottom-section d-sm-flex justify-content-sm-between text-center'<'dt--pages-count  mb-sm-0 mb-3'i><'dt--pagination'p>>",
    // search: false,

    oLanguage: {
      oPaginate: {
        sPrevious:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
        sNext:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
      },
      sInfo: "Showing page _PAGE_ of _PAGES_",
      sSearch:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      sSearchPlaceholder: "بحث...",
      sLengthMenu: "النتائج :  _MENU_",
      processing: `
                <div class="text-center" >
                    <img class="spinner-grow-alert" src="assets/image/flask.png" width="50" height="50" alt="alert_screen">
                    <h5 class="text-center">جاري التحميل</h5>
                </div>
            `,
      emptyTable: `
            <div class="text-center">
                <img class="" src="assets/image/flask.png" width="50" height="50" alt="alert_screen">
                <h5 class="text-center">لا يوجد بيانات</h5>
            </div>`,
    },
    stripeClasses: [],
    lengthMenu: [10, 50, 100, 200, 400, 800, 1000, 2000],
    // "pageLength": 50,
    order: [],
    buttons: [
      // { extend: 'csv', className: 'btn btn-sm btn-info', text: '<i class="fa fa-file-excel-o"></i> تصدير pdf' },
      {
        extend: "excel",
        className: "btn btn-sm btn-success d-none print-excel",
        text: '<i class="far fa-file-spreadsheet"></i> تصدير إكسيل',
      },
      {
        extend: "print",
        className: "btn btn-sm btn-primary d-none print-page",
        text: '<i class="far fa-print"></i> طباعة',
      },
      {
        className: "btn btn-sm btn-success active-print-excel",
        text: '<i class="far fa-file-spreadsheet"></i> تصدير إكسيل',
      },
      {
        className: "btn btn-sm btn-primary active-print-page",
        text: '<i class="far fa-print"></i> طباعة',
      },
    ],
    ...options,
  });
}

$(".dt-buttons").addClass("btn-group");
function setTable_1(id = "table", options = {}) {
  return $("#" + id).DataTable({
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
    // order: [[3, 'desc']],
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
                    <'col-sm-12 col-md-6 d-flex justify-content-md-end justify-content-center mb-md-3 mb-3 pagination'>
                    <'col-12 d-flex justify-content-center mb-md-3 mb-3'B>
                >
            >`,
    language: {
      oPaginate: {
        sPrevious: '<i class="fas fa-caret-right"></i>',
        sNext: '<i class="fas fa-caret-left"></i>',
      },
      lengthMenu: `عرض _MENU_  شريحة`,
      sSearch:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      sSearchPlaceholder: "بحث...",
      sInfo: "عرض _PAGE_ من اصل _PAGES_ صفحة",
      processing: `
                <div class="text-center" >
                    <img class="spinner-grow-alert" src="assets/image/flask.png" width="50" height="50" alt="alert_screen">
                    <h5 class="text-center">جاري التحميل</h5>
                </div>
            `,
      emptyTable: `
            <div class="text-center">
                <img class="" src="assets/image/flask.png" width="50" height="50" alt="alert_screen">
                <h5 class="text-center">لا يوجد بيانات</h5>
            </div>`,
    },
    lengthMenu: [10, 50, 100, 200, 400, 800, 1000, 2000],
    buttons: {
      buttons: [
        // { extend: 'csv', className: 'btn btn-sm btn-info', text: '<i class="fa fa-file-excel-o"></i> تصدير pdf' },
        {
          extend: "excel",
          className: "btn btn-sm btn-outline-print print-excel",
          text: '<i class="far fa-file-spreadsheet"></i> تصدير إكسيل',
        },
        {
          extend: "print",
          className: "btn btn-sm btn-outline-print print-page",
          text: '<i class="far fa-print"></i> طباعة',
        },
      ],
    },
    ...options,
  });
}

function manageImageSave(imageId) {
  let ImageElement = $(`#${imageId}`);
  let value = null;
  if (!ImageElement.val().includes(`${__domain__}app`)) {
    if (ImageElement.val() == "") {
      value = "";
    } else {
      value = `${__domain__}app` + "/" + ImageElement.val();
    }
  } else {
    value = ImageElement.val();
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
  let form_data = new FormData();
  for (let file of files) {
    form_data.append("files[]", file);
  }
  form_data.append("token", localStorage.token);
  form_data.append("hash_lab", localStorage.lab_hash);
  form_data.append("name", name);
  form_data.append("folder_location", folder);
  return upload(form_data);
}

function uploadFile(file, folder, name) {
  let form_data = new FormData();
  form_data.append("files[]", file);
  form_data.append("token", localStorage.token);
  form_data.append("hash_lab", localStorage.lab_hash);
  form_data.append("name", name);
  form_data.append("folder_location", folder);
  return upload(form_data);
}

const Database_Open = async function (options) {
  return new Promise(function (resolve, reject) {
    var dbReq = indexedDB.open(options.table, 1);
    dbReq.onupgradeneeded = function (event) {
      let db = event.target.result;

      // Create DB Table
      db.createObjectStore(options.table, { keyPath: options.hash });
      console.log(
        `upgrade is called database name: ${db.name} version : ${db.version}`
      );
    };
    dbReq.onsuccess = (e) => {
      let db = e.target.result;
      const tx = db.transaction(options.table, "readwrite");
      tx.onerror = (e) => alert(` Error! ${e.target.error}`);
      let _req = tx.objectStore(options.table);
      let req = _req.getAll();
      req.onsuccess = (e) => {
        if (e.target.result?.[0]) {
          resolve(e.target.result);
        } else {
          let data = run(options.query).result[0].query0;
          for (let i of data) {
            _req.add(i);
          }
          resolve(data);
        }
      };
    };
    dbReq.onerror = function (event) {
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
  let invoice = $(`${Id}`);
  // let printInvoice = '';
  // invoice.each(function () {
  //     printInvoice += $(this).html();
  // })
  let mywindow = window.open();
  mywindow.document.write("<html><head><title>" + document.title + "</title>");
  // add new stylesheet
  mywindow.document.write(
    args.map((arg) => `<link rel="stylesheet" href="${arg}">`).join("")
  );
  mywindow.document.write(`
    <style>
    :root {
        --color-orange: ${invoices?.color ?? "#ff8800"};
    }
    </style>
    `);
  // add bootstrap
  mywindow.document.write(
    '<link href="bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" />'
  );
  mywindow.document.write(
    '<link rel="stylesheet" href="plugins/font-awesome/css/all.css">'
  );
  mywindow.document.write("</head><body >");
  invoice.each(function () {
    // remove display none
    let element = $(this).clone();
    element.removeAttr("style");
    mywindow.document.write(element.prop("outerHTML"));
  });
  // mywindow.document.write(printInvoice);
  // add jquery
  mywindow.document.write(
    '<script src="assets/js/jquery-3.5.1.min.js"></script>'
  );
  // add bootstrap

  mywindow.document.write(
    '<script src="bootstrap/js/bootstrap.min.js"></script>'
  );
  mywindow.document.write("</body></html>");
  mywindow.document.close(); // necessary for IE >= 10
  mywindow.focus(); // necessary for IE >= 10*/
  //mywindow ready to print
  mywindow.onafterprint = function () {
    mywindow.close();
  };
  mywindow.onload = function () {
    setTimeout(function () {
      mywindow.print();
    }, 100);
  };
  window["pdf"] = mywindow;
  return true;
}

//dom ready
let code = "";
let reading = false;

document.addEventListener("keypress", (e) => {
  //usually scanners throw an 'Enter' key at the end of read
  if (e.keyCode === 13) {
    if (code.length > 10) {
      // get current page
      let page = window.location.pathname.split("/").pop();
      // check if page visits
      if (page == "visits.html") {
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
        window.location.href = "visits.html?barcode=" + code;
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
