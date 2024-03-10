let tests = fetchApi("/maintests/get_tests_options");
tests = tests.map((test) => ({ hash: test.hash, text: test.name }));
// override Factory class
class Alias extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "test_alias-table",
      "http://localhost:8807/api/app/index.php/alias/get_aliases",
      () => {
        return {};
      },
      [
        { data: "alias" },
        { data: "test" },
        {
          data: null,
          sortable: false,
          className: "center not-print",
          render: (data, type, row) => `
                        <a class="btn-action" onclick="test_alias.updateItem('${row.hash}')"><i class="fas fa-edit"></i></a>
                    <a class="btn-action delete" onclick="fireSwalForDelete.call(test_alias,test_alias.deleteItem, '${row.hash}')"><i class="far fa-trash-alt"></i></a>
                        `,
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
    const data = fetchApi("/alias/get_alias", "GET", { hash });
    fillForm(this.formId, this.fields, data);
    super.updateItem(hash);
  }

  saveNewItem() {
    const data = this.getNewData();
    fetchApi("/alias/create_alias", "POST", data);
    this.dataTable.ajax.reload(null, false);
    // close modal
    $(`#${this.modalId}`).modal("hide");
  }

  saveUpdateItem(hash) {
    const data = { ...this.getUpdateData(), hash };
    fetchApi("/alias/update_alias", "POST", data);
    this.dataTable.ajax.reload(null, false);
    $(`#${this.modalId}`).modal("hide");
  }

  deleteItem(hash) {
    fetchApi("/alias/delete_alias", "POST", { hash });
    this.dataTable.ajax.reload(null, false);
  }
}

// init patient class

const test_alias = new Alias("test_alias", " اختصار", [
  { name: "hash", type: null },
  { name: "alias", type: "text", label: "الاسم", req: "required" },
  {
    name: "test_hash",
    type: "select",
    label: "التحليل",
    req: "required",
    options: tests,
  },
  {
    name: "type",
    type: "select",
    label: "النوع",
    req: "required",
    options: [
      { hash: "A", text: "A" },
      { hash: "B", text: "B" },
      { hash: "C", text: "C" },
    ],
  },
]);

$(() => {
  $(".dt-buttons").addClass("btn-group");
  $("div.addCustomItem").html(
    `<span class="table-title">قائمة الاختصارات</span><button onclick="test_alias.newItem()" class="btn-main-add ml-4"><i class="far fa-user-md mr-2"></i> أضافة اختصار</button>`
  );
});
