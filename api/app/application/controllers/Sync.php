<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Sync extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('SyncModel');
        // Add header to prevent browser from interpreting as plain text
        header('Content-Type: application/json');
    }

    function index()
    {
        // Basic debug info
        $debug = [
            'php_version' => phpversion(),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
            'message' => 'Welcome to the Sync API'
        ];
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($debug));
    }

    /**
     * Get a list of available tables for syncing
     */
    function tables()
    {
        try {
            $tables = $this->SyncModel->get_available_tables();
            $response = ['tables' => $tables];
            
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($response));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(['error' => $e->getMessage()]));
        }
    }

    /**
     * Get data from a specific table with pagination
     *
     * @param string $table_name Table to fetch data from
     */
    function table($table_name = null)
    {
        try {
            $page = $this->input->get('page') ? intval($this->input->get('page')) : 1;
            $per_page = $this->input->get('per_page') ? intval($this->input->get('per_page')) : 20;
            
            $data = $this->SyncModel->sync($table_name, $page, $per_page);
            
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($data, JSON_UNESCAPED_UNICODE));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(['error' => $e->getMessage()]));
        }
    }

    /**
     * Get structure for a specific table
     *
     * @param string $table_name Table to get structure for
     */
    function structure($table_name = null)
    {
        try {
            $structure = $this->SyncModel->get_table_structure($table_name);
            
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($structure));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(['error' => $e->getMessage()]));
        }
    }

    /**
     * Sync all tables at once with pagination
     */
    function all()
    {
        try {
            $page = $this->input->get('page') ? intval($this->input->get('page')) : 1;
            $per_page = $this->input->get('per_page') ? intval($this->input->get('per_page')) : 20;
            $data = $this->SyncModel->sync_all($page, $per_page);
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode($data, JSON_UNESCAPED_UNICODE));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode(['error' => $e->getMessage()]));
        }
    }

   
}
