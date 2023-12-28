<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Upload extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
        $this->load->helper(array('form', 'url'));
        $this->load->library('upload');
    }

    public function uploadSingle()
    {

        if (isset($_FILES['file'])) {
            $file = $_FILES['file'];

            if ($file['error'] === UPLOAD_ERR_OK) {
                $filename = $file['name'];
                $temp_path = $file['tmp_name'];

                if (!empty($folder_location)) {
                    $target_path = 'uploads/' . $folder_location . '/' . $filename;
                    if (!is_dir('uploads/' . $folder_location)) {
                        mkdir('uploads/' . $folder_location, 0777, true);
                    }
                } else {
                    $target_path = 'uploads/' . $filename;
                    if (!is_dir('uploads')) {
                        mkdir('uploads', 0777, true);
                    }
                }

                if (move_uploaded_file($temp_path, $target_path)) {
                    $full_path = base_url() . $target_path;

                    echo json_encode(
                        array(
                            'status' => 200,
                            'message' => 'تم رفع الملف بنجاح',
                            'data' => $full_path,
                            'isAuth' => true,
                            'action' => true,
                        ),
                        JSON_UNESCAPED_UNICODE
                    );
                } else {
                    // Error occurred while moving the uploaded file
                    echo json_encode(
                        array(
                            'status' => 200,
                            'message' => 'حدث خطأ أثناء رفع الملف',
                            'isAuth' => true
                        ),
                        JSON_UNESCAPED_UNICODE
                    );
                }
            } else {
                // Error occurred while uploading the file
                echo json_encode(
                    array(
                        'status' => 200,
                        'message' => 'حدث خطأ أثناء رفع الملف',
                        'isAuth' => true
                    ),
                    JSON_UNESCAPED_UNICODE
                );
            }
        } else {
            // No file was uploaded
            echo json_encode(
                array(
                    'status' => 400,
                    'message' => 'حدث خطأ أثناء رفع الملف',
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
        }
    }
}