<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?><html>



<head>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script>
	var x=0;
	function remove(x)
	{
		//alert(x);
		$(x).closest('tr').remove()
	}
function add(x) 
{
	var str="#tb"+x;
	$(str).append('<tr><td><input type="text" name="class" style="width:100%;" /></td><td><button id="any" onclick="remove($(this))">X</button></td></tr>');
}

function atter(row) 
{
		// x=row.closest("tr").index();
     x=parseInt(x)+1; 
	//	 alert(x);
	   $("#attr").append('<tr><td><input type="text" name="class" onkeyup="chanename($(this))" style="width:99%;" /><button id="ddd" value="Add" onClick="atter($(this));">New Attr</button></td><td><table id="tb'+x+'"  style="width:100%;"><tr><td><input type="text" name="class" style="width:99%;" /></td><td><button id="any" onclick="remove($(this));">X</button></td></tr></table><button  value="Add" onClick="add('+x+');">Add Value</button></td></tr></table');	
}
	 function chanename(x)
	 {
		x.closest("input").attr("name",x.val());
	 }

 function get_all()
	 {
		
		var item = document.getElementById("item").value;
		var code = document.getElementById("code").value;
		var category = document.getElementById("category").value;
		var subcat = document.getElementById("type").value;
		
	//	alert(type);
		 var json="{";
		var x = document.getElementById("attr").rows.length;
//alert(x);		
			for(var k=0;k<x;k++)
			{
			//	alert(k)
				var aa=document.getElementById("attr").rows[k].cells[0].firstChild.value;
				json=json+'"'+aa+'":';
				var tb_count = document.getElementById("tb"+k).rows.length;
				if(tb_count>1)
				json=json+'[';
				else
				json=json+'';

				 for(var m=0;m<tb_count;m++)
				     {
						json=json+'"'+document.getElementById("tb"+k).rows[m].cells[0].firstChild.value+'",';
						//document.getElementById("tb"+k).rows[m].cells[0].firstChild.setAttribute("name", aa+"["+m+"]");
					 }
				if(tb_count>1)
				  {
					json = json.substring(0, json.length-1);
				    json=json+'],';	
				  }
				  else
				  {
					json = json.substring(0, json.length-1);
					json=json+',';
				  }
				 
			    
				//alert(tb_count);
			}
			json = json.substring(0, json.length-1);
			json=json+'}';	
		//	alert(json+" "+code+" "+item+" "+type);
	    send_request1(json,item,code,category,subcat);
	 }

	 function send_request1(json,item_name,code,cat,subcat) 
	 {
		// alert("<?php //echo base_url(); ?>index.php/Menu/addclass");

		$.ajax({
        type: "POST",
        url: "<?php echo base_url(); ?>index.php/Menu/addclass",
		data :{"json":json,"item":item_name,"code":code,"cat":cat,"subcat":subcat},
        success: function(data){
        data=data.trim();
			//	alert(data);
		alert("تمت العملية بنجاح");
          location.href="<?php echo base_url(); ?>index.php/Menu/addclass";
                               }});
		
	 }


	 function full_next(x)
	 {
		 var hashxx=x.val();
		
		$.ajax({
        type: "POST",
        url: "<?php  echo site_url('Menu/get_sub_cat'); ?>",
		    data :{"hash":hashxx},
        success: function(data){
        data=data.trim();
			//	alert(data);
				$("#type").empty();
        var obj=JSON.parse(data);  
			  for(var i=0;i<obj.length;i++)
				{
       // alert(obj[i]["subcategory_name"]+" "+obj[i]["subcategory_hash"]);
			
			 $("#type").append("<option value='"+obj[i]["id"]+"'>"+obj[i]["subcategory_name"]+"</option>");
				} 
			 
    }});
	//	alert(x.val());

	 }
	</script>

</head> 
<body>
<a href="<?php echo site_url("Account/dashborad");  ?>">back</a>
<?php
if($edit=="1")
{
	foreach($class_one as $j)
	$item=$j->name;
	$code=$j->code;
	$category=$j->cat_id;
	$type=$j->sub_cat_id;
	$hash=$j->item_hash;
	$atter=$j->atter;
}
else
{
	$item="";
	$code="";
	$category="";
	$type="";
	$hash="";
	$atter="";
}
?>
<center>

<center> item name <input type="text" id="item" name="item" value="<?php echo $item; ?>"  /></center>
<br/>
<center> code number <input type="text" id="code" name="code" value="<?php echo $code; ?>"  /></center>
<br/>
<center> category <select name="category" id="category" onchange="full_next($(this))" required /><option>select one</option>
<?php
foreach($catigory as $cat)
{
	//echo $cat->id." ".$cat->subcategory_name;
	print'<option value="'.$cat->id.'">'.$cat->category_name.'</option>';
}
?>
</select>
</center>
<br/>
<center> sub category <select name="type" id="type" required /><option>select one</option>
<?php
foreach($sub_catigory as $cat)
{
	//echo $cat->id." ".$cat->subcategory_name;
	print'<option value="'.$cat->id.'">'.$cat->subcategory_name.'</option>';
}
?>
</select>
<script>
$("#type").val("<?php echo $type; ?>");
$("#category").val("<?php echo $category; ?>");
</script>
</center>

<br/>
<br/>





<?php
if($edit=="1")
{
	print'<table style="width:50%;"   id="attr">';
	$count=0;
						print'<tr>';
						foreach(json_decode($atter) as $key=>$value)
						{ 
						//alert($k->);
						print'<td><input type="text"  name="class" onkeyup="chanename($(this))" style="width:99%;" value="'.$key.'" /><button id="ddd" value="Add" onClick="atter($(this));">New Attr</button></td>';
						print'<td>';
						$count++;	
						print'<table id="tb'.$count.'"  style="width:100%;">';
						foreach($value as $v)
								{
								print'
								<tr><td><input type="text" name="class" style="width:99%;" value="'.$v.'" /></td><td><button id="any" onclick="remove($(this))">X</button></td></tr>
								';
								}
								print'</table>';
								print'<button  value="Add" onClick="add('.$count.');">Add Value</button>';
								print'</td>';
								print'</tr>';
						}  

}
else
{
print'
<table style="width:50%;"  id="attr">
<tr>
<td><input type="text"  name="class" onkeyup="chanename($(this))" style="width:99%;" /><button id="ddd" value="Add" onClick="atter($(this));">New Attr</button></td>
<td>
<table id="tb0"  style="width:100%;">
<tr><td><input type="text" name="class" style="width:99%;" /></td><td><button id="any" onclick="remove($(this))">X</button></td></tr>
</table>
<button  value="Add" onClick="add(0);">Add Value</button>
</td>

</tr>
</table>
';
}

?>






</table>
<script>
	 x=<?php echo $count; ?>

</script>
<br/>
<button  value="Add" onClick="get_all();">Save Item</button>
<br/>
<br/>
<hr/>
<table border=1>
<th>item name</th><th>code</th><th>action</th>
<?php
foreach($class as $i)
{
	print'<tr><td><center>'.$i->name.'</center></td><td><center>'.$i->code.'</center></td><td><center><a href="'.site_url("Menu/addclass/$i->item_hash").'">edit</a></center></td></tr>';
}

?>
</table>
 </form>
</center>

</body>
</html>