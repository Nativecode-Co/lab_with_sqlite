const startSteps = () => {
  const tests = fetchDataOnline("data/get_updated_tests");
  if (tests.length > 0) {
    const checkedTests = tests.map((item) => {
      return {
        hash: item.hash,
        updated_at: item.updated_at,
      };
    });
    const testsShouldUpdated = fetchApi(
      "/mainTests/get_main_tests_by_updated_at",
      "POST",
      {
        data: JSON.stringify(checkedTests),
      }
    );
    if (testsShouldUpdated?.length > 0) {
      const newTests = tests.filter((item) => {
        return testsShouldUpdated.includes(item.hash);
      });
      localStorage.setItem("mainTests", JSON.stringify(newTests));
      if (newTests.length > 0) {
        const syncBody = document.getElementById("sync_body");
        syncBody.innerHTML = `
          <div id="insert_tests" class="row justify-content-around">
              <div class="col-12">
                  <h5 class="text-center"> أختر التحاليل التي تريد تحديثها </h5>
              </div>
              <div class="col-12  border rounded p-2 my-2 d-flex justify-content-center align-items-center" style="cursor: pointer;"
                      onclick="$('#insert_tests .syncItem').toggleClass('active');"
                     >
                          <p class="text-center">
                              <span class="h4">اختيار الكل</span>
                          </p>
              </div>
              ${newTests
                .map((item) => {
                  let date = item.updated_at;
                  date = new Date(date).toLocaleDateString("en-GB");
                  return `<div class="col-5 border rounded p-2 my-2 d-flex justify-content-center align-items-center syncItem" style="cursor: pointer;"
                      onclick="$(this).toggleClass('active');"
                      data-hash="${item.hash}"
                     >
                          <p class="text-center">
                              <span class="h4">${item.test_name}</span>
                          </p>
                      </div>
                      `;
                })
                .join("")}
                <div class="col-12">
                    <button class="btn btn-primary w-100" onclick="updateTests()">تحديث</button>
                </div>
          </div>
          `;
        $("#sync").modal("show");
      } else {
        niceSwal("info", "bottom-end", "لا يوجد تحديثات");
      }
    } else {
      niceSwal("info", "bottom-end", "لا يوجد تحديثات");
    }
  } else {
    niceSwal("info", "bottom-end", "لا يوجد تحديثات");
  }
};

const updateTests = () => {
  const checkedTests = $("#insert_tests .active");
  if (checkedTests.length > 0) {
    const checkedTestHashes = $.map(
      checkedTests,
      (item) => `${$(item).data("hash")}`
    );
    console.log(checkedTestHashes);

    const newTests = localStorage.getItem("mainTests");
    if (newTests) {
      try {
        const tests = JSON.parse(newTests);
        if (Array.isArray(tests)) {
          const updatedTests = tests.filter((item) => {
            return checkedTestHashes.indexOf(item.hash) !== -1;
          });
          fetchApi("/mainTests/update_batch", "POST", {
            data: JSON.stringify(updatedTests),
          });
          $("#sync").modal("hide");
          niceSwal("success", "bottom-end", "تم تحديث التحاليل بنجاح");
        } else {
          niceSwal("error", "bottom-end", "البيانات المخزنة غير صحيحة");
        }
      } catch (error) {
        niceSwal("error", "bottom-end", "فشل في تحليل البيانات المخزنة");
      }
    } else {
      niceSwal("error", "bottom-end", "لا توجد بيانات مخزنة");
    }
  } else {
    niceSwal("error", "bottom-end", "يجب تحديد تحاليل للتحديث");
  }
};
