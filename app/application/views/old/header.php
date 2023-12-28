<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?><!DOCTYPE html>
<html>
<head>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
	<meta charset="utf-8">
</head>
<body>
<a href="<?php echo site_url("Hr/dashborad");  ?>">back</a>
<br/><br/><br/>
<?php
$csrf = array(
    'name' => $this->security->get_csrf_token_name(),
    'hash' => $this->security->get_csrf_hash()
);

?>


<ul>
<li><a href="<?php  echo site_url("Hr/user");?>">Add User</a></li>
<li><a href="<?php  echo site_url("Hr/draw_map");?>">Add Zone</a></li>
<li><a href="<?php  echo site_url("Hr/emp");?>">Add Employ</a></li>
<li><a href="<?php  echo site_url("Login/logout");?>">Logout</a></li>
</ul>

</body>
</html>
