<?php



class Users extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('UsersModel');
        $this->load->library('form_validation');
    }



    function index()
    {
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("message" => "Welcome to the users API")));
    }


    function get_users()
    {
        $req = $this->input->post();
        $data = $this->UsersModel->get_all($req);
        $total = $this->UsersModel->count_all($req);
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

    function get_user()
    {
        $hash = $this->input->get('hash');
        $data = $this->UsersModel->get($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function create_user()
    {
        $req = $this->input->post();
        $valid = $this->form_validation->set_data($req)->run('users');
        if (!$valid) {
            $errors = $this->form_validation->error_array();
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors));
            return;
        };
        $data = $this->UsersModel->insert($req);
        $this->output
            ->set_status_header(201)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function update_user()
    {
        $req = $this->input->post();
        $this->form_validation->set_data($req);

        $valid = $this->form_validation->set_data($req)->set_rules(
                'hash',
                'hash',
                'required|numeric',
                array(
                    'required' => 'هذا الحقل مطلوب',
                    'numeric' => 'يجب ادخال قيمة رقمية'
                )
            )->run('users');
        if (!$valid) {
            $errors = $this->form_validation->error_array();
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode($errors));
            return;
        }
        $hash = $req['hash'];
        unset($req['hash']);
        $data = $this->UsersModel->update($hash, $req);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    function delete_user()
    {
        $hash = $this->input->post('hash');
        $this->UsersModel->delete($hash);
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode(array("hash" => $hash)));
    }

    public function get_today_incomes_data()
    {
        $data = $this->UsersModel->get_today_incomes_data();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }

    // groups
    public function get_groups()
    {
        $data = $this->UsersModel->get_groups();
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($data));
    }
}
