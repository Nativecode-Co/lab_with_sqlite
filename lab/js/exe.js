function run(json) {
  localStorage.setItem("last_url", window.location.href);
  const token = localStorage.getItem("token");
  let res = [];

  let new_json;
  if (typeof json === "string") {
    new_json = json;
  } else {
    new_json = `${JSON.stringify(json)};`;
  }
  $.ajax({
    url: `${base_url}run`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    type: "POST",
    dataType: "JSON",
    data: { query: new_json, token: token },
    async: false,
    success: (result) => {
      if (result.result === "unauthorize") {
        location.href = `${front_url}login/login.html`;
      } else if (result.result === "expire") {
        localStorage.setItem("token", result.token);
        // get current location
        let current_location = window.location.href;
        current_location = current_location.split("/");
        if (!current_location.includes("active.html")) {
          location.href = `${front_url}active.html`;
        }
      } else {
        localStorage.setItem("token", result.token);
        res = result;
        // Do something with the result here
      }
    },
    error: () => {
      console.log("internet connection or missing link");
    },
  });
  return res;
}

function fetchData(url = "", type = "GET", data = {}) {
  let res = null;
  const token = localStorage.getItem("token");
  $.ajax({
    url: base_url + url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    type,
    data,
    dataType: "JSON",
    async: false,
    success: (result) => {
      res = result;
    },
    error: () => {
      console.log("internet connection or missing link");
    },
  });
  return res;
}

function fetchDataOnline(url = "", type = "GET", data = {}) {
  let res = null;
  const token = localStorage.getItem("token");
  $.ajax({
    url: `http://umc.native-code-iq.com/app/index.php/${url}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
    type,
    data,
    dataType: "JSON",
    async: false,
    success: (result) => {
      res = result;
    },
    error: () => {
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
  await fetch(`${base_url}LocalApi/clean`).then((res) => res.json());
}

async function clean_db_us() {
  await fetch(`${base_url}LocalApi/clean`);
  // redirect login page
  window.location.href = `${__domain__}/lab/login/login.html`;
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
  fetchData("pull/updateDataBase", "GET", {});
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
        fetchData("pull/cleanCach", "GET", {});
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
  fetch(`${__domain__}/sync/sync_up.php`);
  updateExpireDate();
}
