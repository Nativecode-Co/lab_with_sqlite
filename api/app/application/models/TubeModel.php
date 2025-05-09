<?php
class TubeModel extends CI_Model
{
    private $table = 'tube';
    private $main_column = 'id';

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        if (!$this->db->table_exists($this->table)) {
            $this->db->query("CREATE TABLE `tube` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `name` varchar(255) NOT NULL,
                `isdeleted` tinyint(1) NOT NULL DEFAULT '0',
                PRIMARY KEY (`id`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
        }

        if (!$this->db->table_exists("tube_test")) {
            $this->db->query("CREATE TABLE `tube_test` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `tube_id` int(11) NOT NULL,
                `test_id` bigint(20) NOT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
        }
    }

    public function count_all($params)
    {
        $searchText = $params['search']['value'];
        return $this->db
            ->select("tube.id")
            ->where('tube.isdeleted', 0)
            ->join('tube_test', 'tube_test.tube_id = tube.id', 'left')
            ->join('lab_test', 'lab_test.hash = tube_test.test_id', 'left')
            ->like("name", $searchText)
            ->group_by('tube.name,tube.id')
            ->count_all_results($this->table);
    }

    public function get_all($params)
    {
        $start = $params['start'];
        $rowsPerPage = $params['length'];
        $page = $start / $rowsPerPage;
        $searchText = $params['search']['value'];

        return $this->db
            ->select('tube.id, tube.name, GROUP_CONCAT(lab_test.test_name) as tests, GROUP_CONCAT(lab_test.hash) as test_ids')
            ->where('tube.isdeleted', 0)
            ->join('tube_test', 'tube_test.tube_id = tube.id', 'left')
            ->join('lab_test', 'lab_test.hash = tube_test.test_id', 'left')
            ->where('lab_test.lab_hash is null')
            ->like("tube.name", $searchText)
            ->group_by('tube.id')
            ->order_by('tube.id', 'asc')
            ->get($this->table, $rowsPerPage, $page * $rowsPerPage)
            ->result();
    }

    public function get_all_alias()
    {
        return $this->db
            ->where('isdeleted', 0)
            ->get($this->table)
            ->result();
    }

    public function get($id)
    {
        $tests = $this->db
            ->select('test_id')
            ->where('tube_id', $id)
            ->get('tube_test')
            ->result_array();
        $tests = array_column($tests, 'test_id');
        $tube = $this->db
            ->select('id, name')
            ->where('id', $id)
            ->get($this->table)
            ->row();
        $tube->tests = $tests;
        return $tube;
    }

    public function insert($data, $tests)
    {
        $this->db->insert($this->table, $data);
        $tube_id = $this->db->insert_id();
        $tests = array_map(function ($test) use ($tube_id) {
            return ['test_id' => $test, 'tube_id' => $tube_id];
        }, $tests);
        $this->db->insert_batch('tube_test', $tests);
        return $this->get($tube_id);
    }


    public function update($id, $data, $tests)
    {
        // بدء المعاملة
        $this->db->trans_start();

        // تحديث البيانات الرئيسية
        $this->db
            ->where($this->main_column, $id)
            ->update($this->table, $data);

        $this->db
            ->where('tube_id', $id)
            ->where_not_in('test_id', $tests)
            ->delete('tube_test');

        // الحصول على الاختبارات القديمة
        $old_tests = $this->db
            ->select('test_id')
            ->where('tube_id', $id)
            ->get('tube_test')
            ->result_array();
        $old_tests = array_column($old_tests, 'test_id');

        // إدراج الاختبارات الجديدة
        $new_tests = array_diff($tests, $old_tests);

        $new_tests_data = array_map(function ($test) use ($id) {
            return ['test_id' => $test, 'tube_id' => $id];
        }, $new_tests);

        if (!empty($new_tests_data)) {
            $this->db->insert_batch('tube_test', $new_tests_data);
        }

        // إنهاء المعاملة (إذا كانت ناجحة يتم التثبيت وإلا يتم التراجع)
        $this->db->trans_complete();

        // التحقق من نجاح المعاملة
        if ($this->db->trans_status() === FALSE) {
            // المعاملة فشلت، يمكن هنا إضافة معالجة للخطأ مثل الرمي باستثناء
            return FALSE;
        }

        // استرجاع البيانات المحدثة
        return $this->get($id);
    }


    // trancate table 
    public function truncate()
    {
        $this->db->truncate($this->table);
    }

    public function delete($id)
    {
        $this->db
            ->where($this->main_column, $id)
            ->update($this->table, ['isdeleted' => 1]);
    }

    // get tube by tests
    public function get_tube_by_tests($tests)
    {
        if (count($tests) == 0 || $tests == null) {
            return [];
        }
        return $this->db
            ->select('tube.id, tube.name, GROUP_CONCAT(lab_test.test_name) as tests, GROUP_CONCAT(lab_test.hash) as test_ids')
            ->join('tube_test', 'tube_test.tube_id = tube.id', 'left')
            ->join('lab_test', 'lab_test.hash = tube_test.test_id', 'left')
            ->where('tube.isdeleted', 0)
            ->where_in('tube_test.test_id', $tests)
            ->group_by('tube.id')
            ->get($this->table)
            ->result();
    }

    public function get_all_ids()
    {
        $ids =  $this->db
            ->select('id')
            ->get($this->table)
            ->result();
        return array_map(function ($id) {
            return $id->id;
        }, $ids);
    }

    public function get_all_tube_tests()
    {
        $ids =  $this->db
            ->select('id')
            ->get('tube_test')
            ->result();
        return array_map(function ($id) {
            return $id->id;
        }, $ids);
    }

    /**
     * Filter array to include only columns that exist in the table
     * 
     * @param array $data Data to be filtered
     * @param string $table Table name
     * @return array Filtered data
     */
    private function filter_columns($data, $table = null)
    {
        $table_name = $table ? $table : $this->table;
        
        // Get table fields
        $fields = $this->db->list_fields($table_name);
        
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

    public function insert_batch_tests($data)
    {
        if (empty($data)) {
            return;
        }
        
        // Filter out columns that don't exist in the table
        $filtered_data = $this->filter_columns($data, 'tube_test');
        
        $this->db->insert_batch('tube_test', $filtered_data);
    }
}
