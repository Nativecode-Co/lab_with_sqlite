<?php

// connect to sqlite ./application/databases/db.sqlite
$local_conn = new PDO('sqlite:./application/databases/db.sqlite');
$local_conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


if (!$local_conn) {
  echo json_encode(
    array(
      'status' => true,
      'data' => 'Local connection failed',
      'isAuth' => true
    ),
    JSON_UNESCAPED_UNICODE
  );
}


function offline_sync_query($db)
{
  $resultQueries = "";
  $query = "select table_name from offline_sync where sync=0 group by table_name;";
  $tables = $db->query($query)
    ->fetchAll(PDO::FETCH_OBJ);
  foreach ($tables as $table) {
    $query = "select query as hash,operation from offline_sync where sync=0 and table_name='" . $table->table_name . "';";
    $queries = $db->query($query)
      ->fetchAll(PDO::FETCH_OBJ);
    $insertHashes = array();
    $updateHashes = array();
    $deleteHashes = array();
    foreach ($queries as $query) {
      switch ($query->operation) {
        case 'insert':
          array_push($insertHashes, $query->hash);
          break;
        case 'update':
          array_push($updateHashes, $query->hash);
          break;
        case 'delete':
          array_push($deleteHashes, $query->hash);
          break;
        default:
          break;
      }
    }
    if (count($insertHashes) > 0) {
      // $result = $this->db->query("select * from $table->table_name where hash in ('" . implode("','", $insertHashes) . "');")->result();
      $query = "select * from $table->table_name where hash in ('" . implode("','", $insertHashes) . "');";
      $result = $db->query($query)
        ->fetchAll(PDO::FETCH_OBJ);
      $kays = array_keys((array) $result[0]);
      $index = array_search("id", $kays);
      if ($index !== false) {
        unset($kays[$index]);
      }
      $query = "insert into $table->table_name (" . implode(",", $kays) . ") values ";
      // use kyes to get values
      $values = array_map(function ($item) use ($kays) {
        $values = array();
        foreach ($kays as $key) {
          array_push($values, "'" . $item->$key . "'");
        }
        return "(" . implode(",", $values) . ")";
      }, $result);
      // delete last comma and add semicolon
      $query .= implode(",", $values);
      $query .= ";";
      $resultQueries .= $query;
    }
    if (count($updateHashes) > 0) {
      // $result = $this->db->query("select * from $table->table_name where hash in ('" . implode("','", $updateHashes) . "');")->result();
      $query = "select * from $table->table_name where hash in ('" . implode("','", $updateHashes) . "');";
      $result = $db->query($query)
        ->fetchAll(PDO::FETCH_OBJ);
      $query = "update $table->table_name set ";
      foreach ($result[0] as $key => $value) {
        $query .= "$key = '$value',";
      }
      $query = rtrim($query, ",");
      $query .= " where hash in ('" . implode("','", $updateHashes) . "');";
      $resultQueries .= $query;
    }
    if (count($deleteHashes) > 0) {
      // $result = $this->db->query("select * from $table->table_name where hash in ('" . implode("','", $deleteHashes) . "');")->result();
      $query = "select * from $table->table_name where hash in ('" . implode("','", $deleteHashes) . "');";
      $result = $db->query($query)
        ->fetchAll(PDO::FETCH_OBJ);
      $query = "delete from $table->table_name where hash in ('" . implode("','", $deleteHashes) . "');";
      $resultQueries .= $query;
    }
  }

  return $resultQueries;
}

$queries = offline_sync_query($local_conn);
echo json_encode(
  array(
    'status' => true,
    'message' => 'تمت إضافة المستخدم بنجاح',
    'data' => $queries,
    'isAuth' => true
  ),
  JSON_UNESCAPED_UNICODE
);
die();

// Remote database credentials
$remote_host = "account.native-code-iq.com";
$remote_username = "sync";
$remote_password = "labLab123@";
$remote_dbname = "unimedica_db";

// Check $queries not ""
if ($queries != "") {
  $remote_conn = mysqli_connect($remote_host, $remote_username, $remote_password, $remote_dbname);
  if (!$remote_conn) {
    die("Remote connection failed: " . mysqli_connect_error());
  }

  $query = "start transaction; " . $queries . " commit;";

  if (mysqli_query($remote_conn, $query)) {
    $query = "update offline_sync set sync=1;";
    $local_conn->query($query)
      ->fetchAll(PDO::FETCH_OBJ);
    echo json_encode(array("status" => "is done"), JSON_UNESCAPED_UNICODE);
  } else {
    echo json_encode(array("status" => mysqli_error($remote_conn)), JSON_UNESCAPED_UNICODE);
  }
  mysqli_close($remote_conn);

} else {
  echo json_encode(array("status" => "No records found in local table"), JSON_UNESCAPED_UNICODE);
  // echo "No records found in local table";
}
// stop local connection
$local_conn = null;
?>