const updateNormal = (test, visit_hash) => {
  TEST = fetchApi("/maintests/get_by_patient_and_test", "post", {
    hash: test,
    visit_hash,
  });
  try {
    throw "no refrence";
    const { refrence } = TEST;
    if (Array.isArray(refrence) && refrence.length === 0) {
      throw "no refrence";
    }
    reference = [refrence];

    const refrenceTable = THEME.build(
      test,
      reference,
      refrence?.kit ?? "",
      refrence?.unit ?? ""
    );
    $("#refrence_editor .modal-body").html(refrenceTable);
    $("#refrence_editor").modal("show");
  } catch (error) {
    Swal.fire({
      title: "لاضافة قيمة طبيعية مناسبة لهذا التحليل يرجي اتباع الخطوات التالية",
      html: `<ul class="list-group list-group-flush text-left">
      <li class="list-group-item">1- قم بفتح صفحة التحاليل </li>
      <li class="list-group-item">2- اختر التحليل المراد اضافة رينج له </li>
      <li class="list-group-item">3- تاكد من ادخال العمر والجنس والوحدة الخاصة بالتحليل </li>
      <li class="list-group-item">4- عمر المريض يجب ان يكون بين العمر المحدد في الرينج </li>
      <li class="list-group-item">5- الجنس يجب ان يتطابق مع الجنس المحدد في الرينج  او يكون كلاهما </li>
      <li class="list-group-item">6- الوحدة يجب ان تتطابق مع الوحدة المحددة في الرينج </li>
      </ul>`,
      icon: "info",
      confirmButtonText: "زيارة صفحة التحاليل",
      showCancelButton: true,
      cancelButtonText: "اغلاق",
    }).then((result) => {
      if (result.isConfirmed) {
        // delete " " from last of TEST.test_name
        const name = TEST?.test_name?.replace(/ /g, "");
        window.location.href = `${front_url}package_test.html?name=${name}`;
      }
    });
  }
};

function updateRefrence(hash) {
  const formContainer = $("#form_container");
  formContainer.empty();
  const refrence = TEST?.refrence;
  const form = THEME.mainForm(hash, refrence);
  formContainer.append(form);
}

function saveRefrence(hash, refID) {
  if (refreshValidation() === false) {
    return false;
  }
  const result = $(`#refrence_form_${refID} input[name="type"]:checked`).val();
  const rightOptions = [];
  const options = [];
  if (
    $(`#refrence_form_${refID} input[name="type"]:checked`).val() === "result"
  ) {
    $(`#refrence_form_${refID} input[name='select-result-value']`).each(
      function () {
        options.push($(this).val());
        if (
          $(this)
            .parent()
            .parent()
            .find('input[name="select-result"]')
            .is(":checked")
        ) {
          rightOptions.push($(this).val());
        }
      }
    );
  }
  const { refrence, name } = fetchApi("/maintests/get_main_test", "post", {
    hash,
  });
  let component = [
    {
      name: name,
      reference: refrence,
    },
  ];
  const element = THEME.getData(refID, result, options, rightOptions);
  if (refID === "null") {
    if (component?.[0]) {
      component[0].reference.push(element);
    } else {
      component = [
        {
          name: test.test_name,
          reference: [element],
        },
      ];
      document.getElementById(`test-${hash}`).innerHTML = "";
    }
    const newRefrence = component[0].reference.filter((item, index, self) => {
      return self.findIndex((t) => t?.kit === item?.kit) === index;
    });
    // (${element['age low']??0} ${element['age unit low']} - ${element['age high']??100} ${element['age unit high']})
    if (
      $(
        `#test-${hash}_kit-${(
          kits
            .find((x) => x.id === element.kit)
            ?.name.replace(/[^a-zA-Z0-9]/g, "_") ?? "No Kit"
        )
          .split(" ")
          .join("_")}`
      ).length === 0
    ) {
      document.getElementById(
        `test-${hash}`
      ).innerHTML += ` <span class="badge badge-light border border-info p-2 mr-2 mb-2 col-auto" id="test-${hash}_kit-${(
        kits
          .find((x) => x.id === element.kit)
          ?.name.replace(/[^a-zA-Z0-9]/g, "_") ?? "No Kit"
      )
        .split(" ")
        .join("_")}" style="min-width:200px">
              ${kits.find((x) => x.id === element.kit)?.name ?? "No Kit"} 
              <a onclick="editRefrence('${hash}',${
        newRefrence.length - 1
      })"><i class="far fa-edit fa-lg mx-2 text-success"></i></a>
              </span> `;
    }
  } else {
    component[0].reference[refID] = element;
  }
  fetchApi("/maintests/update_main_test", "post", {
    hash,
    option_test: JSON.stringify({ component }),
  });
  $("#refrence_editor").modal("hide");
  TEST = null;
}

function deleteRange(e, id) {
  const num = $(`#${id} .range`).length;
  if (num > 1) {
    e.parents(".range").remove();
  }
}
