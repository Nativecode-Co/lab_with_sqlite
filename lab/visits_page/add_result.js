
const filterReference = (visit, test) => {

}

function addResult(visit, visitTests) {
    let resultForm = [];
    visitTests.forEach((test) => {
        let options = JSON.parse(test.options);
        let component = options.component;
        let result_test = JSON.parse(test.result_test);
        if (options.type != 'type') {
            let reference = component?.[0]?.reference;
            if (reference) {
                // filter with kit
                reference =
                    filterWithKit(reference, test.kit_id);
                // filter with unit
                reference = filterWithUnit(reference, test.unit);
                // filter with age
                reference = filterWithAge(reference, visit.age, 'عام');
                // filter with gender
                reference = filterWithGender(reference, gender);
            }
            if (options.result = 'number') {
                resultForm.push(generateFieldForTest(test, result_test, reference));
            } else if (0) { }
        } else {
            // add button to open modal
            resultForm.push(`
                <div class="col-md-11 results border-0 bg-light-dark mb-15" onclick="$('#modal-${test.name}').modal('show')" style="cursor: pointer;">
                    <p class="text-center pt-3 mb-0"> ${test.name} <i class="fa fa-plus-circle text-info"></i></p>
                    <p class="text-center pb-3"> Add ${test.name} Test Results </p>
                </div>
            `);
            resultForm.push(`
            <div class="modal fade" id="modal-${test.name}" tabindex="-1" role="dialog" aria-labelledby="modal-${test.name}" aria-hidden="true">
                <div class="modal-dialog modal-xl" role="document">
                    <div class="modal-content">
                        <div class="modal-body">`);
            resultForm.push(`
                <div class="col-md-11 results mb-15">
                    <div class="row align-items-center">
                        <div class="col-md-12">
                            <h4 class="text-center mt-15">${test.name}</h4>
                        </div>
            `);
            let type = '';
            for (let reference of component) {
                let input = '';
                switch (reference.result) {
                    case 'text':
                        input = `
                            <input type="text" class="form-control result text-center" value="${result_test?.[reference.name] ?? ''}" id="result_${test.hash}" name="${reference.name}" placeholder="ادخل النتيجة">`
                        break;
                    case 'result':
                        input = `
                            <select class="form-control result text-center"  name="${reference.name}" id="result_${test.hash}">
                                ${reference.options.map(option => `<option value="${option}" ${result_test?.[reference.name] ?? '' == option ? 'selected' : ''}>${option}</option>`).join('')}
                            </select>
                        
                        `
                        break;
                    case 'nubmer':
                        input = `<input type="number" class="form-control result text-center" id="result_${test.hash}"  name="${reference.name}" placeholder="ادخل النتيجة" value="${result_test?.[reference.name]}">`
                        break;
                    default:
                        break;
                }
                if (reference.type != type) {
                    if (type != '') {
                        resultForm.push(`
                            </div>
                        `);
                    }
                    type = reference.type;
                    resultForm.push(`
                        <div class="col-md-12 mb-3">
                            <h5 class="text-center">${reference.type}</h5>
                        </div>
                        <div class="row justify-content-center mr-15 ml-15">
                    `);
                }
                resultForm.push(`
                    <div class="col-md-4 mb-3">
                        <label for="result">${reference.name}</label>
                        ${input}
                    </div>
                `);
            }
            resultForm.push(`
                        </div>
                    </div>
                </div>
            `);
            resultForm.push(`
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-add w-100" onclick="fireSwal(saveResult,'${visit.hash}');$('#modal-${test.name}').modal('hide')">حفظ النتائج</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }
    });
    return resultForm.join('');
}