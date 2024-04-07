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

const showReferences = (hash, kit, unit) => {
  const references = fetchApi("/maintests/get_main_test", "POST", {
    hash,
    kit,
    unit,
  });
  const data = references?.refrence ??[];

  const referencesElement = document.getElementById("references");
  referencesElement.innerHTML = "";
  if(data.length > 0){
    for(const item of data){
      const {range,right_options,options } = item;
      const ul = document.createElement("ul");
      ul.className = "list-group list-group-flush border rounded mt-5";
      const headerLi = document.createElement("li");
      headerLi.className = "list-group-item bg-default text-center";
      headerLi.innerHTML = `${item.gender} : من ${item["age low"]} ${item["age unit low"]} الي ${item["age high"]} ${item["age unit high"]}`;
      ul.appendChild(headerLi);
      const rangeName = options && options?.length> 0 ? (right_options?.length> 0 ? `<li class="list-group-item text-right">${right_options.join(",")}</li>`:`<li class="list-group-item text-right">لا اختيار صحيح</li>`) : range ? range?.map((r) => {
        const name = r.name ? `${ r.name} :` : "";
        const high = r.high ? r.high : "";
        const low = r.low ? r.low : "";
        if(high && low){
          return `<li class="list-group-item text-right">${name ? name : "Range"} : <span>${high}</span>-<span>${low}</span> </li>`;
        }else if(high){
          return `<li class="list-group-item text-right">${name ? name : "Range"} : less then <span>${high}</span></span></li>`;
        }
        return `<li class="list-group-item text-right">${name ? name : "Range"} : more then <span>${low}</span></span></li>`;
      }).join("<br>") : "No Range";
      ul.innerHTML += rangeName;
      referencesElement.appendChild(ul);

    }
  }else{
    const ul = document.createElement("ul");
    ul.className = "list-group list-group-flush border rounded mt-5";
    const li = document.createElement("li");
    li.className = "list-group-item bg-default text-center";
    li.innerHTML = "لا توجد قيم طبيعية لهذا التحليل مع وحدة القياس المختارة و الكت المختار";
    ul.appendChild(li);
    referencesElement.appendChild(ul);
  }
}

const testId = document.getElementsByName("test_id")[0];
const testKit = document.getElementsByName("kit_id")[0];
const testUnit = document.getElementsByName("unit")[0];

$(document).on("change", "#test-form select", function () {
  const hash = testId.value;
  const kit = testKit.value;
  const unit = testUnit.value;
  showReferences(hash, kit, unit);
});
