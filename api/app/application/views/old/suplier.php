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
if($edit=="1")
{
	foreach($emp_one as $si)
	{
		$name=$si->name;
		$phone=$si->phone;
		$email=$si->email;
		$hash=$si->emp_info_hash;
	}
	
}
else
	{
		$name="";
		$phone="";
		$email="";
		$hash="";

	}
?>

<center>
<form action="<?php  echo site_url("Hr/emp");?>" method="post">
<table>

<tr><td>Employe Name</td><td><input type="text" name="name" value="<?php echo $name; ?>"  /></td></tr>
<tr><td>Employe phone</td><td><input type="text" name="phone" value="<?php echo $phone; ?>"  /></td></tr>
<tr><td>Employe email</td><td><input type="text" name="email" value="<?php echo $email; ?>"  /></td></tr>
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
<th>name</th><th>phone</th><th>email</th><th>Action</th>
<?php
foreach($emp as $si)
{

	print'<tr><td><center>'.$si->name.'</center></td><td><center>'.$si->phone.'</center></td><td><center>'.$si->email.'</center></td><td><center><a href="'.site_url("Hr/emp/$si->emp_hash").'">edit</a></center></td></tr>';
}
?>
</table>
</center>
</body>
</html>
