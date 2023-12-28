async function confirm_exce(order) {
    var condition = 1;
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
                        run(order);
                        fetch_data();
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
    return "ok";
}

async function exce_with_function(order, functions) {
    var condition = 1;
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
                        run(order);
                        functions();
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
    return "ok";
}

async function confirm_delete(order, item_hash) {
    var condition = 1;
    Swal.fire({
        icon: "question",
        html: 'هل انت متاكد انك تريد حذف هذا العنصر',
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
                        run(order);
                        $("#" + item_hash).remove();
                    },
                    didClose: () => {
                        swal.fire({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                            padding: '2em',
                            icon: 'success',
                            title: 'تم الحذف بنجاح',
                        });
                    }
                })
            }
        },
    }).then((result) => {
        if (result.isDismissed) {
            condition = 0;
        }
    });
    return "ok";
}
async function without_confirm_exce(q) {
    var json = q;
    var res = run(json);
    $('#modal').modal('toggle');
    fetch_data();
    return res;
}

function exce(q) {
    var hash = localStorage.getItem("hash");
    var json = q;
    var res = run(json);
    return res;
}

function exce_with_fetch(q) {
    var res = run(q);
    fetch_data();
    return res;
}