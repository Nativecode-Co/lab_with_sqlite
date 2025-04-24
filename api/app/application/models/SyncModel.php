<?php
class SyncModel extends CI_Model
{
    private $table = 'lab_patient';
    private $main_column = 'hash';

    function __construct()
    {
        parent::__construct();
        $this->load->database();
    }
    public function sync($table_name = null, $page = 1, $per_page = 20)
    {
        // List of available tables for syncing
        $available_tables = [
            'lab_doctor',
            'lab_invoice',
            'lab_package',
            'lab_pakage_tests',
            'lab_patient',
            'lab_test',
            'lab_visits_package',
            'lab_visits',
            'lab_visits_tests',
            'system_users'
        ];

        // Validate table name
        if (!$table_name || !in_array($table_name, $available_tables)) {
            return [
                'error' => 'Invalid table name',
                'available_tables' => $available_tables
            ];
        }

        // Validate page number
        $page = max(1, intval($page));
        $per_page = max(1, intval($per_page));
        $offset = ($page - 1) * $per_page;

        // Get total records count for pagination
        $total_records = $this->db->count_all($table_name);
        $total_pages = ceil($total_records / $per_page);

        // Define fields to exclude
        $exclude_fields = ['id'];
        
        // Additional fields to exclude for lab_invoice
        if ($table_name === 'lab_invoice') {
            $exclude_fields = array_merge($exclude_fields, [
                'logo',
                'footer_image',
                'header_image',
                'barcode_height',
                'barcode_width',
                'barcode_first_time',
                'invoice_model'
            ]);
        }
        
        // Get all fields for the table
        $all_fields = $this->db->list_fields($table_name);
        
        // Filter out excluded fields
        $select_fields = array_diff($all_fields, $exclude_fields);
        
        // Get records for current page
        $records = $this->db
            ->select(implode(', ', $select_fields))
            ->from($table_name)
            ->limit($per_page, $offset)
            ->get()
            ->result_array();

        // Get lab ID from lab table (assuming it has one row)
        $lab_id = null;
        if ($this->db->table_exists('lab')) {
            $lab_count = $this->db->count_all('lab');
            if ($lab_count == 1) {
                $lab_record = $this->db->get('lab')->row_array();
                if (isset($lab_record['id'])) {
                    $lab_id = $lab_record['id'];
                }
            }
        }

        // Process records
        foreach ($records as &$record) {
            // Set lab ID if fields exist and lab_id was found
            if ($lab_id !== null) {
                $lab_id_fields = ['lab_id', 'lab_hash', 'labID', 'labHash'];
                foreach ($lab_id_fields as $field) {
                    if (isset($record[$field])) {
                        $record[$field] = $lab_id;
                    }
                }
            }
            
            // For lab_pakage_tests, generate random hash if hash is 0
            if ($table_name === 'lab_pakage_tests' && isset($record['hash']) && $record['hash'] == '0') {
                $record['hash'] = (string)mt_rand(1000000, 9999999);
            }
        }

        // Return data with pagination info
        return [
            'table' => $table_name,
            'page' => $page,
            'per_page' => $per_page,
            'total_records' => $total_records,
            'total_pages' => $total_pages,
            'data' => $records
        ];
    }
    public function get_available_tables()
    {
        return [
            'lab_doctor',
            'lab_invoice',
            'lab_package',
            'lab_pakage_tests',
            'lab_patient',
            'lab_test',
            'lab_visits_package',
            'lab_visits',
            'lab_visits_tests',
            'system_users'
        ];
    }
    public function get_table_structure($table_name)
    {
        // Check if table exists
        if (!$this->db->table_exists($table_name)) {
            return ['error' => 'Table does not exist'];
        }

        // Get field information
        $fields = $this->db->field_data($table_name);
        
        // Get primary key
        $primary_key = null;
        foreach ($fields as $field) {
            if ($field->primary_key) {
                $primary_key = $field->name;
                break;
            }
        }

        return [
            'table' => $table_name,
            'fields' => $fields,
            'primary_key' => $primary_key
        ];
    }
    public function sync_all($page = 1, $per_page = 20)
    {
        $tables = $this->get_available_tables();
        $result = [];

        foreach ($tables as $table) {
            $result[$table] = $this->sync($table, $page, $per_page);
        }

        return $result;
    }
}
