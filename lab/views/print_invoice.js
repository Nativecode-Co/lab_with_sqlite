"usestrict";

const visitHash = urlParams.get('hash');
let complexResult = {};
let normalResult = [];


renderItem(localStorage.lab_hash);
fetchData();
writeNormal()

function renderItem(hash){
    let data = run(`select * from lab_invoice where lab_hash='${hash}';`).result[0].query0[0];
    if(data === undefined){
        run({action:"insert", column:getData(), table:"lab_invoice"});
    }else{
        let workers = JSON.parse(data.workers).data;
        let headerHtml = '';
        let bodyHtml = '';
        let cols = 0;
        headerHtml += `<div class="col-sm-3">
                            <img src="${data.logo}" alt="title" width="100%">
                       </div>
                       <div class="w-100"></div>`;
        workers.map(item=>{
            if(item.job !== ""){
                cols += 1;
            }
            return item;
        })
        for(let [index, worker] of workers.entries()){
            if(worker.job !== ''){
                headerHtml += `<div class="col-sm-${Math.floor(12/cols)} col-12 mr-auto text-center">
                                    <h2 style="color:${data.color}">${worker.job}</h2>
                                    <h4 style="color:${data.color}">${worker.worker}</h4>
                                    <h3 style="color:${data.color}">${worker.cert}</h3>
                                </div>`
            }
        }
        bodyHtml = `<div class="col-4">
                        <h4>${data.phone_1}</h4>
                        <h4>${data.phone_2}</h4>
                    </div>
                    <div class="col-4">
                        <h4>${data.address}</h4>
                    </div>
                    <div class="col-4">
                        <a href="${data.facebook}"><i class="fab fa-4x fa-facebook"></i></a>
                    </div>
        `;
        document.getElementById("header").innerHTML = headerHtml;
        document.getElementById("footer").innerHTML = bodyHtml;
    }
}


function fetchData() {
    let tests = exce(`select result_test,test_name as name,(select name from test_catigory where test_catigory.hash=test.category_hash) as type from visits_tests  inner join test on test.hash=visits_tests.tests_id where visit_id =' ${visitHash}';`).result[0].query0;
    for (let result of tests) {
        let testResult = JSON.parse(result.result_test).result;
        if(testResult?.[1]){
            complexResult[result.name] = JSON.parse(result.result_test).result;
        }else{
            let normal = JSON.parse(result.result_test).result[0];
            normal.name = result.name;
            normal.type = result.type;
            normalResult.push(normal);
            normalResult = normalResult.sort((a, b) => (a.type??"".toLowerCase()) > (b.type??"".toLowerCase()) ? 1 : -1);
            // normalResult[result.name] = JSON.parse(result.result_test).result;
            // normalResult[result.name][0].type = result.type;
        }
    }
    for(let [key,value] of Object.entries(complexResult)){
        document.getElementById("buttons").innerHTML += 
            `<div class="col-xl-12 col-md-3 col-sm-6">
                <a type="button" id="save_btn" onclick="writeComplex('${key}')" class="btn btn-primary btn-print">${key}</a>
            </div>`;
    }
}

function writeComplex(key){
    let body = document.getElementById("body");
    body.innerHTML = '';
    body.innerHTML += `<h1 class="text-center">GENERAL ${key.toUpperCase()} EXAMINATION</h1>`;
    body.innerHTML += `<div class="row text-right pr-5 text-black">
                            <div class="col-4 h5">R. RANGE</div>
                            <div class="col-4 h5">REULT</div>
                            <div class="col-4 h5">NAME</div>
                           </div>
                        <hr>`
    for(let result of complexResult[key]){
        body.innerHTML += `<div class="row text-right pr-5 text-black">
                            <div class="col-4 h5">${result.range}</div>
                            <div class="col-4 h5">${result.result}</div>
                            <div class="col-4 h5">${result.name}</div>
                           </div>`
    }
}

function writeNormal(){
    let body = document.getElementById("body");
    body.innerHTML = '';
    let title = "";
    // body.innerHTML += `<h1 class="text-center">GENERAL ${key.toUpperCase()} EXAMINATION</h1>`;
    body.innerHTML += `<div class="row text-right pr-5 text-black">
                            <div class="col-4 h5">R. RANGE</div>
                            <div class="col-4 h5">REULT</div>
                            <div class="col-4 h5">NAME</div>
                           </div>
                        <hr>`
    for(let result of normalResult){
        title = (title == result.type)?"":result.type;
        if(title){
            body.innerHTML += `<div class="row text-right pr-5 text-danger">
                                    <div class="col-4 h5"></div>
                                    <div class="col-4 h5"></div>
                                    <div class="col-4 h5">${title}</div>
                                </div>`
        }
        body.innerHTML += `<div class="row text-right pr-5 text-black">
                            <div class="col-4 h5">${result.range??""}</div>
                            <div class="col-4 h5">${result.result??""}</div>
                            <div class="col-4 h5">${result.name??""}</div>
                           </div>`
    }
}

function writeEmpty(){
    let body = document.getElementById("body");
    body.innerHTML = '';
}
