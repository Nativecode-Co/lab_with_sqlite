const lab = localStorage.getItem("lab_hash");
const { data: expireDate } = fetchData("Activate/get_last_date", "POST", {
  lab,
});
const notifications = document.getElementById("notifications-box");
notifications.innerHTML = "";

if (expireDate) {
  const expireDateInDays = Math.floor(
    (new Date(expireDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );
  if (expireDateInDays < 7) {
    const div = document.createElement("div");
    div.classList.add("col-4");
    div.classList.add("mb-4");
    div.innerHTML = `
        <div class="card h-100 component-card_9">
            <img src="assets/image/expired.png" class="card-img-top" height="300"  alt="widget-card-2">
            <div class="card-body">
                <p class="meta-date">${expireDate}</p>

                <h5 class="card-title">الرجاء تجديد الاشتراك</h5>
                <p class="card-text">
                الاشتراك الخاص بك سينتهي بعد ${expireDateInDays} يوم
                </p>

            </div>
        </div>
    `;
    notifications.appendChild(div);
  }
}

if (navigator.onLine) {
  const { count, data } = fetchDataOnline("Notification/getAll", "POST", {
    lab: localStorage.getItem("lab_hash"),
  });
  if (count > 0) {
    data.forEach((item, index) => {
      const div = document.createElement("div");
      div.classList.add("col-4");
      div.classList.add("mb-4");
      div.innerHTML = `
              <div class="card h-100 component-card_9">
                  <img src="${
                    item.image === ""
                      ? "assets/image/no-pictures.png"
                      : item.image
                  }" class="card-img-top" height="300"  alt="widget-card-2">
                  <div class="card-body">
                      <p class="meta-date">${item.date}</p>
      
                      <h5 class="card-title">${item.type}</h5>
                      <p class="card-text">${item.text}</p>
      
                  </div>
              </div>
          `;
      notifications.appendChild(div);
    });
  }
}

if (notifications.innerHTML === "") {
  const div = document.createElement("div");
  div.classList.add("col-4");
  div.classList.add("mb-4");
  div.innerHTML = `
    <div class="card h-100 component-card_9">
        <img src="assets/image/no-spam.png" class="card-img-top" height="300"  alt="widget-card-2">
        <div class="card-body">
            <h5 class="card-title text-center"> لا توجد اشعارات </h5>

        </div>
    </div>
    `;
  notifications.appendChild(div);
}
