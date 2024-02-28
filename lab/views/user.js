class User extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "system_users-table",
      "http://localhost:8807/api/app/index.php/users/get_users",
      () => {
        return { lab_id: localStorage.getItem("lab_hash") };
      },
      [
        { data: "username" },
        { data: "user_type_name" },
        {
          data: null,
          className: "center",
          sortable: false,
          render: (
            data,
            type,
            row
          ) => `<a href="#" onclick="system_users.updateItem('${row.hash}')" class="text-success"><i class="far fa-edit fa-lg mx-2"></i></a>
                                <a href="#" onclick="fireSwalForDelete.call(system_users,system_users.deleteItem,'${row.hash}')" class="text-danger"><i class="far fa-trash fa-lg mx-2"></i></a>`,
        },
        {
          data: null,
          className: "text-success center",
          defaultContent: '<i class="fas fa-plus"></i>',
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

  newItem() {
    super.newItem();
    $("#user_type").val("111").trigger("change");
  }

  updateItem(hash) {
    const data = fetchApi(`/users/get_user?hash=${hash}`);
    fillForm(this.formId, this.fields, data);
    super.updateItem(hash);
  }

  saveNewItem() {
    const data = this.getNewData();
    fetchApi("/users/create_user", "POST", data);
    this.dataTable.ajax.reload(null, false);
    // close modal
    $(`#${this.modalId}`).modal("hide");
  }

  saveUpdateItem(hash) {
    const data = { ...this.getUpdateData(), hash };
    fetchApi("/users/update_user", "POST", data);
    this.dataTable.ajax.reload(null, false);
    $(`#${this.modalId}`).modal("hide");
  }

  deleteItem(hash) {
    fetchApi("/users/delete_user", "POST", { hash });
    this.dataTable.ajax.reload(null, false);
  }
}

// init patient class

const system_users = new User("system_users", " موظف", [
  { name: "hash", type: null },
  { name: "id", type: null },
  { name: "username", type: "text", label: "اسم الموظف" },
  { name: "password", type: "password", label: "كلمة المرور" },
  {
    name: "user_type",
    type: "select",
    label: "الوظيفة",
    options: [{ text: "موظف مختبري (ادارة الزيارات والتحاليل)", hash: "111" }],
  },
]);

$(() => {
  $(".dt-buttons").addClass("btn-group");
  $("div.addCustomItem").html(
    `<span class="table-title">قائمة الموظفين</span><button onclick="system_users.newItem()" class="btn-main-add ml-4"><i class="far fa-users-md mr-2"></i> أضافة موظف</button>`
  );
});

// dom ready
$(() => {
  // user_type select first option
  $("#user_type").val("111").trigger("change");
});
