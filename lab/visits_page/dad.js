
const changePatient = function (el) {
    $('#visits_patient_id-form').empty();
    if (!el.is(':checked')) {
        $('#visits_patient_id-form').append(`
            <label for="visits_patient_id">اسم المريض</label>
            <select class="form-control" id="visits_patient_id" onchange="getOldPatient(this.value)">
            <option value="0">اختر المريض</option>
            ${patients.map(patient => `<option value="${patient.hash}">${patient.name}</option>`).join('')}
            </select>
            <script>
                $('#visits_patient_id').select2({
                    width: '100%'
                });
            </script>`
        );
    } else {
        lab_visits.resetForm();
        $('#visits_patient_id-form').append(`
            <label for="visits_patient_id">اسم المريض</label>
            <input type="text" class="form-control" id="visits_patient_id" placeholder="اسم المريض">
            `
        );
    }
};

function toggleTest() {
    let test = $(this);
    let hash = test.attr('id').split('_')[2];
    let testInvoice = $(`#test_normal_${hash}`);
    let category = testInvoice.attr('data-cat');
    if (test.is(':checked')) {
        if ($(`.category_${category}:visible`).length == 0) {
            $(`.category_${category}`).first().show();
            // show 2th category
            $(`.category_${category}`).first().next().show();
        }
        testInvoice.show();
    } else {
        testInvoice.hide();
        if ($(`.category_${category}:visible`).length == 2) {
            $(`.category_${category}:visible`).hide();
        }
    }
}

const getAge = function (birth) {
    let ageInMilliseconds = new Date() - new Date(birth);
    let age = ageInMilliseconds / 1000 / 60 / 60 / 24 / 365;
    // get age in years
    let age_year = Math.floor(age);
    // get age in months
    let age_month = Math.floor((age - age_year) * 12);
    // get age in days
    let age_day = Math.floor((age - age_year - age_month / 12) * 365);
    return { year: age_year, month: age_month, day: age_day };

}

const getOldPatient = function (hash) {
    if (hash != 0) {
        let patient = lab_patient.getItem(hash);
        let { year, month, day } = getAge(patient.birth ?? TODAY);
        $('#age_year').val(year);
        $('#age_month').val(month);
        $('#age_day').val(day);
        $('#gender').val(patient.gender).trigger('change');
        $('#phone').val(patient.phone);
        $('#address').val(patient.address);
    }
}

function showPackagesList(hash) {
    let package = packages.find(package => package.hash == hash);
    $(this).popover({
        template: '<div class="popover popover-light" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
        title: `<p class="text-center">${package.name}</p>`,
        // show price and note
        html: true,
        content: `
            <div class="row">
                <div class="col-md-12">
                    <p class="text-left">السعر: ${package.price}</p>
                </div>
                <div class="col-md-12">
                    <p class="text-left">الملاحظات: ${package.note}</p>
                </div>
            </div>
        `,
        placement: 'top',
    }).popover('show');
}

function visitDetail(hash) {
    let show_visit_button = $('#show_visit_button');
    let invoice_button = $('#invoice_button');
    let show_add_result = $('#show_add_result');
    show_visit_button.attr('onclick', `showVisit('${hash}')`);
    invoice_button.attr('onclick', `showInvoice('${hash}')`);
    show_add_result.attr('onclick', `showAddResult('${hash}')`);
}

