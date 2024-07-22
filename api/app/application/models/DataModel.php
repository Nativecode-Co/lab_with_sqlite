<?php

use function PHPSTORM_META\type;

class DataModel extends CI_Model
{
    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->model('TubeModel');
        $this->load->model('TestAliasModel');
        $this->load->model('DoctorsModel');
        $this->load->model('InvoiceModel');
        $this->load->model('PatientModel');
        $this->load->model('TestsModel');
        $this->load->model('UsersModel');
        $this->load->model('VisitModel');
        $this->load->model('VisitTestModal');
        $this->load->model('WorkersModel');
        $this->load->model('MainTestsModel');
    }

    public function check_data()
    {
        $tubes = $this->TubeModel->get_all_ids();
        $tube_tests = $this->TubeModel->get_all_tube_tests();
        $aliases = $this->TestAliasModel->get_all_ids();
        $groups = $this->db
            ->select('id')
            ->get('system_group_name')
            ->result();
        $groups = array_map(function ($group) {
            return $group->id;
        }, $groups);
        return array(
            'tube' => $tubes,
            'test_alias' => $aliases,
            'system_group_name' => $groups,
            'tube_test' => $tube_tests
        );
    }

    public function check_tests()
    {
        $tests = $this->db->select('hash')->get('lab_test')->result();
        $tests = array_map(function ($test) {
            return $test->hash;
        }, $tests);
        return $tests;
    }

    public function insert_all($data)
    {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                switch ($key) {
                    case 'tube':
                        $this->TubeModel->insert_batch($value);
                        break;
                    case 'test_alias':
                        $this->TestAliasModel->insert_batch($value);
                        break;
                    case 'system_group_name':
                        $this->db->insert_batch('system_group_name', $value);
                        break;
                    case 'tube_test':
                        $this->TubeModel->insert_batch_tests($value);
                        break;
                    case 'lab_test':
                        $this->MainTestsModel->insert_batch($value);
                        break;
                    default:
                        break;
                }
            }
            return array("success" => true);
        }

        return array("error" => "Data is not an array");
    }

    public function insert_lab_data($data)
    {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                switch ($key) {
                    case 'lab':
                        $this->db->insert_batch('lab', $value);
                        break;
                    case 'lab_doctor':
                        $this->DoctorsModel->insert_batch($value);
                        break;
                    case 'lab_invoice':
                        $this->InvoiceModel->insert_batch($value);
                        break;
                    case 'lab_invoice_worker':
                        $this->WorkersModel->insert_batch($value);
                        break;
                    case 'lab_package':
                        $this->TestsModel->insert_batch($value);
                        break;
                    case 'lab_pakage_tests':
                        $this->TestsModel->insert_batch_tests($value);
                        break;
                    case 'lab_patient':
                        $this->PatientModel->insert_batch($value);
                        break;
                    case 'lab_visits':
                        $this->VisitModel->insert_batch($value);
                        break;
                    case 'lab_visits_package':
                        $this->VisitTestModal->insert_batch_package($value);
                        break;
                    case 'lab_visits_tests':
                        $this->VisitTestModal->insert_batch($value);
                        break;
                    case 'system_users':
                        $this->UsersModel->insert_batch($value);
                        break;
                    case 'lab_test':
                        $this->MainTestsModel->insert_batch($value);
                        break;
                    default:
                        break;
                }
            }
            return true;
        }
        return false;
    }

    public function get_smallest_id()
    {
        $tables = array(
            'lab',
            'lab_patient',
            'lab_visits',
            'lab_visits_package',
            'lab_visits_tests',
        );
        $data = array();
        foreach ($tables as $table) {
            // get smallest id
            $this->db->select('id')->order_by('id', 'ASC')->limit(1);
            $data[$table] = $this->db->get($table)->row_array()['id'];
        }
        return $data;
    }
}
