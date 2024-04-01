// dom ready
// get name from search params
const urlParams = new URLSearchParams(window.location.search);
const searchName = urlParams.get("name");

$(document).ready(() => {
  // change table search value by searchName if exist
  if(searchName){
    const searchInput = $("#lab_test-table_wrapper input[type='search']");
    searchInput.val(searchName);
    searchInput.trigger("input");
  }
  // select apllay select2 when parent not have class no-select2
  $("#test-form select").select2({
    width: "100%",
  });
  $("#package-form select").select2({
    width: "100%"
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
  fetchData("Packages/updateCostAndPrice", "POST", {
    hash,
    cost,
    price,
  });
  fetchDataOnline("Packages/updateCostAndPrice", "POST", {
    hash,
    cost,
    price,
  });
};