function showVisit(hash) {
    $('.action').removeClass('active');
    $('#show_visit_button').addClass('active');
    let visit = run(`SELECT name,age,visit_date,total_price, net_price, note,visits_patient_id,hash,
                            (select name from lab_doctor where hash=lab_visits.doctor_hash) as doctor 
                     FROM lab_visits WHERE hash = ${hash};`).result[0].query0[0];
    let patient = run(`SELECT * FROM lab_patient WHERE hash=${visit.visits_patient_id};`).result[0].query0[0];
    let workSpace = $('#work-sapce');
    workSpace.html('');
    let visitInfo = `
    <div class="col-lg-6 mt-4">
        <div class="statbox widget box box-shadow bg-white py-3">
            <div class="widget-content widget-content-area m-auto" style="width: 95%;">
            <div class="container">
            <div class="custom-card visit-info">
                <div class="custom-card-header hr">
                    <h4 class="title">تفاصيل الزيارة</h4>
                </div>
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
                                    <button class="btn btn-action d-print-none" onclick="printElement('#visit-code', 'A3', 'css/barcode.css')">طباعة</button>
                                </td>
                                <script>
                                    JsBarcode("#barcode", '${visit.hash}', {
                                        width:1.5,
                                        height:20,
                                        fontSize:20,
                                    });
                                </script>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="custom-card-footer d-print-none">
                    <div class="row justify-content-center align-items-center">
                        <button type="button" class="btn btn-outline-print" onclick="printElement('.visit-info', 'A3', 'css/new_style.css', 'css/barcode.css')"><i class="mr-2 fal fa-print"></i>طباعة</button>
                    </div>
                    <div class="row mt-3">
                        <button type="button" class="btn btn-add mr-3" onclick="lab_visits.updateItem('${visit.hash}')"><i class="far fa-edit mr-2"></i>تعديل بيانات الزيارة</button>
                        <!--<button type="button" class="btn btn-delete" onclick="fireSwalForDelete.call(lab_visits,lab_visits.deleteItem, '${visit.hash}')"><i class="far fa-trash-alt mr-2"></i>حذف بيانات المريض</button>-->
                    </div>
                </div>
            </div>
        </div>  
            </div>
        </div>
    </div>
    `;
    let PatientInfo = `
    <div class="col-lg-6 mt-4">
        <div class="statbox widget box box-shadow bg-white py-3">
            <div class="widget-content widget-content-area m-auto" style="width: 95%;">
            <div class="container">
            <div class="custom-card patient-info">
                <div class="custom-card-header hr">
                    <h4 class="title">بيانات المريض</h4>
                </div>
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
                <div class="custom-card-footer d-print-none">
                    <div class="row justify-content-center align-items-center">
                        <button type="button" class="btn btn-outline-print" onclick="printElement('.patient-info', 'A3', 'css/new_style.css')"><i class="mr-2 fal fa-print"></i>طباعة</button>
                    </div>
                </div>
            </div>
        </div>  
            </div>
        </div>
    </div>
    `;
    workSpace.append(visitInfo + PatientInfo);
    $("html, body").animate({
        scrollTop: $("#main-space").offset().top,
    }, 500);
}


function visitEdit(hash) {
    if ($(this).hasClass('active')) {
        return;
    }
    $('.detail-page').empty();
    $('.action-pan').removeClass('active');
    $(this).addClass('active');
    $('.page-form').append(visit_form);
    $('.detail-page').append(packagesList());
    let data = run(`select * from lab_visits where hash = '${hash}';
                    select * from lab_visits_package where visit_id = '${hash}';`);
    let visit = data.result[0].query0[0];
    let visit_packages = data.result[1].query1;

    // set visit details
    $('#visits_patient_id').val(visit.visits_patient_id).trigger('change');
    $('#visits_status_id').val(visit.visits_status_id).trigger('change');
    $('#visit_date').val(visit.visit_date);
    $('#doctor_hash').val(visit.doctor_hash).trigger('change');
    $('#note').val(visit.note);
    $('#total_price').val(visit.total_price);

    // set visit packages
    visit_packages.forEach((package) => {
        $(`#package_${package.package_id}`).prop('checked', true);
        $(`#package_${package.package_id}`).trigger('change');
    });

    // change button action
    $('#visit-save').attr('onclick', `if(lab_visits.validate()){fireSwal.call(lab_visits,lab_visits.saveUpdateItem, '${hash}');}`);
}

function convertAgeToDays(age, unit) {
    switch (unit) {
        case 'عام':
            return age * 365;
        case 'شهر':
            return age * 30;
        case 'يوم':
            return age;
    }
}

function filterWithKit(reference, kit) {
    return reference.filter((ref) => {
        if (kit == ref.kit) {
            return true;
        } else {
            return false;
        }
    });
}

function filterWithUnit(reference, unit) {
    return reference.filter((ref) => {
        if (unit == ref.unit) {
            return true;
        } else {
            return false;
        }
    });
}

function filterWithAge(reference, age, unit) {
    let days = convertAgeToDays(age, unit);
    return reference.filter((ref) => {
        let ageLow = convertAgeToDays(ref['age low'], ref['age unit low']);
        let ageHigh = convertAgeToDays(ref['age high'], ref['age unit high']);
        if (days >= ageLow && days <= ageHigh) {
            return true;
        } else {
            return false;
        }
    });
}

function filterWithGender(reference, gender) {
    return reference.filter((ref) => {
        if (gender == ref.gender) {
            return true;
        } else if (ref.gender == 'كلاهما') {
            return true;
        } else {
            return false;
        }
    });
}

function manageRange(reference) {
    return reference?.[0]?.range.map(range => {
        return `
                <div class="col-md-4 text-right"
                     onmouseover="showPopover.call(this,'name', '${range.name == '' ? 'range' : range.name}')" 
                     onmouseleave="$(this).popover('hide')">
                     ${range.name == '' ? 'range' : range.name} 
                </div> 
                <div class="col-md-8 text-right" 
                     onmouseleave="$(this).popover('hide')" 
                     onmouseover="showPopover.call(this,'range', '${range.low == '' ? 0 : range.low} - ${range.high == '' ? 100 : range.high}')">
                    : ${range.low == '' ? 0 : range.low} - ${range.high == '' ? 100 : range.high} 
                 </div>`;
    }).join('<br>') ?? `<div class="col-md-4 text-right">range</div> <div class="col-md-8 text-right ">No Range</div>`;
}

