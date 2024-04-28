const { categories, tests } = fetchApi("/maintests/get_main_tests_data");
// override Factory class

const calcOperator = ["+", "-", "*", "/", "(", ")", "Math.log10("];

class Test extends Factory {
  init() {
    this.createModal();
    this.dataTable = setServerTable(
      "lab_test-table",
      `${api_url}/maintests/get_calc_tests`,
      () => {
        return { lab_id: localStorage.getItem("lab_hash") };
      },
      [
        { data: "test_name" },
        {
          data: null,
          className: "center",
          render: (
            data,
            type,
            row
          ) => `<a href="#" onclick="lab_test.updateItem('${row.hash}')" class="text-success"><i class="far fa-edit fa-lg mx-2"></i></a>
                        <a href="#" onclick="fireSwal.call(lab_test,lab_test.deleteItem, '${row.hash}')" class="text-danger"><i class="far fa-trash fa-lg mx-2"></i></a>`,
        },
        {
          data: null,
          className: "text-success center",
          defaultContent: '<i class="fas fa-plus"></i>',
        },
      ]
    );
  }

  setOptionsTest(data) {
    data.option_test = data.option_test.split(",");
    let options;
    const updatedOptions = {
      type: "calc",
      value: data.option_test,
      tests: data.option_test
        .map((item) => {
          const test = tests.find((test) => test.text === item);
          return test ? test.hash : null;
        })
        .filter((item) => {
          return item !== null;
        }),
    };
    if (localStorage.getItem("options")) {
      options = JSON.parse(localStorage.getItem("options"));
      options = { ...options, ...updatedOptions };
    } else {
      options = updatedOptions;
    }
    data.option_test = JSON.stringify(options);
    data.test_type = "3";
    localStorage.removeItem("options");
    return data;
  }

  updateItem(hash) {
    const data = fetchApi(`/maintests/get_calc_test?hash=${hash}`);
    fillForm(this.formId, this.fields, data);
    super.updateItem(hash);
  }

  getNewData() {
    let data = super.getNewData();
    data = this.setOptionsTest(data);
    return data;
  }

  getUpdateData() {
    let data = super.getUpdateData();
    data = this.setOptionsTest(data);
    return data;
  }

  saveNewItem() {
    if (!validateForm(this.formId, this.fields)) {
      return false;
    }
    const data = this.getNewData();
    fetchApi("/maintests/create_main_test", "POST", data);
    this.dataTable.ajax.reload(null, false);
    $(`#${this.modalId}`).modal("hide");
  }

  saveUpdateItem(hash) {
    if (!validateForm(this.formId, this.fields)) {
      return false;
    }
    const data = this.getUpdateData();
    fetchApi("/maintests/update_main_test", "POST", { ...data, hash });
    this.dataTable.ajax.reload(null, false);
    $(`#${this.modalId}`).modal("hide");
  }

  deleteItem(hash) {
    fetchApi("/maintests/delete_main_test", "POST", { hash });
    this.dataTable.ajax.reload(null, false);
  }
}

// init test_units class

const lab_test = new Test("lab_test", "تحليل حسابي", [
  { name: "hash", type: null },
  { name: "test_name", type: "text", label: "الاسم" },
  {
    name: "category_hash",
    type: "select",
    label: "الفئة",
    options: categories,
  },
  {
    name: "option_test",
    type: "custom",
    label: "الخيارات",
    options: tests,
    setInputsTypeFun(field) {
      return `<div class= "form-group col-md-12">
                        <label for="${field.name}">الخيارات</label>
                        <input type="text" name="${field.name}" id="${
        field.name
      }" class="form-control screen" value="${field.value}" dir="ltr">
                    </div>
                    <h5 class="text-center">التحاليل</h5>
                    <input type="text" class="w-100 form-control product-search br-30 my-2" id="input-search-2" placeholder="ابحث عن الاختبار">
                    <div class="row w-100" dir="ltr">
                        ${calcOperator
                          .map(
                            (item) => `
                        <div class="calc-operator col-auto" onclick="options.addData(['${item}'])">
                                ${item}
                            </div>
                        `
                          )
                          .join("")}
                        <div class="w-100"></div>
                        ${field.options
                          .map(
                            (item) => `
                            <div class="test-item col-auto" onclick="options.addData(['${item.text}'])">
                                ${item.text}
                            </div>
                        `
                          )
                          .join("")}
                    </div>`;
    },
    fillFormFun(item) {
      options.removeAll();
      console.log(item.option_test);
      localStorage.setItem("options", item.option_test);
      let options_test = JSON.parse(item.option_test);
      if (options_test?.value?.length > 0) {
        options.addData(options_test.value);
      }
    },
    clearFormFun(field) {
      options.removeAll();
    },
  },
]);
// dom ready jquery
$(() => {
  $("#input-search-2").on("keyup", function () {
    console.log($(this).val());
    const rex = new RegExp($(this).val(), "i");
    $(".test-item").hide();
    $(".test-item")
      .filter(function () {
        return rex.test($(this).text());
      })
      .show();
  });
  $(() => {
    $(".dt-buttons").addClass("btn-group");
    $("div.addCustomItem").html(
      `<span class="table-title">التحاليل الحسابية</span><button onclick="lab_test.newItem()" class="btn-main-add ml-4"><i class="far fa-users-md mr-2"></i> أضافة تحليل</button>`
    );
  });
});

