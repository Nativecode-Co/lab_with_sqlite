<?php
class DataModel extends CI_Model
{
    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->model('TubeModel');
        $this->load->model('TestAliasModel');
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

    public function insert_all($data)
    {
        foreach ($data as $key => $value) {
            $this->db->insert_batch($key, $value);
        }
    }
}
