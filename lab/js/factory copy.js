'use strict';


function getMonth(month){
    month = Number(month) +1;
    if(month <10){
        month = '0' + month;
    }
    return month
}

const NOW = new Date();
const TODAY = NOW.getFullYear()+'-'+getMonth(NOW.getMonth())+'-'+NOW.getDate();

function uploadFiles(files) {
    let form_data = new FormData();
    for(let file of files){
        form_data.append("files[]", file);
    }
    return upload(form_data);
};

function uploadFile(file) {
    let form_data = new FormData();
    form_data.append("files[]", file);  
    return upload(form_data)
};

const fontSizeArr = ['8px','9px','10px','12px','14px','16px','20px','24px','32px','42px','54px','68px','84px','98px'];

let myToolbar= [
    ['bold', 'italic', 'underline', 'strike'],       
    ['blockquote', 'code-block'],
    [{ 'size': [] }],

    [{ 'color': [] }, { 'background': [] }],         
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean'],                                        
    ['image'], //add image here
    [{ 'direction': 'rtl' }]
];

class CustomQuill{
    constructor(id){
        return new Quill(`#editor_${id}`, {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: myToolbar,
                    handlers: {
                        image: imageHandler
                    }
                },
                imageResize: {
                    displaySize: true
                }
            },
        });
    }
}

function imageHandler(){
    let range = this.quill.getSelection();
    const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.click();

      // Listen upload local image and save to server
      input.onchange = () => {
        const file = input.files[0];

        // file type is only image.
        if (/^image\//.test(file.type)) {
            let value = uploadFile(file).result[0];
            if(value){
                this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
            }
        } else {
          console.warn('You could only upload images.');
        }
      };
}


