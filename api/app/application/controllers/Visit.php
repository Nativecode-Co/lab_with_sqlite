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
        try {
            $data = $this->VisitModel->get_visits();
            if ($data === false) {
                throw new Exception('Error fetching visits');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($data));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
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
        if (!isset($data["name"]) && !isset($data["patient"])) {
            $error['name'] = "يجب ادخال اسم المريض او اختيار مريض";
        }
        $age_year = $data['age_year'];
        $age_month = $data['age_month'];
        $age_day = $data['age_day'];
        $age = get_age($age_year, $age_month, $age_day);
        if ($age <= 0) {
            $error['age'] = "العمر يجب ان يكون اكبر من صفر";
        }
        // $data['tests'] is string
        if (!is_array($data['tests'])) {
            $data['tests'] = json_decode($data['tests'], true);
        }
        if (count($data['tests']) == 0) {
            $error['tests'] = "يجب اختيار تحليل واحد على الاقل";
        }
        return $error;
    }

    function get_visits()
    {
        try {
            $req = $this->input->post();
            $data = $this->VisitModel->get_visits($req);
            if ($data === false) {
                throw new Exception('Error fetching visits');
            }
            $total = $this->VisitModel->visit_count($req);
            if ($total === false) {
                throw new Exception('Error fetching visit count');
            }
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
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    function get_visits_by_status()
    {
        try {
            $req = $this->input->post();
            $data = $this->VisitModel->get_visits_by_status($req);
            if ($data === false) {
                throw new Exception('Error fetching visits by status');
            }
            $total = $this->VisitModel->visit_count_by_status($req);
            if ($total === false) {
                throw new Exception('Error fetching visit count by status');
            }
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
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    function get_visits_report()
    {
        try {
            $req = $this->input->post();
            $data = $this->VisitModel->get_visits_report($req);
            if ($data === false) {
                throw new Exception('Error fetching visits report');
            }
            $total = $this->VisitModel->visit_count_report($req);
            if ($total === false) {
                throw new Exception('Error fetching visit count report');
            }
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
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    public function get_categories()
    {
        try {
            $data = $this->VisitModel->get_categories();
            if ($data === false) {
                throw new Exception('Error fetching categories');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($data));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    public function get_visit_form_data()
    {
        try {
            $data = $this->VisitModel->get_visit_form_data();
            if ($data === false) {
                throw new Exception('Error fetching visit form data');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($data));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    public function get_tests_and_packages()
    {
        try {
            $data = $this->VisitModel->get_tests_and_packages();
            if ($data === false) {
                throw new Exception('Error fetching tests and packages');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($data));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    function create_visit()
    {
        try {
            $req = $this->input->post();
            $valid = $this->form_validation->set_data($req)->run('visit');
            $error = $this->validData($req);
            if (!$valid || count($error) > 0) {
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
            if ($visit_hash === false) {
                throw new Exception('Error creating visit');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($visit_hash));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    function update_visit()
    {
        try {
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
                )->set_rules(
                    'hash',
                    'hash',
                    'required|numeric',
                    array(
                        'required' => 'هذا الحقل مطلوب',
                        'numeric' => 'يجب ادخال قيمة رقمية'
                    )
                )->run('visit');
            $error = $this->validData($req);
            if (!$valid || count($error) > 0) {
                $errors = $this->form_validation->error_array();
                $errors = array_merge($errors, $error);
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode($errors));
                return;
            }
            $data = split_data($req);
            $result = $this->VisitModel->update_visit($data);
            if ($result === false) {
                throw new Exception('Error updating visit');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($data));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    function get_visit()
    {
        try {
            $hash = $this->input->get("hash");
            $valid = $this->form_validation
                ->set_data(array('hash' => $hash))
                ->set_rules(
                    'hash',
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
            if ($data === false) {
                throw new Exception('Error fetching visit');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($data));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    public function get_id_by_hash()
    {
        try {
            $hash = $this->input->get("hash");
            $data = $this->VisitModel->get_id_by_hash($hash);
            if ($data === false) {
                throw new Exception('Error fetching ID by hash');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($data));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    function saveTestResult()
    {
        try {
            $data = $this->input->post();
            $result = $this->VisitModel->saveTestResult($data);
            if ($result === false) {
                throw new Exception('Error saving test result');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($result));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    function saveTestsResult()
    {
        try {
            $data = $this->input->post("data");
            $data = json_decode($data, true);
            $visit_hash = $this->input->post("visit_hash");
            $result = $this->VisitModel->saveTestsResult($data, $visit_hash);
            if ($result === false) {
                throw new Exception('Error saving tests result');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($result));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    public function update_invoice()
    {
        try {
            $data = $this->input->post();
            $lab_hash = $data['lab_hash'];
            unset($data['lab_hash']);
            $result = $this->VisitModel->update_invoice($data, $lab_hash);
            if ($result === false) {
                throw new Exception('Error updating invoice');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($result));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    public function delete_visit()
    {
        try {
            $hash = $this->input->post("hash");
            $result = $this->VisitModel->delete_visit($hash);
            if ($result === false) {
                throw new Exception('Error deleting visit');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($result));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    public function update_visit_status()
    {
        try {
            // validate data
            $valid = $this->form_validation
                ->set_data($this->input->post())
                ->set_rules(
                    'hash',
                    'hash',
                    'required',
                    array(
                        'required' => 'هذا الحقل مطلوب'
                    )
                )
                ->set_rules(
                    'status',
                    'status',
                    'required',
                    array(
                        'required' => 'هذا الحقل مطلوب'
                    )
                )
                ->run();
            // check validation
            if (!$valid) {
                $errors = $this->form_validation->error_array();
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode($errors));
                return;
            }
            $hash = $this->input->post("hash");
            $status = $this->input->post("status");
            $result = $this->VisitModel->update_visit_status($hash, $status);
            if ($result === false) {
                throw new Exception('Error updating visit status');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($result));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    function get_visit_status()
    {
        try {
            $data = $this->VisitModel->get_visit_status();
            if ($data === false) {
                throw new Exception('Error fetching visit status');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($data));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }

    public function get_visits_mobile()
    {
        try {
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
            $status = isset($req['status']) ? $req['status'] : "";
            $data = $this->VisitModel->get_visits_mobile($page, $search, $status);
            if ($data === false) {
                throw new Exception('Error fetching mobile visits');
            }
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($data));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(array('error' => $e->getMessage())));
        }
    }
}
