// override Factory class
class Visit extends Factory {
  init() {
    this.createModal();
    const userType = localStorage.getItem("user_type");
    this.dataTable = setServerTable(
      "lab_visits-table",
      "http://localhost:8807/api/app/index.php/visit/get_visits",
      () => {
        return {
          today: 0,
        };
      },
      [
        {
          data: "lab_patient.name",
          name: "lab_patient.name",
          order: ["lab_patient.name", "asc"],
          render: (data, type, row) => {
            return `
            <a  onclick="location.href='visit_history.html?visit=${row.hash}'">${row.name}</i></a>
              `;
          },
        },
        {
          data: "visit_date",
        },
        {
          data: null,
          className: "not-print",
          render: (data, type, row) => {
            return `
            <a class="btn-action add" title="تفاصيل الزيارة" onclick="location.href='visit_history.html?visit=${
              row.hash
            }'"><i class="far fa-external-link"></i></a>
            ${
              userType === "2" && row.ispayed === "0"
                ? `<a class="btn-action delete" title="حذف" onclick="lab_visits.deleteItem('${row.hash}')"><i class="fas fa-trash"></i></a>`
                : ""
            }
            `;
          },
        },
        {
          data: null,
          className: "text-success",
          defaultContent: '<i class="fas fa-plus"></i>',
        },
      ],
      [[1, "desc"]]
    );
  }

  deleteItem(hash) {
    fetchApi("/visit/delete_visit", "POST", { hash });
    this.dataTable.ajax.reload(null, false);
  }
}

// init lab_patient class

const lab_visits = new Visit("lab_visits", " مريض", [
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
    `<span class="table-title">قائمة الزيارات</span>`
  );
});
