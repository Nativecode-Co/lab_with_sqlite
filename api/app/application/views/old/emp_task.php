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
	foreach($emp_task_one as $si)
	{
		$title=$si->title;
		$date=$si->date;
		$description=$si->description;
        $status=$si->status;
        $note=$si->note;
        $emp_task_hash=$si->emp_task_hash;
        
	}
	
}
else
	{
		$title="";
		$date="";
		$description="";
        $status="";
        $note="";
        $emp_task_hash="";

	}
?>

<center>
<form action="<?php  echo site_url("Hr/emp_task");?>" method="post">
<table>

<tr><td>title</td><td><input type="text" name="title" value="<?php echo $title; ?>"  /></td></tr>
<tr><td>date</td><td><input type="date" name="date" value="<?php echo $date; ?>"  /></td></tr>
<tr><td>description</td><td><input type="text" name="description" value="<?php echo $description; ?>"  /></td></tr>
<tr><td>status</td><td><input type="text" name="status" value="<?php echo $status; ?>"  /></td></tr>
<tr><td>note</td><td><input type="text" name="note" value="<?php echo $note; ?>"  /><input type="hidden" name="insert_hash" value="<?php echo $emp_id; ?>"  /></td></tr>

<?php  
if($edit=="1")
{
	print'<input type="hidden" name="emp_task_hash" value="'.$emp_task_hash.'"  />';
}

?>
<tr><td colspan="2"><center><input type="submit" value="Save" /></center></td></tr>
</table>
</form>
<hr/>
<table border=1>
<th>title</th><th>date</th><th>description</th><th>status</th><th>note</th><th>Action</th>
<?php
foreach($emp_task as $si)
{

	print'<tr><td><center>'.$si->title.'</center></td><td><center>'.$si->date.'</center></td><td><center>'.$si->description.'</center></td><td><center>'.$si->status.'</center></td><td><center>'.$si->note.'</center></td><td><center><a href="'.site_url("Hr/emp_task/?p=$si->emp_info_hash&trans_hash=$si->emp_task_hash").'">edit</a></center></td></tr>';
}
?>
</table>
</center>
</body>
</html>
