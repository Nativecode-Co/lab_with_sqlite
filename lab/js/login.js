async function offlineLogin() {
  $("body").append(waitElement);

  const username = $("#username").val();
  const password = $("#password").val();
  // add waitElement to body

  //console.log(username+" --  "+password);
  $.ajax({
    url: `${base_url}login`,
    type: "POST",
    /* or type:"GET" or type:"PUT" */
    dataType: "JSON",
    data: { username: username, password: password },
    success: async (result) => {
      if (Number(result.result) === 0) {
        document.getElementById("message").innerHTML =
          "يرجى التاكد من اسم الحساب او الرمز السري";
        document.getElementById("alert_screen").remove();
      } else {
        localStorage.setItem("token", result.token);
        localStorage.setItem("hash", result.hash);
        localStorage.setItem("user_type", result.user_type);
        localStorage.setItem("name", result.name);
        localStorage.setItem("lab_hash", result.lab_id);
        localStorage.setItem("lab_name", result.lab_name);
        localStorage.setItem("logo", result.logo);
        await updateExpireDate();
        const user_type = result.user_type;
        if (
          Number(result.lab_id) === 0 ||
          result.lab_id === null ||
          result.lab_id === undefined
        ) {
          document.getElementById("message").innerHTML =
            "ليس لديك صلاحية دخول جرب مرة اخري الرجاء التواصل مع الدعم الفني";
          document.getElementById("alert_screen").remove();
          return;
        }
        fetchData("/localapi/deleteAfterInsertTrigger");
        fetchData("/localapi/createAfterInsertTrigger");
        location.href = `${front_url}index.html`;
      }
    },
    error: () => {
      document.getElementById("message").innerHTML =
        "يرجى التاكد من الاتصال بلانترنت";
      document.getElementById("alert_screen").remove();
    },
  });
}

const runQueries = async (username, password, type) => {
  const message = document.getElementById("message");
  const dataForm = new FormData();
  dataForm.append("username", username);
  dataForm.append("password", password);
  dataForm.append("type", type);

  const res = await fetch(
    "http://umc.native-code-iq.com/app/index.php/Offline/login",
    {
      method: "POST",
      body: dataForm,
    }
  )
    .then((res) => res.json())
    .catch((e) => {
      message.innerHTML = "الرجاء التاكد من الاتصال بالانترنت";
      document.getElementById("alert_screen").remove();
      return;
    });

  if (Boolean(res.status) === false) {
    message.innerHTML = "يرجى التاكد من اسم الحساب او الرمز السري";
    document.getElementById("alert_screen").remove();
    return;
  }
  if (String(type) === "user") {
    const { data } = res;
    const form = new FormData();
    for (const key in data) {
      form.append(key, data[key]);
    }
    return { data, form };
  }
  message.innerHTML = "";

  try {
    let { queries } = res;
    queries = queries.filter((query) => query !== null && query !== "");
    const queriesForm = new FormData();
    queriesForm.append("queries", JSON.stringify(queries));
    await fetch(`${base_url}LocalApi/run_queries`, {
      method: "POST",
      body: queriesForm,
    })
      .then((res) => res.json())
      .then((res) => {
        return res;
      });
  } catch (e) {}
};

const waitLoginElement = `<div id="alert_screen" class="alert_screen"> 
<div class="loader">
    <div class="loader-content">
        <div class="card" style="width: 40rem; height: 50rem;">
            <div class="card-body text-center">
              <h1 class="card-title">الرجاء الانتظار </h1>
              <h4>يتم الان تهيئة بيانات النظام</h4>
              <h4>لتجنب حصول مشكلة الرجاء عدم اغلاق الصفحة</h4>
              <img class="spinner-grow-alert" src="${front_url}assets/image/flask.png" width="100" height="100" alt="alert_screen">
              <div class="w-100 mt-5"></div>
            </div>
          </div>
    </div>
</div>
</div>`;
async function updateLoginSystem() {
  await fetch(`${base_url}pull/pull`).then(async (response) => {
    reloadScripts();
  });
}

const login = async () => {
  const message = document.getElementById("message");
  const username = $("#username").val();
  const password = $("#password").val();
  const dataForm = new FormData();
  dataForm.append("username", username);
  dataForm.append("password", password);
  // This code fetches a user count from the api
  const userCount = await fetch(`${base_url}LocalApi/getUserCount`, {
    method: "POST",
    body: dataForm,
  })
    .then((res) => res.json())
    .then((res) => {
      if (Boolean(res.status) === false) {
        message.innerHTML = "هناك مشكلة في الاتصال بقاعدة البيانات";
        document.getElementById("alert_screen").remove();
        return 100;
      }
      return res.data;
    })
    .catch((e) => {
      message.innerHTML = "الرجاء تشغيل البرنامج الموجود على سطح المكتب";
      document.getElementById("alert_screen").remove();
      return 100;
    });

  if (Number(userCount) === 100) {
    return;
  }
  if (Number(userCount) === 0) {
    const body = document.getElementsByTagName("body")[0];
    body.insertAdjacentHTML("beforeend", waitLoginElement);
    await clean_db();
    addAlert("تم اكمال 20 % من عملية تنزيل البيانات");
    // Check if the user is online
    if (!navigator.onLine) {
      message.innerHTML = "الرجاء التاكد من الاتصال بالانترنت";
      document.getElementById("alert_screen").remove();
      return;
    }
    const types = [
      "doctors",
      "patients",
      "package_tests",
      "packages",
      "visits",
      "visits_packages",
      "visits_tests",
      "workers",
      "invoice",
      "lab",
    ];
    for (const type of types) {
      await runQueries(username, password, type);
    }
    addAlert("تم اكمال 40 % من عملية تنزيل البيانات");
    const { form, data } = await runQueries(username, password, "user");
    fetchDataOnline("offline/insertTestsForLab", "post", {
      lab_id: data.lab_id,
    });
    await fetch(`${base_url}LocalApi/addUser`, {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then(() => {
        addAlert("تم اكمال 60 % من عملية تنزيل البيانات");
      });

    const labIdForm = new FormData();
    labIdForm.append("lab_id", data.lab_id);

    installTests(data.lab_id);

    await fetch(`${base_url}LocalApi/downloadImage`, {
      method: "POST",
      body: labIdForm,
    });
    fetchData("localApi/createAfterInsertTrigger");
    await installAlias();
    addAlert("تم اكمال 80 % من عملية تنزيل البيانات");
    offlineLogin().then(() => {
      addAlert("تم اكمال 100 % من عملية تنزيل البيانات");
      addAlert("جاري تسجيل الدخول");
    });
  } else {
    await offlineLogin();
  }
};

const installTests = async (lab_id) => {
  fetchData("LocalApi/installTestsOrDefaults", "POST", {
    lab_id,
  });
};

const installAlias = async () => {
  const alias = fetchDataOnline("alias/get_all_alias");
  fetchApi("/alias/insert_all", "post", { data: JSON.stringify(alias) });
};

function addAlert(message) {
  const alertScreenBody = document
    .getElementById("alert_screen")
    .getElementsByClassName("card-body")[0];
  alertScreenBody.innerHTML += `
            <div id="message" class="alert alert-success text-left text-success bg-light h-22" role="alert">
                <i class="far fa-check-circle mr-2"></i>
                ${message}
            </div>
        `;
}
