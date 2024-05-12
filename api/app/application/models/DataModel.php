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
        $aliases = $this->TestAliasModel->get_all_ids();
        $groups = $this->db
            ->select('hash')
            ->get('system_group_name')
            ->result();
        return array(
            'tubes' => $tubes,
            'aliases' => $aliases,
            'groups' => $groups,
        );
    }
}
