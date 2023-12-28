<?php
class Menu_db extends CI_Model
{

	function __construct()
	{
		parent::__construct();
		//  $this->load->helper('url');
		$this->load->database();
		$this->load->database('unimedica', TRUE);
		$this->load->library('session');
	}


	function check_user_info($uname, $password)
	{

		if ($uname != "" and $password != "") {
			//die("SELECT username,user_type,hash,name,lab_id  FROM `system_users` where username = '".$uname."' and password='".$password."' ;");
			$res = $this->db->query("SELECT username,user_type,hash,name,lab_id,(select logo from `lab_invoice` where lab_hash=system_users.lab_id) as logo,(select name from lab where id=system_users.lab_id) as lab_name FROM `system_users` where username = '" . $uname . "' and password='" . $password . "'  and is_deleted='0';");
			return $res->row_array();
		} else {
			return 0;
		}
	}


	function check_user_by_hash($hash = "", $hash_lab)
	{

		if ($hash != "") {
			//die("SELECT username,user_type,hash,name,lab_id FROM `system_users` where hash = '".$hash."' and lab_id='".$hash_lab."';");
			$res = $this->db->query("SELECT username,user_type,hash,name,lab_id FROM `system_users` where hash = '" . $hash . "' and lab_id='" . $hash_lab . "';");
			return $res->row_array();
		} else {
			return 0;
		}
	}

	// 	function get_privilage($hash="")
	// 	{
	// 	    if($hash!="")
	// 	    {
	// 	         //$res = $this->db->query("SELECT * FROM `system_put_role_to_users` inner join system_privilage_role on system_put_role_to_users.group_hash=system_privilage_role.group_hash where system_put_role_to_users.user_hash='".$hash."'");

	//               $res = $this->db->query(" SELECT system_privilage_role.id,system_privilage_role.group_hash,user_hash,table_name,select_op,update_op,insert_op,delete_op FROM `system_put_role_to_users` inner join system_privilage_role on system_put_role_to_users.group_hash=system_privilage_role.group_hash where system_put_role_to_users.user_hash='".$hash."'");

	//              return $res->result();  
	// 	    }
	// 	}

	function check_query_privilage($query, $hash = "")
	{
		return true;


		// if ($query != "" && trim($query) != "") {
		// 	//echo $query."---\n"; 
		// 	$role = false;
		// 	//die(print_r($privilate));
		// 	////get type of query
		// 	////end of get type of query
		// 	$query = trim(preg_replace('/[\t\n\r\s]+/', ' ', $query));
		// 	$pieces = explode(" ", $query);
		// 	$first_pice = trim($pieces[0]);
		// 	if ($first_pice == "select" || $first_pice == "SELECT" || $first_pice == "SET" || $first_pice == "set") {
		// 		$type = "select";
		// 		///////////////////get table
		// 		if ($first_pice == "SET" || $first_pice == "set") {
		// 			$query_split = explode("(", $query);
		// 			$query_split = explode(")", $query_split[1]);
		// 			//die($query_split[0]);
		// 			$new_query = $query_split[0];
		// 			$res1 = $this->db->query("explain " . $new_query);
		// 			//die(print_r($res->row_array()));


		// 		} else {
		// 			$res1 = $this->db->query("explain " . $query);   //to get table name from query
		// 			//die(print_r($res->row_array()));
		// 		}
		// 		/////////////////get table
		// 		$acc = "";
		// 		foreach ($res1->result() as $p) {
		// 			//   $acc=$acc.$p->table.","; 
		// 			$res = $this->db->query(" SELECT select_op FROM `system_put_role_to_users` inner join system_privilage_role on system_put_role_to_users.group_hash=system_privilage_role.group_hash where system_put_role_to_users.user_hash='" . $hash . "' and table_name='" . $p->table . "'");
		// 			$role = $res->row_array()["select_op"];
		// 			if ($role == "0")
		// 				break;
		// 			//else
		// 			//$role=1;

		// 		}
		// 		//$acc=substr_replace($acc ,"",-1);
		// 		//die($acc);


		// 		// print_r($res->row_array());
		// 		//$role=1;
		// 	} else
		//   if ($first_pice == "insert" || $first_pice == "INSERT") {
		// 		$type = "insert";
		// 		$second_piece = $pieces[2];
		// 		$second_piece = explode("(", $second_piece);
		// 		$res = $this->db->query(" SELECT insert_op FROM `system_put_role_to_users` inner join system_privilage_role on system_put_role_to_users.group_hash=system_privilage_role.group_hash where system_put_role_to_users.user_hash='" . $hash . "' and table_name='" . $second_piece[0] . "'");
		// 		$role = $res->row_array()["insert_op"];
		// 	} else
		//   if ($first_pice == "update" || $first_pice == "UPDATE") {
		// 		$type = "update";
		// 		$second_piece = $pieces[1];
		// 		//$second_piece = explode("(", $second_piece);
		// 		$res = $this->db->query(" SELECT update_op FROM `system_put_role_to_users` inner join system_privilage_role on system_put_role_to_users.group_hash=system_privilage_role.group_hash where system_put_role_to_users.user_hash='" . $hash . "' and table_name='" . $second_piece . "'");
		// 		$role = $res->row_array()["update_op"];


		// 		// $res = $this->db->query(" SELECT system_privilage_role.id,system_privilage_role.group_hash,user_hash,table_name,select_op,update_op,insert_op,delete_op FROM `system_put_role_to_users` inner join system_privilage_role on system_put_role_to_users.group_hash=system_privilage_role.group_hash where system_put_role_to_users.user_hash='".$hash."'");
		// 		// print($res->row_array());  
		// 	} else
		//   if ($first_pice == "delete" || $first_pice == "DELETE") {
		// 		$type = "delete";
		// 		$second_piece = $pieces[2];
		// 		//$second_piece = explode("(", $second_piece);
		// 		$res = $this->db->query(" SELECT delete_op FROM `system_put_role_to_users` inner join system_privilage_role on system_put_role_to_users.group_hash=system_privilage_role.group_hash where system_put_role_to_users.user_hash='" . $hash . "' and table_name='" . $second_piece . "'");
		// 		$role = $res->row_array()["delete_op"];
		// 		//echo $type." ".$role."\n";
		// 	}

		// 	return $role;   //if put $role true then all query is run successfully

		// } // end of main if condition



	}



