// This File required Jquery File
// This file like Factory Used to Build items only


// Create Button with custom classes and icons and fuction
function button(classes, icon_classes, onclick, hash = false, type) {
    if (hash) {
        onclick = onclick.replace("@", hash);
    }
    var button = jQuery("<a>", {
        class: classes,
        onclick: onclick,
        "data-toggle": "tooltip",
        "data-placement": "top",
        title: type

    });
    var icon = jQuery("<i>", {
        class: icon_classes
    })
    button.append(icon);
    return button
};

function checkobjectInArray(value, array) {
    for (var prep of array) {
        if (value == prep) {
            return true
        }
    };
    return false
};


//  Create Custom DAte Table easly
class CustomTable {
    query;
    header_titles;

    constructor(datebase_object) {
        this.datebase_object = datebase_object;
        this.setQuery();
        this.setHeaderTitles();

    }

    setQuery() {
        this.query = this.datebase_object.result.query;
    }

    getQueryLength() {
        return this.query.length;
    }

    setHeaderTitles() {
        this.header_titles = Object.keys(this.query[0]);
    }

    removeFields(fields) {
        for (var i in fields) {
            var hashIndex = this.header_titles.indexOf(fields[i]);
            this.header_titles.splice(hashIndex, 1);
        }
    }


    buildHeader(header_id, action = false, input = false, inputs = []) {
        var tr = $("<tr>");
        for (var i = 0; i < this.header_titles.length; i++) {
            tr.append($("<th>", {
                text: this.header_titles[i]
            }));
        }
        if (input) {
            for (var inp of inputs) {
                var th = $("<th>", {
                    text: inp
                });
                tr.append(th);
            }
        }
        if (action) {
            tr.append($("<th>", {
                class: "dt-no-sorting text-center"
            }));
        }
        tr.append($("<th>"));
        $("#" + header_id).append(tr);
    }
    buildBody(body_id, action = false, buttons, checks = [], input = false, inputs = [], update = 'update_record') {
        for (var item of this.query) {
            var tr = $("<tr>", {
                id: item["hash"]
            });
            for (var prop of this.header_titles) {
                if (checkobjectInArray(prop, checks)) {
                    if (item[prop] == "1") {
                        tr.append('<td><label class="switch s-icons s-outline s-outline-success mr-2"><input type="checkbox" name="' + prop + '" value="' + item[prop] + '" id="' + item["hash"] + '" onclick="change_state_checkbox(this); ' + update + '($(this));" checked><span class="slider round"></span></label></td>');
                    } else {
                        tr.append('<td><label class="switch s-icons s-outline s-outline-success mr-2"><input type="checkbox" name="' + prop + '" value="' + item[prop] + '" id="' + item["hash"] + '" onclick="change_state_checkbox(this);' + update + ' ($(this));"><span class="slider round"></span></label></td>');
                    }

                } else {
                    tr.append($("<td>", {
                        text: item[prop]
                    }));
                }

            }
            if (input) {
                for (var inp of inputs) {
                    var td = $("<td>");
                    if(inp[0] == 'select'){
                        let select = $("<select>", {
                            class: "form-control",
                            name: inp[1],
                            id: inp[1]
                        });
                        if(inp?.[2]){
                            for(let option of inp[2]){
                                select.append($('<option>',
                                {
                                    value:option.value,
                                    text:option.text
                                }
                                ))
                            }
                        }
                        td.append(select);
                    }else{
                        td.append($("<input>", {
                            class: "form-control",
                            type: inp[0],
                            name: inp[1],
                            id: inp[1]
                        }));
                    }
                    tr.append(td);
                }
                // <input type="text" id="row-2-age" class="form-control" name="row-2-age" value="63">
            }
            if (action) {
                var td = $("<td>", {
                    class: "text-center"
                });
                var ul = $("<ul>", {
                    class: "table-controls"
                })
                for (var btn of buttons) {
                    ul.append($("<li>").append(button(btn[0], btn[1], btn[2], item["hash"], btn[3])))
                }
                td.append(ul);
                tr.append(td);
            }
            tr.append("<td>");
            $("#" + body_id).append(tr);
        }
    }

};




function createSelect(select_name, table_name, id, field, empty = true) {
    if (empty) {
        $("select[name='" + select_name + "']").empty().trigger("change");
    }
    var type_obj = exce("select " + id + "," + field + " as text from " + table_name);
    for (var data of type_obj.result.query) {
        var newOption = new Option(data.text, data.hash, false, false);
        $("select[name='" + select_name + "']").append(newOption).trigger('change');
    }
};


const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}


function setTable() {
    $('#style-3').DataTable({
        responsive: {
            details: {
                type: 'column',
                target: -1
            }
        },
        columnDefs: [{
            className: 'dtr-control text-start',
            orderable: false,
            targets: -1
        }],
        "dom": "<'dt--top-section'<'row'<'col-12 col-sm-6 d-flex justify-content-sm-start justify-content-center'l><'col-12 col-sm-6 d-flex justify-content-sm-end justify-content-center mt-sm-0 mt-3'f>>>" +
            "<'table-responsive'tr>" +
            "<'dt--bottom-section d-sm-flex justify-content-sm-between text-center'<'dt--pages-count  mb-sm-0 mb-3'i><'dt--pagination'p>>",
        search: false,

        "oLanguage": {
            "oPaginate": {
                "sPrevious": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
                "sNext": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>'
            },
            "sInfo": "Showing page _PAGE_ of _PAGES_",
            "sSearch": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
            "sSearchPlaceholder": "بحث...",
            "sLengthMenu": "النتائج :  _MENU_",
        },
        "stripeClasses": [],
        "bLengthChange": false,
        "pageLength": 20
    });
}

function cacheData(options){
    let db = null;
    const request = indexedDB.open(options.table,1);
    //on upgrade needed
    request.onupgradeneeded = e => {
        db = e.target.result;

        // Create DB Table
        db.createObjectStore(options.table, {keyPath: options.hash});
        console.log(`upgrade is called database name: ${db.name} version : ${db.version}`);

    }
    //on success 
    request.onsuccess =  e => {
        db = e.target.result;
        const tx = db.transaction(options.table, "readwrite")
        tx.onerror = e => alert( ` Error! ${e.target.error}`)
        let _req = tx.objectStore(options.table);
        let req = _req.getAll()
        req.onsuccess = e => {
            if(e.target.result?.[0]){
                let data =  e.target.result;
                options.fun(data);
            }else{
                let data = run(options.query).result[0].query0;
                options.fun(data);
                for(let i of data){
                    _req.add(i);
                }
            }
        }
    }
    //on error
    request.onerror = e => {
        alert(`error: ${e.target.error} was found `)
            
    }
    
}

function fireSwal(fun, ...args){
    let condition = 1;
    Swal.fire({
        icon: "question",
        html: 'هل انت متاكد من هذة العملية ',
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: "نعم",
        cancelButtonText: "كلا",
        didClose: () => {
            if (condition) {
                Swal.close();
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
                        fun(...args);
                    },
                    didClose: () => {
                        if (condition) {
                            swal.fire({
                                toast: true,
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 3000,
                                padding: '2em',
                                icon: 'success',
                                title: 'تم اجراء العملية بنجاح',
                            });
                        }
                    }
                })
            }
        },
    }).then((result) => {
        if (result.isDismissed) {
            condition = 0;
        }
    });
}