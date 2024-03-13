const createTest = (test, type) => {
  switch (type) {
    case "1":
      return `
      <div 
        class="n-chk package text-left mb-3 ml-3"
      >
        <label 
          class="new-control items offer new-checkbox new-checkbox-rounded checkbox-outline-success font-weight-bolder mb-0"
        >
          <input 
            type="checkbox" 
            name="tests[]" onclick="changeTotalPrice('${test.hash}')" 
            class="new-control-input testSelect" 
            data-name="${test.name}" 
            data-price="${test.price}" 
            value="${test.hash}" 
            id="package_${test.hash}" 
          >
          <p class=""> ${parseInt(test.price)?.toLocaleString()} </p>
          <span class="new-control-indicator m-3 d-none"></span>
          <span dir="ltr" class="ml-2 overflow-text-hidden">${test.name}</span>
        </label>
      </div>
      `;
    case "2":
      return `
      <div 
        class="n-chk test text-left mb-3 ml-3" 
        data-category="${test.catigory}"
      >
        <label 
          class="new-control items offer new-checkbox new-checkbox-rounded checkbox-outline-success font-weight-bolder mb-0" 
          onmouseover="showPackagesList.call(this, ${test.hash})" 
          onmouseleave="$(this).popover('hide')"
        >
          <input 
            type="checkbox" 
            name="tests[]" onclick="changeTotalPrice('${test.hash}')" 
            class="new-control-input testSelect" 
            data-name="${test.name}" 
            data-price="${test.price}" 
            value="${test.hash}" 
            id="package_${test.hash}" 
          >
          <p class=""> ${parseInt(test.price)?.toLocaleString()} </p>
          <span class="new-control-indicator m-3 d-none"></span>
          <span dir="ltr" class="ml-2 overflow-text-hidden">${test.name}</span>
        </label>
      </div>
      `;
  }
};

class TestsTheme {
  constructor(table, packages, tests, categories) {
    this.name = "select Theme";
    this.table = table;
    this.Packages = packages;
    this.Tests = tests;
    this.categories = categories;
  }

  categorySelect(categories, id = "all") {
    return `
      <select class="form-control rounded border border-info" id="categorySelect-${id}">
        <option value="0">الكل</option>
        ${categories.map((item) => {
          return `<option value="${item.hash}">${item.name}</option>`;
        })}
      </select>
      <script>
        $('#categorySelect-${id}').select2({
            width: '100%',
            dropdownParent: $("#categorySelect-${id}").parent(),
            placeholder: "اختر نوع التحليل",
        });
        // get close select2
        $('.main-visit-tests .select2-selection--single').addClass('br-30');
        // put default value
        $('#categorySelect-${id}').val('').trigger('change');
      </script>
    `;
  }

  createTests() {
    return "createTests";
  }

  createPackages() {
    return "createPackages";
  }

  createSselectedTestsAndPackages() {
    return "createSselectedTestsAndPackages";
  }

  saveButton() {
    return "saveButton";
  }

  priceInputs() {
    return "priceInputs";
  }

  build() {
    return `Build ${this.name} Theme`;
  }
}

class TestsThemeOne extends TestsTheme {
  constructor(table, packages, tests, categories) {
    super(table, packages, tests, categories);
    this.name = "TestsThemeOne";
  }