	function isJson($string)
	{
		json_decode($string);
		return json_last_error() === JSON_ERROR_NONE;
	}
	function JSONTOInsertSQL($query)
	{
		// die("aaa");
		$obj = json_decode($query, JSON_UNESCAPED_UNICODE);
		//die(print_r($obj));
		$hash = "";
		$column = [];
		foreach ($obj as $key => $row) {

			//print($key);
			//echo "\n";
			if ($key == "action")
				$action = $row;
			else
				if ($key == "table")
					$table = $row;
				else
					if ($key == "column")
						$column = $row;
					else
						if ($key == "hash")
							$hash = $row;




			// if(is_array($row))
			//  $column=$row;
			// else
			//  $table=$row;



			//echo "\n";
		}
		//die();


		//if($column!="")
		$keys_col = implode(',', array_map('addslashes', array_keys($column)));
		$values = implode("','", array_map('addslashes', array_values($column)));

		if ($action == "insert" || $action == "INSERT") {
			$hash = round(microtime(true) * 10000) . rand(0, 1000);
			return "insert into $table($keys_col,hash) values('$values','$hash')" . "@#$" . $hash;
		} else
			if ($action == "update" || $action == "UPDATE") {
				$raw_update_query = "";
				$word_after_preprocess = "";
				$words = explode(",", $keys_col);
				$words_values = explode(",", $values);
				for ($k = 0; $k < count($words); $k++) {
					$word_after_preprocess = str_replace("'", "", $words_values[$k]);

					$raw_update_query .= $words[$k] . "='" . $word_after_preprocess . "',";
				}
				$raw_update_query = substr($raw_update_query, 0, -1);

				//   die($values." ______  ".$raw_update_query);
				return "update $table set $raw_update_query where hash='$hash'";
			} else
				if ($action == "delete" || $action == "DELETE")
					return "delete from $table where hash='$hash'";
				else
					if ($action == "select" || $action == "SELECT") {
						if (empty($column))
							$col = "*";
						else
							$col = $keys_col;

						if ($hash != "")
							$where = " where hash='$hash'";
						else
							$where = "";

						return "select $col from $table $where";
					}
	}


