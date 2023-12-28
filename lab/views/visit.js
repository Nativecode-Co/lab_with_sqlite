"use strict";

// override Factory class
class Visit extends Factory {
  init() {
    this.createModal();
    let userType = localStorage.getItem("user_type");
    this.dataTable = setServerTable(
      "lab_visits-table",
      `${base_url}Visit/getVisits`,
      () => {
        return { lab_id: localStorage.getItem("lab_hash") };
      },
      [
        {
          data: "null",
          render: function (data, type, row) {
            return `
                        <a  onclick="location.href='visit_history.html?visit=${row.hash}'">${row.name}</i></a>
                    
                        `;
          },
        },
        { data: "visit_date" },
        {
          data: null,
          className: "center not-print",
          render: function (data, type, row) {
            return `
                        <a class="btn-action add" title="تفاصيل الزيارة" onclick="location.href='visit_history.html?visit=${
                          row.hash
                        }'"><i class="far fa-external-link"></i></a>
                        ${
                          userType == "2" && row.ispayed == "0"
                            ? `<a class="btn-action delete" title="حذف" onclick="lab_visits.deleteItem('${row.hash}')"><i class="fas fa-trash"></i></a>`
                            : ""
                        }
                        `;
          },
          sorter: function (a, b) {
            return a.length - b.length;
          },
        },
        {
          data: null,
          className: "text-success center",
          defaultContent: '<i class="fas fa-plus"></i>',
        },
      ]
    );
  }

  pageCondition() {
    return `
        select count(*) as count from ${this.table}
        inner join 
            lab_patient 
        on 
            lab_patient.hash = lab_visits.visits_patient_id
        where 
            lab_id=${localStorage.getItem("lab_hash")} and 
            visit_date = CURDATE()`;
  }
}

// init lab_patient class

let lab_visits = new Visit("lab_visits", " مريض", [
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
$(function () {
  $(".dt-buttons").addClass("btn-group");
  $("div.addCustomItem").html(
    `<span class="table-title">قائمة الزيارات</span>`
  );
});
