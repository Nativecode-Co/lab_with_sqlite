"use strict";

const DAYS_OF_YEAR = 365,
      DAYS_OF_MONTH = 30,
      NOW = new Date();

function filterGender (reference, gender){
    return reference.filter(item => item.gender == gender || item.gender == "كلاهما");
}

function filterAge (reference, age){
    return reference.filter(item => (age > (item?.["age low"]??0) && age < (item?.["age high"]??120)))
}

function filterKitAndUnit(refrence, kit, unit){
    return refrence.filter(item =>{
        return item.kit == kit && item.unit == unit
    })
}

function mapAge (reference){
    return reference.map((item) => {
        if (item["age unit high"] == "عام") {
            item["age high"] = item["age high"] * 365
        } else if (item["age unit high"] == "شهر") {
            item["age high"] = item["age high"] * 30
        }
        if (item["age unit low"] == "عام") {
            item["age low"] = item["age low"] * 365
        } else if (item["age unit high"] == "شهر") {
            item["age low"] = item["age low"] * 30
        }
        return item
    })
}


// 0-15


function createInput(component,range,hash,value,kit,unit,device,type){
    
    switch(component.result){
        case "result":
            let option = '';
            for (let opt of component.options) {
                option += `<option value="${opt}">${opt}</option>`;
            }
            return `<select name="${component.name}"
                            data-type=${type}
                            data-unit=${unit}
                            data-kit=${kit}
                            data-device=${device}
                            data-name=${component.name}
                            data-range="${range}"
                            data-hash="${hash}"
                            style="font-family: ui-monospace;"
                            class="form-control border-dashed result-value mover">
                        ${option}
                    <select>`;
        default:
            return `<input type="${component.result}"
                           name="${component.name}"
                           data-type=${type}
                           data-unit=${unit}
                            data-kit=${kit}
                            data-device=${device}
                           data-name=${component.name}
                           data-range="${range}" 
                           data-hash="${hash}"
                           class="form-control border-dashed result-value valid mover"
                           id="${component.name}"
                           value="${value}"
                           placeholder="ادخل النتيجة"
                           required="">`;
    }
}

function getRange(reference){
    if(reference.length != 0){
        let range = '';
        for (let _range of reference[0].range) {
            if(isNaN(Number(_range.low)) || _range.low == ""){
                range += _range.low??"";
            }else{
                range += ` ${_range.name??""} `;
                if((_range.low && _range.low != 0) && _range.high){
                    range += `${_range.low??""} - ${_range.high??""}`;
                }else if((_range.high) && _range.low != 0){
                    range += `${_range.low??""} >=`;
                }else if(_range.high || _range.low == 0){
                    range += `<= ${_range.high??""} `;
                }
            }
            range += `<br>`;
        }
        return range
    }else{
        return "No Range";
    }
}

function che(){
    
}

function build_result_form(hash) {
    let data = run(`select result_test,(select option_test from lab_test where lab_test.hash=lab_visits_tests.tests_id) as lab_test from lab_visits_tests where hash=${hash};
    select lab_patient.birth as birth,lab_patient.gender from lab_visits_tests inner join lab_visits on lab_visits.hash=lab_visits_tests.visit_id inner join lab_patient on lab_patient.hash=lab_visits.visits_patient_id where lab_visits_tests.hash=${hash};`);
    let query_obj = data.result[0].query0,
        patient = data.result[1].query1[0],
        patientAge = dateDiffInDays(new Date(patient.birth),NOW);
    let {type,component} = JSON.parse(query_obj[0]?.test??"{}"),
        table = "",
        value = JSON.parse(query_obj[0]?.result_test??"{}");
    if(component !== undefined){
        let lastTypeOfComponent = "";
        for(let [index,com] of component.entries()){
            if(lastTypeOfComponent != com.type && com.type){
                table += `
                    <tr>
                        <td colspan="5" class="text-right text-danger" style="font-size: 18px;">${com.type}</td>
                    </tr>
                `
                lastTypeOfComponent = com.type;
            }
            let {reference} = com;
            if(!type){
                reference = filterAge(mapAge(filterGender(reference, patient.gender)),patientAge);
                reference = filterKitAndUnit(reference, value?.result?.[0]?.kit??0, value?.result?.[0]?.unit??0)
            }
            let range = getRange(reference);
            let input = createInput(com, range, hash, value?.result?.[index]?.result??"",
                                    value?.result?.[index]?.kit??0,
                                    value?.result?.[index]?.unit??0,
                                    value?.result?.[index]?.device??0,
                                    type
            );
            let unit = null;
            if(reference[0]?.unit){
                unit = run(`select name from test_units where hash=${reference[0].unit};`).result[0].query0[0].name;
            }
            console.log(`%c${com.name} ${com.type?com.type:'No Type'}`, "color:blue;font-size:20px;");
            table += 
                `<tr>
                    <td>${com.name}</td>
                    <td>${input}</td>
                    <td><input type="text" value="${value?.result[0]?.notes??""}" name="notes" class="form-control text-center mover" id="notes-${hash}" placeholder="ادخل الملاحظات" value="" required></td>
                    <td>${unit??""}</td>
                    <td>${range}</td>
                </tr>`
        }
    }else{
        return `<tr>
                    <td>لا يوجد تطابق</td>
                    <td>التحليل غير صالح</td>
                    <td>التحليل غير صالح</td>
                    <td>no unit</td>
                    <td>no range</td>
                </tr>`
    }
    return table
}


