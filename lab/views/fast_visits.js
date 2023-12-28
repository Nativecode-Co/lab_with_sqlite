$(document).ready(function() {
    fetch_data();
});

function fetch_data() {
    var visits = exce(`select patient.name as patient_name,(select name from visit_status where visit_status.hash = visits.visits_status_id) as status,visits.name as name,visits_status_id,visits.hash as hash from visits inner join patient on patient.hash = visits.visits_patient_id where ispayed=1`).result.query;
    for (let visit of visits) {
        $(".searchable-items.list").append(
            `
            <div class="items">
                <div class="item-content">
                    <div class="user-profile">
                        <div class="user-meta-info">
                            <p class="user-name" data-name="${visit.patient_name}">${visit.patient_name}</p>
                        </div>
                    </div>
                    <div class="user-email">
                        <p class="info-title"> الزيارة: </p>
                        <p class="usr-email-addr" data-email="${visit.name}">${visit.name}</p>
                    </div>
                    <div class="user-location">
                        <p class="info-title">نوع الزيارة: </p>
                        <p class="usr-location" data-location="${visit.status}">${visit.status}</p>
                    </div>
                    <div class="action-btn text-dark text-center">
                        <i class="fas fa-home fa-lg mx-1" data-hash="${visit.hash}" onclick="change_visit_status($(this),'1','زيارة منزلية')"></i>
                        <i class="fas fa-syringe fa-lg mx-1" data-hash="${visit.hash}" onclick="change_visit_status($(this),'2','انتظار اخذ عينة')"></i>
                        <i class="fas fa-clipboard-check fa-lg mx-1" data-hash="${visit.hash}" onclick="change_visit_status($(this),'3','منجز')"></i>
                        <i class="fas fa-watch fa-lg mx-1" data-hash="${visit.hash}" onclick="change_visit_status($(this),'5','انتظار نتيجة')"></i>
                        <i class="fad fa-poll-people fa-lg mx-1" data-hash="${visit.hash}" onclick="show_tests($(this));"></i>
                    </div>
                </div>
            </div>
            `
        )
    }
}

function change_visit_status(el, value, type) {
    exce(`update visits set visits_status_id = ${value} where hash=${el.data("hash")}`);
    swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        padding: '2em',
        icon: 'success',
        title: `تم تغيير الزيارة الي ${type}`,
    });
}

function show_tests(el) {
    $(".visit-tests").empty();
    $("#tests-modal").modal("toggle");
    $("input[name=form_hash]").val(el.data("hash"));
    let tests = exce(`select (select test_name from test where test.hash=visits_tests.tests_id) as name,result_test,is_done from visits_tests where visit_id=${el.data("hash")}`).result.query;
    var color, text;
    for (let test of tests) {
        switch (test.is_done) {
            case '0':
                color = "danger";
                text = "لم تظهر النتيجة";
                break;
            case '1':
                color = "success";
                text = "اكتمل التحليل";
                break;
            default:
                color = "info";
                text = "غير معروف";
                break;
        }
        let html_result = ""
        if (test.result_test != null) {
            let results = JSON.parse(test.result_test).result;
            for (let result of results) {
                html_result += ` <span class="badge badge-info m-1">${result.name}: ${result.result} ${result.unit}</span> `
            }
        }
        $(".visit-tests").append(
            `
            <tr>
                <td>
                    <div class="td-content product-brand">${test.name}</div>
                </td>
                <td>
                    <div class="td-content product-invoice">${html_result}</div>
                </td>
                <td>
                    <div class="td-content"><span class="badge badge-${color}">${text}</span></div>
                </td>
            </tr>
            `)
    }
}

function print_result() {
    let hash = $("input[name=form_hash]").val();
    location.href = `print_result.html?hash=${hash}`
}