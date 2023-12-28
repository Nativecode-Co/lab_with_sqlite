'use strict';

// override Factory class
class Patient extends Factory {

    init() {
        this.createModal();
        this.dataTable = setServerTable(
            'lab_patient-table',
            `${base_url}Patient/getPatientForLab`,
            () => {
                return { 'lab_id': localStorage.getItem('lab_hash') }
            },
            [
                {
                    "data": null,
                    "className": "center",
                    "render": function (data, type, row) {
                        return `<span onclick="location.href='patient_history.html?patient=${row.hash}'">${row.name}</span>`
                    }
                },
                { data: 'phone' },
                {
                    "data": null,
                    "className": "center not-print",
                    "render": function (data, type, row) {
                        return `
                        <a class="btn-action" title="تفاصيل المريض" onclick="location.href='patient_history.html?patient=${row.hash}'"><i class="far fa-eye"></i></a>
                    <a class="btn-action" title="تعديل بيانات المريض" onclick="lab_patient.updateItem('${row.hash}')"><i class="fas fa-edit"></i></a>
                    <a class="btn-action delete" title="حذف المريض" onclick="fireSwalForDelete.call(lab_patient,lab_patient.deleteItem, '${row.hash}')"><i class="far fa-trash-alt"></i></a>
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
                0: `<span onclick="location.href='patient_history.html?patient=${row.hash}'">${row.name}</span>`,
                1: row.phone,
                2: `
                    <a class="btn-action" title="تفاصيل المريض" onclick="location.href='patient_history.html?patient=${row.hash}'"><i class="far fa-external-link"></i></a>
                    <a class="btn-action" title="تعديل بيانات المريض" onclick="lab_patient.updateItem('${row.hash}')"><i class="fas fa-edit"></i></a>
                    <a class="btn-action delete" title="حذف المريض" onclick="fireSwalForDelete.call(lab_patient,lab_patient.deleteItem, '${row.hash}')"><i class="far fa-trash-alt"></i></a>
                    `,
                3: '',
            }).node().id = row.hash;
            this.dataTable.draw();
        }
    }

    saveNewItem() {
        let phone = run(`select phone from lab_patient where phone = '${$('#phone').val()}' and isdeleted = 0;`)?.result[0]?.query0[0]?.phone;
        if (phone) {
            Swal.fire({
                title: 'تنبيه',
                text: 'هذا الرقم تابع لمريض مسجل بالفعل',
                icon: 'warning',
                confirmButtonText: 'موافق'
            });
            return false;
        }
        super.saveNewItem();
    }

    getNewData() {
        let data = super.getNewData();
        data = { ...data, lab_id: localStorage.getItem('lab_hash') };
        return data;
    }

    mainCondition() {
        return `where lab_id = '${localStorage.getItem('lab_hash')}' and ${this.table}.isdeleted='0'`;
    }

    havingQuery(value) {
        return `having name like '%${value}%'`;
    }
}

// init lab_patient class

let lab_patient = new Patient('lab_patient', ' مريض', [
    { name: 'hash', type: null },
    { name: 'birth', type: null },
    { name: 'name', type: 'text', label: 'الاسم', req: 'required' },
    { name: 'gender', type: 'select', label: 'الجنس', options: [{ hash: 'ذكر', text: 'ذكر' }, { hash: 'أنثى', text: 'أنثى' }], req: 'required' },
    { name: 'birth', type: 'date', label: 'تاريخ الميلاد', req: 'required' },
    { name: 'address', type: 'text', label: 'العنوان', req: '' },
    { name: 'phone', type: 'text', label: 'رقم الهاتف', req: 'required' },
]);

// dom ready
$(function () {
    $('.dt-buttons').addClass('btn-group');
    $('div.addCustomItem').html(`<span class="table-title">قائمة المرضى</span><button onclick="lab_patient.newItem()" class="btn-main-add ml-4"><i class="far fa-user-injured mr-2"></i> أضافة مريض</button>`);
});
