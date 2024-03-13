// global variables
let updates = [];
let inserts = [];
const body = document.getElementsByTagName("body")[0];

const onStepChanging = (event, currentIndex, newIndex) => {
  const newTestsElement = document.getElementById("newTests");
  const updateTestsElement = document.getElementById("editTests");

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
  newTestsElement.innerHTML = "";
  updateTestsElement.innerHTML = "";
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

const startSteps = () => {
  const newTestsElement = document.getElementById("newTests");
  const updateTestsElement = document.getElementById("editTests");
  newTestsElement.innerHTML = "";
  updateTestsElement.innerHTML = "";
  // check if syncSteps is already created
  if (document.querySelector(".steps.clearfix")) {
    $("#syncSteps").steps("destroy");
  }
  $("#sync").modal("show");
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
    enableCancelButton: true,

    labels: {
      cancel: "الغاء",
      current: "الخطوة الحالية:",
      pagination: " ترقيم الصفحات",
      finish: "تحديث",
      next: " التالي",
      previous: " السابق",
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
    onCanceled: (event) => {
      $("#sync").modal("hide");
    },
  });
};

const syncInserts = async () => {
  const newTestsElement = document.getElementById("newTests");
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
    const onLineQueries = queries.map((item) => {
      let query = item;
      // before ") values" add lab_hash
      query = query.replace(") values", ", lab_hash) values");
      // add lab_hash value
      query = query.replace("')", `', '${localStorage.getItem("lab_hash")}')`);
      return query;
    });
    new Promise((resolve) => {
      fetchData("LocalApi/run_queries", "POST", {
        queries: JSON.stringify(queries),
      });
      fetchDataOnline("Offline/run_sync", "POST", {
        queries: `${onLineQueries.join(";")};`,
      });
      return resolve();
    }).then(() => {
      niceSwal("success", "bottom-end", "تم تحديث البيانات بنجاح");
    });
  }
  niceSwal("success", "bottom-end", "لم يتم اختيار اي تحليل");
};

const syncUpdates = async () => {
  // get  bottom with href "#finish" father li
  const finishButton = document.querySelector(
    ".actions.clearfix a[href='#finish']"
  ).parentElement;
  const updateTestsElement = document.getElementById("editTests");
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

  if (updates.length > 0) {
    // make finish button enabled
    finishButton.classList.remove("isDisabled");
    // change herf to be "#"
    finishButton.firstElementChild.href = "#finish";
    updateTestsElement.innerHTML += `
          <div id="update_tests" class="row justify-content-around">
              <div class="col-12">
                  <h5 class="text-center"> أختر التحاليل التي تريد تحديث القيم البيعية لها </h5>
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
                              اخر تحديث لها كان في
                              <span class="h6">${date}</span>
                          </p>
                      </div>
                      `;
                })
                .join("")}
          </div>
          `;
  } else {
    // make finish button disabled
    finishButton.classList.add("isDisabled");
    // change herf to be "#"
    finishButton.firstElementChild.href = "#";
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
    updateTests.map((item) => {
      const qu = item.query.split(";");
      queries = [...queries, ...qu];
    });
    const offLineQueries = [
      ...queries,
      ...updateTests.map((item) => {
        return `update lab_test set short_name = "${
          new Date().toISOString().split("T")[0]
        }" where hash = "${item.hash}";`;
      }),
    ];
    const onLineQueries = queries.map((item) => {
      run_online(
        `${item} and lab_hash = "${localStorage.getItem("lab_hash")}";`
      );
      run_online(
        `update lab_test set short_name = "${
          new Date().toISOString().split("T")[0]
        }" where hash = "${item.hash} and lab_hash = "${localStorage.getItem(
          "lab_hash"
        )}"";`
      );
    });

    updateTests.map((item) => {
      fetchData("Packages/updateNameWithTestHsh", "POST", {
        name: item.name,
        hash: item.hash,
      });
    });

    new Promise((resolve) => {
      fetchData("LocalApi/run_queries", "POST", {
        queries: JSON.stringify(offLineQueries),
      });
      return resolve();
    }).then(() => {
      niceSwal("success", "bottom-end", "تم تحديث البيانات بنجاح");
    });
  }
  niceSwal("success", "bottom-end", "لم يتم اختيار اي تحليل");
};
