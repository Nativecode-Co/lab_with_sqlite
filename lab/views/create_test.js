'usestrict';

const header = $("#user_header"),
    body = $("#user_body");

let devicesOptions = null,
    kitsOptions = null,
    devices_kits = null,
    kits = null,
    devices = null;

let queryResult = run(`select test_name as name,hash,option_test from lab_test;
                       select name,hash from lab_test_units;
                       select (select name from devices where devices.id=devices_id) as name,devices_id as id from lab_device where lab_id=${localStorage.getItem("lab_hash")};`),
    tests = queryResult.result[0].query0,
    units = queryResult.result[1].query1;
    devices = queryResult.result[2].query2;
    

Database_Open({
    table: 'kits',
    hash: 'id',
    query: `select name,id from kits;`,
}).then(result => {
    kits = result;
    Database_Open({
        table: 'device_kit',
        hash: 'id',
        query: `select device_id,kit_id,id from device_kit;`,
    }).then(result=>{
        devices_kits = result;
    }).then(fetchData);
})

function save_package(id) {
    let test_name = $("#" + id + " td").first().html(),
        cost = $("#" + id + " input[name=cost]").val(),
        price = $("#" + id + " input[name=price]").val(),
        note = $("#" + id + " input[name=note]").val(),
        device = $("#" + id + " select[name=device]").val(),
        kit = $("#" + id + " select[name=kit]").val(),
        unit = $("#" + id + " select[name=unit]").val();
    if (cost && price) {
        var package = exce(`insert into package(catigory_id,name,cost,price,lab_id) values(9,'${test_name}',${cost},${price},${localStorage.getItem("lab_hash")});`);
        var package = exce(`insert into pakage_tests(package_id,test_id,lab_device_id,kit_id,unit) values(${package.result[0].query0},'${id}','${device}','${kit}','${unit}');`);
        $(`#${id}`).remove();
        swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            padding: '2em',
            icon: 'success',
            title: 'تم اضافة التحليل بنجاح',
        });
    
    } else {
        swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            padding: '2em',
            icon: 'error',
            title: 'تاكد من ادخال كل البيانات',
        });
    }
    // exce("insert into package(catigory_id,name,cost,price,note) values(catigory_id,name,cost,price,note)");
}
// const fetchData = function(){
//     for(let test of tests){
//         body.append(
//             `
//             <tr>
//                 <td>${test.name}</td>
//                 <td><input class="form-control" type="number" name="cost" id="cost"></td>
//                 <td><input class="form-control" type="number" name="price" id="price"></td>
//                 <td><input class="form-control" type="text" name="note" id="note"></td>
//                 <td><select class="form-control" name="device" id="device"></select></td>
//                 <td><select class="form-control" name="kit" id="kit">${kitsOptions}</select></td>
//                 <td>
//                 <ul class="table-controls">
//                     <li>
//                         <a class="bs-tooltip" onclick="save_package('${test.hash}')" data-toggle="tooltip" data-placement="top" title="Save">
//                             <i class="fal fa-badge-check fa-lg mx-2"></i>
//                         </a>
//                     </li>
//                 </ul>
//                 </td>
//                 <td></td>
//             </tr>
//             `
//         )
//     }
//     setTable();
// }

function fetchData(order) {
    header.append(
        `
        <tr>
            <th>الاسم</th>
            <th>التكلفة</th>
            <th>السعر</th>
            <th>الجهاز</th>
            <th>kit</th>
            <th>وحدة القياس</th>
            <th></th>
            <th></th>
        </tr>
        `);
    Swal.fire({
        title: "الرجاء الانتظار",
        text: "يتم الان اجراء العملية",
        timer: 100,
        showDenyButton: false,
        showCancelButton: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        },
        willClose: () => {
            for (let [index, test] of tests.entries()) {
                let unitOption = units.filter(item=>{
                    return JSON.parse(test.option_test)?.component?.[0]?.reference?.find(x=> x.unit == item.hash);
                }).map(item => `<option value="${item.hash}">${item.name}</option>`).join('');
                body.append(
                    `
                    <tr id="${test.hash}">
                        <td style="width:19%;">${test.name}</td>
                        <td style="width:9%;"><input class="form-control" type="number" name="cost" id="cost"></td>
                        <td style="width:9%;"><input class="form-control" type="number" name="price" id="price"></td>
                        <td style="width:24%;"><select style="height:47px;" class="form-control border-dark" name="device" onmouseover="selectDevice($(this));" onchange="selectDeviceChange($(this));" id="device"><option value="0">Select devices</select></td>
                        <td style="width:24%;"><select style="height:47px;" class="form-control border-dark" name="kit" id="kit"><option value="0">Select Kit</select></td>
                        <td style="width:9%;"><select style="height:47px;" class="form-control border-dark" name="unit" id="unit">${unitOption}</td>
                        <td>
                        <ul class="table-controls">
                            <li>
                                <a class="bs-tooltip" onclick="save_package('${test.hash}')" data-toggle="tooltip" data-placement="top" title="Save">
                                    <i class="fal fa-badge-check fa-lg mx-2"></i>
                                </a>
                            </li>
                        </ul>
                        </td>
                        <td></td>
                    </tr>
                    `
                )
            }
            setTable();
        }
    })
}


function selectDevice(ele){
    if(ele.find("option").length <= 1 ){
        ele.select2()
        devicesOptions = devices.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
        ele.append(devicesOptions);
    }
}

function selectDeviceChange(ele){
    let value = ele.val();
    let kitElement = ele.parents('tr').find('#kit');
    let result = devices_kits.filter(item => item.device_id == value).map(item => item.kit_id);
    result = kits.filter(item => {
        return result.find(x => x == item.id);
    });
    kitElement.empty();
    if(result.length == 0){
        kitsOptions = `<option value="0">No Kits</option>`
    }else{
        kitsOptions = result.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
    }
    kitElement.append(kitsOptions);
    kitElement.select2();
}

function selectKit(ele){
    let value = ele.parents('tr').find('#device').val();
    let result = devices_kits.filter(item => item.device_id == value).map(item => item.kit_id);
    result = kits.filter(item => {
        return result.find(x => x == item.id);
    });
    ele.empty();
    if(result.length == 0){
        kitsOptions = `<option value="0">No Kits</option>`
    }else{
        kitsOptions = result.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
    }
    ele.append(kitsOptions);
}