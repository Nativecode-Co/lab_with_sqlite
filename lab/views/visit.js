// override Factory class
class Visit extends Factory {
  init() {
    this.createModal();
    const userType = localStorage.getItem("user_type");
    this.dataTable = setServerTable(
      "lab_visits-table",
      `${api_url}/visit/get_visits`,
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
            <a class="btn-action add" title"تحميل النتائج" onclick="dwonloadInvoice('${row.hash}')">
            <i class="fas fa-file-pdf"></i>
            </a>

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

const waitDwonloadElement = `<div id="alert_screen" class="alert_screen"> 
<div class="loader">
    <div class="loader-content">
        <div class="card" style="width: 40rem;">
            <div class="card-body text-center">
              <h1 class="card-title">الرجاء الانتظار </h1>
              <h4>جاري تحميل الفاتورة</h4>
              <img class="spinner-grow-alert" src="${front_url}assets/image/flask.png" width="100" height="100" alt="alert_screen">
              <div class="w-100 mt-5"></div>
            </div>
          </div>
    </div>
</div>
</div>`;

function dwonloadInvoice(hash) {
  const body = document.getElementsByTagName("body")[0];
  body.insertAdjacentHTML("beforeend", waitDwonloadElement);
  let lab_hash = localStorage.getItem("lab_hash");

  fetch(`${base_url}Pdf/dwonload?pk=${hash}&lab=${lab_hash}`).then((res) => {
    $("#alert_screen").remove();
    Swal.fire({
      icon: "success",
      title: "تم تحميل النتائج",
      showCancelButton: true,
      cancelButtonText: "الغاء",
      confirmButtonText: "عرض مجلد النتائج",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${base_url}Pdf/openFolder?pk=${hash}&lab=${lab_hash}`);
      }
    });
  });
}
