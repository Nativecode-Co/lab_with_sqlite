const urlParams = new URLSearchParams(window.location.search);
const barcode = urlParams.get("barcode");

if (barcode) {
  visitDetail(`${barcode}`);
  showAddResult(`${barcode}`);
}

function get_var(_var = "") {
  const r = document.querySelector(":root");
  const rs = getComputedStyle(r);
  alert(`The value of ${_var} is: ${rs.getPropertyValue(_var)}`);
}

// Create a function for setting a variable value
function set_var(_var, value) {
  const r = document.querySelector(":root");
  // Set the value of variable --blue to another value (in this case "lightblue")
  r.style.setProperty(_var, value);
}

// dom ready
$(() => {
  set_var("--font_size", `${invoices?.font_size ?? 20}px`);
  set_var(
    "--typeTest-font",
    `${Number.parseInt(invoices?.font_size) + 2 ?? 20}px`
  );
  set_var("--color-orange", invoices?.color ?? "#ff8800");
  set_var("--invoice-color", invoices?.font_color ?? "#000");
  // set_var("--logo-height", `${invoices?.header ?? 175}px`);
  // document.documentElement.style.setProperty('--font_size', `${invoices?.font_size ?? 20}px`);
  // r.style.setProperty('--color-orange', invoices?.color??'red');
  // r.style.setProperty('--water-mark', `url(${invoices.logo})`??'url(../assets/image/logo2.png)');
  $(".half-page").css("height", $(window).height() - 100);
  //resize window
  $(window).resize(() => {
    $(".half-page").css("height", $(window).height() - 100);
  });

  // visits button
  $("#visits-button").click(() => {
    $(".page-form").empty();
    $(".pan").addClass("d-none");
    $(".visits").removeClass("d-none");
    $("#visits-button").addClass("active");
    $("#add-visit-button").removeClass("active");
  });

  // add-visit button
  $("#add-visit-button").click(() => {
    $(".page-form").empty();
    $(".page-form").append(visit_form);
    $(".pan").addClass("d-none");
    $(".detail-page").removeClass("d-none");
    $(".detail-page").empty();
    $(".detail-page").append(packagesList());
    $("#visits-button").removeClass("active");
    $("#add-visit-button").addClass("active");
  });

  $(document).keydown((e) => {
    if (
      $("input.result").is(":focus") &&
      (e.keyCode === 40 || e.keyCode === 13)
    ) {
      e.preventDefault();
      focusInput("add");
    } else if ($("input.result").is(":focus") && e.keyCode === 38) {
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
      const category = $("#categorySelect-all").val();
      const rex = new RegExp($(this).val(), "i");
      $(".searchable-container .test").hide();
      $(".searchable-container .package").hide();
      if (Number(category) === 0 || category === "" || !category) {
        $(".searchable-container .package")
          .filter(function () {
            return rex.test($(this).text());
          })
          .show();
        $(".searchable-container .test")
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
        $(`.searchable-container .test[data-category='${category}']`)
          .filter(function () {
            return rex.test($(this).text());
          })
          .show();
      }
    });

    $("#categorySelect-all").on("change", function () {
      $("#input-search-all").val("");
      const category = $(this).val();
      if (Number(category) === 0 || category === "" || !category) {
        $(".searchable-container .test").show();
        $(".searchable-container .package").show();

        return;
      }
      $(".searchable-container .test").hide();
      $(".searchable-container .package").hide();
      $(`.searchable-container .package[data-category='${category}']`).show();
      $(`.searchable-container .test[data-category='${category}']`).show();
    });
    $("#input-search-2").on("keyup change", function () {
      const category = $("#categorySelect-2").val();
      const rex = new RegExp($(this).val(), "i");
      $(".searchable-container .test").hide();
      if (Number(category) === 0 || category === "" || !category) {
        $(".searchable-container .test")
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
      const category = $(this).val();
      if (Number(category) === 0 || category === "" || !category) {
        $(".searchable-container .test").show();
        return;
      }
      $(".searchable-container .test").hide();
      $(`.searchable-container .test[data-category='${category}']`).show();
    });

    $("#input-search-3").on("keyup change", function () {
      const category = $("#categorySelect-3").val();
      const rex = new RegExp($(this).val(), "i");
      $(".searchable-container .package").hide();
      if (Number(category) === 0 || category === "" || !category) {
        $(".searchable-container .package")
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
      const category = $(this).val();
      if (Number(category) === 0 || category === "" || !category) {
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
