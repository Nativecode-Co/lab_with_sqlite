const user_hash = localStorage.getItem("hash");
const { username: old_username, password: _old_password } = fetchApi(
  `/users/get_user?hash=${user_hash}`
);

// dom ready
$(() => {
  // get dom elements [username, old_password, new_password, confirm_password]
  const username = $("#username");
  const old_password = $("#old_password");
  const new_password = $("#new_password");
  const confirm_password = $("#confirm_password");
  // set username
  username.val(old_username);
  // new_password and confirm_password on input
  new_password.on("input", () => {
    if (new_password.val() !== confirm_password.val()) {
      confirm_password.addClass("is-invalid");
    } else {
      confirm_password.removeClass("is-invalid");
    }
  });
  confirm_password.on("input", () => {
    if (new_password.val() !== confirm_password.val()) {
      confirm_password.addClass("is-invalid");
    } else {
      confirm_password.removeClass("is-invalid");
    }
  });
  // submit
  $("#submit").on("click", () => {
    // get values
    const username_val = username.val();
    const old_password_val = old_password.val();
    const new_password_val = new_password.val();
    const confirm_password_val = confirm_password.val();
    // check if username is empty
    if (username_val === "") {
      username.addClass("is-invalid");
      return;
    }
    username.removeClass("is-invalid");
    // check if old_password is empty
    if (old_password_val === "") {
      old_password.addClass("is-invalid");
      return;
    }
    old_password.removeClass("is-invalid");
    // check if new_password is empty
    if (new_password_val === "") {
      new_password.addClass("is-invalid");
      return;
    }
    new_password.removeClass("is-invalid");
    // check if confirm_password is empty
    if (confirm_password_val === "") {
      confirm_password.addClass("is-invalid");
      return;
    }
    // check if user is null
    if (old_password.val() !== _old_password) {
      console.log(old_password, _old_password);
      old_password.addClass("is-invalid");
      return;
    }
    old_password.removeClass("is-invalid");
    // update user
    fetchApi("/users/update_user", "post", {
      hash: user_hash,
      username: username_val,
      password: new_password_val,
    });
    // redirect to login
    window.location.href = "/lab/login/login.html";
  });
});
