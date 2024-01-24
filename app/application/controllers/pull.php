<?php

class pull extends CI_Controller
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function auth()
    {
        $token = $this->input->get_request_header('Authorization', TRUE);
        $token = str_replace("Bearer ", "", $token);
        $decoded_array = $this->jwt_dec($token);
        if ($decoded_array == 0) {
            echo json_encode(
                array(
                    "status" => false,
                    "message" => "Invalid token",
                    "isAuth" => false,
                    "data" => null
                ),
                JSON_UNESCAPED_UNICODE
            );
            exit();
        } else {
            $res = $this->Menu_db->check_user_by_hash($decoded_array["hash"], $decoded_array["lab_id"]);
            $token = $this->jwt_enc($res);
        }
    }
    public function pull()
    {
        // try to pull update
        //$output = shell_exec('cd /var/www/html/ && git pull https://nativecode2020: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@github.com/nativecode2020/lab.git 2>&1');

        $command = 'cd C:\xampp\htdocs && C:\xampp\PortableGit\bin\git.exe config --global --add safe.directory C:/xampp/htdocs && C:\xampp\PortableGit\bin\git.exe reset --hard 2>&1 && C:\xampp\PortableGit\bin\git.exe stash --include-untracked 2>&1 && C:\xampp\PortableGit\bin\git.exe pull https://nativecode2020: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@github.com/Nativecode-Co/lab_with_sqlite.git 2>&1';
        $output = exec($command);

        // $output = shell_exec('cd /var/www/html/ &&  git reset --hard 2>&1 && git stash --include-untracked 2>&1 && git pull https://nativecode2020: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@github.com/nativecode2020/lab.git 2>&1');
        // check if update is success or not or need to merge 
        if (strpos($output, 'Already up to date.') !== false) {
            $version = $this->getVersion();
            // update version
            $this->db->query("UPDATE `lab_version` SET `version` = '$version' WHERE `lab_version`.`isdeleted` = 0;");
            echo json_encode(
                // no update
                array(
                    'status' => 400,
                    'message' => 'لا يوجد تحديثات',
                    'data' => $output,
                    'isAuth' => false
                ),

                JSON_UNESCAPED_UNICODE
            );
            die();
            // pull is done by check updating work not /updating/ or changed files
        } else if ((strpos($output, 'Updating') !== false || (strpos($output, 'changed') !== false)) && strpos($output, 'fatal') == false || strpos($output, 'create mode') !== false || strpos($output, 'delete mode') !== false) {
            $version = $this->getVersion();
            // update version
            $this->db->query("UPDATE `lab_version` SET `version` = '$version' WHERE `lab_version`.`isdeleted` = 0;");
            echo json_encode(
                array(
                    'status' => 200,
                    'message' => 'تم تحديث البرنامج بنجاح ..',
                    'data' => $output,
                    'isAuth' => true
                ),
                JSON_UNESCAPED_UNICODE
            );
            die();
        } else {
            // shell_exec('cd /var/www/html/ && git stash --include-untracked 2>&1 && git pull https://nativecode2020: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@github.com/nativecode2020/lab.git  2>&1');
            echo json_encode(
                array(
                    'status' => 200,
                    'message' => 'الرجاء التواصل مع الدعم الفني لتحديث البرنامج',
                    'data' => $output,
                    'isAuth' => true
                ),

                JSON_UNESCAPED_UNICODE
            );
        }
    }

    public function getVersion()
    {
        $token = $this->input->get_request_header('Authorization', TRUE);
        $token = str_replace("Bearer ", "", $token);

        $url = "http://umc.native-code-iq.com/app/index.php/Offline/getLastVersion";
        $headers = [
            "Authorization: Bearer {$token}",
        ];

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            echo 'Error: ' . curl_error($ch);
        }

        curl_close($ch);

        // Process $response as needed
        return $response;
    }

    public function needUpdate()
    {
        $currentVersion = $this->getVersion();
        $offlineVersion = $this->db->query("select version from lab_version where isdeleted=0 order by id desc limit 1")->row();
        $offlineVersion = $offlineVersion->version;
        if ($currentVersion <= $offlineVersion) {
            echo "false";
        } else {
            echo "true";
        }
        exit();
    }

    public function setVersion()
    {
        $token = $this->input->get_request_header('Authorization', TRUE);
        $token = str_replace("Bearer ", "", $token);

        $url = "http://umc.native-code-iq.com/app/index.php/Offline/setVersion";
        $headers = [
            "Authorization: Bearer {$token}",
        ];

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            echo 'Error: ' . curl_error($ch);
        }

        curl_close($ch);

        // Process $response as needed
        echo $response;
    }
}