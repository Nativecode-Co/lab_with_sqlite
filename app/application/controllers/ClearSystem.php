<?php
defined('BASEPATH') or exit('No direct script access allowed');
require __DIR__ . '/jwt/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class ClearSystem extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->database();
        
    }

    public function createAfterInsertTrigger(){
        $this->db->query("CREATE TRIGGER lab_visits_AFTER_INSERT
        AFTER INSERT ON `lab_visits`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('lab_visits','insert',new.labId,last_query );
        
        END;"
        );
        $this->db->query("CREATE TRIGGER lab_visits_tests_AFTER_INSERT
        AFTER INSERT ON `lab_visits_tests`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('lab_visits_tests','insert',new.lab_id,last_query);
        
        END;"
        );
        $this->db->query("CREATE TRIGGER lab_visits_package_AFTER_INSERT
        AFTER INSERT ON `lab_visits_package`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('lab_visits_package','insert',new.lab_id,last_query);
        
        END;"
        );
        $this->db->query("CREATE TRIGGER lab_patient_AFTER_INSERT
        AFTER INSERT ON `lab_patient`
        FOR EACH ROW
        BEGIN
            Declare last_query TEXT;
            SET last_query = (SELECT info FROM INFORMATION_SCHEMA.PROCESSLIST WHERE id = CONNECTION_ID());
            INSERT INTO `offline_sync`(`table_name`,`operation`,`lab_id`,`query`) VALUES ('lab_patient','insert',new.lab_id,last_query);
        
        END;"
        );
        echo json_encode(
            array(
                'status' => true,
                'message' => 'تم إنشاء الـtrigger',
                'isAuth' => true
            ),
            JSON_UNESCAPED_UNICODE
        );
    }

    public function deleteAfterInsertTrigger(){
        $this->db->query("DROP TRIGGER IF EXISTS `lab_visits_tests_AFTER_INSERT`;");
        $this->db->query("DROP TRIGGER IF EXISTS `lab_visits_AFTER_INSERT`;");
        $this->db->query("DROP TRIGGER IF EXISTS `lab_visits_package_AFTER_INSERT`;");
        $this->db->query("DROP TRIGGER IF EXISTS `lab_patient_AFTER_INSERT`;");
        return true;
    }

    public function getUser1212Tests(){
        $queries = ''; 
        $package_tests = $this->db->query("SELECT  lab_pakage_tests.lab_id, package_id, test_id, kit_id, lab_device_id, unit, lab_pakage_tests.hash FROM unimedica_db.lab_package join lab_pakage_tests on lab_pakage_tests.package_id=lab_package.hash where catigory_id='8' group by lab_package.lab_id,lab_package.hash,test_id,kit_id,unit,lab_device_id")->result();
        $count = count($package_tests);
        if (count($package_tests) > 0) {
            $package_tests_query = "insert ignore into lab_pakage_tests(" . implode(",", array_keys((array) $package_tests[0])) . ") values ";
            $package_tests_values = array_map(function ($package_test) {
                return "('" . implode("','", array_values((array) $package_test)) . "')";
            }, $package_tests);
            $package_tests_query .= implode(",", $package_tests_values);
            $queries .= $package_tests_query;
        } else {
            $queries .= "No package tests found";
        }
        echo json_encode(
            array(
                'status' => true,
                'message' => $queries,
                'isAuth' => true,
                'count' => $count
            ),
            JSON_UNESCAPED_UNICODE
        );
    }


   
}
