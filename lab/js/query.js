function check_object(obj, field, value) {
    var query_obj = exce("select * from " + obj + " where " + field + "= " + value);
    var condition_value = query_obj.result.query.length;
    if (condition_value == 0) {
        return false
    } else {
        return true
    }
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