  createTests(tests) {
    return `
        <div class="row justify-content-center h-100 m-auto">
            <div class="col-6 mt-3">
                <input type="text" class="w-100 form-control product-search br-30" id="input-search-2" placeholder="ابحث عن التحليل">
            </div>
            <div class="col-6 mt-3">
                ${this.categorySelect(this.categories, "2")}
            </div>
            <div class="col-12" style="overflow-y: scroll; height: 500px">
                <div class="row justify-content-between">
                    <div class="col-md-12">
                        <div class="searchable-container m-0 packages-search" style="max-width: 100%;">
                            <div class="my-3 border-0 row" id="offers">
                            ${tests
                              .map((item) => createTest(item, "2"))
                              .join("")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
  }

  createPackages(packages) {
    return `
        <div class="row justify-content-center h-100 m-auto">
            <div class="col-6 mt-3">
                <input type="text" class="w-100 form-control product-search br-30" id="input-search-3" placeholder="ابحث عن العرض">
            </div>
            <div class="col-6 mt-3">
                ${this.categorySelect(this.categories, "3")}
            </div>
            <div class="col-12" style="overflow-y: scroll; height: 500px">
                <div class="row justify-content-between">
                    <div class="col-md-12">
                        <div class="searchable-container m-0 packages-search" style="max-width: 100%;">
                            <div class="my-3 border-0 row" id="offers">
                              ${packages
                                .map((item) => createTest(item, "1"))
                                .join("")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
  }

  createSselectedTestsAndPackages() {
    return `
    <div class="tab-pane fade" id="selected-tests" role="tabpanel"
        aria-labelledby="selected-tests-tab">
        <div id="show_selected_tests" class="row m-auto"
            style="overflow-y: scroll; height: 545.39px">
            
        </div>
    </div>
    `;
  }

  saveButton(table) {
    return `<button type="button" class="btn btn-main-add w-100" onclick="fireSwal.call(${table},${table}.saveNewItem)" id="${table}-save">حفظ</button>`;
  }

  priceInputs(table) {
    return `
    <div class="row align-items-center mx-auto my-2">
        <div class="col-3">
            <!-- السعر -->
            <div class="form-group">
                <label for="total_price">السعر</label>
                <input type="text" class="form-control" name="total_price" id="total_price" value="0"
                    placeholder="السعر" disabled onchange="netPriceChange()"
                    onkeyup="netPriceChange()">
            </div>
        </div>

        <div class="col-3">
            <!-- الخصم -->
            <div class="form-group">
                <label for="dicount">الخصم</label>
                <input type="number" class="form-control" name="dicount" id="dicount" value="0"
                    placeholder="الخصم" onchange="netPriceChange()"
                    onkeyup="netPriceChange()">
            </div>
        </div>
        <div class="col-3">
            <!-- الاجمالي -->
            <div class="form-group">
                <label for="net_price">الاجمالي</label>
                <input type="text" class="form-control" name="net_price" id="net_price" value="0"
                    placeholder="الاجمالي" disabled>
            </div>
        </div>

        <div class="col-3">
            <div id="save-button">
                ${this.saveButton(table)}
            </div>
        </div>
    </div>`;
  }

  build() {
    return `
    <div class="statbox widget box box-shadow bg-white main-visit-tests mt-4 h-100">
        <div class="widget-content widget-content-area m-auto h-100">
            <div class="modal-header d-flex justify-content-center">
                <h3 class="modal-title">التحاليل</h3>
            </div>
            <ul class="nav nav-tabs border-0 row my-3" id="myTab" role="tablist">
                <li class="nav-item col-lg-4" role="presentation">
                    <button class="w-100 text-center btn btn-action active" id="all-tests-tab"
                        data-toggle="tab" data-target="#all-tests" type="button" role="tab"
                        aria-controls="all-tests" aria-selected="true">التحاليل</button>
                </li>
                <li class="nav-item col-lg-4" role="presentation">
                    <button class="w-100 text-center btn btn-action" id="all-packages-tab"
                        data-toggle="tab" data-target="#all-packages" type="button" role="tab"
                        aria-controls="all-packages" aria-selected="false">العروض</button>
                </li>
                <li class="nav-item col-lg-4" role="presentation">
                    <button class="w-100 text-center btn btn-action" id="selected-tests-tab"
                        data-toggle="tab" data-target="#selected-tests" type="button" role="tab"
                        aria-controls="selected-tests" aria-selected="false">التحاليل
                        المختارة</button>
                </li>
            </ul>
            <div class="tab-content" id="myTabContent">
                <div class="tab-pane fade show active" id="all-tests" role="tabpanel"
                    aria-labelledby="all-tests-tab">
                    <div id="all-tests-content">
                        ${this.createTests(this.Tests)}
                    </div>
                </div>
                <div class="tab-pane fade" id="all-packages" role="tabpanel"
                    aria-labelledby="all-packages-tab">
                    <div id="all-packages-content">
                        ${this.createPackages(this.Packages)}
                    </div>
                </div>
                ${this.createSselectedTestsAndPackages()}
            </div>
            <!-- price Inputs -->
            ${this.priceInputs(this.table)}
        </div>
    </div>
    `;
  }
}

class TestsThemeTwo extends TestsTheme {
  constructor(table, packages, tests, categories) {
    super(table, packages, tests, categories);
    this.name = "TestsThemeTwo";
  }

