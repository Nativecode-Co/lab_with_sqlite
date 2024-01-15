<?php
if (!defined('BASEPATH'))
    exit('No direct script access allowed');

class Pdf extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->model('Menu_db');
        $this->load->model('Visit_model');
        $this->load->helper('download');
    }

    public function index()
    {
        $pk = $this->input->get('pk');
        $lab = $this->input->get('lab');
        $parm = "$pk-$lab";
        $patient = $this->Visit_model->getPatientDetail($pk);
        $name = $patient['name'];
        $date = $patient['date'];
        $date = str_replace("-", "_", $date);
        $path = getcwd();
        // check if folter exist
        if (!file_exists("$path\pdfs")) {
            mkdir("$path\pdfs", 0777, true);
        }
        //  create folder with pk
        if (!file_exists("$path\pdfs\\$name")) {
            mkdir("$path\pdfs\\$name", 0777, true);
        }
        // file name
        $file = "$path\pdfs\\$name\\$date.pdf";
        $command = 'C:\xampp\ch\chrome --headless --disable-gpu --print-to-pdf="' . $file . '"  --virtual-time-budget=10000 http://localhost:8807/lite/lab/show_invoice.html?pk=' . $parm . '';
        $output = exec($command);
        // return pdf file
        force_download($file, NULL);
    }
}