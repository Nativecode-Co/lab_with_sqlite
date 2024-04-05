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
    error: (e) => {
      console.log(e.responseText)
    },
  });
  syncOnline();
  return res;
}

function fetchSync(url = "", type = "GET", data = {}) {
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
    async: true,
    success: (result) => {
      res = result;
    },
    error: (e) => {
      console.log(e.responseText)
    },
  });
  syncOnline();
  return res;
}

function fetchApi(url = "", type = "GET", data = {}) {
  let res = null;
  const token = localStorage.getItem("token");
  $.ajax({
    url: `${api_url}${url}`,
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
    error: (e) => {
      console.log(e.responseText)
    },
  });
  return res;
}

function fetchDataOnline(url = "", type = "GET", data = {}) {
  if (!navigator.onLine) {
    return false;
  }
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
    error: (e) => {
      console.log(e.responseText)
    },
  });
  return res;
}

function add_calc_tests(tests, visit_hash, action = "insert") {
  localStorage.setItem("last_url", window.location.href);
  const token = localStorage.getItem("token");
  $.ajax({
    url: `${base_url}Calc/add_calc_tests_to_visit`,
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
    success: (result) => {
      console.log(result);
    },
    error: (e) => {
      console.log(e.responseText)
    },
  });
}

function upload(dataForm) {
  let response;
  try {
    $.ajax({
      url: `${base_url}Login/upload`,
      type: "post",
      data: dataForm,
      dataType: "json",
      contentType: false,
      processData: false,
      async: false,
      success: (res) => {
        response = res;
      },
      error: (err) => {
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
      success: (res) => {
        response = res;
      },
      error: (err) => {
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
  const form_data = new FormData();
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
  window.location.href = `${__domain__}/lab/login/login.html`;
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

async function updateExpireDate() {
  const formDate = new FormData();
  formDate.append("lab", localStorage.getItem("lab_hash"));
  await fetch("http://umc.native-code-iq.com/app/index.php/LastDate/get", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formDate,
  })
    .then((res) => res.json())
    .then(async (res) => {
      const date = res.data;
      if (!date) {
        return false;
      }
      const newFormDate = new FormData();
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
  // set token in header

  fetch(`${__domain__}/sync/sync_up.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": localStorage.getItem("token"),
    },
  }).then((res) => res.json()).then((data)=>{
    
  }).catch((e)=>{console.log("error", e)})
  updateExpireDate();
}
