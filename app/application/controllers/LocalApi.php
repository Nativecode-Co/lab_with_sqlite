<?php

class LocalApi extends CI_Controller
{

    function __construct()
    {
        parent::__construct();
        $this->load->model('User_model');
        $this->load->database(); // Load the database library
        if (!$this->db->conn_id) {
            echo json_encode(
                array(
                    'status' => false,
                    'message' => 'عدد المستخدمين',
                    'data' => null,
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
            exit();
        }
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description, Authorization');
        // json response
        header('Content-Type: application/json');
    }

    public function getUserCount()
    {
        $userCount = $this->User_model->get_user_count();
        echo json_encode(
            array(
                'status' => true,
                'message' => 'عدد المستخدمين',
                'data' => $userCount,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
        die();
    }

    // add user
    public function addUser()
    {
        $data = array(
            'id' => $this->input->post('id'),
            'lab_id' => $this->input->post('lab_id'),
            'name' => $this->input->post('name'),
            'username' => $this->input->post('username'),
            'password' => $this->input->post('password'),
            'user_type' => $this->input->post('user_type'),
            'hash' => $this->input->post('hash'),
            'insert_record_date' => $this->input->post('insert_record_date'),
            'is_deleted' => $this->input->post('is_deleted'),
            'isIos' => $this->input->post('isIos'),
            'device_info' => $this->input->post('device_info'),
            'token' => $this->input->post('token'),
            'type2' => $this->input->post('type2'),
        );
        $insert = $this->User_model->add_user($data);
        $this->db->insert(
            'system_put_role_to_users',
            array(
                'group_hash' => $this->input->post('user_type'),
                'user_hash' => $this->input->post('hash'),
                'hash' => $this->input->post('hash')
            )
        );
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تمت إضافة المستخدم بنجاح',
                'data' => $data,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
        die();
    }

    public function run_queries()
    {
        $queries = $this->input->post("queries");
        $queries = json_decode($queries);
        // run all queries
        set_time_limit(500);
        foreach ($queries as $query) {
            if (isset($query)) {
                $this->db->query($query);
            }
        }
        // trancate offline_sync table
        $this->db->query('TRUNCATE TABLE offline_sync');
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
    }

    public function clean()
    {
        // CALL unimedica_db.lab_clean()
        $this->db->query('CALL lab_clean()');
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تنظيف البيانات',
                'data' => $this->db->affected_rows(),
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function downloadImage()
    {
        $lab_id = $this->input->post('lab_id');
        $url = $this->db->query("SELECT logo FROM lab_invoice WHERE lab_hash = $lab_id")->row()->logo;
        $local_host = $_SERVER['SERVER_NAME'];
        $img = '/var/www/html/app/uploads/' . basename($url);
        shell_exec("chmod -R 777 /var/www/html/");
        // check permission

        if (!is_writable($img)) {
            echo json_encode(
                array(
                    'status' => 400,
                    'message' => 'فشل تحميل الصورة',
                    'data' => 'لا يمكنك تحميل الصورة',
                    'isAuth' => false
                ),
                JSON_UNESCAPED_UNICODE
            );
            die();
        }
        file_put_contents($img, file_get_contents($url), FILE_APPEND);
        $this->db->query("UPDATE lab_invoice SET logo = 'http://$local_host/app/uploads/" . basename($url) . "' WHERE lab_hash = $lab_id");
        echo json_encode(
            array(
                'status' => $url,
                'message' => 'تحميل الصورة',
                'data' => $this->db->affected_rows(),
                'isAuth' => $img
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function update_expire()
    {
        $date = $this->input->post('date');
        $lab_id = $this->input->post('lab');
        if (!isset($date) || !isset($lab_id)) {
            echo json_encode(
                array(
                    'status' => 400,
                    'message' => 'فشل تحديث تاريخ الانتهاء',
                    'data' => 'الرجاء ادخال تاريخ الانتهاء ورقم المعمل',
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
            return;
        }
        $last_expire = $this->db->query("SELECT expire_date FROM lab_expire WHERE lab_id = '$lab_id'");
        if (isset($last_expire->row()->expire_date)) {
            $this->db->query("UPDATE lab_expire SET expire_date = '$date' where lab_id = '$lab_id'");
        } else {
            $this->db->query("INSERT INTO lab_expire (lab_id, expire_date,last_code,status,user_hash) VALUES ('$lab_id', '$date','0','1','0')");
        }
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تحديث تاريخ الانتهاء',
                'data' => $this->db->affected_rows(),
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }
}