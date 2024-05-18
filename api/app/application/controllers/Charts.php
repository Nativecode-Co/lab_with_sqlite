<?php



class Charts extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('ChartModal');
    }

    function visit_count()
    {
        $type = $this->input->get('type');
        $gender = $this->input->get('gender');
        $age = $this->input->get('age');
        $data = $this->ChartModal->visit_count($type, $gender, $age);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }
}
