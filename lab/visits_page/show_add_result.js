const showAddResult = {
    __init__(hash) {
        this.selectors.buttons.removeClass('active');
        this.selectors.showAddResultButton.addClass('active');
        let { visit, VisitTests } = this.data.__init__(hash);
        this.selectors.workSpace.html(this.templates.__init__({ /* form, invoice */hash }));
    },
    selectors: {
        buttons: $('.action'),
        showAddResultButton: $('#show_add_result'),
        workSpace: $('#work-sapce'),
    },
    data: {
        __init__(hash) {
            let data = run(this.getVisitQuery(hash) + this.getVisitTestsQuery(hash));
            let visit = data.result[0].query0[0];
            let visitPackages = data.result[1].query1;
            return { visit, VisitTests };
        },

        getVisitQuery() {
            return `
                select 
                    age,
                    (select gender from lab_patient where hash=lab_visits.visits_patient_id) as gender,
                    name,
                    DATE(visit_date) as date,
                    TIME(visit_date) as time,
                    (select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor,
                    hash
                from 
                    lab_visits where hash = '${hash}';
            `;
        },

        getVisitTestsQuery() {
            return `
                select 
                    option_test as options,
                    test_name as name,
                    kit_id,
                    (select name from lab_test_units where hash=lab_pakage_tests.unit) as unit_name,
                    (select name from lab_test_catigory where hash=lab_test.category_hash) as category,
                    unit,
                    result_test,
                    lab_visits_tests.hash as hash
                from 
                    lab_visits_tests 
                inner join
                    lab_pakage_tests
                on 
                    lab_pakage_tests.test_id = lab_visits_tests.tests_id and lab_pakage_tests.package_id = lab_visits_tests.package_id
                inner join
                    lab_test
                on
                    lab_test.hash = lab_visits_tests.tests_id
                where 
                    visit_id = '${hash}';
            `;
        },
    },

    templates: {
        __init__(props) {
            return `
                <div class="col-lg-12 mt-4">
                    <div class="statbox widget box box-shadow bg-white py-3">
                        <div class="widget-content widget-content-area m-auto" style="width: 95%;">
                            <div class="row">
                                <div class="col-md-6 mt-48">
                                    ${form}
                                    ${this.saveButtonComponent(hash)}
                                </div>
                                <div class="col-md-6 mt-48">
                                    ${invoice}
                                    ${this.printButtonsComponent()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        printButtonsComponent() {
            return `
                <div class="row mt-15 justify-content-center">
                    <div class="col-md-3 col-6">
                        <button type="button" class="btn btn-outline-print w-100" id="print-invoice-result">
                            <i class="mr-2 fal fa-print"></i>طباعة النتائج
                        </button>
                    </div>
                    <div class="col-md-3 col-6">
                        <button type="button" class="btn btn-outline-print w-100" id="print-all-invoice-result">
                            <i class="mr-2 fal fa-print"></i>طباعة الكل
                        </button>
                    </div>
                    <div class="col-md-3 col-6">
                        <button type="button" class="btn btn-outline-print w-100" onclick="toggleHeaderAndFooter.call(this)">
                            <i class="mr-2 fal fa-print"></i>اخفاء الفورمة
                        </button>
                    </div>
                </div>
            `;
        },

        saveButtonComponent(hash) {
            return `
            <div class="row mt-15 justify-content-center">
                <div class="col-md-3 col-6">
                    <button type="button" class="btn btn-add w-100" onclick="fireSwal(saveResult,'${hash}')">حفظ النتائج</button>
                </div>
            </div>
            `;
        }
    },
};


function showAddResult(hash) {
    $('.action').removeClass('active');
    $('#show_add_result').addClass('active');
    let workSpace = $('#work-sapce');
    workSpace.html('');
    let data = run(`select age,(select gender from lab_patient where hash=lab_visits.visits_patient_id) as gender,
                           name,
                           DATE(visit_date) as date,
                           TIME(visit_date) as time,
                           (select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor,
                           hash
                        from lab_visits where hash = '${hash}';
                    select 
                        option_test as options,
                        test_name as name,
                        kit_id,
                        (select name from lab_test_units where hash=lab_pakage_tests.unit) as unit_name,
                        (select name from lab_test_catigory where hash=lab_test.category_hash) as category,
                        unit,
                        result_test,
                        lab_visits_tests.hash as hash
                    from 
                        lab_visits_tests 
                    inner join
                        lab_pakage_tests
                    on 
                        lab_pakage_tests.test_id = lab_visits_tests.tests_id and lab_pakage_tests.package_id = lab_visits_tests.package_id
                    inner join
                        lab_test
                    on
                        lab_test.hash = lab_visits_tests.tests_id
                    where 
                        visit_id = '${hash}';`);
    let visit = data.result[0].query0[0];
    let visitTests = data.result[1].query1;
    let form = addResult(visit, visitTests);
    let invoice = showResult(visit, visitTests);
    let html = `
    <div class="col-lg-12 mt-4">
        <div class="statbox widget box box-shadow bg-white py-3">
            <div class="widget-content widget-content-area m-auto" style="width: 95%;">
                <div class="row">
                    <div class="col-md-6 mt-48">
                        ${form}
                        <div class="row mt-15 justify-content-center">
                            <div class="col-md-3 col-6">
                                <button type="button" class="btn btn-add w-100" onclick="fireSwal(saveResult,'${hash}')">حفظ النتائج</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mt-48">
                        ${invoice}
                        <div class="row mt-15 justify-content-center">
                            <div class="col-md-3 col-6">
                                <button type="button" class="btn btn-outline-print w-100" id="print-invoice-result">
                                    <i class="mr-2 fal fa-print"></i>طباعة النتائج
                                </button>
                            </div>
                            <div class="col-md-3 col-6">
                                <button type="button" class="btn btn-outline-print w-100" id="print-all-invoice-result">
                                    <i class="mr-2 fal fa-print"></i>طباعة الكل
                                </button>
                            </div>
                            <div class="col-md-3 col-6">
                                <button type="button" class="btn btn-outline-print w-100" onclick="toggleHeaderAndFooter.call(this)">
                                    <i class="mr-2 fal fa-print"></i>اخفاء الفورمة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    workSpace.append(html);
    setInvoiceStyle()
    $('#invoice-tests-buttons .btn').first().addClass('active');
    $('.book-result').first().show();
    $('#print-invoice-result').attr('onclick', `printElement('#invoice-${$('.book-result').first().attr('id').split('-')[1]}', 'A4', 'css/invoice.css')`);
    $('#print-all-invoice-result').attr('onclick', `printElement('.book-result', 'A4', 'css/invoice.css')`);
    cloneOldInvoice(manageInvoiceHeight())
    $("html, body").animate({
        scrollTop: $("#main-space").offset().top,
    },
        500
    );
    $('.modal-body select').each(function () {
        $(this).select2({
            width: '100%',
            tags: true,
            dropdownParent: $(this).parent().parent()
        });
    });
}