const showInvoice = {
    __init__(hash, props) {
        this.selectors.buttons.removeClass('active');
        this.selectors.invoiceButton.addClass('active');
        let { visit, visitPackages } = this.data.__init__(hash);
        this.selectors.workSpace.html(this.templates.__init__({ visit, visitPackages, ...props }));
        this.utils.__init__Barcode(visit.id, visit.hash);
        this.utils.setInvoiceStyle();
        this.utils.animate();
    },

    selectors: {
        buttons: $('.action'),
        invoiceButton: $('#invoice_button'),
        workSpace: $('#work-sapce'),
    },

    data: {
        __init__(hash) {
            let data = run(this.getVisitQuery(hash) + this.getVisitPackagesQuery(hash));
            let visit = data.result[0].query0[0];
            let visitPackages = data.result[1].query1;
            return { visit, visitPackages };
        },

        getVisitQuery(hash) {
            return `
            SELECT
                age,
                lab_patient.name as name,
                gender,
                lab_patient.id as id,
                date(lab_visits.insert_record_date) as date,
                TIME_FORMAT(TIME(lab_visits.insert_record_date), "%l:%i %p") as time,
                total_price,
                dicount,
                net_price
            FROM
                lab_visits
            INNER JOIN lab_patient ON lab_patient.hash = lab_visits.visits_patient_id
            WHERE
                lab_visits.hash = ${hash};
            `
        },

        getVisitPackagesQuery(hash) {
            return `
                SELECT
                    (select name from lab_package where hash=lab_visits_package.package_id) as name,
                    price
                FROM
                    lab_visits_package
                WHERE
                    visit_id = ${hash};
            `;
        },
    },

    templates: {
        __init__(props) {
            return `
            <div class="col-md-12 mt-4">
                <div class="statbox widget box box-shadow bg-white py-3">
                    <div class="widget-content widget-content-area m-auto" style="width: 95%;">
                        <div class="book-invoice" dir="ltr" id="pdf">
                            <div class="page">
                                ${this.invoiceHeaderComponent(props.logo, props.lab_name)}
                                ${this.invoiceBodyComponent(props.visit, props.visitPackages)}
                                ${this.invoiceFooterComponent(props.visit, props.invoice)}
                            </div>
                        </div>
                        ${this.invoicePrintComponent()}
                    </div>
                </div>
            </div>
            `;
        },

        invoiceHeaderComponent(logo, lab_name) {
            return `
                <div class="header">
                    <div class="row">
                        <div class="logo">
                            <!-- شعار التحليل ---------------------------------------------------------------------------------------------------------------->
                            <img src="${logo}" alt="${logo}">
                        </div>

                        <div class="left">
                            <!-- عنوان جانب الايسر ------------------------------------------------------------------------------------------------------------->
                            <div class="size1">
                                <p class="title" style="font-size: 18px; margin-block-end: -5px;">وصــل اســتلام</p>
                                <p class="namet" style="font-size: 18px; margin-block-end: -5px;">Return Receipt</p>
                            </div>
                        </div>
                        <div class="right">
                            <!-- عنوان جانب الايمن -->
                            <div class="size1">
                                <p class="title">${lab_name}</p>
                                <p class="namet">للتحليلات المرضية المتقدمة</p>
                                <p class="certificate"> Medical Lab for Pathological Analyses</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        invoiceBodyComponent(visit, visitPackages) {
            return `
                <div class="center">
                    <div class="center2-background"></div>
                    ${this.invoiceBodyUserDetailsComponent(visit)}
                    <div class="tester">
                        ${this.invoiceBodyDetailHeaderComponent()}
                        ${this.invoiceBodyDetailBodyComponent(visitPackages)}
                    </div>
                </div>
            `;
        },

        invoiceBodyUserDetailsComponent(visit) {
            return `
                <div class="nav">
                    <!-- شريط معلومات طالب التحليل --------------------------------------------------------------------------------------------->
                    <div class="name">
                        <p class="">Name</p>
                    </div>
                    <div class="namego">
                        <p>${visit.name}</p>
                    </div>
                    <div class="paid">
                        <p class="">Barcode</p>
                    </div>
                    <div class="paidgo d-flex justify-content-center align-items-center">
                        <svg id="visit-${visit.id}-code"></svg>
                    </div>
                    <script>
                        JsBarcode("#visit-${visit.id}-code", '${visit.hash}', {
                            width: 1,
                            height: 10,
                            displayValue: false
                        });
                    </script>
                    <div class="vid">
                        <p class="">Date</p>
                    </div>
                    <div class="vidgo">
                        <p><span class="note">${visit.date}</span>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;<span
                                class="note">${visit.time}</span></p>
                    </div>
                    <div class="prd">
                        <p class="">Received Date</p>
                    </div>
                    <div class="prdgo">
                        <p><span
                                class="note">${NOW.toLocaleDateString().split('/').reverse().join('-')}</span>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;<span
                                class="note">${NOW.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                    </div>
                </div>
            `;
        },

        invoiceBodyDetailHeaderComponent() {
            return `
                <div class="row">
                    <!-- تصنيف الجدول او اقسام الجدول --------------------------------------------------------------------------------------->
                    <div class="sections" style="width: 5%;">
                        <p>#</p>
                    </div>
                    <div class="sections" style="width: 81%;">
                        <p>Analysis Type</p>
                    </div>
                    <div class="sections" style="width: 12%;">
                        <p>Price</p>
                    </div>
                </div>
            `;
        },

        invoiceBodyDetailBodyComponent(visitPackages) {
            return `
                <div class="row m-0">
                    ${visitPackages.map((item, index) => `
                    <div class="mytest" style="">
                        <!--سطر تسعيرة التحليل الذي سيتكرر----------------------------------------------------------------------->
                        <div class="testname">
                            <p>${index + 1}</p>
                        </div>
                        <div class="testresult">
                            <p> ${item.name}</p>
                        </div>
                        <div class="testnormal">
                            <p>${parseInt(item.price)?.toLocaleString()}<span class="note">&nbsp; IQD</span></p>
                        </div>
                    </div>
                    `).join('')}
                </div>
            `;
        },

        invoiceFooterComponent(visit, invoice) {
            return `
            <div class="footer">
                <div class="navtotal">
                    <!--مجموع السعر مع الخصومات والمتبقي --------------------------------------------------------------------->
                    <div class="namett" style="width: 86%;">
                        <p class="">Total</p>
                    </div>
                    <div class="namegot">
                        <p>${parseInt(visit.total_price)?.toLocaleString()}<span class="note">&nbsp; IQD</span></p>
                    </div>
                    <div class="paidt">
                        <p class="">Discount</p>
                    </div>
                    <div class="paidgot">
                        <p>${parseInt(visit.dicount)?.toLocaleString()}<span class="note">&nbsp; IQD</span></p>
                    </div>
                    <div class="vidt">
                        <p class="">Total Amount</p>
                    </div>
                    <div class="vidgot">
                        <p>${parseInt(visit.net_price)?.toLocaleString()}<span class="note">&nbsp; IQD</span></p>
                    </div>
                    <div class="prdt">
                        <p class="">Paid amount</p>
                    </div>
                    <div class="prdgot">
                        <p>0<span class="note">&nbsp; IQD</span></p>
                    </div>
                    <div class="prdt">
                        <p class="">Remaining amount</p>
                    </div>
                    <div class="prdgot">
                        <p>0<span class="note">&nbsp; IQD</span></p>
                    </div>
                </div>
                <div class="f2">
                    <!--عنوان او ملاحظات ---------------------------------------------------------------------------------------------------->
            
                    <p>${invoice.address}<span class="note">&nbsp;&nbsp;&nbsp;&nbsp;
                            ${invoice.facebook}</span>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;<span class="note">
                            ${invoice.phone_1}</span></p>
                </div>
            </div>
          `;
        },

        invoicePrintComponent() {
            return `
                <div class="row mt-15 justify-content-center">
                    <div class="col-3">
                        <button type="button" class="btn btn-outline-print w-100" onclick="printElement('.book-invoice', 'A3', 'css/invoice.css')">
                            <i class="mr-2 fal fa-print"></i>طباعة النتائج
                        </button>
                    </div>
                </div>
            `;
        }
    },

    utils: {
        __init__Barcode(id, hash) {
            JsBarcode(`#visit-${id}-code`, `${hash}`, {
                width: 1,
                height: 10,
                displayValue: false
            });
        },

        animate() {
            $("html, body").animate({
                scrollTop: $("#main-space").offset().top,
            },
                500
            );
        },

        setInvoiceStyle() {
            $('.sections').css('border-bottom', `2px solid ${invoices?.color}`);
            // change .center2-background background-image
            $('.center2-background').css('background-image', `url(${invoices?.logo})`);
            $('.namet').css('color', `${invoices?.color}`);
            $('.page .header').height(invoices?.header);
            $('.page .footer2').height(invoices?.footer - 5);
            $('.page .center2').height(invoices?.center - 15);
            $('.page .center').height(invoices?.center);
        }
    },

};

