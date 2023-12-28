'use strict';

// override Factory class
class Worker extends Factory {

    init() {
        this.createModal();
        this.dataTable = setServerTable(
            'lab_invoice_worker-table',
            `${base_url}Worker/getWorkers`,
            () => {
                return { 'lab_id': localStorage.getItem('lab_hash') }
            },
            [
                {
                    "data": 'name',
                },
                {
                    "data": 'jop',
                },
                {
                    data: 'null',
                    render: function (data, type, row) {
                        return row.is_available == 1 ? 'متاح' : 'غير متاح';
                    }
                },
                {
                    "data": null,
                    "className": "center not-print",
                    "render": function (data, type, row) {
                        return `
                        <a class="btn-action" onclick="lab_invoice_worker.updateItem('${row.hash}')"><i class="fas fa-edit"></i></a>
                        <a class="btn-action delete" onclick="fireSwalForDelete.call(lab_invoice_worker,lab_invoice_worker.deleteItem, '${row.hash}')"><i class="far fa-trash-alt"></i></a>`
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
                1: row.jop,
                2: row.is_available == 1 ? 'متاح' : 'غير متاح',
                3: `
                    <a class="btn-action" onclick="lab_invoice_worker.updateItem('${row.hash}')"><i class="fas fa-edit"></i></a>
                    <a class="btn-action delete" onclick="fireSwalForDelete.call(lab_invoice_worker,lab_invoice_worker.deleteItem, '${row.hash}')"><i class="far fa-trash-alt"></i></a>`,
                4: ``
            }).node().id = row.hash;
            this.dataTable.draw();
        }
    }

    getNewData() {
        let data = super.getNewData();
        data = { ...data, lab_hash: localStorage.getItem('lab_hash') };
        return data;
    }

    mainCondition() {
        return `where lab_hash = '${localStorage.getItem('lab_hash')}'`;
    }

    pageCondition() {
        return `
        select 
            count(*) as count from ${this.table}
        where 
            lab_hash=${localStorage.getItem('lab_hash')}`;
    }

    havingQuery(value) {
        return `having name like '%${value}%'`;
    }

}

// init patient class

let lab_invoice_worker = new Worker('lab_invoice_worker', ' اجازة', [
    { name: 'hash', type: null },
    { name: 'name', type: 'text', label: 'الاسم', req: 'required' },
    { name: 'jop', type: 'text', label: 'التخصص بالعربي', req: 'required' },
    { name: 'jop_en', type: 'text', label: 'التخصص بالانجليزية', req: 'required' },
    { name: 'is_available', type: 'checkbox', label: 'الظهور على الفورمة', req: '' },
]);

$(function () {
    $('.dt-buttons').addClass('btn-group');
    $('div.addCustomItem').html(`<span class="table-title">قائمة الاجازات</span><button onclick="lab_invoice_worker.newItem()" class="btn-main-add ml-4"><i class="far fa-user-md mr-2"></i> أضافة اجازة</button>`);
});
