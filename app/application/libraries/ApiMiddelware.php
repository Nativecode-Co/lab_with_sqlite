
<?php
class ApiMiddelware
{
    public function __construct()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description, Authorization');
        header('Content-Type: application/x-www-form-urlencoded');
        header('Content-Type: application/json');
    }
}
