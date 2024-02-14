let updates = [];
let inserts = [];

const body = document.getElementsByTagName("body")[0];

const syncInserts = async () => {
  body.insertAdjacentHTML("beforeend", waitElement);
  const { data: lastSyncDateForForm } = fetchData(
    "LocalApi/get_last_update_date",
    "GET",
    {}
  );
};

async function getAsyncData() {
  if (!navigator.onLine) {
    Swal.fire({
      icon: "error",
      title: "تحذير !",
      text: "لا يوجد اتصال بالانترنت",
      confirmButtonText: "موافق",
    });
    return false;
  }
  await new Promise((resolve) => {
    body.insertAdjacentHTML("beforeend", waitElement);
    const { data: lastSyncDateForForm } = fetchData(
      "LocalApi/get_last_update_date",
      "GET",
      {}
    );
    const lastSyncDate = new Date(lastSyncDateForForm).toLocaleDateString(
      "en-GB"
    );
    const response = fetchDataOnline("Offline/getAsyncData", "post", {
      date: lastSyncDateForForm,
    });
    updates = response.updates;
    inserts = response.inserts;
    const areTestsFounded =
      run(
        `select test_name from lab_test where test_name in('${inserts
          .map((item) => item.name)
          .join("','")}') group by test_name;`
      ).result[0]?.query0 ?? [];
    inserts = inserts.filter((item) => !areTestsFounded.includes(item.name));
    Swal.close();
    const syncBodyModal = document.getElementById("sync_body");

    if (inserts.length > 0) {
      syncBodyModal.innerHTML = "";
      syncBodyModal.innerHTML += `
          <div id="update_tests" class="row justify-content-around">
              <div class="col-12">
                  <h5 class="text-center"> أختر التحاليل التي تريد اضافتها </h5>
              </div>
              <div 
                class="col-5 border rounded p-2 my-2 d-flex justify-content-center align-items-center" 
                style="cursor: pointer;"
                onclick="selectAll(event);$(this).toggleClass('all');"
              >
                <p class="text-center">
                    <span class="h4">اختار الكل</span>
                </p>
              </div>
              <div class="w-100"></div>
              ${inserts
                .map((item) => {
                  let date = item.date_time;
                  // iraq en 28-7-2023
                  date = new Date(date).toLocaleDateString("en-GB");
                  // compare date and lastSyncDate
                  const compareDate = new Date(date) > new Date(lastSyncDate);

                  return `<div class="col-5 border rounded p-2 my-2 d-flex justify-content-center align-items-center syncItem" style="cursor: pointer;"
                      onclick="$(this).toggleClass('active');"
                     >
                          <p class="text-center">
                              <span class="h4">${item.name}</span>
                              <br>
                              <span class="h6">اخر تحديث للتحليل : <span
                                      class="text-${
                                        compareDate ? "success" : "danger"
                                      }"
                              >${date}</span></span>
                          </p>
                      </div>
                      `;
                })
                .join("")}
          </div>
          `;
    }

    if (updates.length > 0) {
      const updatesTests =
        run(
          `select test_name,hash from lab_test where hash in(${updates
            .map((item) => item.hash)
            .join(",")}) group by test_name;`
        ).result[0]?.query0 ?? [];
      if (updatesTests.length > 0) {
        syncBodyModal.innerHTML += `
          <div id="update_tests" class="row justify-content-around">
              <div class="col-12">
                  <h5 class="text-center"> أختر التحاليل التي تريد تحديثها </h5>
                  <h6 class="text-center"> علما بأن اخر تحديث لك كان في : <span class="text-info">${lastSyncDate}</span> </h6>
                  <h6 class="text-center"> المزامنة لا تضمن فقط تحديث التحاليل المختارة بل تحديث جميع البيانات </h6>
                  
              </div>
              <div 
                class="col-5 border rounded p-2 my-2 d-flex justify-content-center align-items-center" 
                style="cursor: pointer;"
                onclick="selectAll(event);$(this).toggleClass('all');"
              >
                <p class="text-center">
                    <span class="h4">اختار الكل</span>
                </p>
              </div>
              <div class="w-100"></div>
              ${updatesTests
                .map((item) => {
                  let date = updates.find(
                    (i) => i.hash === item.hash
                  ).date_time;
                  // iraq en 28-7-2023
                  date = new Date(date).toLocaleDateString("en-GB");
                  // compare date and lastSyncDate
                  const compareDate = new Date(date) > new Date(lastSyncDate);

                  return `<div class="col-5 border rounded p-2 my-2 d-flex justify-content-center align-items-center syncItem" style="cursor: pointer;"
                      data-hash="${item.hash}"
                      onclick="$(this).toggleClass('active');"
                     >
                          <p class="text-center">
                              <span class="h4">${item.test_name}</span>
                              <br>
                              <span class="h6">اخر تحديث للتحليل : <span
                                      class="text-${
                                        compareDate ? "success" : "danger"
                                      }"
                              >${date}</span></span>
                          </p>
                      </div>
                      `;
                })
                .join("")}
          </div>
          `;
      } else {
        syncBodyModal.innerHTML += `
            <div id="update_tests" class="row">
                <div class="col-12">
                    <h5 class="text-center"> لا يوجد تحديثات </h5>
                </div>
            </div>
            `;
      }
    } else {
      syncBodyModal.innerHTML = "";
      syncBodyModal.innerHTML += `
          <div id="update_tests" class="row">
              <div class="col-12">
                  <h5 class="text-center"> لا يوجد تحديثات </h5>
              </div>
          </div>
          `;
    }

    $("#sync").modal("show");
    resolve();
  }).then(() => {
    body.removeChild(document.getElementById("alert_screen"));
  });
}

async function runAsyncData() {
  const body = document.getElementsByTagName("body")[0];
  body.insertAdjacentHTML("beforeend", waitElement);
  // queries = inserts.map((query) => query.query);
  const updatesSelected = document.querySelectorAll("#update_tests .active");
  if (updatesSelected.length > 0) {
    const updateTestsHash = Array.from(updatesSelected).map(
      (item) => item.dataset.hash
    );
    const updateTests = updates.filter((item) =>
      updateTestsHash.includes(item.hash)
    );
    queries = [...queries, ...updateTests.map((item) => item.query)];
  }
  const queriesForm = new FormData();
  queriesForm.append("queries", JSON.stringify(queries));
  const quer = await fetch(`${base_url}LocalApi/run_queries`, {
    method: "POST",
    body: queriesForm,
  })
    .then((res) => res.json())
    .then(() => {
      body.removeChild(document.getElementById("alert_screen"));
      $("#sync").modal("hide");
    });
  run(
    `insert into system_users_type (hash,title,insert_record_date) values ('1','update by ${
      localStorage.getItem("name") ?? ""
    }','${new Date().toISOString().slice(0, 19).replace("T", " ")}');`
  );
  niceSwal("success", "bottom-end", "تم تحديث البيانات بنجاح");
}