// Get key of Object by value 
const getKeyByValue = function(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function checkobjectInArray(value, array) {
    for (var prep of array) {
        if (value == prep) {
            return true
        }
    };
    return false
};

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

/*
    Change Value of Boolean
    - Args 
        1- element => checkbox HTML element
        2- table => table name
        3- hash => row hash  
*/
const saveCheck = function (element,table,hash){
    (Number(element.val()))?element.val(0):element.val(1);
    run(`update ${table} set ${element.attr('name')}='${element.attr('value')}' where ${hash}='${element.attr('id')}';`);
}


/* 
    Create HTML input element
    - Args 
        1- type => input type
        2- name => input name
        3- label => // label value
*/
const buildInput = function(name,options,label){
    let __label = options.type == "hidden"?"":`<label for="${name}">${label}</label>`
    return `<div class="col-md-${options.size??4} mb-4">
                ${__label}
                <input type="${options.type}" name="${name}" class="form-control" id="${name}" placeholder="ادخل ${label}" ${options.required}>
            </div>`
}
/* 
    Create HTML select element
    - Args 
        1- name => input name
        2- label => // label value
*/
const buildSelect = function(name,options,label){
    return `<div class="col-md-${options.size??4} mb-4">
                <label style="float:right;" for="" class="form-label ">${label} </label>
                <select name="${name}" id="${name}" class="form-control form-select" ${options.required}>
                </select>
            </div>`
}

const buildTextarea = function(name,options,label){
    return `<label for="${name}" class="w-100">${label}</label><div id="editor_${name}" class="col-md-${options.size??4} mb-4"></div>
            <input type="hidden" id="${name}">`
    // return `<div class="col-md-${options.size??4} mb-4">
    //             <label for="${name}">${label}</label>
    //             <textarea  class="form-control" name="${name}" id="${name}" rows="3" ${options.required}></textarea>
    //         </div>`
}

const buildFileInput = function(name,options,label){
    return `<div class="col-md-${options.size??4} mb-4">
                <div class="custom-file-container" data-upload-id="${name}">
                    <label>${label} <a href="javascript:void(0)" class="custom-file-container__image-clear" title="حذف الملف">x</a></label>
                    <label class="custom-file-container__custom-file" >
                        <input type="file" class="custom-file-container__custom-file__custom-file-input" accept="${options.fileType}/*" ${options.required}>
                        <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                        <span class="custom-file-container__custom-file__custom-file-control"></span>
                    </label>
                    <div class="custom-file-container__image-preview"></div>
                </div>
                ${options.scoundLabel?`<label>${options.scoundLabel}</label>`:''}
                <input dir="ltr" type="${options?.inputtype??'hidden'}" class="form-control" name="${name}" id="${name}"/>
            </div>`
}

const setTable = function(id='table'){
    $(`#${id}`).DataTable({
        responsive: true,
        responsive: {
            details: {
                type: 'column',
                target: -1
            }
        },
        columnDefs: [{
            className: 'dtr-control text-center',
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
        "pageLength": 200,
        // stop ordering at the first column
        "order": [],
    });
}

function reset_form(form_id) {
    let column = {};
    $("#" + form_id).find("input, textarea, select").each(function() {
        let inputType = this.tagName.toUpperCase() === "INPUT" && this.type.toUpperCase();
        if (inputType !== "BUTTON" && inputType !== "SUBMIT") {
            $("textarea[name='" + this.name + "']").val(null);
            if (!(this.id.includes("noclear")))
                $("input[name='" + this.name + "']").val(null);
            $("select[name='" + this.name + "']").val(null).trigger("change");
            try {
                $('#summernote').summernote('reset');
            } catch (error) {}
        }
    });
}


/* 
    Create DataTable to show Data
        - load data
        - create table header
        - create table body 
            {
                table : [str, required, DB Table],
                fields :[object, required, DB fields],
                headerId: [str, required, Table Header Id],
                bodyId: [str, required, Table Body Id]
                styleFields: [object, options, field type],
                    {name: type[badge, check, defulet]}
                deleteFields:[array, options, fields to delete from table only],
                modal : [object, options, modal to create and edit row],
                    {id,size}
                modelForm: [object, requered if modal defined only],
                    {name:{type, required}}
                dataTable
                buildBadge
                buildCheck
                buildButtons
                buildHeader
                buildBody
            }
*/
const buildTable = function(options){
    // Main Varibles
    var {
        table, fields, condetion,
        headerId, bodyId,
        styleFields, deleteFields,
        modal, modelForm,
        hash,
    } = options;

    // Main Functions
    let {
        buildBadge, buildCheck, buildButtons,
        fetchData, buildHeader, buildBody,
        editItem, deleteItem, newItem, saveItem,
        preSave, afterEdit
    } = options;



    // Catsh Required options undefined

    // table name required
    if (!table) {
        throw new Error("You forget defiend table")
    };

    // fields required
    if (!fields) {
        throw new Error("You forget defiend fields")
    };

    // table headerId required
    if (!headerId) {
        throw new Error("You forget defiend headerId")
    };

    // table bodyId required
    if (!bodyId) {
        throw new Error("You forget defiend bodyId")
    };

    // if Build header must defined BuildBody
    if(buildHeader){
        if(!buildBody) {
            throw new Error("You defiend buildHeader fun without buildBody fun")
        };
    }

    // if Build modal must defined modelForm
    if(modal){
        if(!modelForm) {
            throw new Error("You defiend model without modelForm fun")
        };
    }

    // coustom fields We will use 
    let query = '',
        data,
        headerFields,
        editFields = '',
        headerHtml ='',
        bodyHtml ='';
    hash = hash??'hash';

    // Html Elements 
    const header = document.getElementById(headerId),
          body = document.getElementById(bodyId);

    
    buildBadge = buildBadge?? function(value){
        return `<span class="badge badge-dark"> ${value} </span>`;
    }

    buildCheck = buildCheck?? function(arname,rowhash,value){
        let name = getKeyByValue(fields,`${arname}`);
        if(value == 1){
            return `<label class="switch s-icons s-outline s-outline-success mr-2">
                <input type="checkbox" name="${name}" value="${value}" id="${rowhash}" onclick="saveCheck($(this),'${table}','${hash}')" checked>
                <span class="slider round"></span>
            </label>`
        }else{
            return `<label class="switch s-icons s-outline s-outline-success mr-2">
                <input type="checkbox" name="${name}" value="${value}" id="${rowhash}" onclick="saveCheck($(this),'${table}','${hash}')">
                <span class="slider round"></span>
            </label>`
        }
    }

    buildButtons = buildButtons??function(tablename,item,item_hash,hashrow,editfields,modalid){
        return `<ul class="table-controls">
            <li>
                <a class="bs-tooltip" onclick="editItem('${item_hash}','${hashrow}','${tablename}','${editfields}','${modalid??null}');" data-toggle="tooltip" data-placement="top" title="تعديل">
                    <i class="far fa-edit fa-lg mx-2"></i>
                </a>
            </li>
            <li>
                <a class="bs-tooltip" onclick="deleteItem('${item_hash}','${hashrow}','${table}');" data-toggle="tooltip" data-placement="top" title="الغاء">
                    <i class="far fa-trash fa-lg mx-2"></i>
                </a>
            </li>
        </ul>`
    }
    // get data from DB
    fetchData = fetchData?? function(tableFields=fields, table=table){
        query = '';
        tableFields = Object.entries(Object.entries(tableFields));
        for(let [index, [key,value]] of tableFields){
            query += `${key} as '${value}',`;
        }
        query = `select ${query.slice(0,-1)} from ${table} ${condetion??''};`;
        return run(query).result[0].query0;
    }
    data = fetchData(fields,table);
    editFields = Object.keys(modelForm).join(',')
    

    // built table header
    buildHeader = buildHeader?? function(tableFields=fields, deleteFields=deleteFields){
        headerFields = (deleteFields)?Object.keys(tableFields).reduce((acc,cur)=>{
            if(deleteFields.indexOf(cur) == -1){
                acc[cur] = tableFields[cur];
            }
            return acc
        },{}):tableFields;
        for(let [,value] of Object.entries(headerFields)){
            headerHtml += `<th>${value}</th>`;
        }
        headerHtml = `<tr>${headerHtml}<th></th><th></th></tr>`;
        header.insertAdjacentHTML('beforeend',headerHtml);
    }
    buildHeader(fields, deleteFields);

    // built table body
    buildBody = buildBody?? function(tableDate=data, tableFields=headerFields, styleFields){
        $(body).empty();
        bodyHtml ='';
        for(let item of tableDate){
            let tr = '';
            for(let th of Object.values(tableFields)){
                if(styleFields){
                    switch(styleFields[th]){
                        case 'badge':
                            tr += `<td>${buildBadge(item[th])}</td>`;
                            break;
                        case 'check':
                            tr += `<td>${buildCheck(th,item[hash],item[th])}</td>`;
                            break;
                        default:
                            tr += `<td>${item[th]}</td>`;
                            break;
                    }
                }else{
                    tr += `<td>${item[th]}</td>`;
                }
                
            }
            bodyHtml += `<tr>
                            ${tr}
                            <td class="text-center">
                                ${buildButtons(table,item,hash,item[hash],editFields,modal.id)??''}
                            </td>
                            <td></td>
                        </tr>`;
        }
        body.insertAdjacentHTML('beforeend',bodyHtml);
    }
    buildBody(data, headerFields, styleFields);
    setTable();
    

    if(modal && modelForm){
        let form = '';
        for(let [key,value] of Object.entries(modelForm)){
            if(value.type == 'select'){
                form += buildSelect(key,value ,fields[key]);
            }else if(value.type == 'textarea'){
                form += buildTextarea(key,value,fields[key])
            }else if(value.type == 'file'){
                form += buildFileInput(key,value, fields[key])
            }else{
                form +=  buildInput(key,value,fields[key]);
            }
        }
        form = `<div class="modal fade" id="${modal.id}" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-${modal.size}" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="myLargeModalLabel">ادخل البيانات</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <i class="fal fa-window-close text-danger"></i>
                                </button>
                            </div>
                            <div class="modal-body">
                                <form class="form-item" novalidate accept-charset="utf-8" id="form_id">
                                    <div class="form-content form-row justify-content-center">
                                        ${form}
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-primary submit-form" data-form="${encodeURIComponent(JSON.stringify(modelForm))}" onclick="saveItem($(this), '${modal.id}', '${table}');">حفظ</button>
                            </div>
                        </div>
                    </div>
                </div>`
        document.querySelector('body').insertAdjacentHTML('beforeend',form);
    }

    afterEdit = afterEdit??function(hash,data={}){}
    editItem = editItem?? function(hashfield,hash,table,query,modalId){
        let data = run(`select ${query} from ${table} where ${hashfield}='${hash}';`).result[0].query0[0];
        let fields = query.split(',');
        for(let field of fields){
            let jQueryfield = $(`#${field}`);
            if(jQueryfield.prop('nodeName') === "SELECT"){
                jQueryfield.val(data[field]).trigger('change');
            }else{
                jQueryfield.val(data[field]);
            }
        }
        if(modalId){
            $(`#${modalId}`).modal('toggle');
        }
        if(itemHash || itemHash == 0){
            itemHash = hash;
        }
        afterEdit(hash,data);
    }

    deleteItem = deleteItem?? function (hashfield,hash,table) {
        function deleteI(){
            run(`delete from ${table} where ${hashfield}=${hash};`);
            buildBody(fetchData(fields, table), headerFields,  styleFields);
        }
        fireSwal(deleteI)
    }

    newItem = newItem?? function(modalId){
        $(`#${modalId}-modal`).modal('toggle');
        reset_form(`${modalId}-modal`);
        itemHash = 0;
    }

    preSave = preSave??function(){}

    saveItem = saveItem?? function(form, modalId, tableName){
        function save(){
            preSave();
            let formFields = '';
            form = form.data('form');
            form = decodeURIComponent(form);
            form = JSON.parse(form);
            if(itemHash == 0){
                run(`insert into ${tableName}(${Object.keys(form).join(',')}) values(${Object.keys(form).map(x=> `'${$(`#${x}`).val()}'`).join(',')});`);
            }else{
                run(`update ${tableName} set ${Object.keys(form).map(x => `${x}='${$(`#${x}`).val()}'`).join(',')} where hash=${itemHash};`);
            }
            $(`#${modalId}`).modal('toggle');
            reset_form(modalId);
            itemHash = 0;
            buildBody(fetchData(fields, table), headerFields,  styleFields);
        }
        fireSwal(save);
    }
    
    const returnObj = {
        table:table,
        fields:fields,
        optionsFields:fetchData,
        deleteFields:deleteFields,
        data:data,
        headerFields:headerFields,
        style:styleFields,
        render:function(){
            buildBody(fetchData(this.fields, this.table), this.headerFields,  this.style);
        },
        edit:editItem,
        delete:deleteItem,
        new:newItem,
        save:saveItem
    }

    return returnObj;
}

function niceSwal(type="success", position="top-end", msg='تم اجراء العملية بنجاح'){
    swal.fire({
        toast: true,
        position: position,
        showConfirmButton: false,
        timer: 3000,
        padding: '2em',
        icon: type,
        title: msg,
    });
}