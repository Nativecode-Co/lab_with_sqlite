<?php
class InvoiceModel extends CI_Model
{
    private $table = 'lab_invoice';
    private $main_column = 'hash';

    private $default = array(
        "orderOfHeader" => array(
            "logo",
            "name",
        ),
        "visitTestsTheme" => "one",
        "SuperTestTheme" => "table",
    );

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->helper('db');
        $this->load->model('WorkersModel');
        if (!$this->db->field_exists('history', 'lab_invoice')) {
            $this->db->query("ALTER TABLE lab_invoice ADD COLUMN history INTEGER NOT NULL DEFAULT 0;");
        }
        if (!$this->db->field_exists('show_name', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `show_name` INTEGER NOT NULL DEFAULT 0 ;");
        }
        if (!$this->db->field_exists('show_logo', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `show_logo` INTEGER NOT NULL DEFAULT 1 ;");
        }
    }

    public function get()
    {
        $setting = $this->get_setting();
        $invoice = $this->db->select('color,history, phone_1,show_name,show_logo, footer, invoice_about_en')
            ->select(" phone_2 as size, address, facebook, header, center")
            ->select("logo, water_mark, footer_header_show, invoice_about_ar")
            ->select("font_size, zoom, doing_by, name_in_invoice, font_color,setting")
            ->limit(1)
            ->get('lab_invoice')->row_array();
        $invoice = array_merge($invoice, $setting);
        $workers = $this->WorkersModel->getVisibleWorkers();
        $orderOfHeader = $setting["orderOfHeader"] ?? [];
        // sort workers with hash using orderOfHeader
        usort($workers, function ($a, $b) use ($orderOfHeader) {
            $posA = array_search($a['hash'], $orderOfHeader);
            $posB = array_search($b['hash'], $orderOfHeader);
            return $posA - $posB;
        });
        $invoice['workers'] = $workers;
        return $invoice;
    }

    public function get_setting()
    {
        $default = $this->default;
        $orderOfHeader = $default["orderOfHeader"];
        $setting = $this->db
            ->select('setting')
            ->get($this->table)
            ->row();
        if (isset ($setting->setting)) {
            $setting = json_decode($setting->setting, true);
            if (is_array($setting)) {
                $default = array_merge($default, $setting);
            }
        }
        if (!is_array($default['orderOfHeader'])) {
            $default['orderOfHeader'] = array_merge(json_decode($default['orderOfHeader'], true), $orderOfHeader);
        }
        return $default;
    }

    public function set_setting($setting)
    {
        $default = $this->default;
        if (is_string($setting)) {
            $setting = json_decode($setting, true);
        }
        $old = $this->db
            ->select('setting')
            ->get($this->table)
            ->row();
        if (isset ($old->setting) && $old->setting != "null" && $old->setting != "") {
            $old = json_decode($old->setting, true);
            $setting = array_merge($old, $setting);
        }
        $setting = array_merge($default, $setting);
        $this->db
            ->set('setting', json_encode($setting))
            ->update($this->table);
    }

}