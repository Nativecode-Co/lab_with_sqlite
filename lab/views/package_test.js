// dom ready
$(document).ready(() => {
  $("select").select2({
    width: "100%",
  });

  $("#row-packages .form-check-input").on("click", () => {});

  // make tests list height equal to tests-form height
  $("#tests").css("height", $("#tests-form").css("height"));

  $(".buttons .btn-action.action").on("click", function () {
    // remove active class from all buttons
    $(".btn-action").removeClass("active");
    $(this).addClass("active");
    $(".page").hide();
    $(`#${$(this).attr("data-id")}`).show();
    // change save button
    $("#addTest #save-button").attr("onclick", "fireSwal(saveNewTest)");
    $("#addPackage #save-package").attr("onclick", "fireSwal(saveNewPackage)");
    // change save button text
    $("#addTest #save-button").text("اضافة");
    $("#addPackage #save-package").text("اضافة");
    // empty form
    emptyTestForm();
    emptyPackageTests();
  });
  // cost or price out of focus
});

const updatePackageDetail = async (hash) => {
  const cost = $(`#${hash}_cost`).val();
  const price = $(`#${hash}_price`).val();
  let formData = new FormData();
  formData.append("hash", hash);
  formData.append("cost", cost);
  formData.append("price", price);
  await fetch(`${base_url}Packages/updateCostAndPrice`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.token}`,
    },
  }).then((res) => {});
  await fetch(
    `http://umc.native-code-iq.com/app/index.php/Packages/updateCostAndPrice`,
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.token}`,
      },
    }
  ).then((res) => {});
};
