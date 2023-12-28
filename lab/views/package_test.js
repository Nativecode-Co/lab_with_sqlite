'use strict';

let allData = run_both(`select (select name from devices where devices.id=devices_id) as name,devices_id as id from lab_device where lab_id=${localStorage.lab_hash};
                   select name,hash from lab_test_units;`)
let labDevices = allData.result[0].query0;

let labDevicesOptions = labDevices.map((device) => {
    return `<option value="${device.id}">${device.name}</option>`;
}).join('');

let units = allData.result[1].query1;

let unitsOptions = units.map((unit) => {
    return `<option value="${unit.hash}">${unit.name}</option>`;
}).join('');

// dom ready
$(document).ready(function () {
    // select 2
    $('#addTest #lab_device_id').append(labDevicesOptions);
    $('#addTest #lab_device_id').select2({
        width: '100%'
    });
    $('#addTest #kit_id').select2({
        width: '100%'
    });
    $('#addTest #unit').append(unitsOptions);
    $('#addTest #unit').select2({
        width: '100%'
    });

    $('#row-packages .form-check-input').on('click', function () {

    });

    // make tests list height equal to tests-form height
    $('#tests').css('height', $('#tests-form').css('height'));

    $('#search_test input').on('keyup change', function () {
        let rex = new RegExp($(this).val(), 'i');
        $('#row-tests .n-chk.col-auto').hide();
        let testsLength = $('#row-tests .n-chk.col-auto').filter(function () {
            return rex.test($(this).text());
        }).show().length;
        $('.test-col-header').each(function () {
            if ($(this).next().children('.n-chk.col-auto:visible').length == 0) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
        let dataBaseLabs = run_both(allTests.searchQuery($(this).val())).result[0].query0;
        allTests.createTableBody(dataBaseLabs);
    });

    $('#search_package input').on('keyup change', function () {
        let rex = new RegExp($(this).val(), 'i');
        $('#row-packages .n-chk.col-auto').hide();
        let testsLength = $('#row-packages .n-chk.col-auto').filter(function () {
            return rex.test($(this).text());
        }).show().length;
        $('.test-col-header').each(function () {
            if ($(this).next().children('.n-chk.col-auto:visible').length == 0) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
        if (testsLength == 0) {
            let dataBaseLabs = run_both(allPAckages.searchQuery($(this).val())).result[0].query0;
            allPAckages.createTableBody(dataBaseLabs);
        }
    });
    $('.buttons .btn-action.action').on('click', function () {
        // remove active class from all buttons
        $('.btn-action').removeClass('active');
        $(this).addClass('active');
        $('.page').hide();
        $(`#${$(this).attr('data-id')}`).show();
        // change save button 
        $('#addTest #save-button').attr('onclick', `fireSwal(saveNewTest)`);
        $('#addPackage #save-package').attr('onclick', `fireSwal(saveNewPackage)`);
        // change save button text
        $('#addTest #save-button').text('اضافة');
        $('#addPackage #save-package').text('اضافة');
        // empty form
        emptyTestForm();
        emptyPackageTests();
    });
    // cost or price out of focus 

});

const updatePackageDetail = async (hash) => {
    const cost = $(`#${hash}_cost`).val();
    const price = $(`#${hash}_price`).val();
    let formData = new FormData();
    formData.append('hash', hash);
    formData.append('cost', cost);
    formData.append('price', price);
    await fetch(`${base_url}Packages/updateCostAndPrice`, {
        method: 'POST',
        body: formData,
        headers: {
            Authorization: `Bearer ${localStorage.token}`
        }
    }).then((res) => { });
    await fetch(`http://umc.native-code-iq.com/app/index.php/Packages/updateCostAndPrice`, {
        method: 'POST',
        body: formData,
        headers: {
            Authorization: `Bearer ${localStorage.token}`
        }
    }).then((res) => { });
};


