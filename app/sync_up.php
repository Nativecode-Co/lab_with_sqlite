<?php


// run the query to get the offline sync queries
$ch = curl_init('http://localhost:8807/app/index.php/Offline_sync');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
$result = curl_exec($ch);
curl_close($ch);

// decode the json response
$result = json_decode($result, true);
if (isset($result['queries'])) {
  $queries = $result['queries'];

  // run the queries online as string
// start curl
  $ch = curl_init('http://umc.native-code-iq.com/app/index.php/offline/run_sync');
  // set the content type to x-www-form-urlencoded
  curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
  // set the request method to POST
  curl_setopt($ch, CURLOPT_POST, 1);
  // set the post data
  curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(array('queries' => $queries)));
  // return the response as a string
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  // execute the curl
  $result = curl_exec($ch);
  // close the curl
  curl_close($ch);
  echo $result;
  // update the offline sync table
  $ch = curl_init('http://localhost:8807/app/index.php/Offline_sync/update_sync');
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
  $result = curl_exec($ch);
  curl_close($ch);
  echo $result;
} else {
  echo "No queries to run";
}

?>