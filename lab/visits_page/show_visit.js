const testTest = {
    __init__(hash) {
        this.selectors.buttons.removeClass('active');
        this.selectors.showVisitButton.addClass('active');
        let { visit, patient } = this.data.__init__(hash);
        this.selectors.workSpace.html(this.templates.__init__(visit, patient));
        this.utils.__init__Barcode(visit.hash);
        this.utils.animate();
    },
    selectors: {
        buttons: $('.action'),
        showVisitButton: $('#show_visit_button'),
        workSpace: $('#work-sapce'),
    },

    data: {
        __init__(hash) {
            let visit = run(this.getVisitQuery(hash)).result[0].query0[0];
            let patient = run(this.getPatientQuery(visit.visits_patient_id)).result[0].query0[0];
            return { visit, patient };
        },
        getVisitQuery(hash) {
            return `
            SELECT 
                name, age, visit_date, total_price, net_price, note,visits_patient_id, hash,
                (select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor 
            FROM 
                lab_visits WHERE hash = ${hash};
            
            `;
        },

        getPatientQuery(hash) {
            return `
            SELECT * FROM lab_patient WHERE hash=${hash};
            `;
        },
    },

    templates: {
        __init__(visit, patient) {
            return this.visitDetailTemplate.__init__(visit) + this.patientDetailTemplate.__init__(patient);
        },

        visitDetailTemplate: {
            __init__(visit) {
                return `
                    <div class="col-lg-6 mt-4">
                        <div class="statbox widget box box-shadow bg-white py-3">
                            <div class="widget-content widget-content-area m-auto" style="width: 95%;">
                                <div class="container">
                                    <div class="custom-card visit-info">
                                        ${this.visitDetailHeaderComponent(visit)}
                                        ${this.visitDetailBodyComponent(visit)}
                                        ${this.visitDetailFooterComponent(visit)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            },
            visitDetailHeaderComponent(visit) {
                return `
                    <div class="custom-card-header hr">
                        <h4 class="title">تفاصيل الزيارة</h4>
                    </div>
                `;
            },

            visitDetailBodyComponent(visit) {
                return `
                    <div class="custom-card-body" dir="rtl">
                        <table class="information-1">
                            <tbody>
                                <tr>
                                    <td>اسم المريض</td>
                                    <td>${visit?.name ?? ''}</td>
                                </tr>
                                <tr>
                                    <td>الطبيب المعالج</td>
                                    <td>${visit?.doctor ?? ''}</td>
                                </tr>
                                <tr>
                                    <td>العمر</td>
                                    <td>${visit?.age ?? ''} سنة</td>
                                </tr>
                                <tr>
                                    <td>التاريخ</td>
                                    <td>${visit?.visit_date ?? ''}</td>
                                </tr>
                                <tr>
                                    <td>اجمالي المبلغ</td>
                                    <td>${parseInt(visit?.total_price)?.toLocaleString() ?? ''} IQD</td>
                                </tr>
                                <tr>
                                    <td>صافي الدفع</td>
                                    <td>${parseInt(visit?.net_price)?.toLocaleString() ?? ''} IQD</td>
                                </tr>
                                <tr>
                                    <td>ملاحظات</td>
                                    <td>${visit?.note ?? ''}</td>
                                </tr>
                                ${this.visitDetailBarcodeComponent(visit)}
                            </tbody>
                        </table>
                    </div>
                `;
            },

            visitDetailBarcodeComponent(visit) {
                return `
                    <tr>
                        <td>الرمز</td>
                        <td id="visit-code">
                            <div class="barcode" id="barcode-print">
                                <div class="title">
                                    <p>${visit.name}</p>
                                </div>
                                <div class="code">	
                                    <svg width="100%" x="0px" y="0px" viewBox="0 0 310 50" xmlns="http://www.w3.org/2000/svg" version="1.1" style="transform: translate(0,0)" id="barcode"></svg>
                                </div>
                            </div>
                            ${this.visitDetailBarcodeButtonComponent()}
                        </td>
                    </tr>
                `;
            },

            visitDetailBarcodeButtonComponent() {
                return `
                    <button class="btn btn-action d-print-none" onclick="printElement('#visit-code', 'A3', 'css/barcode.css')">طباعة</button>
                `;
            },

            visitDetailFooterComponent() {
                return `
                    <div class="custom-card-footer d-print-none">
                        <div class="row justify-content-center align-items-center">
                            <button type="button" class="btn btn-outline-print" onclick="printElement('.visit-info', 'A3', 'css/new_style.css', 'css/barcode.css')"><i class="mr-2 fal fa-print"></i>طباعة</button>
                        </div>
                    </div>
                `;
            }
        },

        patientDetailTemplate: {
            __init__(patient) {
                return `
                    <div class="col-lg-6 mt-4">
                        <div class="statbox widget box box-shadow bg-white py-3">
                            <div class="widget-content widget-content-area m-auto" style="width: 95%;">
                                <div class="container">
                                    <div class="custom-card patient-info">
                                        ${this.patientDetailHeaderComponent()}
                                        ${this.patientDetailBodyComponent(patient)}
                                        ${this.patientDetailFooterComponent()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            },

            patientDetailHeaderComponent(patient) {
                return `
                    <div class="custom-card-header hr">
                        <h4 class="title">تفاصيل المريض</h4>
                    </div>
                `;
            },

            patientDetailBodyComponent(patient) {
                return `
                    <div class="custom-card-body" dir="rtl">
                        <table class="information-1">
                            <tbody>
                                <tr>
                                    <td>الاسم</td>
                                    <td>${patient.name}</td>
                                </tr>
                                <tr>
                                    <td>تاريخ الميلاد</td>
                                    <td>${patient.birth}</td>
                                </tr>
                                <tr>
                                    <td>النوع</td>
                                    <td>${patient.gender}</td>
                                </tr>
                                <tr>
                                    <td>رقم الهاتف</td>
                                    <td>${patient.phone}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            },

            patientDetailFooterComponent() {
                return `
                <div class="custom-card-footer d-print-none">
                    <div class="row justify-content-center align-items-center">
                        <button type="button" class="btn btn-outline-print" onclick="printElement('.patient-info', 'A3', 'css/new_style.css')"><i class="mr-2 fal fa-print"></i>طباعة</button>
                    </div>
                </div>
                `;
            }

        },
    },

    utils: {
        __init__Barcode(hash) {
            JsBarcode("#barcode", `${hash}`, {
                width: 1.5,
                height: 20,
                fontSize: 20,
            });
        },

        animate() {
            $("html, body").animate({
                scrollTop: $("#main-space").offset().top,
            }, 500);
        },
    },

};