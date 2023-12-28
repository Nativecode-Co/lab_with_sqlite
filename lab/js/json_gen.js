function buildLabel(name, value, classes) {
    var label = $("<label>", {
        for: value,
        text: name,
        class: classes
    })
    return label
}

function buildInput(name, type, classes, placeholder, required, value) {
    var input = $("<input>", {
        name: name,
        id: name,
        class: classes,
        type: type,
        placeholder: placeholder,
        required: required,
        value: value
    })
    return input
}

function builsSelect(name, classes, options = []) {
    var select = $("<select>", {
        name: name,
        id: name,
        class: classes,
    })
    for (var option of options) {
        select.append(new Option(option, option));
    }
    return select
}

function buildRadio(theme, name, type, classes, value, span1, span2, text, checked = false) {
    var radio = $("<label>", {
        class: "new-control new-radio new-radio-text radio-classic-" + theme
    });
    radio.append($("<input>", {
        type: type,
        class: classes,
        name: name,
        value: value,
        checked: checked
    }));
    radio.append($("<span>", { class: span1 }));
    radio.append($("<span>", { class: span2, text: text }));
    radio = buildDiv("n-chk").append(radio);
    return radio
}

function buildInputCol(col_classes, name, value, type, classes, placeholder, required) {
    var col = $("<div>", {
        class: "mb-3 " + col_classes
    }).append(buildLabel(value, name), buildInput(name, type, classes, placeholder, required));
    return col
}

function buildSelectCol(col_classes, name, value, classes, options) {
    var col = $("<div>", {
        class: "mb-3 " + col_classes
    }).append(buildLabel(value, name), builsSelect(name, classes, options));
    return col
}

function buildDiv(classes) {
    return $("<div>", {
        class: classes
    });
}

function buildBut(classes, value, col, click, icon = false) {
    var div = $("<div>", {
        class: col
    });
    var button = $("<button>", {
        class: "btn btn-" + classes,
        text: value,
        type: "button",
        onclick: click
    });
    if (icon) {
        button.append($("<i>", {
            class: icon
        }))
    }
    div.append(button);
    return div
}

function createComponent() {
    var num = Math.floor(Math.random() * 1000000);
    var row = $("<div>", {
        class: "row justify-content-end align-items-center border rounded-lg border-info p-3 m-3 component com-" + num,
        id: num
    });
    row.append(buildInputCol("col-md-4", "com_" + num + "_name", "الاسم", "text", "form-control", "اكتب الاسم ", "true"));
    row.append(buildInputCol("col-md-4", "com_" + num + "_shortcut", "الاختصار", "text", "form-control", "اكتب الاختصار ", "true"));
    row.append(buildInputCol("col-md-4", "com_" + num + "_unit", "وحدة القياس", "text", "form-control", "اكتب وحدة القياس ", "true"));
    var radio1 = buildDiv("col-md-4");
    radio1.append(buildRadio("success", "com_" + num + "_result", "radio", "new-control-input", "number", "new-control-indicator", "new-radio-content", "رقم", true));
    var radio2 = buildDiv("col-md-4");
    radio2.append(buildRadio("success", "com_" + num + "_result", "radio", "new-control-input", "text", "new-control-indicator", "new-radio-content", "نص"));
    var radio3 = buildDiv("col-md-4");
    radio3.append(buildRadio("success", "com_" + num + "_result", "radio", "new-control-input", "select", "new-control-indicator", "new-radio-content", "اختيار من متعدد"));
    row.append(radio1, radio2, radio3);
    row.append(buildDiv("col-md-12 result"));
    row.append(buildDiv("col-md-12 reference-elements"));
    row.append(buildDiv("w-100"))
    row.append(buildBut("success w-100 mb-3 btn-lg", "", "col-md-2", "createReference('com-" + num + "');", "fal fa-plus-square"));
    row.append(buildBut("danger w-100 mb-3 btn-lg", "", "col-md-2", "deleteComponent('com-" + num + "');", "fal fa-trash"));
    $("#proccess").append(row);
    $("input[type=radio]").click(function() {
        if ($(this).val() == "select") {
            addFirstResult("com-" + num);
        } else {
            $(".com-" + num + " .result").empty();
        }
    })
    return num;
}

function createReference(com) {
    var num = Math.floor(Math.random() * 1000000);
    var row = $("<div>", {
        class: "row justify-content-between align-items-end border rounded-lg border-primary p-3 bg-light m-3 reference com-" + num,
        id: num
    });
    row.append(buildSelectCol("col-md-4", "com_" + num + "_gender", "الجنس", "form-control", ["ذكر", "انثي", "كلاهما"]));
    row.append(buildSelectCol("col-md-4", "com_" + num + "_age unit", "وحدة قياس العمر", "form-control", ["عام", "شهر", "يوم"]));
    row.append(buildInputCol("col-md-4", "com_" + num + "_age", "العمر", "number", "form-control", "اكتب العمر ", "true"));
    row.append(buildInputCol("col-md-4", "com_" + num + "_critical low", "critical low", "text", "form-control", "اكتب  ", false));
    row.append(buildInputCol("col-md-4", "com_" + num + "_normal", "normal", "text", "form-control", "اكتب   ", false));
    row.append(buildInputCol("col-md-4", "com_" + num + "_critical high", "critical high", "text", "form-control", "اكتب  ", false));
    row.append(buildInputCol("col-md-10", "com_" + num + "_note", "الملاحظات", "text", "form-control", "اكتب الملاحظات  ", false));
    row.append(buildBut("danger w-100 mb-3 btn-lg", "", "col-md-2", "deleteComponent('com-" + num + "');", "fal fa-trash"));
    $("." + com + " .reference-elements").append(row);
    return num;
}