  createTests(tests) {
    return `
    <div class="col-6" style="overflow-y: scroll;height: 60%;">
      <div class="row justify-content-between">
          <div class=" col-md-12  my-3 px-5">
              <h3>التحاليل</h3>
          </div>
          <div class="col-md-12">
              <div class="searchable-container packages-search">
                  <div class="searchable-items my-3 border-0" id="offers">
                      ${tests.map((item) => createTest(item, "2")).join("")}
                  </div>
              </div>
          </div>
      </div>
  </div>
    `;
  }

  createPackages(packages) {
    return `
    <div class="col-6" style="overflow-y: scroll;height: 60%;">
      <div class="row justify-content-between">
          <div class=" col-md-12  my-3 px-5">
              <h3>العروض</h3>
          </div>
          <div class="col-md-12">
              <div class="searchable-container packages-search">
                  <div class="searchable-items my-3 border-0" id="offers">
                      ${packages.map((item) => createTest(item, "1")).join("")}
                  </div>
              </div>
          </div>
      </div>
  </div>
    `;
  }

  createSselectedTestsAndPackages() {
    return `
    <div class="statbox widget box box-shadow bg-white mt-4 main-visit-selected-tests">
      <div class="widget-content widget-content-area m-auto h-100">
          <div class="modal-header d-flex justify-content-center">
              <h3 class="modal-title">التحاليل المختارة</h3>
          </div>
          <div id="show_selected_tests" class="row m-auto"
              style="overflow-y: scroll;width: 95%; height:65%">
          </div>
          ${this.priceInputs()}
      </div>
  </div>
    `;
  }

  priceInputs() {
    return `
    <div class="row h-25 m-auto" style="width: 95%;">
      <div class="col-4">
          <!-- السعر -->
          <div class="form-group">
              <label for="total_price">السعر</label>
              <input type="text" class="form-control" name="total_price" id="total_price" value="0"
                  placeholder="السعر" disabled onchange="netPriceChange()"
                  onkeyup="netPriceChange()">
          </div>
      </div>
      <div class="col-4">
          <!-- الخصم -->
          <div class="form-group">
              <label for="dicount">الخصم</label>
              <input type="number" class="form-control" name="dicount" id="dicount" value="0"
                  placeholder="الخصم" onchange="netPriceChange()"
                  onkeyup="netPriceChange()">
          </div>
      </div>
      <div class="col-4">
          <!-- الاجمالي -->
          <div class="form-group">
              <label for="net_price">الاجمالي</label>
              <input type="text" class="form-control" name="net_price" id="net_price" value="0"
                  placeholder="الاجمالي" disabled>
          </div>
      </div>
  </div>`;
  }

  saveButton(table) {
    return `
    <button type="button" class="btn btn-main-add" onclick="fireSwal.call(${table},${table}.saveNewItem)" id="${table}-save">حفظ</button>
    `;
  }

  build() {
    return `
    <div class="row" style="height: 550px;">
      <div class="col-7">
        <div class="statbox widget box box-shadow bg-white main-visit-tests mt-4">
            <div class="widget-content widget-content-area m-auto h-100" >
                <div class="modal-header d-flex justify-content-center">
                    <h3 class="modal-title">التحاليل</h3>
                </div>
                <div class="row justify-content-center h-100 m-auto" style="width: 95%;">
                    <div class="col-6 mt-3">
                        <input type="text" class="w-100 form-control product-search br-30" id="input-search-all" placeholder="ابحث عن التحليل">
                    </div>
                    <div class="col-6 mt-3">
                        ${this.categorySelect(this.categories)}
                    </div>
                    ${this.createTests(this.Tests)}
                    ${this.createPackages(this.Packages)}
                </div>
                
            </div>
        </div>
      </div>  
      <div class="col-5">
        ${this.createSselectedTestsAndPackages()}
      </div>
    </div>
    <div class="modal-footer mt-5">
        ${this.saveButton(this.table)}
    </div>
    `;
  }
}
