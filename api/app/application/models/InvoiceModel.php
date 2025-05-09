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
        // barcode_width
        if (!$this->db->field_exists('barcode_width', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `barcode_width` INTEGER NOT NULL DEFAULT 80 ;");
        }
        // barcode_height
        if (!$this->db->field_exists('barcode_height', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `barcode_height` INTEGER NOT NULL DEFAULT 20 ;");
        }
        // barcode first_time
        if (!$this->db->field_exists('barcode_first_time', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `barcode_first_time` INTEGER NOT NULL DEFAULT 0 ;");
        }
        // header_image
        if (!$this->db->field_exists('header_image', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `header_image` TEXT NOT NULL DEFAULT '' ;");
        }
        // footer_image
        if (!$this->db->field_exists('footer_image', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `footer_image` TEXT NOT NULL DEFAULT '' ;");
        }
        // invoice_model ["images","names"]
        if (!$this->db->field_exists('invoice_model', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `invoice_model` CHAR(255) NOT NULL DEFAULT 'names' ;");
        }
        // border is integer
        if (!$this->db->field_exists('border', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `border` INTEGER DEFAULT 0 ;");
        }
        // setting is TEXT
        if (!$this->db->field_exists('setting', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `setting` TEXT DEFAULT '' ;");
        }
        // nav_setting is TEXT
        if (!$this->db->field_exists('nav_settings', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `nav_settings` TEXT DEFAULT '' ;");
        }
        // header_footer_style is char
        if (!$this->db->field_exists('header_footer_style', 'lab_invoice')) {
            $this->db->query("ALTER TABLE `lab_invoice` ADD COLUMN `header_footer_style` CHAR(255) DEFAULT '' ;");
        }
    }

    public function get()
    {
        // check if there invoice 
        $isExit = $this->db->select('count(*) as count')->from($this->table)->limit(1)->get();
        if ($isExit->row()->count == 0) {
            $this->db->insert(
                'lab_invoice',
                array(
                    "color" => "#6F8EFC",
                    "font_color" => "#000000",
                    "phone_1" => "",
                    "phone_2" => "",
                    "address" => "",
                    "facebook" => "",
                    "water_mark" => "",
                    "logo" => "",
                    "name_in_invoice" => "Name in invoice",
                    "setting" => json_encode($this->default)

                )
            );
        }
        $setting = $this->get_setting();
        $invoice = $this->db->select('color,history, phone_1,show_name,show_logo, footer, invoice_about_en')
            ->select(" phone_2 as size, address, facebook, header, center")
            ->select("logo, water_mark, footer_header_show, invoice_about_ar")
            ->select("font_size, zoom, doing_by, name_in_invoice, font_color,setting")
            ->select("barcode_width, barcode_height,barcode_first_time")
            ->select("header_image, footer_image, invoice_model")
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
        if (isset($setting->setting)) {
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
        if (isset($old->setting) && $old->setting != "null" && $old->setting != "") {
            $old = json_decode($old->setting, true);
            $setting = array_merge($old, $setting);
        }
        $setting = array_merge($default, $setting);
        $this->db
            ->set('setting', json_encode($setting))
            ->update($this->table);
    }

    /**
     * Filter array to include only columns that exist in the table
     * 
     * @param array $data Data to be filtered
     * @return array Filtered data
     */
    private function filter_columns($data)
    {
        // Get table fields
        $fields = $this->db->list_fields($this->table);
        
        // If data is a batch of rows
        if (isset($data[0]) && is_array($data[0])) {
            $filtered_data = [];
            foreach ($data as $row) {
                $filtered_row = [];
                foreach ($row as $key => $value) {
                    if (in_array($key, $fields)) {
                        $filtered_row[$key] = $value;
                    }
                }
                $filtered_data[] = $filtered_row;
            }
            return $filtered_data;
        } else {
            // If data is a single record
            $filtered_data = [];
            foreach ($data as $key => $value) {
                if (in_array($key, $fields)) {
                    $filtered_data[$key] = $value;
                }
            }
            return $filtered_data;
        }
    }

    public function insert_batch($data)
    {
        if (empty($data)) {
            return;
        }
        
        // Filter out columns that don't exist in the table
        $filtered_data = $this->filter_columns($data);
        
        $this->db->insert_batch($this->table, $filtered_data);
    }
}
