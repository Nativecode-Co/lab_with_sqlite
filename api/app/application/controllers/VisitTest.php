<?php



class VisitTest extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('VisitTestModal');
        $this->load->library('form_validation');
    }



    function index()
    {
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Welcome to the workers API")));
    }


    function get_tests()
    {
        $req = $this->input->post();
        $data = $this->VisitTestModal->get_all($req);
        $total = $this->VisitTestModal->count_all($req);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(
                json_encode(
                    array(
                        "recordsTotal" => $total,
                        "recordsFiltered" => $total,
                        "data" => $data
                    )
                )
            );
    }

}
