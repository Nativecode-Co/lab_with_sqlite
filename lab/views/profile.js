let user_hash = localStorage.getItem("hash");
let old_username = run(`select username from system_users where hash=${user_hash};`).result[0].query0[0].username;

// dom ready
$(function() {
    // get dom elements [username, old_password, new_password, confirm_password]
    let username = $("#username");
    let old_password = $("#old_password");
    let new_password = $("#new_password");
    let confirm_password = $("#confirm_password");
    // set username
    username.val(old_username);
    // new_password and confirm_password on input
    new_password.on("input", function() {
        if (new_password.val() !== confirm_password.val()) {
            confirm_password.addClass("is-invalid");
        } else {
            confirm_password.removeClass("is-invalid");
        }
    });
    confirm_password.on("input", function() {
        if (new_password.val() !== confirm_password.val()) {
            confirm_password.addClass("is-invalid");
        } else {
            confirm_password.removeClass("is-invalid");
        }
    });
    // submit
    $("#submit").on("click", function() {
        // get values
        let username_val = username.val();
        let old_password_val = old_password.val();
        let new_password_val = new_password.val();
        let confirm_password_val = confirm_password.val();
        // check if username is empty
        if (username_val === "") {
            username.addClass("is-invalid");
            return;
        } else {
            username.removeClass("is-invalid");
        }
        // check if old_password is empty
        if (old_password_val === "") {
            old_password.addClass("is-invalid");
            return;
        } else {
            old_password.removeClass("is-invalid");
        }
        // check if new_password is empty
        if (new_password_val === "") {
            new_password.addClass("is-invalid");
            return;
        }else {
            new_password.removeClass("is-invalid");
        }
        // check if confirm_password is empty
        if (confirm_password_val === "") {
            confirm_password.addClass("is-invalid");
            return;
        }
        // get user by hash and password
        let user = run(`select * from system_users where hash='${user_hash}' and password='${old_password_val}';`)?.result?.[0]?.query0?.[0]??null;
        // check if user is null
        if (user === null) {
            old_password.addClass("is-invalid");
            return;
        } else {
            old_password.removeClass("is-invalid");
        }
        // update user
        run(`update system_users set username='${username_val}', password='${new_password_val}' where hash='${user_hash}';`);
        // redirect to login
        window.location.href = "/lab/login/login.html";
    });
});


