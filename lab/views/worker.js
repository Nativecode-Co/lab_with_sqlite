class Worker extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_invoice_worker-table",
      "http://localhost:8807/api/app/index.php/workers/get_workers",
      () => {
        return { lab_id: localStorage.getItem("lab_hash") };
      },
      [
        {
          data: "name",
        },
        {
          data: "jop",
        },
        {
          data: "is_available",
          render: (data, type, row) =>
            row.is_available === "1" ? "متاح" : "غير متاح",
        },
        {
          data: null,
          sortable: false,
          className: "center not-print",
          render: (data, type, row) => `
                        <a class="btn-action" onclick="lab_invoice_worker.updateItem('${row.hash}')"><i class="fas fa-edit"></i></a>
                        <a class="btn-action delete" onclick="fireSwalForDelete.call(lab_invoice_worker,lab_invoice_worker.deleteItem, '${row.hash}')"><i class="far fa-trash-alt"></i></a>`,
        },
        {
          data: null,
          className: "text-success center",
          defaultContent: '<i class="fas fa-plus"></i>',
        },
      ]
    );
  }

  updateItem(hash) {
    const data = fetchApi(`/workers/get_worker?hash=${hash}`);
    fillForm(this.formId, this.fields, data);
    super.updateItem(hash);
  }

  saveNewItem() {
    const data = this.getNewData();
    fetchApi("/workers/create_worker", "POST", data);
    this.dataTable.ajax.reload(null, false);
    // close modal
    $(`#${this.modalId}`).modal("hide");
  }

  saveUpdateItem(hash) {
    const data = { ...this.getUpdateData(), hash };
    fetchApi("/workers/update_worker", "POST", data);
    this.dataTable.ajax.reload(null, false);
    $(`#${this.modalId}`).modal("hide");
  }

  deleteItem(hash) {
    fetchApi("/workers/delete_worker", "POST", { hash });
    this.dataTable.ajax.reload(null, false);
  }
}

// init worker class

const lab_invoice_worker = new Worker("lab_invoice_worker", " اجازة", [
  { name: "hash", type: null },
  { name: "name", type: "text", label: "الاسم", req: "required" },
  { name: "jop", type: "text", label: "التخصص بالعربي", req: "required" },
  {
    name: "jop_en",
    type: "text",
    label: "التخصص بالانجليزية",
    req: "required",
  },
  {
    name: "is_available",
    type: "checkbox",
    label: "الظهور على الفورمة",
    req: "",
  },
]);

$(() => {
  $(".dt-buttons").addClass("btn-group");
  $("div.addCustomItem").html(
    `<span class="table-title">قائمة الاجازات</span><button onclick="lab_invoice_worker.newItem()" class="btn-main-add ml-4"><i class="far fa-user-md mr-2"></i> أضافة اجازة</button>`
  );
});
