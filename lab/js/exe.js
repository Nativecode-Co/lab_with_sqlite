let updates = [];
let inserts = [];
let deletes = [];

function run(json) {
  localStorage.setItem("last_url", window.location.href);
  var token = localStorage.getItem("token");
  var res = [];

  if (typeof json === "string") {
    new_json = json;
  } else {
    new_json = JSON.stringify(json) + ";";
  }
  $.ajax({
    url: base_url + "run",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "POST",
    dataType: "JSON",
    data: { query: new_json, token: token },
    async: false,
    success: function (result) {
      if (result.result == "unauthorize") {
        location.href = front_url + "login/login.html";
      } else if (result.result == "expire") {
        localStorage.setItem("token", result.token);
        // get current location
        let current_location = window.location.href;
        current_location = current_location.split("/");
        if (!current_location.includes("active.html")) {
          location.href = front_url + "active.html";
        }
      } else {
        localStorage.setItem("token", result.token);
        res = result;
      }
    },
    error: function () {
      console.log("internet connection or missing link");
    },
  });
  return res;
}

function run_online(json, token = localStorage.getItem("token")) {
  localStorage.setItem("last_url", window.location.href);
  var res = [];

  if (typeof json === "string") {
    new_json = json;
  } else {
    new_json = JSON.stringify(json) + ";";
  }
  $.ajax({
    url: "http://umc.native-code-iq.com/app/index.php/run",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "POST",
    dataType: "JSON",
    data: { query: new_json, token: token },
    async: false,
    success: function (result) {
      if (result.result == "unauthorize") {
        // location.href = front_url + "login/login.html";
      } else {
        localStorage.setItem("token", result.token);
        res = result;
      }
    },
    error: function () {
      console.log("internet connection or missing link");
    },
  });
  return res;
}

function run_both(json) {
  // if (!navigator.onLine) {
  //     Swal.fire({
  //         icon: 'error',
  //         title: 'تحذير !',
  //         text: 'لا يوجد اتصال بالانترنت',
  //         confirmButtonText: 'موافق'
  //     })
  //     return false;
  // }
  var res = run(json);
  // setTimeout(() => { run_online(json); }, 500)
  return res;
}

function add_calc_tests(tests, visit_hash, action = "insert") {
  localStorage.setItem("last_url", window.location.href);
  var token = localStorage.getItem("token");
  $.ajax({
    url: base_url + "Calc/add_calc_tests_to_visit",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "POST",
    dataType: "JSON",
    data: {
      tests: JSON.stringify(tests),
      token: token,
      visit_hash: visit_hash,
      action: action,
    },
    async: false,
    success: function (result) {
      console.log(result);
    },
    error: function () {
      console.log("internet connection or missing link");
    },
  });
}

function upload(dataForm) {
  let response;
  try {
    $.ajax({
      url: base_url + "Login/upload",
      type: "post",
      data: dataForm,
      dataType: "json",
      contentType: false,
      processData: false,
      async: false,
      success: function (res) {
        response = res;
      },
      error: function (err) {
        console.log(
          "%c========== Error  ==========",
          "color:#fff;background:#ee6f57;padding:3px;border-radius:2px"
        );
        console.log(
          "%c========== Error  ==========",
          "color:#fff;background:#ee6f57;padding:3px;border-radius:2px"
        );
        console.log("=====>", err);
      },
    });
  } catch (e) {
    response = { status: false, message: e.message };
  }
  return response;
}

function upload_online(dataForm) {
  let response;
  try {
    $.ajax({
      url: "http://umc.native-code-iq.com/app/index.php/Login/upload",
      type: "post",
      data: dataForm,
      dataType: "json",
      contentType: false,
      processData: false,
      async: false,
      success: function (res) {
        response = res;
      },
      error: function (err) {
        console.log(
          "%c========== Error  ==========",
          "color:#fff;background:#ee6f57;padding:3px;border-radius:2px"
        );
        console.log(
          "%c========== Error  ==========",
          "color:#fff;background:#ee6f57;padding:3px;border-radius:2px"
        );
        console.log("=====>", err);
      },
    });
  } catch (e) {
    response = { status: false, message: e.message };
  }
  return response;
}

function uploadFileOnline(file, folder, name) {
  let form_data = new FormData();
  form_data.append("files[]", file);
  form_data.append("token", localStorage.token);
  form_data.append("hash_lab", localStorage.lab_hash);
  form_data.append("name", name);
  form_data.append("folder_location", folder);
  try {
    return upload_online(form_data);
  } catch (e) {
    return { status: false, message: e.message };
  }
}

async function clean_db() {
  await fetch(`${base_url}LocalApi/clean`);
}

async function clean_db_us() {
  await fetch(`${base_url}LocalApi/clean`);
  // redirect login page
  window.location.href = `${__domain__}lab/login/login.html`;
}

function reloadScripts() {
  // Get all script elements on the page
  var scripts = document.getElementsByTagName("script");

  // Loop through each script element and add a timestamp to the src URL
  for (var i = 0; i < scripts.length; i++) {
    var script = scripts[i];
    var src = script.getAttribute("src");
    if (src) {
      script.setAttribute("src", src + "?t=" + new Date().getTime());
    }
  }
}

function hardRefresh() {
  const t = parseInt(Date.now() / 10000); //10s tics
  const x = localStorage.getItem("t");
  localStorage.setItem("t", t);

  if (x != t) location.reload(true); //force page refresh from server
  else {
    //refreshed from server within 10s
    const a = document.querySelectorAll("a, link, script, img");
    var n = a.length;
    while (n--) {
      var tag = a[n];
      var url = new URL(tag.href || tag.src);
      url.searchParams.set("r", t.toString());
      tag.href = url.toString(); //a, link, ...
      tag.src = tag.href; //rerun script, refresh img
    }
  }
}