function deleteComponent(com) {
    $("." + com).remove();
}

function addFirstResult(com) {
    var row = buildDiv("row justify-content-around align-items-end border rounded-lg border-primary p-3 bg-light m-3");
    row.append(buildInputCol("col-md-4", "options", "الاختيار", "text", "form-control", "اكتب الاختيار", "true"));
    row.append(buildInputCol("col-md-4", "options", "الاختيار", "text", "form-control", "اكتب الاختيار", "true"));
    row.append(buildInputCol("col-md-4", "options", "الاختيار", "text", "form-control", "اكتب الاختيار", "true"));
    if ($("." + com + " .result").is(":empty")) {
        $("." + com + " .result").append(row);
        $("." + com + " .result .row").append(row.append(buildBut("success w-100 mb-3 btn-lg", "", "col-md-2 addresult", "addResult('" + com + "');", "fal fa-plus-square")));
        $("." + com + " .result .row").append(row.append(buildBut("danger w-100 mb-3 btn-lg", "", "col-md-2", "deleteResult('" + com + "');", "fal fa-trash")))
    };

};

function addResult(com) {
    $(buildInputCol("col-md-4", "options", "الاختيار", "text", "form-control", "اكتب الاختيار", "true")).insertBefore("." + com + " .result .row .addresult");
}

function deleteResult(com) {
    $("." + com + " .result .row .col-md-4").last().remove();
}

function getFormDateJson(inputs) {
    var json = {};
    inputs.each(function(input) {
        if ($(this).attr("type") == "radio") {
            if ($(this).is(":checked")) {
                json[$(this).attr("name").split('_').pop()] = $(this).val();
            };
        } else {
            if ($(this).attr("name").split('_').pop() == "options") {
                if (json["options"] == undefined) {
                    json["options"] = [];
                    json["options"].push($(this).val())
                } else {
                    json["options"].push($(this).val())
                }
            } else {
                json[$(this).attr("name").split('_').pop()] = $(this).val();
            }
        }
    });
    return json;
}

function get_json(parent, child = false) {
    var ParentJson = {};
    ParentJson[parent] = []
    var items = $("." + parent);
    items.each(function() {
        if (child) {
            var parentInputs = $(this).children().find("input,select,textarea").not("." + child + " input,select,textarea");
            var json = getFormDateJson(parentInputs);
            json[child] = []
            $(this).children().find("." + child).each(function() {
                var childInputs = $(this).children().find("input,select,textarea");
                json[child].push(getFormDateJson(childInputs))
            })
            ParentJson[parent].push(json)
        } else {
            var parentInputs = $(this).children().find("input,select,textarea");
            ParentJson[parent].push(getFormDateJson(parentInputs));
        }
    });
    console.log(JSON.stringify(ParentJson));
    return JSON.stringify(ParentJson);
};


function convertJson(json, parent, parentFun, child, childFun) {
    json = JSON.parse(json);
    for (var i of json[parent]) {
        var id = parentFun();
        for (var j in i) {
            if (j == child) {
                for (var k in i[j]) {
                    var childId = childFun("com-" + id);
                    for (var l in i[j][k]) {
                        var name = "com_" + childId + "_" + l
                        $("textarea[name='" + name + "']").val(i[j][k][l]);
                        $("input[name='" + name + "']").val(i[j][k][l]);
                        $("select[name='" + name + "']").val(i[j][k][l]).trigger("change");
                    }
                }
            } else if (j == "result") {
                var name = "com_" + id + "_" + j;
                $("input[name='" + name + "'][value=" + i[j] + "]").attr("checked", true);
            } else if (j == "options") {
                for (var option of i[j]) {
                    if ($(".com-" + id + " .result").is(":empty")) {
                        addFirstResult("com-" + id);
                        console.log($(".com-" + id + " .result").children().find("input").last().val(option));
                    } else {
                        addResult("com-" + id);
                        console.log($(".com-" + id + " .result").children().find("input").last().val(option));
                    }
                }
            } else {
                var name = "com_" + id + "_" + j;
                $("textarea[name='" + name + "']").val(i[j]);
                $("input[name='" + name + "']").val(i[j]);
                $("select[name='" + name + "']").val(i[j]).trigger("change");
            }
        }
    }
}