<?php

class Visit extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('VisitModel');
    }

    function index()
    {
        $data = $this->VisitModel->get_visits();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function get_visits()
    {
        $req = $this->input->get();
        $data = $this->VisitModel->get_visits(203, $req["start"], $req["length"], $req["search"], 0);
        $total = $this->VisitModel->visit_count($req["search"], 0);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(
                json_encode(
                    array(
                        "total" => $total,
                        "data" => $data
                    )
                )
            );
    }

    function split_data()
    {
        $req = $this->input->post();
        $birth = get_birth_date($req["age_year"], $req["age_month"], $req["age_day"]);
        $visits_patient_id = $req["patient"] == "" ? create_hash() : $req["patient"];
        $patient_data = array(
            "name" => $req["name"],
            "birth" => $birth,
            "age_year" => $req["age_year"],
            "age_month" => $req["age_month"],
            "age_day" => $req["age_day"],
            "gender" => $req["gender"],
            "address" => $req["address"],
            "phone" => $req["phone"],
            "hash" => $visits_patient_id
        );
        $visit_hash = $req["visit_hash"] == "" ? create_hash() : $req["visit_hash"];
        $visit_data = array(
            "visits_patient_id" => $visits_patient_id,
            "visit_date" => $req["visit_date"],
            "doctor_hash" => $req["doctor_hash"],
            "visits_status_id" => 2,
            "note" => $req["note"],
            "total_price" => $req["total_price"],
            "dicount" => $req["dicount"],
            "net_price" => $req["net_price"],
            "hash" => $visit_hash
        );
        $tests = json_decode($req["tests"], true);
        return array(
            "tests" => $tests,
            "patient_data" => $patient_data,
            "visit_data" => $visit_data
        );
    }

    function create_visit()
    {
        $data = $this->split_data();
        $visit_hash = $this->VisitModel->create_visit($data);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($visit_hash));
    }

    function update_visit()
    {
        $data = $this->split_data();
        $visit_hash = $this->VisitModel->update_visit($data);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($visit_hash));
    }
}