	function add_hash_to_insert($query)
	{
		//  die("xxxxx ".$query); 
		$hash = round(microtime(true) * 10000) . rand(0, 1000);

		$pieces = explode("values(", $query);

		// die($query." = ".$pieces[0]."  x  ".$pieces[1]);
		$pieces[0] = trim($pieces[0]);
		$pieces[0] = substr($pieces[0], 0, -1);
		$pieces[0] = $pieces[0] . ",hash)";
		$pieces[1] = substr($pieces[1], 0, -1);
		$pieces[1] = $pieces[1] . ",'" . $hash . "')";
		$query = $pieces[0] . " values(" . $pieces[1];
		//die($query);
		return $query . "@@@" . $hash;
	}



	function run_query($query = "", $hash = "")
	{
		$check = $this->db->query("SHOW COLUMNS FROM unimedica_db.lab_invoice LIKE 'setting';");
		$result = $check->row_array();
		// check if column setting is exist
		if (empty($result)) {
			$this->db->query("ALTER TABLE unimedica_db.lab_invoice ADD COLUMN `setting` JSON NULL AFTER `font_color`;");
		}

		$insert_hash = "";
		// $res=""; 
		//$privilate=$this->get_privilage($hash);


		//die($query);


		if ($query != "") {
			//die("aaaa");
			//    try
			//    {


			// die($query);
			if (strpos($query, ';') !== false && !strpos($query, '&nbsp;') !== false) { //هنا اذا اكو اكثر من كويري

				$pieces = explode(";", $query);

				$k = 0;
				//die($pieces[0]." ".$pieces[1]);
				$build_query = "";
				for ($i = 0; $i < count($pieces); $i++) {

					// print($pieces[$i]."\n");
					// //echo $pieces[$i]."\n";

					if (strpos($pieces[$i], 'values(') !== false || strpos($pieces[$i], 'VALUES(') !== false) //هنا حطيتا الشرط هنا علمود اجيك الكويري العادية هيه انسيرت اولا علمود اضيفلها هاش
					{
						// die("xx");
						$query_back_with_hash = $this->add_hash_to_insert($pieces[$i]);
						$query_back_with_hash = explode("@@@", $query_back_with_hash);
						$pieces[$i] = $query_back_with_hash[0];
						$insert_hash = $query_back_with_hash[1];
						//  die("aaab ".$pieces[$i]);
					}



					if ($this->isJson($pieces[$i])) //check if coming json
					{

						$build_query = $this->JSONTOInsertSQL($pieces[$i]);

						if (strpos($build_query, '@#$') !== false) //هنا حتى افصخ الراجع اذا جان بحالت الانسرت اخذ الهاش
						{
							$pieces[$i] = explode("@#$", $build_query)[0];
							$insert_hash = explode("@#$", $build_query)[1];
						} else
							$pieces[$i] = $build_query;
					}





					// die($pieces[$i]);

					//print($pieces[$i]."  xxx ".$insert_hash."\n");


					if ($pieces[$i] != "" && trim($pieces[$i]) != "") {
						//die("xxx");
						//if (strpos($pieces[$i], 'select') !== false&&!strpos($pieces[$i], '=(select') !== false) {
						//if (strpos($pieces[$i], 'select') !== false&&!strpos($pieces[$i], '@') !== false) {     
						if ((strpos($pieces[$i], 'select') !== false || strpos($pieces[$i], 'SELECT') !== false) && !(strpos(strtok($pieces[$i], " "), 'update') !== false || strpos(strtok($pieces[$i], " "), 'insert') !== false || strpos(strtok($pieces[$i], " "), 'delete') !== false) || strpos(strtok($pieces[$i], " "), 'set') !== false) { ///strtok take first word from stenince
							// print($i."  ".$pieces[$i]."\n");
							//check here

							//die("11");
							if ($this->check_query_privilage($pieces[$i], $hash)) //check for select
							{
								$res_select = $this->db->query($pieces[$i]);
								//$res[$k]=array("query".$k=>$res_select->row_array());
								$res[$k] = array("query" . $k => $res_select->result());
							} else {
								$res[$k] = array("query" . $k => "-1");
							}
						} else //check if insert update delete
						{
							//die("21");
							//check here
							if ($this->check_query_privilage($pieces[$i], $hash)) {
								$this->db->db_debug = false;
								if (!$this->db->query($pieces[$i])) {
									return array("query" . $k => $this->db->error());
								}
								$this->db->db_debug = true;

								if ($insert_hash != "") //هنا دااجيك اذا انسرت حتى ارج
									$res[$k] = array("query" . $k => $insert_hash);
								else
									$res[$k] = array("query" . $k => "1");
							} else {
								$res[$k] = array("query" . $k => "-1");
							}
						}
						$k++;
					}
					$build_query = "";
				}

				// if($insert_hash=="")  //هنا دااجيك اذا انسرت حتى ارجع هاش 
				return $res;
				// else
				// return $insert_hash;

			} else //هنا اذا اكو كويري وحدة
			{


				if (strpos($query, 'values(') !== false || strpos($query, 'VALUES(') !== false) //هنا حطيتا الشرط هنا علمود اجيك الكويري العادية هيه انسيرت اولا علمود اضيفلها هاش
				{
					$query = $this->add_hash_to_insert($query);
				}
				// die($query);
				if ((strpos($query, 'select') !== false || strpos($query, 'SELECT') !== false) && !(strpos(strtok($query, " "), 'update') !== false || strpos(strtok($query, " "), 'insert') !== false || strpos(strtok($query, " "), 'delete') !== false) || strpos(strtok($query, " "), 'set') !== false) { ///strtok take first word from stenince

					// echo $query."\n";
					if ($this->check_query_privilage($query, $hash)) //check for select
					{
						//die("1111111111x");
						$res = $this->db->query($query);
						//$res=array("query"=>$res->row_array());
						$res = array("query" => $res->result());
						//return $res->row_array();  
					} else {
						$res = array("query" => "-1");
					}
				} else //check if insert update delete
				{
					if ($this->check_query_privilage($query, $hash)) {
						//die($query);
						$res = $this->db->query($query);
						//$res=array("query"=>$res->row_array());
						// $res=array("query"=>$res->result());
						$res = array("query" => "1");
						//return 1;
					} else {
						//die("222222222");
						$res = array("query" => "-1");
					}
				}
				return $res;
			}
		} else
			return 0;
	}



