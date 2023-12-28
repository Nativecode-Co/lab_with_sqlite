<?php
class Pdf extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
    }

    public function index()
    {
        echo "hello world";
    }

    public function sendPdf()
    {
        $html = $this->input->post('html');
        if (!empty($html)) {
            try {
                header('Content-Type: application/pdf');
                header('Content-Disposition: attachment; filename="output.pdf"');

                // Disable caching
                header('Cache-Control: no-cache, no-store, must-revalidate');
                header('Pragma: no-cache');
                header('Expires: 0');
                echo $this->generatePdf($html);
                exit();
            } catch (Exception $e) {
                echo json_encode(array(
                    "status" => false,
                    "message" => $e->getMessage(),
                    "isAuth" => false,
                    "data" => null
                ), JSON_UNESCAPED_UNICODE);
                exit();
            }
        } else {
            exit();
        }
    }

    private function generatePdf($html)
    {
        // Generate the PDF output using the HTML
        // Replace this with your own PDF generation code
        $pdf = "<html>

    <head>
        <title>Invoice</title>
    </head>

    <body> $html </body>

    </html>";
        return $pdf;
    }
}