{/* 
<div class="col-md-4 mb-3">
    <label class="radio high mr-2">
        <span class="high-value">High</span>
        <input type="radio" id="color" name="color_${test.hash}" value="danger" ${(resultList?.[`color_${test.name}`])=='danger'?'checked':''}>
    </label>
    <label class="radio low mr-2">
        <span class="low-value">Low</span>
        <input type="radio" id="color" name="color_${test.hash}" value="info" ${(resultList?.[`color_${test.name}`])=='info'?'checked':''}>
    </label>
</div> 
*/}

function generateFieldForTest(test, resultList, reference) {
    return `
    <div class="col-md-11 results mb-15">
        <div class="row align-items-center">
            
            <div class="col-md-10">
                <h4 class="text-right mt-15">${test.name}</h4>
            </div>
            <div class="col-md-2 mb-3 text-center">
                <label class="d-inline switch s-icons s-outline s-outline-invoice-slider mr-2">
                    <input type="checkbox" id="check_normal_${test.hash}" name="check_normal_${test.hash}" checked onclick="toggleTest.call(this)">
                    <span class="slider invoice-slider"></span>
                </label>
            </div>
            <div class="col-md-6 mb-3">
                <label for="result" class="w-100 text-center">النتيجة</label>
                <div class="row">
                    <div class="col-md-4 text-center">
                        <span class="">${test.unit_name}</span>
                    </div>
                    <div class="col-md-8">
                        <input type="number" class="form-control result text-center" id="result_${test.hash}" name="${test.name}" placeholder="ادخل النتيجة" value="${resultList?.[test.name]}">
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-3 text-center" dir="ltr">
                <label for="range">المرجع</label>
                <h5 class="text-center"><div class="row w-100">${manageRange(reference)}</div></h5>
            </div>
        </div>
    </div>
`
}

function focusInput(type) {
    let list = $('.result');
    let index = list.index($('.result:focus'));
    if (type == "add") {
        index = (index + 1) % list.length;
    } else {
        index = (index - 1) % list.length;
    }
    list.eq(index).focus();
}


function changeTotalPrice() {
    let totalPrice = parseInt($('#total_price').val());
    if ($(this).is(':checked')) {
        totalPrice += parseInt($(this).data('price'));
    } else {
        totalPrice -= parseInt($(this).data('price'));
    }
    let discount = parseInt($('#dicount').val()) || 0;
    $('#total_price').val(totalPrice);
    let netPrice = totalPrice - discount;
    if (netPrice < 0) {
        netPrice = 0;
    }
    $('#net_price').val(netPrice);

}

function netPriceChange() {
    let total_price = parseFloat($('#total_price').val());
    let discount = parseFloat($('#dicount').val()) || 0;
    let net_price = total_price - discount;
    if (net_price < 0) {
        net_price = 0;
    }
    $('#net_price').val(net_price);
}

