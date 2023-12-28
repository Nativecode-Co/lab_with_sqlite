// check if user online
if (!navigator.onLine) {
    Swal.fire({
        title: 'خطأ',
        text: 'لا يوجد اتصال بالانترنت',
        icon: 'error',
        confirmButtonText: 'موافق'
    }).then(() => {
        window.location.href = 'index.html';
    })
}
var __domain__ = "http://umc.native-code-iq.com/";

var base_url = `${__domain__}app/index.php/`;

var front_url = `${__domain__}lab/`;

