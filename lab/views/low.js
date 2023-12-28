defult_table = {
    table_id:"table_id",
    header_id:"header_id",
    body_id:"body_id",
    fields:['*'],
    database_table:"table_name",
    condition_allowed:false,
    condition:"",
    additional_tr_allowed:false,
    additional_tr:[],
    check_tr_allowed:"table_id",
    check_tr:[],
    getData:function(){
        if(this.condition_allowed){
            return run(`select ${fields.join(',')} from ${database_table} where ${condition.join(" and ")};`)
        }
        else{
            return run(`select ${fields.join(',')} from ${database_table};`)
        }
    },
    buildTable: function(table_id = this.table_id){

    },
}

function test(table=defult_table){
    t = table.getData;
}

test();