async function updateSystem() {
  if (!navigator.onLine) {
    Swal.fire({
      icon: "error",
      title: "تحذير !",
      text: "لا يوجد اتصال بالانترنت",
      confirmButtonText: "موافق",
    });
    return false;
  }
  const body = document.getElementsByTagName("body")[0];
  body.insertAdjacentHTML("beforeend", waitElement);
  await fetch(`${base_url}pull/pull`)
    .then((response) => response.json())
    .then(async (data) => {
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve();
        }, 2000)
      ).then(() => {
        body.removeChild(document.getElementById("alert_screen"));
      });
      Swal.fire({
        icon: "success",
        title: "تم !",
        text: data.message,
        confirmButtonText: "موافق",
      }).then((result) => {
        // Call the reloadScripts function to reload all scripts on the page
        // window.location.reload(true);
        hardRefresh();
        // looooooooooooool
      });
    })
    .catch((error) => {
      body.removeChild(document.getElementById("alert_screen"));
      Swal.fire({
        icon: "error",
        title: "تحذير !",
        text: "لا يوجد اتصال بالانترنت",
        confirmButtonText: "موافق",
      });
    });
}

const selectAll = (e) => {
  let updateTests = document.querySelectorAll(".syncItem");
  updateTests.forEach((item) => {
    // e has active class
    if (e.target.classList.contains("all")) {
      item.classList.remove("active");
    }
    // e has not active class
    else {
      item.classList.add("active");
    }
  });
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
  // ask user to confirm
  const body = document.getElementsByTagName("body")[0];
  body.insertAdjacentHTML("beforeend", waitElement);
  const formData = new FormData();
  let lastSyncDateForForm =
    run(
      `select insert_record_date as date from system_users_type order by id desc limit 1;`
    ).result[0]?.query0?.[0]?.date ?? "2023-01-01 00:00:00";
  formData.append("date", lastSyncDateForForm);
  let lastSyncDate = new Date(lastSyncDateForForm).toLocaleDateString("en-GB");
  let queries = await fetch(
    "http://umc.native-code-iq.com/app/index.php/Offline/getAsyncData",
    {
      method: "POST",
      headers: {},
      body: formData,
    }
  )
    .then((res) => res.json())
    .then((res) => {
      updates = res.updates;
      inserts = res.inserts;
      deletes = res.deletes;
      return res.inserts;
    })
    .then(() => {
      body.removeChild(document.getElementById("alert_screen"));
    })
    .catch((e) => console.log(e));
  const syncBodyModal = document.getElementById("sync_body");

  if (updates.length > 0) {
    let updatesTests =
      run(
        `select test_name,hash from lab_test where hash in(${updates
          .map((item) => item.hash)
          .join(",")}) group by test_name;`
      ).result[0]?.query0 ?? [];
    if (updatesTests.length > 0) {
      syncBodyModal.innerHTML = "";
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
              let date = updates.find((i) => i.hash == item.hash).date_time;
              // iraq en 28-7-2023
              date = new Date(date).toLocaleDateString("en-GB");
              // compare date and lastSyncDate
              let compareDate = new Date(date) > new Date(lastSyncDate);

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
      syncBodyModal.innerHTML = "";
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
}

async function runAsyncData() {
  const body = document.getElementsByTagName("body")[0];
  body.insertAdjacentHTML("beforeend", waitElement);
  queries = inserts.map((query) => query.query);
  let updatesSelected = document.querySelectorAll("#update_tests .active");
  if (updatesSelected.length > 0) {
    let updateTestsHash = Array.from(updatesSelected).map(
      (item) => item.dataset.hash
    );
    let updateTests = updates.filter((item) =>
      updateTestsHash.includes(item.hash)
    );
    queries = [...queries, ...updateTests.map((item) => item.query)];
  }
  let queriesForm = new FormData();
  queriesForm.append("queries", JSON.stringify(queries));
  let quer = await fetch(`${base_url}LocalApi/run_queries`, {
    method: "POST",
    body: queriesForm,
  })
    .then((res) => res.json())
    .then(() => {
      body.removeChild(document.getElementById("alert_screen"));
      $("#sync").modal("hide");
    });
  run(
    `insert into system_users_type (title,insert_record_date) values ('update by ${
      localStorage.getItem("name") ?? ""
    }','${new Date().toISOString().slice(0, 19).replace("T", " ")}');`
  );
  niceSwal("success", "top-end", "تم تحديث البيانات بنجاح");
}

async function updateExpireDate() {
  let formDate = new FormData();
  formDate.append("lab", localStorage.getItem("lab_hash"));
  await fetch("http://umc.native-code-iq.com/app/index.php/LastDate/get", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: formDate,
  })
    .then((res) => res.json())
    .then(async (res) => {
      let date = res.data;
      if (!date) {
        return false;
      }
      let newFormDate = new FormData();
      newFormDate.append("lab", localStorage.getItem("lab_hash"));
      newFormDate.append("date", date);
      await fetch(`${base_url}LocalApi/update_expire`, {
        method: "POST",
        body: newFormDate,
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
        });
    })
    .catch((err) => {
      console.log(err);
    });
}

function syncOnline() {
  // check internet connection`
  if (!navigator.onLine) {
    return false;
  }
  fetch(`${__domain__}sync/sync_up.php`);
  updateExpireDate();
}
