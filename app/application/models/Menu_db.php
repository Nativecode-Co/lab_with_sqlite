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
		if (!$this->db->table_exists('lab_version')) {
			$this->db->query("CREATE TABLE `lab_version` (
                `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `version` int(255) NOT NULL,
                `isdeleted` tinyint(1) NOT NULL DEFAULT '0'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
			// insert default version
			$this->db->query("INSERT INTO `lab_version` (`id`, `version`, `isdeleted`) VALUES
                (1, 0, 0);");
		}
	}


	function check_user_info($uname, $password)
	{

		if ($uname != "" and $password != "") {
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

	function check_query_privilage($query, $hash = "")
	{
		return true;
	}



	function isJson($string)
	{
		json_decode($string);
		return json_last_error() === JSON_ERROR_NONE;
	}
	function JSONTOInsertSQL($query)
	{
		$obj = json_decode($query, JSON_UNESCAPED_UNICODE);
		$hash = "";
		$column = [];
		foreach ($obj as $key => $row) {
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
		}
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
		$hash = round(microtime(true) * 10000) . rand(0, 1000);
		$pieces = explode("values(", $query);
		$pieces[0] = trim($pieces[0]);
		$pieces[0] = substr($pieces[0], 0, -1);
		$pieces[0] = $pieces[0] . ",hash)";
		$pieces[1] = substr($pieces[1], 0, -1);
		$pieces[1] = $pieces[1] . ",'" . $hash . "')";
		$query = $pieces[0] . " values(" . $pieces[1];
		return $query . "@@@" . $hash;
	}



	function run_query($query = "", $hash = "")
	{
		$check = $this->db->query("SHOW COLUMNS FROM unimedica_db.lab_invoice LIKE 'setting';");
		$result = $check->row_array();
		if (empty($result)) {
			$this->db->query("ALTER TABLE unimedica_db.lab_invoice ADD COLUMN `setting` JSON NULL AFTER `font_color`;");
		}

		$insert_hash = "";
		if ($query != "") {
			if (strpos($query, ';') !== false && !strpos($query, '&nbsp;') !== false) { //هنا اذا اكو اكثر من كويري

				$pieces = explode(";", $query);

				$k = 0;
				$build_query = "";
				for ($i = 0; $i < count($pieces); $i++) {
					if (strpos($pieces[$i], 'values(') !== false || strpos($pieces[$i], 'VALUES(') !== false) //هنا حطيتا الشرط هنا علمود اجيك الكويري العادية هيه انسيرت اولا علمود اضيفلها هاش
					{
						$query_back_with_hash = $this->add_hash_to_insert($pieces[$i]);
						$query_back_with_hash = explode("@@@", $query_back_with_hash);
						$pieces[$i] = $query_back_with_hash[0];
						$insert_hash = $query_back_with_hash[1];
					}
					if ($this->isJson($pieces[$i])) {
						$build_query = $this->JSONTOInsertSQL($pieces[$i]);

						if (strpos($build_query, '@#$') !== false) //هنا حتى افصخ الراجع اذا جان بحالت الانسرت اخذ الهاش
						{
							$pieces[$i] = explode("@#$", $build_query)[0];
							$insert_hash = explode("@#$", $build_query)[1];
						} else
							$pieces[$i] = $build_query;
					}
					if ($pieces[$i] != "" && trim($pieces[$i]) != "") {
						if ((strpos($pieces[$i], 'select') !== false || strpos($pieces[$i], 'SELECT') !== false) && !(strpos(strtok($pieces[$i], " "), 'update') !== false || strpos(strtok($pieces[$i], " "), 'insert') !== false || strpos(strtok($pieces[$i], " "), 'delete') !== false) || strpos(strtok($pieces[$i], " "), 'set') !== false) {
							if ($this->check_query_privilage($pieces[$i], $hash)) //check for select
							{
								$res_select = $this->db->query($pieces[$i]);
								$res[$k] = array("query" . $k => $res_select->result());
							} else {
								$res[$k] = array("query" . $k => "-1");
							}
						} else {
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
		$res = $this->db->query($query);
		return 1;
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////


}