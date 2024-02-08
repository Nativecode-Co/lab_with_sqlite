<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?><!DOCTYPE html>
<html>
<head>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
	<meta charset="utf-8">
</head>
<body>
<br/><br/><br/>
<?php
$csrf = array(
    'name' => $this->security->get_csrf_token_name(),
    'hash' => $this->security->get_csrf_hash()
);

?>

<center>
<p /*style="color:red;"*/><?php echo $mes;   ?></p>
<form action="<?php  echo site_url("Login/check_user");?>" method="post">
<table>

<tr><td>Username </td><td><input type="text" name="username"  required /></td></tr>
<tr><td>Password</td><td><input type="password" name="password" required /></td></tr>

<tr><td colspan="2"><center><input type="hidden" name="<?=$csrf['name'];?>" value="<?=$csrf['hash'];?>" /><input type="submit" value="Login" /></center></td></tr>
</table>
</form>

</center>
</body>
</html>
