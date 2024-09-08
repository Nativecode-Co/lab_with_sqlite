<?php
class DataModel extends CI_Model
{
    function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    // tables 
    private  $tables = array(
        "lab" => "id",
        "lab_doctor" => "lab_id",
        "lab_invoice" => "lab_hash",
        "lab_invoice_worker" => "lab_hash",
        "lab_package" => "lab_id",
        "lab_pakage_tests" => "lab_id",
        "lab_patient" => "lab_id",
        "lab_visits" => "labId",
        "lab_visits_package" => "lab_id",
        "lab_visits_tests" => "lab_id",
        "lab_test" => "lab_hash",
        "system_users" => "lab_id",
        "lab_expire" => "lab_id",
        "device_connecteds" => "lab_hash"
    );

    public function get_lab_id($username, $password)
    {
        $this->db->select('lab_id');
        $this->db->where('username', $username);
        $this->db->where('password', $password);
        $this->db->where('is_deleted', 0);
        $this->db->limit(1);
        $query = $this->db->get('system_users');
        if ($query->num_rows() > 0) {
            return $query->row()->lab_id;
        }
        return false;
    }

    public function get_new_data($data)
    {
        $all = array();
        foreach ($data as $key => $value) {
            if (is_array($value) && count($value) > 0) {
                $selectedData = $this->db->where_not_in('id', $value)->get($key);
                if ($selectedData->num_rows() > 0) {
                    $all[$key] = $selectedData->result_array();
                }
            } else {
                $selectedData = $this->db->get($key);
                if ($selectedData->num_rows() > 0) {
                    $all[$key] = $selectedData->result_array();
                }
            }
        }
        return $all;
    }

    public function get_new_tests($data)
    {
        $all = array();
        $selectedData = $this->db->select('test_name,updated_at, test_type, option_test, hash, insert_record_date, isdeleted, short_name, sample_type, category_hash, sort')
            ->where_not_in('hash', $data)
            ->where('lab_hash', null)
            ->get('lab_test');
        if ($selectedData->num_rows() > 0) {
            $all['lab_test'] = $selectedData->result_array();
        }
        return $all;
    }

    public function get_updated_tests()
    {
        return $this->db->select('test_name,updated_at, test_type, option_test, hash, insert_record_date, isdeleted, short_name, sample_type, category_hash, sort')
            ->where('lab_hash', null)
            ->where("sync", 2)
            ->get('lab_test')->result_array();
    }


    public function get_lab_data($lab_id)
    {
        $data = array();
        foreach ($this->tables as $key => $value) {
            if ($key == "lab") {
                $this->db->select('id, region_id, class_id, type, certification_id, hash, name, phone, owner, email, user_id, attachment, checked, is_blackList, is_active, is_deleted, date, updated_at');
            }
            if ($key == "lab_test") {
                $this->db->select('id, test_name, test_type, option_test, hash, insert_record_date, isdeleted, short_name, sample_type, category_hash, sort');
            }
            if ($key == "system_users") {
                $this->db->select('id, lab_id, name, username, password, user_type, hash, insert_record_date, is_deleted,type2');
                // user type not 3
                $this->db->where('user_type !=', "3");
            }
            // lab_patient, lab_visits, lab_visits_tests, lab_visits_package
            if ($key == "lab_patient" || $key == "lab_visits" || $key == "lab_visits_tests" || $key == "lab_visits_package") {
                // insert_record_date is this month
                $this->db->where("insert_record_date >=", date('Y-m-01 00:00:00'));
            }
            // order by id
            $this->db->order_by('id', 'asc');
            $selectedData = $this->db->where($value, $lab_id)->get($key);
            if ($selectedData->num_rows() > 0) {
                $data[$key] = $selectedData->result_array();
            } else {
                $data[$key] = [];
            }
        }
        return $data;
    }

    public function insertTestsForLab($lab_id)
    {
        // lab_test where lab_hash is lab_id
        $count = $this->db->where('lab_hash', $lab_id)->count_all_results('lab_test');
        if ($count > 0) {
            return false;
        }
        $tests = $this->db->query("select * from lab_test where lab_hash is null;")->result_array();
        $tests = array_map(function ($test) use ($lab_id) {
            // delete id
            unset($test['id']);
            $test['lab_hash'] = $lab_id;
            $test['insert_record_date'] = date('Y-m-d H:i:s');
            $test['isdeleted'] = 0;
            $option_test = $test['option_test'];
            $test['option_test'] = json_decode(json_encode($option_test), true);

            return $test;
        }, $tests);
        $result = $this->db->insert_batch('lab_test', $tests);
        return $result;
    }

    // install rest of the data for lab_patient, lab_visits, lab_visits_tests, lab_visits_package
    public function install_rest($lab_id, $patient, $visit, $visit_test, $visit_package)
    {
        $data = array();
        foreach ($this->tables as $key => $value) {
            // only lab_patient, lab_visits, lab_visits_tests, lab_visits_package
            if ($key == "lab_patient" || $key == "lab_visits" || $key == "lab_visits_tests" || $key == "lab_visits_package") {
                if ($key == "lab_patient") {
                    $this->db->where("id <", $patient);
                }
                if ($key == "lab_visits") {
                    $this->db->where("id <", $visit);
                }
                if ($key == "lab_visits_tests") {
                    $this->db->where("id <", $visit_test);
                }
                if ($key == "lab_visits_package") {
                    $this->db->where("id <", $visit_package);
                }
                $this->db->order_by('id', 'desc');
                // limit 1000
                $this->db->limit(1000);
                $selectedData = $this->db->where($value, $lab_id)->get($key);
                if ($selectedData->num_rows() > 0) {
                    $data[$key] = $selectedData->result_array();
                } else {
                    $data[$key] = [];
                }
            }
        }
        return $data;
    }
}
