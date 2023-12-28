// 'use strict';
let kits = null;
let devices_kits = null;
let lab_package = null;


Database_Open({
    table: 'kits',
    hash: 'hash',
    query: `select name as text,id as hash from kits;`,
}).then(result => {
    kits = result;
    kits = kits.map(item => {
        return { hash: item.id, text: item.name };
    })
    Database_Open({
        table: 'device_kit',
        hash: 'id',
        query: `select device_id,kit_id,id from device_kit;`,
    }).then(result => {
        devices_kits = result;
    }).then(x => {
        let result = run(`select (select name from devices where devices.id=devices_id) as text,devices_id as hash from lab_device where lab_id=${localStorage.getItem("lab_hash")};
                              select name as text,hash from lab_test_units;`);
        let devices = result.result[0].query0;
        let units = result.result[1].query1;
        lab_package = new PackageFactory('lab_package', 'فئة', [
            { name: 'hash', type: null },
            { name: 'name', type: null },
            { name: 'cost', type: 'text', label: 'التكلفة' },
            { name: 'price', type: 'text', label: 'السعر' },
            { name: 'category', type: null, label: 'الفئة' },
            { name: 'lab_device_id', type: 'select', label: 'DEVICE', options: devices, actions: [{ event: 'change', function: 'selectDeviceChange($(this))' }] },
            { name: 'kit_id', type: 'select', label: 'KIT', options: [] },
            { name: 'unit', type: 'select', label: 'وحدة القياس', options: units }
        ]);
    });
})

// override Factory class
class PackageFactory extends Factory {
    addRow(row) {
        this.dataTable.row.add({
            0: row.name,
            1: row.cost,
            2: row.price,
            3: row.category,
            4: `<a href="#" onclick="package.updateItem('${row.hash}')" class="text-success"><i class="far fa-edit fa-lg mx-2"></i></a>
                <a href="#" onclick="fireSwalForDelete.call(lab_package,lab_package.deleteItem, '${row.hash}')" class="text-danger"><i class="far fa-trash fa-lg mx-2"></i></a>`,
            5: ``
        }).node().id = row.hash;
        this.dataTable.draw();
    }

    getQuery(resetQuery) {
        return `select 
                    name,cost,price,(select name from lab_test_catigory where lab_test_catigory.id = lab_package.catigory_id) as category,hash
                        from lab_package 
                    where 
                        catigory_id <> 8 and lab_id=${localStorage.getItem("lab_hash")} ${resetQuery};`
    }

    updateItem(hash) {
        // open modal 
        $(`#${this.modalId}`).modal('show');
        // fill form with item
        let queryResult = run(this.getQuery(`and hash=${hash}`) + `select kit_id,lab_device_id,unit from lab_pakage_tests where package_id=${hash};`);
        fillForm(this.formId, this.fields, { ...queryResult.result[0].query0[0], ...queryResult.result[1].query1[0] });
        selectDeviceChange($('#lab_device_id'));
        let kit_id = queryResult.result[1].query1[0].kit_id;
        $('#kit_id').val(kit_id).trigger('change');
        // change modal title
        $(`#${this.modalId}`).find('.modal-title').text(`تعديل` + this.tableLabel);
        // change button text
        $(`#${this.table}-save`).text('تعديل');
        // change button onclick
        $(`#${this.table}-save`).attr('onclick', `fireSwal.call(${this.table},${this.table}.saveUpdateItem,'${hash}')`);
    }
    saveUpdateItem(hash) {
        let data = getFormData(this.formId, this.fields);
        let queryResult = run(`update lab_package set cost='${data.cost}', price='${data.price}' where hash=${hash};
                 update lab_pakage_tests set lab_device_id='${data.lab_device_id}',kit_id='${data.kit_id}', unit='${data.unit}' where package_id=${hash};`
            + this.getQuery(`and hash=${hash}`))
        let updateObject = { ...data, hash, ...queryResult.result[2].query2[0] };
        $(`#${this.modalId}`).modal('hide');
        this.dataTable.row(`#${hash}`).remove().draw();
        this.addRow(updateObject);
    }
}

function selectDeviceChange(ele) {
    let value = ele.val();
    let kitElement = $('#kit_id');
    let result = devices_kits.filter(item => item.device_id == value).map(item => item.kit_id);
    result = kits.filter(item => {
        return result.find(x => x == item.hash);
    });
    kitElement.empty();
    if (result.length == 0) {
        kitsOptions = `<option value="0">No Kits</option>`
    } else {
        kitsOptions = result.map(item => `<option value="${item.hash}">${item.text}</option>`).join('');
    }
    kitElement.append(kitsOptions);
}