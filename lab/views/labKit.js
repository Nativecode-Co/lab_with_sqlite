const kits = fetchApi("/labkits/get_kits_groups");

class LabKit extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_kits-table",
      `${api_url}/labkits/get_kits`,
      () => {
        return { lab_id: localStorage.getItem("lab_hash") };
      },
      [
        { data: "name" },
        { data: "quantity" },
        { data: "purchase_price" },
        { data: "note" },
        {
          data: null,
          className: "center",
          sortable: false,
          render: (
            data,
            type,
            row
          ) => `<a href="#" onclick="labKits.updateItem('${row.hash}')" class="text-success"><i class="far fa-edit fa-lg mx-2"></i></a>
                                <a href="#" onclick="fireSwalForDelete.call(labKits,labKits.deleteItem,'${row.hash}')" class="text-danger"><i class="far fa-trash fa-lg mx-2"></i></a>`,
        },
      ]
    );
  }

  getNewData() {
    const data = super.getNewData();
    data.lab_id = localStorage.getItem("lab_hash");
    data.type2 = Math.floor(Math.random() * 900000) + 100000;
    return data;
  }

  updateItem(hash) {
    const data = fetchApi(`/labkits/get_kit?hash=${hash}`);
    fillForm(this.formId, this.fields, data);
    super.updateItem(hash);
  }

  saveNewItem() {
    const data = this.getNewData();
    fetchApi("/labkits/create_kit", "POST", data);
    this.dataTable.ajax.reload(null, false);
    $(`#${this.modalId}`).modal("hide");
  }

  saveUpdateItem(hash) {
    const data = { ...this.getUpdateData(), hash };
    fetchApi("/labkits/update_kit", "POST", data);
    this.dataTable.ajax.reload(null, false);
    $(`#${this.modalId}`).modal("hide");
  }

  deleteItem(hash) {
    fetchApi("/labkits/delete_kit", "POST", { hash });
    this.dataTable.ajax.reload(null, false);
  }
}

// init labKit class

const labKits = new LabKit("labKits", " أداة مختبر", [
  { name: "hash", type: null },
  { name: "id", type: null },
  {
    name: "name",
    type: "select",
    label: "اسم الأداة",
    options: kits.map((kit) => {
      return { hash: kit.id, text: kit.name };
    }),
  },
  { name: "quantity", type: "number", label: "الكمية" },
  { name: "purchase_price", type: "number", label: "سعر الشراء" },
  { name: "total_price", type: "number", label: "السعر الإجمالي" },
  { name: "note", type: "text", label: "ملاحظات" },
  { name: "date", type: "date", label: "تاريخ" },
  { name: "status", type: "text", label: "الحالة" },
  { name: "expiry_date", type: "date", label: "تاريخ الانتهاء" },
]);

$(() => {
  $(".dt-buttons").addClass("btn-group");
  $("div.addCustomItem").html(
    `<span class="table-title">قائمة أدوات المختبر</span><button onclick="labKits.newItem()" class="btn-main-add ml-4"><i class="far fa-flask mr-2"></i> إضافة أداة</button>`
  );
});
