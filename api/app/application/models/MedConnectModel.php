<?php
class MedConnectModel extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->helper('db');
    }

    public function tests($name, $code)
    {
        $query =  $this->db
            ->select('lab_test.hash as ID, lab_test.test_name as Name,test_alias.alias as Code,lab_test_catigory.name as Type')
            ->join('test_alias', 'lab_test.hash = test_alias.test_hash', 'left')
            ->join('lab_test_catigory', 'lab_test_catigory.hash = lab_test.category_hash', 'left');
        if ($name) {
            $query->like('lab_test.test_name', $name);
        }
        if ($code) {
            $query->like('test_alias.alias', $code);
        }
        return $query->get('lab_test')->result();
    }

    public function orders($visit_hash, $all_tests)
    {
        // Visit transaction date (yyyymmddHis)
        $visit = $this->db
            ->select('lab_visits.hash as SampleNumber')
            ->select('date_format(lab_visits.visit_date, "%Y%m%d%H%i%s") as TransactionDate')
            ->where('hash', $visit_hash)
            ->get('lab_visits')
            ->row();
        if (!$visit) {
            return array(
                "message" => "No visit found with the provided SampleNumber",
                "status" => 404
            );
        }
        if ($all_tests) {
            $tests = $this->db
                ->select('lab_visits_tests.tests_id as id')
                ->where('lab_visits_tests.visit_id', $visit_hash)
                ->get('lab_visits_tests')->result();
            $test_ids = [];
            foreach ($tests as $test) {
                $test_ids[] = $test->id;
            }
            $visit->Tests = $test_ids;
        }

        $patient = $this->db
            ->select('lab_patient.hash as ID')
            ->select('lab_patient.name as Name')
            ->select('lab_patient.birth as DateOfBirth')
            ->select('CASE WHEN lab_patient.gender = "ذكر" THEN "M" ELSE "F" END as Sex', false)
            ->join('lab_visits', 'lab_patient.hash = lab_visits.visits_patient_id', 'inner')
            ->where('lab_visits.hash', $visit_hash)

            ->get('lab_patient')
            ->row();
        // get age from birth date by days
        $age = floor((time() - strtotime($patient->DateOfBirth)) / (60 * 60 * 24 * 365));
        if ($age < 30) {
            $patient->Age = $age;
            $patient->AgeUnit = 'D';
        } elseif ($age < 365) {
            $patient->Age = $age / 30;
            $patient->AgeUnit = 'M';
        } else {
            $patient->Age = $age / 365;
            $patient->AgeUnit = 'Y';
        }

        $visit->Patient = $patient;

        return $visit;
    }

    public function result($data)
    {
        // for each test in the data
        foreach ($data as $test) {
            // get name of the test
            $test_name = $this->db
                ->select('lab_test.test_name as Name')
                ->where('hash', $test['TestCode'])
                ->get('lab_test')
                ->row();
            if (!$test_name) {
                return array(
                    "message" => "No test found with the provided ID => " . $test['TestCode'] . " for SampleNumber => " . $test['SampleNumber'],
                    "status" => 404
                );
            }
            // check visit is exist
            $visit = $this->db
                ->select('hash')
                ->where('hash', $test['SampleNumber'])
                ->get('lab_visits')
                ->row();
            if (!$visit) {
                return array(
                    "message" => "No visit found with the provided SampleNumber",
                    "status" => 404
                );
            }

            $test_name = $test_name->Name;
            if ($test["TestCode"] == "360" || $test["TestCode"] == "16708623707062301") {
                $result = $this->db
                    ->select('result_test')
                    ->where('visit_id', $test['SampleNumber'])
                    ->where('tests_id', $test['TestCode'])
                    ->get('lab_visits_tests')
                    ->row();
                $result = json_decode($result->result_test, true);
                // merge the new result with the old result
                $result[$test['SubTestCode']] = $test['Result'];
                $this->db
                    ->where('visit_id', $test['SampleNumber'])
                    ->where('tests_id', $test['TestCode'])
                    ->update('lab_visits_tests', array("result_test" => json_encode($result)));
            } else {
                $this->db
                    ->where('visit_id', $test['SampleNumber'])
                    ->where('tests_id', $test['TestCode'])
                    ->update('lab_visits_tests', array("result_test" => json_encode(array($test_name => $test['Result'], "checked" => true))));
            }
        }
        return array(
            "message" => "Results updated successfully",
            "status" => 200
        );
    }
}
