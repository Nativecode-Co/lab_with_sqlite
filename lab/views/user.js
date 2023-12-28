'use strict';

// override Factory class
class User extends Factory {
    init() {
        this.createModal();
        this.dataTable = setServerTable(
            'system_users-table',
            `${base_url}User/getUsersByLab`,
            () => {
                return { 'lab_id': localStorage.getItem('lab_hash') }
            },
            [
                { data: 'username' },
                { data: 'user_type_name' },
                {
                    "data": null,
                    "className": "center",
                    "render": function (data, type, row) {
                        return `<a href="#" onclick="system_users.updateItem('${row.hash}')" class="text-success"><i class="far fa-edit fa-lg mx-2"></i></a>
                                <a href="#" onclick="fireSwalForDelete.call(system_users,system_users.deleteItem,'${row.hash}')" class="text-danger"><i class="far fa-trash fa-lg mx-2"></i></a>`
                    },

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
        this.dataTable.row.add({
            0: row.name,
            1: row.username,
            2: row.user_type_name,
            3: row.lab_name,
            4: `<a href="#" onclick="system_users.updateItem('${row.hash}')" class="text-success"><i class="far fa-edit fa-lg mx-2"></i></a>`,
            5: ``
        }).node().id = row.hash;
        this.dataTable.draw();
    }

    mainCondition() {
        return `where hash<>'${localStorage.hash}' and user_type<>'3'`
    }

    pageCondition() {
        return `select count(*) as count from ${this.table} ${this.mainCondition()};`;
    }

    getQuery(resetQuery) {
        return `SELECT hash,
                        name,
                        username,
                        password,
                        user_type,
        lab_id FROM ${this.table} ${resetQuery};`;
    }

    havingQuery(value) {
        return `having name like '%${value}%' or username like '%${value}%'`;
    }

    getNewData() {
        let data = super.getNewData();
        data.lab_id = localStorage.getItem('lab_hash');
        data.type2 = Math.floor(Math.random() * 900000) + 100000;
        return data;
    }

    newItem() {
        super.newItem();
        $('#user_type').val('111').trigger('change');
    }

    saveNewItem() {
        let data = this.getNewData();
        let response = run_both(`insert into ${this.table}(${Object.keys(data).join(',')}) values(${Object.values(data).map(item => `'${item}'`).join(',')});`).result;
        if (response?.query0?.code) {
            Swal.fire({
                icon: 'error',
                title: 'تحذير !',
                text: 'هذا المستخدم موجود مسبقاً',
                confirmButtonText: 'موافق'
            });
            return false;
        }
        //id, group_hash, user_hash, hash
        let userHash = response[0].query0;
        let allData = run_both(`insert into system_put_role_to_users(group_hash, user_hash) values('${data.user_type}', '${userHash}');`);
        let newObject = allData.result[0].query0[0];
        $(`#${this.modalId}`).modal('hide');
        this.dataTable.draw(false);
        return newObject;
    }

    saveUpdateItem(hash) {
        let data = this.getUpdateData();
        let group = run_both(`update ${this.table} set ${Object.entries(data).map(([key, value]) => `${key}='${value}'`).join(',')} ${this.itemQuery(hash)};select hash from system_put_role_to_users where user_hash='${hash}';`).result[1].query1[0];
        let groupQuery = group ? `update system_put_role_to_users set group_hash='${data.user_type}' ${this.itemQuery(group.hash)};` : `insert into system_put_role_to_users(group_hash, user_hash) values('${data.user_type}', '${hash}');`;
        let allData = run_both(groupQuery);
        $(`#${this.modalId}`).modal('hide');
        this.dataTable.draw(false);
    }

    deleteItem(hash) {
        run_both(`update system_users set is_deleted='1' where hash='${hash}'; delete from system_put_role_to_users where user_hash='${hash}';`);
        this.dataTable.draw(false);
    }
}

// init patient class

let system_users = new User('system_users', ' موظف', [
    { name: 'hash', type: null },
    { name: 'id', type: null },
    { name: 'username', type: 'text', label: 'اسم الموظف' },
    { name: 'password', type: 'password', label: 'كلمة المرور' },
    { name: 'user_type', type: 'select', label: 'الوظيفة', options: [{ text: "موظف مختبري (ادارة الزيارات والتحاليل)", hash: '111' }] }
]);

$(function () {
    $('.dt-buttons').addClass('btn-group');
    $('div.addCustomItem').html(`<span class="table-title">قائمة الموظفين</span><button onclick="system_users.newItem()" class="btn-main-add ml-4"><i class="far fa-users-md mr-2"></i> أضافة موظف</button>`);
});

// dom ready
$(function () {
    // user_type select first option
    $('#user_type').val('111').trigger('change');
});

const deleteLab = (hash) => {
    let query = '';
    query += `delete from system_users where lab_id='${hash}';`;
    query += `delete from lab_doctor where lab_id='${hash}';`;
    query += `delete from lab_invoice where lab_hash='${hash}';`;
    query += `delete from lab_invoice_worker where lab_hash='${hash}';`;
    let packages = run_both(`select hash from lab_package where lab_id='${hash}';`).result[0].query0;
    packages.forEach(item => {
        query += `delete from lab_pakage_tests where package_id='${item.hash}';`;
    });
    query += `delete from lab_package where lab_id='${hash}';`;
    query += `delete from lab_patient where lab_id='${hash}';`;
    let visits = run_both(`select hash from lab_visits where labId='${hash}';`).result[0].query0;
    visits.forEach(item => {
        query += `delete from lab_visit_tests where visit_id='${item.hash}';`;
        query += `delete from lab_visits_package where visit_id='${item.hash}';`
    });
    query += `delete from lab_visits where labId='${hash}';`;
    run_both(query);
};

