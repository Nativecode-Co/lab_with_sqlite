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
                $select = "HOUR(insert_record_date) AS date";
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
                visit_date BETWEEN '$start' AND '$end' $genderClause $ageClause
            GROUP BY 
                $groupByClause
    ";

        $result = $this->db->query($query)->result();
        return $result;
    }
}
