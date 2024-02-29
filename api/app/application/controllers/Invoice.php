<?php



class Invoice extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('InvoiceModel');
        $this->load->library('form_validation');
    }



    function index()
    {
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Welcome to the Invoice API")));
    }


    public function get_setting()
    {
        $data = $this->InvoiceModel->get_setting();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function set_setting()
    {
        $req = $this->input->post();
        $this->InvoiceModel->set_setting($req);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Setting updated")));
    }

}
