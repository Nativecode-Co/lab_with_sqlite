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
	foreach($emp_conf_one as $si)
	{
		$from=$si->attend_from;
		$to=$si->attend_to;
		$place=$si->place;
        $timeq=$si->questions_time;
        $timel=$si->address_time;
        $emp_conf_hash=$si->emp_conf_hash;
        $attend_in=$si->attend_in;
        
	}
	
}
else
	{
		$from="";
		$to="";
		$place="";
        $timeq="";
        $timel="";
        $emp_conf_hash="";
        $attend_in="";

	}
?>

<center>
<form action="<?php  echo site_url("Hr/emp_conf");?>" method="post">
<table>

<tr><td>from</td><td><input type="time" name="from" value="<?php echo $from; ?>"  /></td></tr>
<tr><td>to</td><td><input type="time" name="to" value="<?php echo $to; ?>"  /></td></tr>
<tr><td>place</td><td><!--<input type="text" name="place" value="<?php //echo $place; ?>"  />-->
<select name="place" id="place">
<option value="">Select place</option>
<?php
foreach($location as $l)
{
	print'<option value="'.$l->area_circle_hash.'">'.$l->area_name.'</option>';
}
?>
</select>
</td></tr>
<tr><td>time question</td><td><input type="text" name="timeq" value="<?php echo $timeq; ?>"  /></td></tr>
<tr><td>allow time</td><td><input type="time" name="attend_in" value="<?php echo $attend_in; ?>"  /></td></tr>
<tr><td>time location</td><td><input type="text" name="timel" value="<?php echo $timel; ?>"  /><input type="hidden" name="insert_hash" value="<?php echo $emp_id; ?>"  /></td></tr>

<?php  
if($edit=="1")
{
	print'<input type="hidden" name="emp_conf_hash" value="'.$emp_conf_hash.'"  />';
    print'<script>$("#place").val("'.$place.'");</script>';
}

?>
<tr><td colspan="2"><center><input type="submit" value="Save" /></center></td></tr>
</table>
</form>
<hr/>
<table border=1>
<th>Form</th><th>To</th><th>Place</th><th>Question time</th><th>Location Time</th><th>Allow time</th><th>Action</th>
<?php
foreach($emp_conf as $si)
{

	print'<tr><td><center>'.$si->attend_from.'</center></td><td><center>'.$si->attend_to.'</center></td><td><center>'.$si->area_name.'</center></td><td><center>'.$si->questions_time.'</center></td><td><center>'.$si->address_time.'</center></td><td><center>'.$si->attend_in.'</center></td><td><center><a href="'.site_url("Hr/emp_conf/?p=$si->emp_info_hash&trans_hash=$si->emp_conf_hash").'">edit</a></center></td></tr>';
}
?>
</table>
</center>
</body>
</html>
