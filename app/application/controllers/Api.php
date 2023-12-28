<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Api extends CI_Controller
{

    function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->library('session');
        $this->load->model('Menu_db');
        $this->load->library('pagination');


        $this->name = $this->session->userdata('name');
        $this->id = $this->session->userdata('id');
        $this->idhash = $this->session->userdata('idhash');
        if ($this->name == "") {
            redirect('Login/logout');
        }
    }


    public function index()
    {
    }




    ////////////////////////////////////////////////////////////////////////user



    public function update_user()
    {
        $name = $this->input->post("name");
        $uname = $this->input->post("username");
        $password = $this->input->post("password");

        if ($name != "" && $uname != "" && $password != "") {

            $user_info = array("name" => $name, "username" => $uname, "password" => $password, "idhash" => $this->idhash);
            $this->Menu_db->update_user_info($user_info);


            echo json_encode(array("result" => "1"), JSON_UNESCAPED_UNICODE);
        }
    }




    public function dashborad()
    {

        die("is run");
    }

    public function get_information($employ_hash)
    {
        if ($employ_hash != "") {
            $res = $this->Menu_db->get_emp_details($employ_hash);

            echo json_encode($res, JSON_UNESCAPED_UNICODE);
        }
    }
    public function check_user_mobile()
    {
        $username = $this->input->post("username");
        $password = $this->input->post("password");
        // echo $username." ".$password;
        $array_info = array("uname" => $username, "password" => $password);
        $res = $this->Menu_db->check_emp_info($array_info);
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
    }


    public function send_vacation()
    {
        $dur = $this->input->post("dur");
        $date = $this->input->post("date");
        $date_end = $this->input->post("date_end");
        $note = $this->input->post("note");
        $idhash = $this->idhash;
        $arr = array("dur" => $dur, "date" => $date, "date_end" => $date_end, "note" => $note, "idhash" => $idhash, "eid" => $this->id);
        $res = $this->Menu_db->send_vacation($arr);
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
    }


    public function update_task()
    {
        $status = $this->input->post("status");
        $idhash = $this->input->post("idhash");

        $arr = array("status" => $status, "idhash" => $idhash);
        $res = $this->Menu_db->update_task($arr);
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
    }

    public function get_task()
    {
        //$eid=$this->input->post("eid"); 
        $eid = $this->id;
        $arr = array("eid" => $eid);
        $res = $this->Menu_db->get_task($arr);
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
    }
    public function get_attend_type()
    {
        $res = $this->Menu_db->get_attend_type($arr);
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
    }

    public function set_attend()
    {
        // $eid=$this->input->post("eid");
        $attend_type = $this->input->post("attend_type");
        $date_attend = $this->input->post("date_attend");
        $latitude = $this->input->post("latitude");
        $longitude = $this->input->post("longitude");
        $note = $this->input->post("note");

        $arr = array("eid" => $this->id, "attend_type" => $attend_type, "date_attend" => $date_attend, "latitude" => $latitude, "longitude" => $longitude, "note" => $note);

        $res = $this->Menu_db->set_attend($arr);
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
    }

    public function get_folder()
    {
        $eid = $this->id;
        $res = $this->Menu_db->get_folder($eid);
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
    }

    public function detail()
    {
        $hash = $this->input->get('hash');

        echo json_encode(array(
            'status' => true,
            'message' => 'success',
            'data' => $hash,
            'isAuth' => true
        ), JSON_UNESCAPED_UNICODE);
    }


    // Create Api for React App 

    public function jwt_enc($data, $expir = "1900")
    {
        $iat = time();
        $exp = $iat + $expir;
        $data["iat"] = $iat;
        $data["exp"] = $exp;
        $key = "@@redhaalasd2020@@";
        $payload = $data;
        $jwt = JWT::encode($payload, $key, 'HS256');
        return $jwt;
    }

    // check user token function 
    // to check if user is login or not
    public function check_user_token()
    {
        $token = $this->input->get_request_header('Authorization', TRUE);
        $token = explode(" ", $token)[1];
        $user = $this->db->get_where('system_users', ['token' => $token])->row_array();
        return ($user ? true : false);
    }

    // login function
    public function login()
    {
        // how access Access-Control-Allow-Origin 

        $username = $this->input->post('username');
        $password = $this->input->post('password');
        $data = $this->Menu_db->check_user_info($username, $password);
        if ($data) {
            $token = $this->jwt_enc($data);
            // how update token in User table
            $this->db->set('token', $token);
            $this->db->where('id', $data['id']);
            $this->db->update('system_users');
            // how update token in $data array
            $data['token'] = $token;
            echo json_encode(
                array(
                    'status' => true,
                    'message' => 'تم تسجيل الدخول بنجاح',
                    'data' => $data,
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
        } else {
            echo json_encode(
                array(
                    'status' => false,
                    'message' => 'خطأ في اسم المستخدم او كلمة المرور',
                    'data' => null,
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
        }
    }
}
