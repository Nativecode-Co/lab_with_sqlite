const rootElement = document.getElementById("root");
const tests = fetchApi("/mainTests/get_structural_tests");

const createFormInput = (test) => {
  const font = Number.parseInt(test.option_test.font ?? 14);
  // name 20 characters
  const name = test.name
    .substring(0, 30)
    .concat(test.name.length > 30 ? "..." : "");
  return `
    <div class="col-md-3">
        <div class="form-group">
            <label for="${test.hash}" class="text-center w-100">${name}</label>
            <div class="input-group mb-3">
            <div class="input-group-prepend">
                <button class="btn btn-outline-primary" type="button" id="button-${test.hash}"
                onclick="handleSave(event)" >حفظ</button>
            </div>
            <input type="text" class="form-control text-center" id="${test.hash}" name="${test.hash}" value="${font}" placeholder>
        </div>
        </div>
        
    </div>
    `;
};

const form = document.createElement("form");
const row = document.createElement("div");
row.className = "row justify-content-center align-items-center";

form.appendChild(row);

for (const test of tests) {
  row.innerHTML += createFormInput(test);
}

rootElement.appendChild(form);

const handleSave = (event) => {
  event.preventDefault();
  const button = event.target;
  const input = button.parentElement.nextElementSibling;
  const testHash = input.id;
  const font = Number.parseInt(input.value);

  const test = tests.find((test) => test.hash === testHash);
  if (test) {
    test.option_test.font = `${font}px`;
    fetchApi("/maintests/update_main_test", "POST", {
      option_test: JSON.stringify(test.option_test),
      hash: testHash,
    });
    niceSwal("success", "bottom-end", "تم تحديث الخط بنجاح");
  } else {
    niceSwal("error", "bottom-end", "حدث خطأ أثناء تحديث الخط");
  }
};