	///////////////////////////////////////////////////////////////
	function dynamic_select($conditions = "", $table_name, $coloumns = "*")
	{
		$query = "SELECT   " . $coloumns . " FROM   " . $table_name;
		if ($conditions != "") {
			$flag = 0;
			foreach ($conditions as $key => $value) {

				if ($flag == 0) {
					$query = $query . " where " . $key . " = " . $value;
					$flag = 1;
				} else {
					$query = $query . " and " . $key . " = " . $value;
				}
			}
		}
		$res = $this->db->query($query);
		return $res->result();
	}

	////////////////////////////////////////////////////////////////////////////////////

	function dynamic_insert($columns = "", $table_name, $get_id = "0")
	{
		$hash_name = $table_name . "_hash";
		$columns[$hash_name] = round(microtime(true) * 10000) . rand(0, 1000);

		$columns['user_entry'] = $this->session->userdata('user_id');

		$query = "INSERT INTO  " . $table_name . " ( ";
		$query_2 = " ) VALUES ( ";
		$query_3 = "";
		$query_4 = ")";
		if ($columns != "") {
			$flag = 0;
			foreach ($columns as $key => $value) {

				if ($flag == 0) {
					$query = $query . " `" . $key . "`";
					$flag = 1;
					$query_3 = $query_3 . " '" . $value . "'";
				} else {
					$query = $query . " ,`" . $key . "`";
					$query_3 = $query_3 . " ," . $value;
				}
			}
			$query = $query . $query_2 . $query_3 . $query_4;
			//die($query);
			$res = $this->db->query($query);
			if ($get_id == 0)
				return 1;
			else
				return $this->db->insert_id();
		}
	}
	//////////////////////////////////////////////////////////////////////////////////
	function dynamic_update($columns = "", $table_name)
	{



		$columns['user_entry'] = $this->session->userdata('user_id');

		$query = "UPDATE  " . $table_name . " SET ";
		$flag = 0;
		foreach ($columns as $key => $value) {

			if ($flag == 0) {
				$query = $query . " `" . $key . "` = '" . $value . "'";

				$flag = 1;
			} else {
				$query = $query . " , `" . $key . "` = '" . $value . "'";
			}
		}


		$query = $query . " where " . $table_name . "_hash = " . $columns[$table_name . "_hash"];
		//die($query);
		$res = $this->db->query($query);

		return 1;
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////


}