'use strict';

let allData = run_both(`select name as text, hash from lab_doctor_partment;`)
let partments = allData.result[0].query0;
// override Factory class
class Doctor extends Factory {

    init() {
        this.createModal();
        this.dataTable = setServerTable(
            'lab_doctor-table',
            `${base_url}Doctor/getDoctorForLab`,
            () => {
                return { 'lab_id': localStorage.getItem('lab_hash') }
            },
            [
                { data: 'name' },
                { data: 'commission' },
                { data: 'jop' },
                { data: 'phone' },
                {
                    "data": null,
                    "className": "center not-print",
                    "render": function (data, type, row) {
                        return `
                        <a class="btn-action" onclick="lab_doctor.updateItem('${row.hash}')"><i class="fas fa-edit"></i></a>
                    <a class="btn-action delete" onclick="fireSwalForDelete.call(lab_doctor,lab_doctor.deleteItem, '${row.hash}')"><i class="far fa-trash-alt"></i></a>
                        `
                    }
                },
                {
                    "data": null,
                    "className": "text-success center",
                    "defaultContent": '<i class="fas fa-plus"></i>'

                }
            ]
        );
    }
    addRow(row) {
        if (this.dataTable.row(`#${row.hash}`)[0].length == 0) {
            this.dataTable.row.add({
                0: row.name,
                1: row.commission,
                2: row.jop,
                3: row.phone,
                4: `
                    <a class="btn-action" onclick="lab_doctor.updateItem('${row.hash}')"><i class="fas fa-edit"></i></a>
                    <a class="btn-action delete" onclick="fireSwalForDelete.call(lab_doctor,lab_doctor.deleteItem, '${row.hash}')"><i class="far fa-trash-alt"></i></a>`,
                5: ``
            }).node().id = row.hash;
            this.dataTable.draw();
        }
    }

    getNewData() {
        let data = super.getNewData();
        data = { ...data, lab_id: localStorage.getItem('lab_hash') };
        return data;
    }

    newItem() {
        super.newItem();
        $('#commission').val(0);
    }

    mainCondition() {
        return `where lab_id = '${localStorage.getItem('lab_hash')}' and ${this.table}.isdeleted='0'`;
    }

    havingQuery(value) {
        return `having name like '%${value}%'`;
    }
}

// init patient class

let lab_doctor = new Doctor('lab_doctor', ' طبيب', [
    { name: 'hash', type: null },
    { name: 'name', type: 'text', label: 'الاسم', req: 'required' },
    { name: 'partmen_hash', type: 'select', label: 'التخصص', req: 'required', options: partments },
    { name: 'commission', type: 'number', label: 'نسبة الطبيب %', req: 'required' },
    // { name: 'jop', type: 'text', label: 'التخصص', req: 'required' },
    { name: 'phone', type: 'text', label: 'رقم الهاتف', req: 'required' },
]);

$(function () {
    $('.dt-buttons').addClass('btn-group');
    $('div.addCustomItem').html(`<span class="table-title">قائمة الاطباء</span><button onclick="lab_doctor.newItem()" class="btn-main-add ml-4"><i class="far fa-user-md mr-2"></i> أضافة طبيب</button>`);
});
