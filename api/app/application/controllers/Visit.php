<?php

class Visit extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->helper('visit');
        $this->load->model('VisitModel');
        $this->load->library('Session'); 
        $this->load->library('form_validation');
    }

    function index()
    {
        $data = $this->VisitModel->get_visits();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function validData($data)
    {
        $error = array();
        // check visit date is date
        $date = $data['visit_date'];
        $newDate = date("Y-m-d", strtotime($date));
        if ($newDate != $date) {
            $error['visit_date'] = "التاريخ غير صحيح";
        }
        if(!isset($data["name"]) && !isset($data["patient"])){
            $error['name'] = "يجب ادخال اسم المريض او اختيار مريض";
        }
        $age_year = $data['age_year'];
        $age_month = $data['age_month'];
        $age_day = $data['age_day'];
        $age = get_age($age_year, $age_month, $age_day);
        if($age <= 0)
        {
            $error['age'] = "العمر يجب ان يكون اكبر من صفر";
        }
        // $data['tests'] is string
        if(!is_array($data['tests'])){
            $data['tests'] = json_decode($data['tests'], true);
        }
        if(count($data['tests']) == 0){
            $error['tests'] = "يجب اختيار تحليل واحد على الاقل";
        }
        return $error;
    }

    function get_visits()
    {
        $req = $this->input->post();
        $data = $this->VisitModel->get_visits($req);
        $total = $this->VisitModel->visit_count($req);
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

    function get_visits_report()
    {
        $req = $this->input->post();
        $data = $this->VisitModel->get_visits_report($req);
        $total = $this->VisitModel->visit_count_report($req);
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
    

    public function get_visit_form_data()
    {
        // get session data
        // $session_data = $this->session->userdata('user');
        // die(json_encode($session_data));
        $data = $this->VisitModel->get_visit_form_data();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function get_tests_and_packages()
    {
        $data = $this->VisitModel->get_tests_and_packages();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }
    function create_visit()
    {
        $req = $this->input->post();
        $valid = $this->form_validation->
            set_data($req)->
            run('visit');
        $error = $this->validData($req);
        if (!$valid|| count($error) > 0) {
            $errors = $this->form_validation->error_array();
            // merge errors
            $errors = array_merge($errors, $error);
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors));
            return;
        }
        
        $data = split_data($req);
        $visit_hash = $this->VisitModel->create_visit($data);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($visit_hash));
    }

    function update_visit()
    {
        $req = $this->input->post();
        $valid = $this->form_validation
        ->set_data($req)
        ->set_rules(
                'patient',
                'patient',
                'required|numeric',
                array(
                    'required' => 'هذا الحقل مطلوب',
                    'numeric' => 'يجب ادخال قيمة رقمية'
                )
            )->
            set_rules(
                'hash',
                'hash',
                'required|numeric',
                array(
                    'required' => 'هذا الحقل مطلوب',
                    'numeric' => 'يجب ادخال قيمة رقمية'
                )
            )->
            run('visit');
            $error = $this->validData($req);
        if (!$valid || count($error) > 0){
            $errors = $this->form_validation->error_array();
            $errors = array_merge($errors, $error);
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors));
            return;
        }
        $data = split_data($req);
        $this->VisitModel->update_visit($data);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function get_visit()
    {
        $hash = $this->input->get("hash");
        $valid = $this->form_validation
        ->set_data(array('hash' => $hash))
        ->set_rules('hash',
                    'hash',
                    'required|numeric',
                    array(
                        'required' => 'هذا الحقل مطلوب',
                        'numeric' => 'يجب ادخال قيمة رقمية'
                    )
        )
        ->run();
        if (!$valid) {
            $errors = $this->form_validation->error_array();
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors));
            return;
        }
                
        $data = $this->VisitModel->get_visit($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function saveTestResult()
    {
        $data = $this->input->post();
        $visit_hash = $this->VisitModel->saveTestResult($data);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($visit_hash));
    }

    function saveTestsResult()
    {
        $data = $this->input->post("data");
        $data = json_decode($data, true);
        $visit_hash = $this->input->post("visit_hash");
        $visit_hash = $this->VisitModel->saveTestsResult($data, $visit_hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function update_invoice()
    {
        $data = $this->input->post();
        $lab_hash = $data['lab_hash'];
        unset($data['lab_hash']);
        $visit_hash = $this->VisitModel->update_invoice($data, $lab_hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function delete_visit()
    {
        $hash = $this->input->post("hash");
        $data = $this->VisitModel->delete_visit($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function update_visit_status()
    {
        $hash = $this->input->post("hash");
        $status = $this->input->post("status");
        $data = $this->VisitModel->update_visit_status($hash, $status);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    public function get_visits_mobile()
    {
        $req = $this->input->get();
        // validate data
        $valid = $this->form_validation
        ->set_data($req)
        ->set_rules(
            'page',
            'page',
            'required|numeric',
            array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        )
        ->run();
        
        if (!$valid) {
            $errors = $this->form_validation->error_array();
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors));
            return;
        }
        $page = $req['page'];
        $search = isset($req['search']) ? $req['search'] : "";
        $data = $this->VisitModel->get_visits_mobile($page, $search);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }
}
