const urlParams = new URLSearchParams(window.location.search),
  barcode = urlParams.get("barcode");

if (barcode) {
  visitDetail(`${barcode}`);
  showAddResult(`${barcode}`);
}

function get_var(_var = "") {
  let r = document.querySelector(":root");
  let rs = getComputedStyle(r);
  alert(`The value of ${_var} is: ` + rs.getPropertyValue(_var));
}

// Create a function for setting a variable value
function set_var(_var, value) {
  let r = document.querySelector(":root");
  // Set the value of variable --blue to another value (in this case "lightblue")
  r.style.setProperty(_var, value);
}

// on page load

// dom ready
$(function () {
  setTimeout(() => {
    // const driverObj = driver.js.driver({
    //   overlayOpacity: 0,
    //   popoverClass: "text-white bg-dark text-center",
    //   popoverOffset: 0,
    //   nextBtnText: "التالي",
    //   prevBtnText: "السابق",
    //   doneBtnText: "تم",
    //   steps: [
    //     {
    //       element: "#form-lab_visits",
    //       popover: {
    //         title: "اضافة مريض",
    //         description: "هنا يمكن اضافة تفاصيل المريض",
    //         side: "left",
    //         align: "center",
    //       },
    //     },
    //   ],
    // });
    // driverObj.drive();
  });
  // change format date of #visit_date to 01-apr-2023

  // let root = document.documentElement;
  // change :root  font_size
  set_var("--font_size", `${invoices?.font_size ?? 20}px`);
  set_var("--typeTest-font", `${parseInt(invoices?.font_size) + 2 ?? 20}px`);
  set_var("--color-orange", invoices?.color ?? "#ff8800");
  set_var("--invoice-color", invoices?.font_color ?? "#000");
  // set_var("--logo-height", `${invoices?.header ?? 175}px`);
  // document.documentElement.style.setProperty('--font_size', `${invoices?.font_size ?? 20}px`);
  // r.style.setProperty('--color-orange', invoices?.color??'red');
  // r.style.setProperty('--water-mark', `url(${invoices.logo})`??'url(../assets/image/logo2.png)');
  $(".half-page").css("height", $(window).height() - 100);
  // add visit form
  $("#visit-form").append(lab_visits.createForm());
  //resize window
  $(window).resize(function () {
    $(".half-page").css("height", $(window).height() - 100);
  });

  // visits button
  $("#visits-button").click(function () {
    $(".page-form").empty();
    $(".pan").addClass("d-none");
    $(".visits").removeClass("d-none");
    $("#visits-button").addClass("active");
    $("#add-visit-button").removeClass("active");
  });

  // add-visit button
  $("#add-visit-button").click(function () {
    $(".page-form").empty();
    $(".page-form").append(visit_form);
    $(".pan").addClass("d-none");
    $(".detail-page").removeClass("d-none");
    $(".detail-page").empty();
    $(".detail-page").append(packagesList());
    $("#visits-button").removeClass("active");
    $("#add-visit-button").addClass("active");
  });

  $(document).keydown(function (e) {
    if (
      $(`input.result`).is(":focus") &&
      (e.keyCode == 40 || e.keyCode == 13)
    ) {
      e.preventDefault();
      focusInput("add");
    } else if ($(`input.result`).is(":focus") && e.keyCode == 38) {
      e.preventDefault();
      focusInput("12");
    }
  });

  $(".dt-buttons").addClass("btn-group");
  $("div.addCustomItem").html(`
    <span class="h-22 ml-4 mt-1">الكل</span>
    <label class="d-inline switch s-icons s-outline s-outline-invoice-slider mx-3 mt-2">
        <input type="checkbox" name="currentDay" id="currentDay" checked="" onchange="lab_visits.dataTable.ajax.reload()">
        <span class="invoice-slider slider"></span>
    </label>
    <span class="h-22 mt-1">اليوم</span>
  `);

  // wait 500ms to load data
  setTimeout(() => {
    $("#input-search-all").on("keyup change", function () {
      let category = $("#categorySelect-all").val();
      var rex = new RegExp($(this).val(), "i");
      $(".searchable-container .item").hide();
      if (category == 0 || category == "" || !category) {
        $(`.searchable-container .items.package`)
          .filter(function () {
            return rex.test($(this).text());
          })
          .show();
        $(`.searchable-container .item`)
          .filter(function () {
            return rex.test($(this).text());
          })
          .show();
      } else {
        $(`.searchable-container .items.package[data-category='${category}']`)
          .filter(function () {
            return rex.test($(this).text());
          })
          .show();
        $(`.searchable-container .item[data-category='${category}']`)
          .filter(function () {
            return rex.test($(this).text());
          })
          .show();
      }
    });

    $("#categorySelect-all").on("change", function () {
      $("#input-search-all").val("");
      var category = $(this).val();
      if (category == 0 || category == "" || !category) {
        $(".searchable-container .item").show();
        return;
      }
      $(".searchable-container .item").hide();
      $(
        `.searchable-container .items.package[data-category='${category}']`
      ).show();
      $(`.searchable-container .item[data-category='${category}']`).show();
    });
    $("#input-search-2").on("keyup change", function () {
      let category = $("#categorySelect-2").val();
      var rex = new RegExp($(this).val(), "i");
      $(".searchable-container .test").hide();
      if (category == 0 || category == "" || !category) {
        $(`.searchable-container .test`)
          .filter(function () {
            return rex.test($(this).text());
          })
          .show();
      } else {
        $(`.searchable-container .test[data-category='${category}']`)
          .filter(function () {
            return rex.test($(this).text());
          })
          .show();
      }
    });

    $("#categorySelect-2").on("change", function () {
      $("#input-search-2").val("");
      var category = $(this).val();
      if (category == 0 || category == "" || !category) {
        $(".searchable-container .test").show();
        return;
      }
      $(".searchable-container .test").hide();
      $(`.searchable-container .test[data-category='${category}']`).show();
    });

    $("#input-search-3").on("keyup change", function () {
      let category = $("#categorySelect-3").val();
      var rex = new RegExp($(this).val(), "i");
      $(".searchable-container .package").hide();
      if (category == 0 || category == "" || !category) {
        $(`.searchable-container .package`)
          .filter(function () {
            return rex.test($(this).text());
          })
          .show();
      } else {
        $(`.searchable-container .package[data-category='${category}']`)
          .filter(function () {
            return rex.test($(this).text());
          })
          .show();
      }
    });

    $("#categorySelect-3").on("change", function () {
      var category = $(this).val();
      if (category == 0 || category == "" || !category) {
        $(".searchable-container .package").show();
        return;
      }
      $(".searchable-container .package").hide();
      $(`.searchable-container .package[data-category='${category}']`).show();
    });
  }, 500);
  //////////////////////////////////////////
  setTimeout(() => {
    const mainHeight = $(".main-visit-form").height();

    $(".main-visit-list").height(mainHeight);
    $(".main-visit-tests").height(mainHeight);
    $(".main-visit-selected-tests").height(mainHeight);
  }, 200);
  // $(document).on('select2:open', (e) => {
  //   // focus on search input for this select2
  //   document.querySelector('.select2-search__field').focus();
  // });
});
