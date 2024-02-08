<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?><!DOCTYPE html>
<html>
<head>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
	<meta charset="utf-8">
</head>
<body>
<a href="<?php echo site_url("Account/dashborad");  ?>">back</a>
<br/><br/><br/>
<?php
if($edit=="1")
{
	foreach($user_one as $u)
	{
		$name=$u->name;
		$uname=$u->uname;
		$password=$u->password;
		$hash=$u->user_hash;
		

	}
	
}
else
	{
		$name="";
		$uname="";
		$password="";
		$hash="";
	}
?>

<center>
<form action="<?php  echo site_url("Account/user");?>" method="post">
<table>

<tr><td>customer name</td><td><input type="text" name="name" value="<?php echo $name; ?>"  /></td></tr>
<tr><td>customer username</td><td><input type="text" name="uname" value="<?php echo $uname; ?>"  /></td></tr>
<tr><td>customer password</td><td><input type="password" name="password" value="<?php echo $password; ?>"  /></td></tr>
<?php  
if($edit=="1")
{
	print'<input type="hidden" name="hash" value="'.$hash.'"  />';

}

?>
<tr><td colspan="2"><center><input type="submit" value="Save" /></center></td></tr>
</table>
</form>
<hr/>
<table border=1>
<th>name</th><th>username</th><th>password</th><th>Action</th>
<?php
foreach($user as $u)
{
	print'<tr><td><center>'.$u->name.'</center></td><td><center>'.$u->uname.'</center></td><td><center>'.$u->password.'</center></td><td><center><a href="'.site_url("Account/user/$u->user_hash").'">edit</a></center></td></tr>';
}
?>
</table>
</center>
</body>
</html>
