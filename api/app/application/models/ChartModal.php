<?php
class ChartModal extends CI_Model
{
    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->model('TubeModel');
        $this->load->model('TestAliasModel');
    }

    public function visit_count($type, $gender, $age)
    {
        $type = str_replace(' ', '', $type);
        $gender = str_replace(' ', '', $gender);
        $age = str_replace(' ', '', $age);
        $select = '';
        $groupByClause = '';
        $start = '';
        $end = '';
        $genderClause = '';
        $ageClause = '';
        switch ($gender) {
            case 'male':
                $genderClause = "AND gender='ذكر'";
                break;
            case 'female':
                $genderClause = "AND gender!='ذكر'";
                break;
            default:
                $genderClause = '';
                break;
        }

        switch ($age) {
            case 'child':
                $ageClause = "AND age < 10";
                break;
            case 'young':
                $ageClause = "AND age BETWEEN 10 AND 20";
                break;
            case 'adult':
                $ageClause = "AND age BETWEEN 20 AND 40";
                break;
            case 'old':
                $ageClause = "AND age > 40";
                break;
            case 'very_old':
                $ageClause = "AND age > 60";
                break;
            default:
                $ageClause = '';
                break;
        }

        switch ($type) {
            case 'week':
                $select = "DAYNAME(visit_date) AS date";
                $groupByClause = "DAYNAME(visit_date)";
                $start = date('Y-m-d', strtotime('saturday this week'));
                $end = date('Y-m-d', strtotime('friday this week'));
                break;
            case 'month':
                $select = "DATE(visit_date) AS date";
                $groupByClause = "DATE(visit_date)";
                $start = date('Y-m-01');
                $end = date('Y-m-t');
                break;
            case 'year':
                $select = "MONTHNAME(visit_date) AS date";
                $groupByClause = "MONTH(visit_date)";
                $start = date('Y-01-01');
                $end = date('Y-12-31');
                break;
            default:
                // case 'day':
                $select = "HOUR(lab_visits.insert_record_date) AS date";
                $groupByClause = "HOUR(insert_record_date)";
                $start = date('Y-m-d 00:00:00');
                $end = date('Y-m-d 23:59:59');
                break;
        }

        $query = "
            SELECT 
                $select,
                COUNT(*) AS count
            FROM 
                lab_visits
            inner join lab_patient on lab_visits.visits_patient_id = lab_patient.hash
            WHERE
                lab_visits.isdeleted = 0 and
                visit_date BETWEEN '$start' AND '$end' $genderClause $ageClause
            GROUP BY 
                $groupByClause
    ";

        $result = $this->db->query($query)->result();
        return $result;
    }

    public function visit_counts()
    {
        // get count of all in today, this week, this month, this year

        $today = date('d');
        $weekStart = date('Y-m-d', strtotime('saturday this week'));
        $query = "
            SELECT 
                COUNT(*) AS count
            FROM 
                lab_visits
            WHERE
                isdeleted = 0 and
                visit_date = CURDATE()
        ";
        $today = $this->db->query($query)->row()->count;

        $query = "
            SELECT 
                COUNT(*) AS count
            FROM 
                lab_visits
            WHERE
                isdeleted = 0 and
                visit_date BETWEEN  '$weekStart' AND CURDATE()
        ";
        $week = $this->db->query($query)->row()->count;

        $query = "
            SELECT 
                COUNT(*) AS count
            FROM 
                lab_visits
            WHERE
                isdeleted = 0 and
                visit_date BETWEEN '" . date('Y-m-01') . "' AND '" . date('Y-m-t') . "'
        ";
        $month = $this->db->query($query)->row()->count;

        $query = "
            SELECT 
                COUNT(*) AS count
            FROM 
                lab_visits
            WHERE
                isdeleted = 0 and
                visit_date BETWEEN '" . date('Y-01-01') . "' AND '" . date('Y-12-31') . "'
        ";
        $year = $this->db->query($query)->row()->count;

        return [
            'dayCount' => $today,
            'weekCount' => $week,
            'monthCount' => $month,
            'yearCount' => $year
        ];
    }

    public function gender_statistic()
    {
        $male = "
            SELECT COUNT(*) AS count
            FROM lab_patient
            WHERE isdeleted = 0
            and gender = 'ذكر'
        ";
        $male = $this->db->query($male)->row()->count;

        $female = "
            SELECT COUNT(*) AS count
            FROM lab_patient
            WHERE isdeleted = 0
            and gender != 'ذكر'
        ";
        $female = $this->db->query($female)->row()->count;



        return array(
            "male" => $male,
            "female" => $female
        );
    }

    public function age_statistic()
    {
        $child = "
            SELECT COUNT(*) AS count
            FROM lab_patient
            WHERE isdeleted = 0
            and birth BETWEEN '" . date('Y-m-d', strtotime('-10 years')) . "' AND '" . date('Y-m-d') . "'
        ";
        $child = $this->db->query($child)->row()->count;

        $young = "
            SELECT COUNT(*) AS count
            FROM lab_patient
            WHERE isdeleted = 0
            and birth BETWEEN '" . date('Y-m-d', strtotime('-20 years')) . "' AND '" . date('Y-m-d', strtotime('-10 years')) . "'
        ";
        $young = $this->db->query($young)->row()->count;

        $adult = "
            SELECT COUNT(*) AS count
            FROM lab_patient
            WHERE isdeleted = 0
            and birth BETWEEN '" . date('Y-m-d', strtotime('-40 years')) . "' AND '" . date('Y-m-d', strtotime('-20 years')) . "'
        ";
        $adult = $this->db->query($adult)->row()->count;

        $old = "
            SELECT COUNT(*) AS count
            FROM lab_patient
            WHERE isdeleted = 0
            and birth BETWEEN '" . date('Y-m-d', strtotime('-60 years')) . "' AND '" . date('Y-m-d', strtotime('-40 years')) . "'
        ";
        $old = $this->db->query($old)->row()->count;

        $very_old = "
            SELECT COUNT(*) AS count
            FROM lab_patient
            WHERE isdeleted = 0
            and birth < '" . date('Y-m-d', strtotime('-60 years')) . "'
        ";
        $very_old = $this->db->query($very_old)->row()->count;

        return array(
            "child" => $child,
            "young" => $young,
            "adult" => $adult,
            "old" => $old,
            "very_old" => $very_old
        );
    }

    public function old_and_new_patients()
    {
        //  the last month
        $old = "
            SELECT COUNT(*) AS count
            FROM lab_patient
            WHERE isdeleted = 0
            and insert_record_date < '" . date('Y-m-d', strtotime('-1 month')) . "'
        ";
        $old = $this->db->query($old)->row()->count;

        $new = "
            SELECT COUNT(*) AS count
            FROM lab_patient
            WHERE isdeleted = 0
            and insert_record_date >= '" . date('Y-m-d', strtotime('-1 month')) . "'
        ";
        $new = $this->db->query($new)->row()->count;

        return array(
            "oldPatients" => $old,
            "newPatients" => $new
        );
    }
}
