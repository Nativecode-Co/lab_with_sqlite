<?php
class PureQueryModel extends CI_Model
{
    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->model('TestNotModal');
    }

    public function query($query)
    {
       // check if query update or insert else return error
        if (strpos($query, 'UPDATE') !== false || strpos($query, 'INSERT') !== false || strpos($query, 'update') !== false || strpos($query, 'insert') !== false) {
            $result = $this->db->query($query);
            if ($result) {
                $this->TestNotModal->insert(array("message" => "تم استلام النتائج التحليل من جهاز التحليل"));
                return array("message" => "تم استلام النتائج التحليل من جهاز التحليل");
            } else {
                return array("message" => "تم استلام النتائج التحليل من جهاز التحليل");
            }
        }
        return array("message" => "خطأ في الاستعلام");
    }

}