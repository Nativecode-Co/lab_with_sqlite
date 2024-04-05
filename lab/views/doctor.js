const partments = fetchApi("/doctors/get_partments");
// override Factory class
class Doctor extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_doctor-table",
      `${api_url}/doctors/get_doctors`,
      () => {
        return { lab_id: localStorage.getItem("lab_hash") };
      },
      [
        { data: "name" },
        { data: "commission" },
        { data: "partment_name" },
        { data: "phone" },
        {
          data: null,
          sortable: false,
          className: "center not-print",
          render: (data, type, row) => `
                        <a class="btn-action" onclick="lab_doctor.updateItem('${row.hash}')"><i class="fas fa-edit"></i></a>
                    <a class="btn-action delete" onclick="fireSwalForDelete.call(lab_doctor,lab_doctor.deleteItem, '${row.hash}')"><i class="far fa-trash-alt"></i></a>
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
    const data = fetchApi(`/doctors/get_doctor?hash=${hash}`);
    fillForm(this.formId, this.fields, data);
    super.updateItem(hash);
  }

  saveNewItem() {
    const data = this.getNewData();
    fetchApi("/doctors/create_doctor", "POST", data);
    this.dataTable.ajax.reload(null, false);
    // close modal
    $(`#${this.modalId}`).modal("hide");
  }

  saveUpdateItem(hash) {
    const data = { ...this.getUpdateData(), hash };
    fetchApi("/doctors/update_doctor", "POST", data);
    this.dataTable.ajax.reload(null, false);
    $(`#${this.modalId}`).modal("hide");
  }

  deleteItem(hash) {
    fetchApi("/doctors/delete_doctor", "POST", { hash });
    this.dataTable.ajax.reload(null, false);
  }
}

// init patient class

const lab_doctor = new Doctor("lab_doctor", " طبيب", [
  { name: "hash", type: null },
  { name: "name", type: "text", label: "الاسم", req: "required" },
  {
    name: "partmen_hash",
    type: "select",
    label: "التخصص",
    req: "required",
    options: partments,
  },
  {
    name: "commission",
    type: "number",
    label: "نسبة الطبيب %",
    req: "required",
  },
  // { name: 'jop', type: 'text', label: 'التخصص', req: 'required' },
  { name: "phone", type: "text", label: "رقم الهاتف", req: "required" },
]);

$(() => {
  $(".dt-buttons").addClass("btn-group");
  $("div.addCustomItem").html(
    `<span class="table-title">قائمة الاطباء</span><button onclick="lab_doctor.newItem()" class="btn-main-add ml-4"><i class="far fa-user-md mr-2"></i> أضافة طبيب</button>`
  );
});
