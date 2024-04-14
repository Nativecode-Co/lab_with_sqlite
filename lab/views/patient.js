class Patient extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_patient-table",
      `${api_url}/patient/get_patients`,
      () => {
        return {};
      },
      [
        {
          data: "name",
          className: "center",
          render: (data, type, row) => {
            return `<span onclick="location.href='patient_history.html?patient=${row.hash}'">${row.name}</span>`;
          },
        },
        { data : "visit_date",
          className: "center",
          render: (data, type, row) => {
            return data ? data : "لم يتم الزيارة";
          },
        },
        { data: "phone",
          className: "center",
          render: (data, type, row) => {
            return data ? data : "لا يوجد رقم هاتف";
          },
      
      },
        {
          data: null,
          className: "center not-print",
          render: (data, type, row) => {
            return `
                        <a class="btn-action" title="تفاصيل المريض" onclick="location.href='patient_history.html?patient=${row.hash}'"><i class="far fa-eye"></i></a>
                    <a class="btn-action" title="تعديل بيانات المريض" onclick="lab_patient.updateItem('${row.hash}')"><i class="fas fa-edit"></i></a>
                    <a class="btn-action delete" title="حذف المريض" onclick="fireSwalForDelete.call(lab_patient,lab_patient.deleteItem, '${row.hash}')"><i class="far fa-trash-alt"></i></a>
                        `;
          },
        },
        {
          data: null,
          className: "text-success center",
          defaultContent: '<i class="fas fa-plus"></i>',
        },
      ],
      [[1, "desc"]]
    );
  }

  updateItem(hash) {
    const data = fetchApi(`/patient/get_patient?hash=${hash}`);
    fillForm(this.formId, this.fields, data);
    super.updateItem(hash);
  }

  saveNewItem() {
    const phone = document.getElementById("phone").value;
    const { isExist, hash } = fetchApi("/patient/patientIsExist", "POST", {
      phone,
    });
    if (isExist) {
      Swal.fire({
        title: "تنبيه",
        text: "هذا الرقم تابع لمريض مسجل بالفعل",
        icon: "warning",
        confirmButtonText: "موافق",
      });
      return false;
    }
    const data = this.getNewData();
    fetchApi("/patient/create_patient", "POST", data);
    this.dataTable.ajax.reload(null, false);
    // close modal
    $(`#${this.modalId}`).modal("hide");
  }

  saveUpdateItem(hash) {
    const data = { ...this.getUpdateData(), hash };
    fetchApi("/patient/update_patient", "POST", data);
    this.dataTable.ajax.reload(null, false);
    $(`#${this.modalId}`).modal("hide");
  }

  deleteItem(hash) {
    fetchApi("/patient/delete_patient", "POST", { hash });
    this.dataTable.ajax.reload(null, false);
  }
}

// init lab_patient class

const lab_patient = new Patient("lab_patient", " مريض", [
  { name: "hash", type: null },
  { name: "birth", type: null },
  { name: "name", type: "text", label: "الاسم", req: "required" },
  {
    name: "gender",
    type: "select",
    label: "الجنس",
    options: [
      { hash: "ذكر", text: "ذكر" },
      { hash: "أنثى", text: "أنثى" },
    ],
    req: "required",
  },
  { name: "birth", type: "date", label: "تاريخ الميلاد", req: "required" },
  { name: "address", type: "text", label: "العنوان", req: "" },
  { name: "phone", type: "text", label: "رقم الهاتف", req: "required" },
]);

// dom ready
$(() => {
  $(".dt-buttons").addClass("btn-group");
  $("div.addCustomItem").html(
    `<span class="table-title">قائمة المرضى</span><button onclick="lab_patient.newItem()" class="btn-main-add ml-4"><i class="far fa-user-injured mr-2"></i> أضافة مريض</button>`
  );
});