(() => {
  const TagsInput = function (opts) {
    this.options = Object.assign(TagsInput.defaults, opts);
    this.init();
  };

  // Initialize the plugin
  TagsInput.prototype.init = function (opts) {
    this.options = opts ? Object.assign(this.options, opts) : this.options;

    if (this.initialized) this.destroy();

    if (
      !(this.orignal_input = document.getElementById(this.options.selector))
    ) {
      console.error(
        "tags-input couldn't find an element with the specified ID"
      );
      return this;
    }

    this.arr = [];
    this.wrapper = document.createElement("div");
    this.input = document.createElement("input");
    init(this);
    initEvents(this);

    this.initialized = true;
    return this;
  };

  // Add Tags
  TagsInput.prototype.addTag = function (string) {
    if (this.anyErrors(string)) return;

    this.arr.push(string);
    const tagInput = this;

    const tag = document.createElement("span");
    tag.className = this.options.tagClass;
    tag.innerText = string;

    const closeIcon = document.createElement("a");
    closeIcon.innerHTML = "&times;";

    // delete the tag when icon is clicked
    closeIcon.addEventListener("click", function (e) {
      e.preventDefault();
      const tag = this.parentNode;

      for (let i = 0; i < tagInput.wrapper.childNodes.length; i++) {
        if (tagInput.wrapper.childNodes[i] === tag) tagInput.deleteTag(tag, i);
      }
    });

    tag.appendChild(closeIcon);
    this.wrapper.insertBefore(tag, this.input);
    this.orignal_input.value = this.arr.join(",");

    return this;
  };

  // Delete Tags
  TagsInput.prototype.deleteTag = function (tag, i) {
    tag.remove();
    this.arr.splice(i, 1);
    this.orignal_input.value = this.arr.join(",");
    return this;
  };

  // remove all tags
  TagsInput.prototype.removeAll = function () {
    while (this.arr.length > 0) {
      for (let i = 0; i < this.arr.length; i++) {
        this.deleteTag(this.wrapper.childNodes[i], i);
      }
    }
    return this;
  };

  // Make sure input string have no error with the plugin
  TagsInput.prototype.anyErrors = function (string) {
    if (this.options.max != null && this.arr.length >= this.options.max) {
      console.log("max tags limit reached");
      return true;
    }

    if (!this.options.duplicate && this.arr.indexOf(string) !== -1) {
      console.log(`duplicate found " ${string} " `);
      return true;
    }

    return false;
  };

  // Add tags programmatically
  TagsInput.prototype.addData = function (array) {
    for (const string of array) {
      this.addTag(string);
    }
    return this;
  };

  // Get the Input String
  TagsInput.prototype.getInputString = function () {
    return this.arr.join(",");
  };

  // destroy the plugin
  TagsInput.prototype.destroy = function () {
    this.orignal_input.removeAttribute("hidden");

    this.orignal_input = undefined;

    for (const key in this) {
      if (this[key] instanceof HTMLElement) this[key].remove();

      if (key !== "options") delete this[key];
    }

    this.initialized = false;
  };

  // Private function to initialize the tag input plugin
  function init(tags) {
    tags.wrapper.append(tags.input);
    tags.wrapper.classList.add(tags.options.wrapperClass);
    tags.orignal_input.setAttribute("hidden", "true");
    tags.orignal_input.parentNode.insertBefore(
      tags.wrapper,
      tags.orignal_input
    );
  }

  // initialize the Events
  function initEvents(tags) {
    tags.wrapper.addEventListener("click", () => {
      tags.input.focus();
    });

    tags.input.addEventListener("keydown", (e) => {
      const str = tags.input.value.trim();

      if (~[9, 13, 188].indexOf(e.keyCode)) {
        e.preventDefault();
        tags.input.value = "";
        if (str !== "") tags.addTag(str);
      }
    });
  }

  // Set All the Default Values
  TagsInput.defaults = {
    selector: "",
    wrapperClass: "tags-input-wrapper",
    tagClass: "tag",
    max: null,
    duplicate: false,
  };

  window.TagsInput = TagsInput;
})();

const options = new TagsInput({
  selector: "option_test",
  duplicate: true,
  max: 100,
});
