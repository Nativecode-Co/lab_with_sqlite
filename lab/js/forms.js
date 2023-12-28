var setting_datatable = {
    responsive: true,
    pageLength: 100,
    lengthChange: false,
    searching: true,
    ordering: false,
    rowReorder: {
        selector: 'td:nth-child(2)'
    },
    "language": {
        "search": "بحث:"
    }
    //"data": obj.result.query
};

function get_name_attr(form_id) {
    var column = {};
    $("#" + form_id).find("input, textarea, select").each(function() {
        var inputType = this.tagName.toUpperCase() === "INPUT" && this.type.toUpperCase();
        if (inputType !== "BUTTON" && inputType !== "SUBMIT") {
            if (this.type == "radio") {
                var isChecked = $(this).is(':checked');
                if (isChecked)
                    column[this.name] = $(this).val();
            } else
            if (this.name != "" && this.name != "files")
                column[this.name] = $(this).val();
        }
    });
    return column;
}

function get_insert_object(form_id, table) {
    //alert("aaaaa");
    var column = get_name_attr(form_id)
        // var column = {fields: fields};
        /////////////add field object to orm json
    var orm = {
        "action": "insert",
        "table": table,
        column
    };
    //      {
    //   "action": "insert",
    //   "table": "system_users",
    //   "column": {
    //     "name": "redhaxxxdd"
    //   }
    // };
    //new_json=JSON.stringify(orm);
    console.log(orm);
    return orm;
}

function get_update_object(form_id, table, hash) {
    //alert("aaaaa");
    var column = get_name_attr(form_id)
        // var column = {fields: fields};
        /////////////add field object to orm json
    var orm = {
        "action": "update",
        "table": table,
        column,
        "hash": hash
    };
    // {
    //   "action": "update",
    //   "table": "system_users",
    //   "column": {
    //     "name": "redhaxxxdd"
    //   },
    //   "hash": "123456543"
    // };
    //new_json=JSON.stringify(orm);
    console.log(orm);
    return orm;
}

function change_state_checkbox(element) {
    //alert($(element).val()); 
    if ($(element).val() == "0")
        $(element).val(1);
    else
        $(element).val(0);
}

function reset_form(form_id) {
    var column = {};
    $("#" + form_id).find("input, textarea, select").each(function() {
        var inputType = this.tagName.toUpperCase() === "INPUT" && this.type.toUpperCase();
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

function check_object(obj, field, value) {
    var query_obj = exce("select * from " + obj + " where " + field + "= " + value);
    return query_obj && query_obj.length > 0;
};


function get_inseret_or_update_object(form_id, table, hash, conditon) {
    var column = get_name_attr(form_id);
    var orm = {};
    if (conditon) {
        orm = {
            "action": "update",
            "table": table,
            column,
            "hash": hash
        };
    } else {
        var orm = {
            "action": "insert",
            "table": table,
            column
        };
    }
    return orm;
}
$(document).ready(function() {
    $(".select2-selection").addClass("text-end");
})