function createInvoice(visit, type, form) {
    return `<div class="book-result" dir="ltr" id="invoice-${type}" style="display: none;">
		<div class="page">
			<!-- صفحة يمكنك تكرارها -->
			<div class="header">
				<div class="row">
					<div class="left col-4">
						<!-- عنوان جانب الايسر -->
						<div class="size1">
							<p class="title">${workers?.[1]?.jop ?? 'Jop title'}</p>
							<p class="namet">${workers?.[1]?.name ?? 'Worker name'}</p>
							<p class="certificate">${workers?.[1]?.jop_en ?? 'Jop En title'}</p>
						</div>

						<div class="size2">

						</div>
					</div>

					<div class="logo col-4 p-2">
						<!-- شعار التحليل -->
						<img src="${invoices?.logo ?? ''}" alt="${invoices?.logo ?? 'upload Logo'}">
					</div>
					<div class="right col-4">
						<!-- عنوان جانب الايمن -->
						<div class="size1">
                        <p class="title">${workers?.[0]?.jop ?? 'Jop title'}</p>
                        <p class="namet">${workers?.[0]?.name ?? 'Worker name'}</p>
                        <p class="certificate">${workers?.[0]?.jop_en ?? 'Jop En title'}</p>
						</div>

						<div class="size2">

						</div>
					</div>
				</div>
			</div>
			<div class="center2">
                <div class="center2-background"></div>
				<div class="nav">
					<!-- شريط تخصص التحليل -->
					<div class="name">
						<p class="">Name</p>
					</div>
					<div class="namego">
						<p>${visit.age > 16 ? (visit.gender == 'ذكر' ? 'السيد' : 'السيدة') : (visit.gender == 'ذكر' ? 'الطفل' : 'الطفلة')} / ${visit.name}</p>
					</div>
					<div class="paid">
						<p class="">Barcode</p>
					</div>
					<div class="paidgo d-flex justify-content-center align-items-center">
						<svg id="visit-${type}-code"></svg>
					</div>
                    <script>
                        JsBarcode("#visit-${type}-code", '${visit.hash}', {
                            width:1,
                            height:10,
                            displayValue: false
                        });
                    </script>
					<div class="agesex">
						<p class="">Sex / Age</p>
					</div>
					<div class="agesexgo">
						<p><span class="note">${visit.gender == 'ذكر' ? 'Male' : 'Female'}</span> / <span class="note">${visit.age}</span></p>
					</div>
					<div class="vid">
						<p class="">Date</p>
					</div>
					<div class="vidgo">
						<p><span class="note">${visit.date}</span>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;<span
								class="note">${visit.time}</span></p>
					</div>
					<div class="refby">
						<p class="">By</p>
					</div>
					<div class="refbygo">
						<p>${localStorage.name}</p>
					</div>
					<div class="prd">
						<p class="">Doctor</p>
					</div>
					<div class="prdgo">
						<p><span class="note">${visit.doctor ?? ''}</span></p>
					</div>
				</div>

				<div class="tester">
					<!-- دف الخاص بالتحليل الدي سيكرر حسب نوع التحليل ------------------>


					${form}


				</div>


			</div>

			<div class="footer2">
				<div class="f1">
					<p>${invoices.address}</p>
				</div>
				<div class="f2">
					<p><span class="note">
							${invoices.facebook}</span>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;<span
							class="note"> ${invoices.phone_1}</span></p>
				</div>
			</div>
		</div>


	</div>`
}


function getCurrentInvoice(ele) {
    // get id
    let id = ele.attr('id').split('-')[1];
    // get invoice
    let invoice = $(`#invoice-${id}`);
    // hide all invoices
    $('.book-result').hide();
    // show current invoice
    invoice.show();
    // change active button
    $('#invoice-tests-buttons .btn').removeClass('active');
    $(`#test-${id}`).addClass('active');
    $('#print-invoice-result').attr('onclick', `printElement('#invoice-${id}', 'A4', 'css/invoice.css')`);
    cloneOldInvoice(manageInvoiceHeight());
}

{/* <div class="row justify-content-center m-auto mb-30" id="invoice-tests-buttons">

</div> */}

function setInvoiceStyle() {
    $('.sections').css('border-bottom', `2px solid ${invoices?.color}`);
    // change .center2-background background-image
    $('.center2-background').css('background-image', `url(${invoices?.logo})`);
    $('.namet').css('color', `${invoices?.color}`);
    $('.page .header').height(invoices?.header);
    $('.page .footer2').height(invoices?.footer - 5);
    $('.page .center2').height(invoices?.center - 15);
    $('.page .center').height(invoices?.center);
}

function manageInvoiceHeight() {
    //.book-result:visible .center2
    // when .center2 scroll < (.center2 .test) scroll then filter that test
    let center2 = $('.book-result:visible .center2:last');
    let tests = $('.book-result:visible .center2:last .test');
    let center2Scroll = center2.height();
    let testsHeight = tests.map((i, test) => {
        return $(test).offset().top - center2.offset().top;
    }).get();
    tests = tests.filter((i, test) => {
        return (testsHeight[i] + 100) >= center2Scroll;
    });
    // add tests to new invoice and remove them from old invoice
    let newInvoice = '';
    tests = tests.each((i, test) => {
        newInvoice += $(test).prop('outerHTML');
        $(test).remove();
    });
    // check if last test or test before last have class typetest
    let lastTest = $('.book-result:visible .center2:last .test:last');
    let testBeforeLast = lastTest.prev();
    if (lastTest.hasClass('typetest')) {
        newInvoice = lastTest.prop('outerHTML') + newInvoice;
        lastTest.remove();
    } else if (testBeforeLast.hasClass('typetest')) {
        newInvoice = testBeforeLast.prop('outerHTML') + lastTest.prop('outerHTML') + newInvoice;
        testBeforeLast.remove();
        lastTest.remove();
    }
    return newInvoice;
}

function cloneOldInvoice(newInvoiceBody) {
    if (newInvoiceBody != '') {
        let oldInvoice = $('.book-result:visible .page');
        let newInvoice = oldInvoice.clone();
        newInvoice.find('.tester').html(newInvoiceBody);
        $('.book-result:visible').append(newInvoice);
    }
}

