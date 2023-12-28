

class PackageFactory extends Factory {
    addRow(row) {
        this.dataTable.row.add({
            0: row.name,
            1: row.cost,
            2: row.price,
            3: row.category,
            4: `<a href="#" onclick="window.location.href = 'create_package.html?hash=${row.hash}';" class="text-success"><i class="far fa-edit fa-lg mx-2"></i></a>
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
                        catigory_id = 8 and lab_id=${localStorage.getItem("lab_hash")} ${resetQuery};`
    }
}

let lab_package = new PackageFactory('lab_package', 'فئة', []);