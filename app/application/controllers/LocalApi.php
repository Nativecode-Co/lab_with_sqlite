<?php

class LocalApi extends CI_Controller
{

    function __construct()
    {
        parent::__construct();
        $this->load->model('User_model');
        $this->load->helper('download');
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
        if (!$this->db->field_exists('history', 'lab_invoice')) {
            $this->db->query("ALTER TABLE lab_invoice ADD COLUMN history INTEGER NOT NULL DEFAULT 0;");
        }
        if (!$this->db->field_exists('show_name', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `show_name` INTEGER NOT NULL DEFAULT 0 ;");
        }
        if (!$this->db->field_exists('show_logo', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `show_logo` INTEGER NOT NULL DEFAULT 1 ;");
        }
        // barcode_width
        if (!$this->db->field_exists('barcode_width', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `barcode_width` INTEGER NOT NULL DEFAULT 80 ;");
        }
        // barcode_height
        if (!$this->db->field_exists('barcode_height', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `barcode_height` INTEGER NOT NULL DEFAULT 20 ;");
        }
        // barcode first_time
        if (!$this->db->field_exists('barcode_first_time', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `barcode_first_time` INTEGER NOT NULL DEFAULT 0 ;");
        }
    }

    public function getUserCount()
    {
        $userCount = $this->User_model->get_user_count();
        if ($userCount == 0) {
            $this->trancateLabTable();
        }
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

    public function trancateLabTable()
    {
        // trancate lab table
        $this->db->query("TRUNCATE lab;");
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
        $trancate = $this->input->post("trancate");
        // set sql mode 1
        $this->db->query("SET SQL_SAFE_UPDATES = 0;");
        $queries = json_decode($queries);
        foreach ($queries as $query) {
            if (isset($query)) {
                $this->db->query($query);
            }
        }
        if (!isset($trancate)) {
            $this->db->query("TRUNCATE offline_sync;");
        }
        // trancate offline_sync table
        if (isset($trancate) && $trancate == true) {
            $this->db->query("TRUNCATE offline_sync;");
        }
        $this->db->query("SET SQL_SAFE_UPDATES = 1;");

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


    public function getTestsQueries()
    {
        $queries = "";
        $lab_hash = $this->input->post('lab_id');
        $tests = $this->db->query("select test_name, test_type, option_test, hash, insert_record_date, isdeleted, short_name, sample_type, category_hash, sort from lab_test where hash NOT IN ('16708623707062301','360')")->result();

        if (count($tests) > 0) {
            $tests_query = "insert into lab_test(" . implode(",", array_keys((array) $tests[0])) . ", lab_hash) values ";
            $tests_values = array_map(function ($test) use ($lab_hash) {
                $option_test = $test->option_test;
                $option_test = str_replace('"', '\"', $option_test);
                $test->option_test = $option_test;
                $name = $test->test_name;
                $name = str_replace("'", "", $name);
                $test->test_name = $name;
                return "('" . implode("','", array_values((array) $test)) . "', '$lab_hash')";
            }, $tests);
            $tests_query .= implode(",", $tests_values);
            $queries .= $tests_query;
        } else {
            $tests_query = '';
        }

        if ($queries != '') {
            $token = $this->input->get_request_header('Authorization', TRUE);
            $token = str_replace("Bearer ", "", $token);

            $url = "http://umc.native-code-iq.com/app/index.php/Offline/insertIntoLab_test";
            $headers = [
                "Authorization: Bearer {$token}",
            ];

            // add lab_id to post data
            $data = array(
                'lab_id' => $lab_hash,
                'query' => $queries
            );

            $ch = curl_init($url);

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));

            $response = curl_exec($ch);

            if (curl_errno($ch)) {
                echo 'Error: ' . curl_error($ch);
            }

            curl_close($ch);
            echo json_encode(
                array(
                    'status' => true,
                    'data' => $response,
                    'message' => 'تمت إضافة الاختبارات بنجاح',
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
        } else {
            echo json_encode(
                array(
                    'status' => true,
                    'message' => 'لا يوجد بيانات',
                    'data' => null,
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
        }
    }


    public function createAfterInsertTrigger()
    {
        // create trigger for lab_visits AFTER INSERT if not exists
        $this->db->query(
            "CREATE TRIGGER lab_visits_AFTER_INSERT
        AFTER INSERT ON `lab_visits`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('lab_visits','insert',new.labId,last_query );
        
        END;"
        );
        $this->db->query(
            "CREATE TRIGGER lab_visits_tests_AFTER_INSERT
        AFTER INSERT ON `lab_visits_tests`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('lab_visits_tests','insert',new.lab_id,last_query);
        
        END;"
        );
        $this->db->query(
            "CREATE TRIGGER lab_visits_package_AFTER_INSERT
        AFTER INSERT ON `lab_visits_package`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('lab_visits_package','insert',new.lab_id,last_query);
        
        END;"
        );
        $this->db->query("CREATE TRIGGER lab_patient_AFTER_INSERT
        AFTER INSERT ON `lab_patient`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('lab_patient','insert',new.lab_id,last_query);
        
        END;");
        // add trigger for lab_test AFTER INSERT
        $this->db->query("CREATE TRIGGER lab_test_AFTER_INSERT
        AFTER INSERT ON `lab_test`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('lab_test','insert','0',last_query);
        
        END;");
        // add trigger for lab_test AFTER UPDATE
        $this->db->query("CREATE TRIGGER lab_test_AFTER_UPDATE
        AFTER UPDATE ON `lab_test`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('lab_test','update','0',last_query);
        
        END;");
        // add trigger for lab_test AFTER DELETE
        $this->db->query("CREATE TRIGGER lab_test_AFTER_DELETE
        AFTER DELETE ON `lab_test`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('lab_test','delete','0',last_query);
        
        END;");
        // add trigger for system_users AFTER INSERT
        $this->db->query("CREATE TRIGGER system_users_AFTER_INSERT
        AFTER INSERT ON `system_users`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('system_users','insert','0',last_query);
        
        END;");
        // add trigger for system_users AFTER UPDATE
        $this->db->query("CREATE TRIGGER system_users_AFTER_UPDATE
        AFTER UPDATE ON `system_users`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('system_users','update','0',last_query);
        
        END;");
        // add trigger for system_users AFTER DELETE
        $this->db->query("CREATE TRIGGER system_users_AFTER_DELETE
        AFTER DELETE ON `system_users`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('system_users','delete','0',last_query);
        
        END;");
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تم إنشاء الـtrigger',
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function deleteAfterInsertTrigger()
    {
        $this->db->query("DROP TRIGGER IF EXISTS `lab_visits_tests_AFTER_INSERT`;");
        $this->db->query("DROP TRIGGER IF EXISTS `lab_visits_AFTER_INSERT`;");
        $this->db->query("DROP TRIGGER IF EXISTS `lab_visits_package_AFTER_INSERT`;");
        $this->db->query("DROP TRIGGER IF EXISTS `lab_patient_AFTER_INSERT`;");
        $this->db->query("DROP TRIGGER IF EXISTS `lab_test_AFTER_INSERT`;");
        $this->db->query("DROP TRIGGER IF EXISTS `lab_test_AFTER_UPDATE`;");
        $this->db->query("DROP TRIGGER IF EXISTS `lab_test_AFTER_DELETE`;");
        $this->db->query("DROP TRIGGER IF EXISTS `system_users_AFTER_INSERT`;");
        $this->db->query("DROP TRIGGER IF EXISTS `system_users_AFTER_UPDATE`;");
        $this->db->query("DROP TRIGGER IF EXISTS `system_users_AFTER_DELETE`;");
        return true;
    }

    public function installTests()
    {
        $queries = "";
        $lab_hash = $this->input->post('lab_id');
        $token = $this->input->get_request_header('Authorization', TRUE);
        $token = str_replace("Bearer ", "", $token);

        $url = "http://umc.native-code-iq.com/app/index.php/Offline/installTests";
        $headers = [
            "Authorization: Bearer {$token}",
        ];
        $data = array(
            'lab_id' => $lab_hash,
        );

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            echo 'Error: ' . curl_error($ch);
        }

        curl_close($ch);
        if ($response == "" || $response == null || $response == "null") {
            echo json_encode(
                array(
                    'status' => false,
                    'message' => 'لا توجد نسخة احتياطية',
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
            exit();
        } else {
            $this->db->trans_start();
            $this->db->query("delete from lab_test");
            $this->db->query($response);
            // end transaction
            if ($this->db->trans_status() === FALSE) {
                // حدثت مشكلة خلال الـtransaction
                $result = false;
                $this->db->trans_rollback();
            } else {
                // تمت العمليات بنجاح
                $result = true;
                $this->db->trans_commit();
            }

            $this->db->trans_complete();
            if ($result) {
                echo json_encode(
                    array(
                        'status' => true,
                        'message' => 'تمت العملية بنجاح',
                        'isAuth' => true
                    ),
                    JSON_UNESCAPED_UNICODE
                );
            } else {
                echo json_encode(
                    array(
                        'status' => false,
                        'message' => 'حدث خطأ أثناء العملية',
                        'isAuth' => true
                    ),
                    JSON_UNESCAPED_UNICODE
                );
            }
        }
    }

    public function installTestsOrDefaults()
    {
        $queries = "";
        $lab_hash = $this->input->post('lab_id');
        $token = $this->input->get_request_header('Authorization', TRUE);
        $token = str_replace("Bearer ", "", $token);

        $url = "http://umc.native-code-iq.com/app/index.php/Offline/installTestsOrDefaults";
        $headers = [
            "Authorization: Bearer {$token}",
        ];
        $data = array(
            'lab_id' => $lab_hash,
        );

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            echo 'Error: ' . curl_error($ch);
        }
        curl_close($ch);
        if ($response == "" || $response == null || $response == "null") {
            echo json_encode(
                array(
                    'status' => false,
                    'message' => 'لا توجد نسخة احتياطية',
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
            exit();
        } else {
            $this->db->trans_start();
            $this->db->query("delete from lab_test");
            $this->db->query($response);
            // end transaction
            if ($this->db->trans_status() === FALSE) {
                // حدثت مشكلة خلال الـtransaction
                $result = false;
                $this->db->trans_rollback();
            } else {
                // تمت العمليات بنجاح
                $result = true;
                $this->db->trans_commit();
            }

            $this->db->trans_complete();
            if ($result) {
                echo json_encode(
                    array(
                        'status' => true,
                        'message' => 'تمت العملية بنجاح',
                        'isAuth' => true
                    ),
                    JSON_UNESCAPED_UNICODE
                );
            } else {
                echo json_encode(
                    array(
                        'status' => false,
                        'message' => 'حدث خطأ أثناء العملية',
                        'isAuth' => true
                    ),
                    JSON_UNESCAPED_UNICODE
                );
            }
        }
    }

    public function clean()
    {
        $this->db->query("call lab_clean()");
        $this->deleteAfterInsertTrigger();
        $this->db->query("TRUNCATE lab;");
        $this->db->query("TRUNCATE lab_test;");
        // DELETE FROM lab_doctor;
        // DELETE FROM lab_patient;
        // DELETE FROM lab_visits;
        // DELETE FROM lab_package;
        // DELETE FROM lab_pakage_tests;
        // DELETE FROM offline_sync;
        // DELETE FROM system_users;
        // DELETE FROM lab_visits_package;
        // DELETE FROM lab_visits_tests;
        // DELETE FROM lab_invoice_worker;
        // DELETE FROM lab_invoice;
        // DELETE FROM lab_expire;
        // ");
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
        // get path
        $path = getcwd();
        if (!file_exists("$path\uploads")) {
            mkdir("$path\uploads", 0777, true);
        }
        $path = $path . '/uploads/' . basename($url);
        shell_exec("chmod -R 777 /var/www/html/");
        // dwonload image from url to path

        $result = file_put_contents($path, file_get_contents($url), FILE_APPEND);
        $path = "http://localhost:8807/app/uploads/" . basename($url);
        $this->db->query("UPDATE lab_invoice SET logo = '$path' WHERE lab_hash = $lab_id");

        echo json_encode(
            array(
                'status' => 400,
                'message' => 'فشل تحميل الصورة',
                'data' => 'لا يمكنك تحميل الصورة',
                'isAuth' => $path
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

    public function openAnyDeskProgram()
    {
        // open anydesk program then end the response
        $path = 'c:\xampp\nircmd.exe exec  hide  "c:\xampp\tools\program\AnyDesk.exe"';
        $out = shell_exec("$path 2>&1");
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تم فتح برنامج AnyDesk',
                'data' => $out,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    //select insert_record_date as date from system_users_type order by id desc limit 1;
    public function get_last_update_date()
    {
        $date = $this->db->select("insert_record_date as date")->from("system_users_type")->order_by("id", "desc")->limit(1)->get()->row()->date;
        if (!(isset($date) && $date != null && $date != "")) {
            $date = "2023-01-01 00:00:00";
        }
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تاريخ اخر تحديث',
                'data' => $date,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function check_if_test_exit_by_name()
    {
        $names = $this->input->get('names');
        $tests = $this->db->select("test_name as name")->from("lab_test")->where("test_name in ('$names')")->group_by("test_name")->get()->result();
        $tests = array_map(function ($test) {
            return $test->name;
        }, $tests);
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تحقق من وجود الاختبار',
                'data' => $tests,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function get_dates_for_tests_to_check_update()
    {
        $hashes = $this->input->post('hashes');
        $dates = $this->db->
            // short_name as date if short_name is not empty else 2023-01-01 00:00:00
            select("
            case 
                when short_name != '' then short_name
                else '2023-01-01 00:00:00' 
            end as date,
            hash
        ")->from("lab_test")->where("hash in ('$hashes')")->get()->result();
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تاريخ اخر تحديث',
                'data' => $dates,
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }
}
