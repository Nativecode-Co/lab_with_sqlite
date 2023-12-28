$(document).ready(function() {
    fetch_data();
    $('#input-search-2').on('keyup', function() {
        var rex = new RegExp($(this).val(), 'i');
        $('.packages-search .items').hide();
        $('.packages-search .items').filter(function() {
            return rex.test($(this).text());
        }).show();
    });
});

function fetch_data() {
    let visit = exce(`select name,(select name from patient where patient.hash=visits.visits_patient_id) as parient_name from visits where hash = ${hash_id}`).result.query;
    let packages = exce(`select name,price,hash from package where lab_id = ${localStorage.getItem("lab_hash")}`).result.query;
    $(".visit-name").text(`الزيارة: ${visit[0].name} للمريض: ${visit[0].parient_name}`);
    for (var package of packages) {
        $("#packages").append(
            `<div class="items package">
                <div class="n-chk w-50 text-left">
                    <label class="new-control new-checkbox new-checkbox-rounded checkbox-outline-success mb-0">
                        <input type="checkbox" class="new-control-input" data-name="${package.name}" data-price="${package.price}" data-hash="${package.hash}">
                        <span class="new-control-indicator"></span>${package.name}
                    </label>
                </div>
                <div class="w-25 text-left">
                    <p class="">${package.price}$</p>
                </div>
            </div>`
        )
    }
}


function add_package() {
    $(".inv-detail").empty();
    let total_price = 0.00
    $(".package input:checked").each(function() {
        $(".inv-detail").append(`
        <div class="info-detail-1" data-hash="${$(this).data("hash")}" data-price="${$(this).data("price")}">
            <p class="w-50">${$(this).data("name")} 1</p>
            <p class="w-50"><span class="w-currency">$</span> <span class="bill-amount">${$(this).data("price")}</span></p>
        </div>
        `);
        total_price += parseFloat($(this).data("price"));
        $(".total_price").text(`$ ${total_price}`);
        $(".finish-price").text(`$ ${total_price}`);
    })
    $('#package-modal').modal('toggle');
}

function pay() {
    let package_tests = get_package_tests();
    if (package_tests != false) {
        let query = "";
        for (let test of package_tests) {
            query += `insert into visits_tests(visit_id,tests_id) values('${hash_id}','${test.test_id}');`
        }
        create_visit_package();
        exce(query);
        location.href = `invoice.html?hash=${hash_id}`
    } else {
        swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            padding: '2em',
            icon: 'error',
            title: 'لم يتم اضافة تحاليل بعد',
        });
    }
}

function detail() {
    let package_tests = get_package_tests();
    if (package_tests != false) {
        $(".order-summary").empty();
        for (let test of package_tests) {
            $(".order-summary").append(
                `
            <div class="summary-list summary-income">

                <div class="summery-info">

                    <div class="w-icon">
                        <i class="far fa-syringe fa-lg"></i>
                    </div>

                    <div class="w-summary-details">

                        <div class="w-summary-info">
                            <h6><span class="summary-count">${test.name}</span></h6>
                        </div>

                    </div>

                </div>

            </div>
            `
            )
        }
    }
}

function get_package_tests() {
    var hashs = "";
    $(".info-detail-1").each(function() {
        if (hashs != "") {
            hashs += `,'${$(this).data("hash")}'`
        } else {
            hashs += `'${$(this).data("hash")}'`
        }
    })
    if (hashs == "") {
        return false
    } else {
        return exce(`select test_id,(select test_name from test where test.id=pakage_tests.test_id) as name from pakage_tests where package_id in (${hashs})`).result.query;
    }
}

function create_visit_package() {
    let query = ""
    $(".info-detail-1").each(function() {
        query += `insert into visits_package(visit_id,package_id,price) values(${hash_id},${$(this).data("hash")},${$(this).data("price")});`
    })
    exce(query)
}