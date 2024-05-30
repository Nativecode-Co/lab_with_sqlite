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
            row
          ) => `<a href="#" onclick="labKits.updateItem('${row.hash}')" class="text-success"><i class="far fa-edit fa-lg mx-2"></i></a>
                                <a href="#" onclick="fireSwalForDelete.call(labKits,labKits.deleteItem,'${row.hash}')" class="text-danger"><i class="far fa-trash fa-lg mx-2"></i></a>`,
        },
        {
          data: null,
          className: "text-success center",
          defaultContent: '<i class="fas fa-plus"></i>',
        },
      ]
    );

    // Attach event listeners for quantity and purchase price fields
    $('[name="quantity"], [name="purchase_price"]').on(
      "input",
      this.updateTotalPrice
    );
  }

  validate() {
    let isValid = true;
    const requiredFields = [
      "kit",
      "quantity",
      "purchase_price",
      "date",
      "status",
      "expiry_date",
    ];

    requiredFields.forEach((field) => {
      const value = $(`[name=${field}]`).val();
      if (!value) {
        $(`[name=${field}]`).addClass("is-invalid");
        isValid = false;
      } else {
        $(`[name=${field}]`).removeClass("is-invalid");
      }
    });

    return isValid;
  }

  updateTotalPrice() {
    const quantity = parseFloat($('[name="quantity"]').val()) || 0;
    const purchasePrice = parseFloat($('[name="purchase_price"]').val()) || 0;
    const totalPrice = quantity * purchasePrice;
    $('[name="total_price"]').val(totalPrice.toFixed(2));
  }

  getNewData() {
    const data = super.getNewData();
    data.lab_id = localStorage.getItem("lab_hash");
    return data;
  }

  updateItem(hash) {
    const data = fetchApi(`/labkits/get_kit?hash=${hash}`);
    fillForm(this.formId, this.fields, data);
    super.updateItem(hash);
  }

  saveNewItem() {
    if (!this.validate()) return;
    const data = this.getNewData();
    fetchApi("/labkits/create_kit", "POST", data);
    this.dataTable.ajax.reload(null, false);
    $(`#${this.modalId}`).modal("hide");
  }

  saveUpdateItem(hash) {
    if (!this.validate()) return;
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
    name: "kit",
    type: "select",
    label: "اسم الأداة",
    options: kits.map((kit) => {
      return { hash: kit.id, text: kit.name };
    }),
    req: "required",
  },
  { name: "quantity", type: "number", label: "الكمية", req: "required" },
  {
    name: "purchase_price",
    type: "number",
    label: "سعر الشراء",
    req: "required",
  },
  {
    name: "total_price",
    type: "number",
    label: "السعر الإجمالي",
    req: "disabled",
  },
  { name: "note", type: "textarea", label: "ملاحظات" },
  { name: "date", type: "date", label: "تاريخ الشراء", req: "required" },
  { name: "status", type: "text", label: "الحالة", req: "required" },
  {
    name: "expiry_date",
    type: "date",
    label: "تاريخ انتهاء الصلاحية",
    req: "required",
  },
]);

$(() => {
  $(".dt-buttons").addClass("btn-group");
  $("div.addCustomItem").html(
    `<span class="table-title">قائمة أدوات المختبر</span><button onclick="labKits.newItem()" class="btn-main-add ml-4"><i class="far fa-flask mr-2"></i> إضافة أداة</button>`
  );
});
