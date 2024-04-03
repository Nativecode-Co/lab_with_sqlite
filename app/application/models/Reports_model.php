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
        $params = $this->input->post();
        $start = $params['start'];
        $rowsPerPage = $params['length'];
        $page = $start / $rowsPerPage;
        $searchText = $params['search']['value'];
        $startDate = $params['startDate'] ?? Date('Y-m-d');
        $endDate = $params['endDate'] ?? Date('Y-m-d');
        $doctor = $params['doctor'];
        $user = $params['user'];
        $count = $this->getVisitsCount($searchText, $startDate, $endDate, $doctor, $page, $rowsPerPage);
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
        if ($searchText != '') {
            $this->db->like('v.name', $searchText);
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
        $this->db->limit($rowsPerPage, $page * $rowsPerPage);
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

    public function getVisitsCount($search, $startDate, $endDate, $doctor = '', $page = 0, $rowsPerPage = 10)
    {
        // get count of all visits not prices total
        $this->db->select('count(*) as count');
        $this->db->from('lab_visits v');
        $this->db->where('v.isdeleted', 0);
        $this->db->order_by('v.visit_date', 'DESC');
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
        $count = $this->db->get()->row_array()['count'];
        // prices total
        $this->db->select('*');
        $this->db->from('lab_visits v');
        $this->db->where('v.isdeleted', 0);
        $this->db->order_by('v.visit_date', 'DESC');
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
        $this->db->limit($rowsPerPage, $page * $rowsPerPage);
        $data = $this->db->get()->result_array();
        $total_price = 0;
        $net_price = 0;
        $dicount = 0;
        foreach ($data as $row) {
            $total_price += $row['total_price'];
            $net_price += $row['net_price'];
            $dicount += $row['dicount'];
        }
        return array(
            "count" => $count,
            "total_price" => $total_price,
            "net_price" => $net_price,
            "dicount" => $dicount
        );

    }
}