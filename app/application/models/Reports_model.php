<?php
class Reports_model extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        // $this->load->database('unimedica', TRUE);
        $this->load->library('session');
    }

    public function record_count_for_lab($search)
    {
        $this->db->select('count(*) as count');
        $this->db->from('lab_patient');
        $this->db->where('isdeleted', 0);
        $this->db->like('name', $search);
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0]['count'];
    }

    function getVisits()
    {
        $start = $this->input->post('start');
        $rowsPerPage = $this->input->post('length');
        $page = $start / $rowsPerPage;
        $search = $this->input->post('search')['value'];
        $startDate = $this->input->post('startDate') ?? Date('Y-m-d');
        $endDate = $this->input->post('endDate') ?? Date('Y-m-d');
        $doctor = $this->input->post('doctor');
        $user = $this->input->post('user');
        $count = $this->getVisitsCount($search, $startDate, $endDate, $doctor, $user);
        $this->db->select("
                p.name,
               ifnull(d.name,'لا يوجد طبيب') as doctor,
                visit_date,
                net_price,
                dicount,
                total_price
        ");
        $this->db->from('lab_visits v');
        $this->db->join('lab_doctor d', 'd.hash = v.doctor_hash', 'left');
        $this->db->join('lab_patient p', 'p.hash = v.visits_patient_id', 'left');
        $this->db->where('v.isdeleted', 0);
        $this->db->order_by('v.visit_date', 'DESC');
        $this->db->order_by('v.id', 'DESC');
        if ($search != '') {
            $this->db->like('v.name', $search);
        }
        if ($startDate != '') {
            $this->db->where('visit_date >=', $startDate);
        }
        if ($endDate != '') {
            $this->db->where('visit_date <=', $endDate);
        }
        if ($doctor != '') {
            $this->db->where('doctor_hash', $doctor);
        }
        $this->db->limit($rowsPerPage, $page);
        $query = $this->db->get();
        return array(
            "data" => $query->result_array(),
            "recordsTotal" => $count['count'],
            "recordsFiltered" => $count['count'],
            "total_price" => $count['total_price'],
            "net_price" => $count['net_price'],
            "dicount" => $count['dicount'],
            "startDate" => $startDate,
            "endDate" => $endDate
        );
    }

    public function getVisitsCount($search, $startDate, $endDate, $doctor, $user)
    {
        $this->db->select('count(*) as count,sum(total_price) as total_price');
        $this->db->select('sum(net_price) as net_price,sum(dicount) as dicount');
        $this->db->from('lab_visits');
        $this->db->where('isdeleted', 0);
        if ($search != '') {
            $this->db->like('name', $search);
        }
        if ($startDate != '') {
            $this->db->where('visit_date >=', $startDate);
        }
        if ($endDate != '') {
            $this->db->where('visit_date <=', $endDate);
        }
        if ($doctor != '') {
            $this->db->where('doctor_hash', $doctor);
        }
        $query = $this->db->get();
        $result = $query->result_array();
        return $result[0];
    }
}