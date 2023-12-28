<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Login extends CI_Controller
{

    function __construct()
    {
        header('Access-Control-Allow-Origin: *');
        parent::__construct();
        $this->load->helper('url');
        $this->load->library('session');
        $this->load->model('Menu_db');
        $this->load->model('LabActivate');
        $this->load->library('pagination');
    }


    public function index()
    {
        echo "hello world";
        // $now = time();
        // $ten_minutes = $now + (10 * 60);
        // $startDate = date('m-d-Y H:i:s', $now);
        // $endDate = date('m-d-Y H:i:s', $ten_minutes);


        // $token=$this->jwt_enc(array("iss" => "http://example.org","aud" => "http://example.com","iat" => $startDate,"nbf" => $endDate));
        // print($token);
        // $decoded_array=$this->jwt_dec($token);
        // print_r($decoded_array);

    }

    public function check_user()
    {
        $set_full = $this->db->query("SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));");
        $username = $this->input->post("username");
        $password = $this->input->post("password");
        //die($username." xxx ".$password);
        if ($username != "" && $password != "") {

            $res = $this->Menu_db->check_user_info($username, $password);
            //die(print_r($res));

            if (isset($res["hash"])) {
                //$iat=time();
                //$exp=$iat+1;
                //$res["iat"]=$iat;
                // $res["nbf"]=$exp;

                $token = $this->jwt_enc($res);
                //echo $token;
                $res["token"] = $token;
                // $decoded_array=$this->jwt_dec($token);


                echo json_encode($res, JSON_UNESCAPED_UNICODE);


                // print_r($decoded_array);

            } else {
                echo json_encode(array("result" => "0"), JSON_UNESCAPED_UNICODE);
            }
        } else
            echo json_encode(array("result" => "0"), JSON_UNESCAPED_UNICODE);
    }
    // public function isJson($string) {
    //   json_decode($string);
    //   return json_last_error() === JSON_ERROR_NONE;
    // }
    // public function JSONTOInsertSQL($query){
    //     $obj=json_decode($query,JSON_UNESCAPED_UNICODE);
    //     //die(print_r($obj));

    //     foreach ($obj as $row)
    //     {
    //         if(is_array($row))
    //          $column=$row;
    //         else
    //          $table=$row;



    //       //echo "\n";
    //     }
    //   //die();
    //     $keys   = implode('`,`', array_map('addslashes', array_keys($column)));
    //     $values = implode("','", array_map('addslashes', array_values($column)));
    //     return "INSERT INTO $table ($keys) VALUES ('$values')";
    // }

    public function run_query()
    {
        $query = $this->input->post("query");
        $token = $this->input->post("token");

        //die($query);

        // if($this->isJson($query))
        //   $query=$this->JSONTOInsertSQL($query);

        //die($query);

        //die($query);
        $decoded_array = $this->jwt_dec($token);
        if ($decoded_array == 0) {
            echo json_encode(array("result" => "unauthorize"), JSON_UNESCAPED_UNICODE);
        } else {

            $lab_id = $decoded_array["lab_id"];
            $hash = $decoded_array["hash"];
            $res = $this->Menu_db->check_user_by_hash($hash, $lab_id);
            if ($res["hash"] != "") {
                $token = $this->jwt_enc($res);
                $res = $this->Menu_db->run_query($query, $res["hash"]);
            } else {
                echo json_encode(array("result" => "0"), JSON_UNESCAPED_UNICODE);
            }
            $expire = $this->LabActivate->check_expire($lab_id);
            if (!$expire) {
                echo json_encode(array(
                    "result" => "expire",
                    "hash" => $hash,
                    "lab_id" => $lab_id,
                    "token" => $token
                ), JSON_UNESCAPED_UNICODE);
                return;
            }
            echo json_encode(array("result" => $res, "hash" => $hash, "token" => $token), JSON_UNESCAPED_UNICODE);
        }
    }








    public function logout()
    {
        $token = $this->input->post("token");
        $type = "logout";
        $decoded_array = $this->jwt_dec($token, $type);
        if ($decoded_array == 0) {
            echo json_encode(array("result" => "unauthorize"), JSON_UNESCAPED_UNICODE);
        } else {

            $res = $this->Menu_db->check_user_by_hash($decoded_array["hash"]);
            if ($res["hash"] != "") {
                $token = $this->jwt_enc($res, -10000);
                echo json_encode(array("result" => "1", "token" => $token), JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(array("result" => "0"), JSON_UNESCAPED_UNICODE);
            }
        }
    }


    public function jwt_enc($data, $expir = "5000")
    {
        // die($expir);
        $iat = time();
        $exp = $iat + $expir;
        $data["iat"] = $iat;
        $data["exp"] = $exp;
        //die(print_r($data));
        $key = "@@redhaalasd2020@@";
        $payload = $data;
        $jwt = JWT::encode($payload, $key, 'HS256');
        return $jwt;
    }

    public function jwt_dec($token, $type = "normal")
    {
        //die("aaaa");
        try {
            $key = "@@redhaalasd2020@@";
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            $decoded_array = (array) $decoded;
            $exp = $decoded_array["exp"];
            $iat = time();
            //die($exp." x ".$iat." ".$type);
            if ($exp > $iat || $type == "logout")
                return $decoded_array;
            else
                return 0;
        } catch (Exception $e) {
            return 0;
        }
    }


    public function notiifcation()
    {

        //   $this->output->set_header('Content-Type: text/event-stream');
        //   $this->output->set_header('Cache-Control: no-cache');

        //  header("Content-Type: text/event-stream");
        //  header("Cache-Control: no-cache");




        $user_hash = $this->input->get("hash");
        // $user_hash="aaa";
        $time = date('r');
        echo "data: " . json_encode(array('user' => $time)) . "\n\n";
        flush();
    }


    public function send_whatsapp()
    {

        $number = $this->input->post("number");
        $msg = $this->input->post("msg");

        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => "https://api.ultramsg.com/instance15290/messages/chat",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_SSL_VERIFYPEER => 0,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => "token=lhqfikkm2n3uedfh&to=+964" . $number . "&body=" . $msg . "&priority=1&referenceId=",
            CURLOPT_HTTPHEADER => array(
                "content-type: application/x-www-form-urlencoded"
            ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err) {
            echo json_encode("cURL Error #:" . $err, JSON_UNESCAPED_UNICODE);
            //  echo "cURL Error #:" . $err;
        } else {
            //echo $response;
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        }
    }


    public function upload()
    {
        //die("aaa");
        $year = date('Y');
        $month = date('m');

        $hash_lab = $this->input->post("hash_lab");
        $token = $this->input->post("token");
        $name = $this->input->post("name");
        $folder_location = $this->input->post("folder_location");
        $countfiles = count($_FILES['files']['name']);
        $decoded_array = $this->jwt_dec($token);
        if ($decoded_array == 0) {
            echo json_encode(array("result" => "unauthorize"), JSON_UNESCAPED_UNICODE);
        } else {
            $res = $this->Menu_db->check_user_by_hash($decoded_array["hash"], $hash_lab);

            if (isset($res["hash"])) {
                $token = $this->jwt_enc($res);
                $upload_location = "uploads/" . $folder_location;
                $lastChar = substr($upload_location, -1);
                if ($lastChar != "/")
                    $upload_location = $upload_location . "/";

                if (!file_exists($upload_location)) { // create year folder
                    if (mkdir($upload_location, 0777, true)) {
                        fopen($upload_location . "/index.php", "w+");
                        $html = "<!DOCTYPE html><html><head><title>403 Forbidden</title></head><body><p>Directory access is forbidden.</p></body></html>";
                        file_put_contents($upload_location . "/index.php", $html);
                    }
                }
                // To store uploaded files path
                $files_arr = array();
                // Loop all files
                for ($index = 0; $index < $countfiles; $index++) {

                    if (isset($_FILES['files']['name'][$index]) && $_FILES['files']['name'][$index] != '') {
                        // File name
                        $filename = $name . "_" . $year . '-' . $month . '-' . $_FILES['files']['name'][$index];

                        // Get extension
                        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

                        // Valid image extension
                        //  $valid_ext = array("png","jpeg","jpg");

                        // Check extension
                        //  if(in_array($ext, $valid_ext)){

                        // File path
                        $path = $upload_location . $filename;

                        // Upload file
                        $flage = "";
                        if (move_uploaded_file($_FILES['files']['tmp_name'][$index], $path)) {
                            $files_arr[] = $path;
                            // $res=$this->Menu_db->add_attachment(base_url().$path,$hash);
                            $flage = 1;
                        } else {
                            $flage = 0;
                            break;
                        }




                        //  }
                    }
                }

                if ($flage)
                    echo json_encode(array("result" => $files_arr, "hash" => $decoded_array["hash"], "token" => $token), JSON_UNESCAPED_UNICODE);
                else
                    echo json_encode(array("result" => "0", "hash" => $decoded_array["hash"], "token" => $token), JSON_UNESCAPED_UNICODE);










                ////////////////////////////////////////////////////////////end main upload //////////////////////////////////////////////////////////////

                //  echo json_encode(array("result"=>$res,"hash"=>$decoded_array["hash"],"token"=>$token), JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(array("result" => "0"), JSON_UNESCAPED_UNICODE);
            }
        }
    }
}
