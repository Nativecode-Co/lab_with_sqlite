// global variables
let updates = [];
let inserts = [];
const body = document.getElementsByTagName("body")[0];

const onStepChanging = (event, currentIndex, newIndex) => {
  switch (currentIndex) {
    case 0:
      break;
    case 1:
      saveInserts();
      break;
    case 2:
      saveUpdates();
      break;
    default:
      break;
  }
  switch (newIndex) {
    case 0:
      break;
    case 1:
      syncInserts();
      break;
    case 2:
      syncUpdates();
      break;
    default:
      break;
  }
  return true;
};
// start steps model
$("#syncSteps").steps({
  headerTag: "h3",
  bodyTag: "section",
  transitionEffect: "slideLeft",
  autoFocus: true,
  cssClass: "pills wizard",
  enableAllSteps: false,
  stepsOrientation: "vertical",
  enableFinishButton: true,
  titleTemplate: "#title#",
  loadingTemplate: waitElement,

  labels: {
    cancel: "الغاء",
    current: "الخطوة الحالية:",
    pagination: " ترقيم الصفحات",
    finish: "حفظ وانهاء",
    next: "حفظ والتالي",
    previous: "حفظ والسابق",
    loading: "جاري التحميل ...",
  },
  onStepChanging: (event, currentIndex, newIndex) => {
    fireSwal(onStepChanging, event, currentIndex, newIndex);
    return true;
  },
  onFinishing: (event, currentIndex) => {
    $("#sync").modal("hide");
    fireSwal(onStepChanging, event, currentIndex, 0);
    return true;
  },
});

const syncInserts = async () => {
  const newTestsElement = document.getElementById("syncSteps-p-1");
  newTestsElement.innerHTML = "";
  const response = fetchDataOnline("Offline/getSyncInserts", "post", {});
  inserts = response.data;
  const areTestsFounded = fetchData(
    "LocalApi/check_if_test_exit_by_name",
    "GET",
    {
      names: inserts.map((item) => item.name).join("','"),
    }
  ).data;
  inserts = inserts.filter((item) => !areTestsFounded.includes(item.name));
  newTestsElement.innerHTML += `
          <div id="insert_tests" class="row justify-content-around">
              <div class="col-12">
                  <h5 class="text-center"> أختر التحاليل التي تريد اضافتها </h5>
              </div>
              ${inserts
                .map((item) => {
                  let date = item.date_time;
                  date = new Date(date).toLocaleDateString("en-GB");
                  return `<div class="col-5 border rounded p-2 my-2 d-flex justify-content-center align-items-center syncItem" style="cursor: pointer;"
                      onclick="$(this).toggleClass('active');"
                      data-name="${item.name}"
                     >
                          <p class="text-center">
                              <span class="h4">${item.name}</span>
                              <br>
                              <span class="h6">${date}</span>
                          </p>
                      </div>
                      `;
                })
                .join("")}
          </div>
          `;
};

const saveInserts = async () => {
  let queries = [];
  const insertsSelected = document.querySelectorAll("#insert_tests .active");
  if (insertsSelected.length > 0) {
    const insertTestsNames = Array.from(insertsSelected).map(
      (item) => item.dataset.name
    );
    const insertTests = inserts.filter((item) =>
      insertTestsNames.includes(item.name)
    );
    queries = [...queries, ...insertTests.map((item) => item.query)];
    new Promise((resolve) => {
      fetchData("LocalApi/run_queries", "POST", {
        queries: JSON.stringify(queries),
      });
      return resolve();
    }).then(() => {
      niceSwal("success", "bottom-end", "تم تحديث البيانات بنجاح");
    });
  }
  niceSwal("success", "bottom-end", "لم يتم اختيار اي تحليل");
};

const syncUpdates = async () => {
  const updateTestsElement = document.getElementById("syncSteps-p-2");
  updateTestsElement.innerHTML = "";
  const response = fetchDataOnline("Offline/getSyncUpdates", "POST", {});
  updates = response.data;
  const updatesTests = fetchData(
    "LocalApi/get_dates_for_tests_to_check_update",
    "POST",
    {
      hashes: updates.map((item) => item.hash).join("','"),
    }
  ).data;
  updates = updates.filter((item) => {
    const date = updatesTests.find((i) => i.hash === item.hash)?.date;
    if (!date) return false;
    return new Date(item.date_time) > new Date(date);
  });

  console.log(updates);
  if (updates.length > 0) {
    updateTestsElement.innerHTML += `
          <div id="update_tests" class="row justify-content-around">
              <div class="col-12">
                  <h5 class="text-center"> أختر التحاليل التي تريد تحديثها </h5>
              </div>
              ${updates
                .map((item) => {
                  let date = item.date_time;
                  date = new Date(date).toLocaleDateString("en-GB");
                  return `<div class="col-5 border rounded p-2 my-2 d-flex justify-content-center align-items-center syncItem" style="cursor: pointer;"
                      onclick="$(this).toggleClass('active');"
                      data-hash="${item.hash}"
                     >
                          <p class="text-center">
                              <span class="h4">${item.name}</span>
                              <br>
                              <span class="h6">${date}</span>
                          </p>
                      </div>
                      `;
                })
                .join("")}
          </div>
          `;
  } else {
    updateTestsElement.innerHTML += `
          <div id="update_tests" class="row">
              <div class="col-12">
                  <h5 class="text-center"> لا يوجد تحديثات </h5>
              </div>
          </div>
          `;
  }
};

const saveUpdates = async () => {
  let queries = [];
  const updatesSelected = document.querySelectorAll("#update_tests .active");
  if (updatesSelected.length > 0) {
    const updateTestsHash = Array.from(updatesSelected).map(
      (item) => item.dataset.hash
    );
    const updateTests = updates.filter((item) =>
      updateTestsHash.includes(item.hash)
    );
    queries = [...queries, ...updateTests.map((item) => item.query)];
    queries = [
      ...queries,
      ...updateTests.map((item) => {
        return `update lab_test set short_name = "${
          new Date().toISOString().split("T")[0]
        }" where hash = "${item.hash}";`;
      }),
    ];
    new Promise((resolve) => {
      fetchData("LocalApi/run_queries", "POST", {
        queries: JSON.stringify(queries),
      });
      return resolve();
    }).then(() => {
      niceSwal("success", "bottom-end", "تم تحديث البيانات بنجاح");
    });
  }
  niceSwal("success", "bottom-end", "لم يتم اختيار اي تحليل");
};
