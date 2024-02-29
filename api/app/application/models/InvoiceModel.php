<?php
class InvoiceModel extends CI_Model
{
    private $table = 'lab_invoice';
    private $main_column = 'hash';

    private $default = array(
        "orderOfHeader" => array(),
        "visitTestsTheme" => "one",
        "SuperTestTheme" => "table",
    );

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->helper('db');
    }

    public function get_setting()
    {
        $default = $this->default;
        $setting = $this->db
            ->select('setting')
            ->get($this->table)
            ->row();
        if (isset($setting->setting)) {
            $setting = json_decode($setting->setting, true);
            if (is_array($setting)) {
                $default = array_merge($default, $setting);
            }
        }
        return $default;
    }

    public function set_setting($setting)
    {
        $default = $this->default;
        $setting = json_decode($setting, true);
        $old = $this->db
            ->select('setting')
            ->get($this->table)
            ->row();
        if (isset($old->setting)) {
            $old = json_decode($old->setting, true);
            $setting = array_merge($old, $setting);
        }
        // sure that the setting has all the default keys
        $setting = array_merge($default, $setting);
        $this->db
            ->set('setting', json_encode($setting))
            ->update($this->table);
    }

}