<?php defined('BASEPATH') or exit('No direct script access allowed');

class Migration_Add_catigory_to_lab_type extends CI_Migration
{

    public function up()
    {
        $this->dbforge->add_column('lab_type', array(
            'catigory' => array(
                'type' => 'VARCHAR',
                'constraint' => '255',
                'null' => TRUE
            )
        ));
    }

    public function down()
    {
        $this->dbforge->drop_column('lab_type', 'catigory');
    }
}
