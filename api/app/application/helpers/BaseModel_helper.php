<?php

class BaseModel
{
    function __construct($db, $table, $main_column = 'id')
    {
        $this->db = $db;
        $this->table = $table;
        $this->main_column = $main_column;
        get_instance()->load->helper('db');
    }



    function get($id, $where = array(), $select = array())
    {
        if (empty($select)) {
            $select = '*';
        }
        $data = $this->db->select($select)->get_where($this->table, array_merge($where, array($this->main_column => $id)))->row_array();
        return $data;
    }

    function get_with_join($id, $join, $where = array(), $select = array())
    {
        if (empty($select)) {
            $select = '*';
        }
        $this->db->select($select);
        $this->db->from($this->table);
        join_table($this->db, $join);
        $data = $this->db->where(array_merge($where, array($this->main_column => $id)))->get()->row_array();
        return $data;
    }

    function get_all($where = array(), $select = array())
    {
        if (empty($select)) {
            $select = '*';
        }
        $data = $this->db->order_by('id', 'desc')->select($select)->get_where($this->table, $where)->result_array();
        return $data;
    }

    function get_all_with_join($join, $where = array(), $select = array())
    {
        if (empty($select)) {
            $select = '*';
        }
        $this->db->select($select);
        $this->db->from($this->table);
        foreach ($join as $key => $value) {
            $this->db->join($value['table'], $value['condition'], $value['type']);
        }
        $data = $this->db->where($where)->get()->result_array();
        return $data;
    }

    function insert($data)
    {
        if ($this->main_column == 'hash') {
            $data['hash'] = create_hash();
        }
        $this->db->insert($this->table, $data);
        $id = $this->db->insert_id();
        return $this->get($id);
    }

    function update($id, $data)
    {
        $this->db->where($this->main_column, $id)->update($this->table, $data);
        return $this->get($id);
    }

    function delete($id)
    {
        $this->db->where($this->main_column, $id)->delete($this->table);
        return $this->get($id);
    }

    function count($where = array())
    {
        return $this->db->where($where)->count_all_results($this->table);
    }

    function count_with_join($join, $where = array())
    {
        $this->db->from($this->table);
        foreach ($join as $key => $value) {
            $this->db->join($value['table'], $value['condition'], $value['type']);
        }
        return $this->db->where($where)->count_all_results();
    }

    function exists($where = array())
    {
        return $this->db->where($where)->count_all_results($this->table) > 0;
    }

    function bulk_insert($data)
    {
        $this->db->insert_batch($this->table, $data);
        return $this->db->affected_rows();
    }

    function bulk_update($data, $column)
    {
        $this->db->update_batch($this->table, $data, $column);
        return $this->db->affected_rows();
    }

    function bulk_delete($ids)
    {
        $this->db->where_in($this->main_column, $ids)->delete($this->table);
        return $this->db->affected_rows();
    }

    function insert_or_update($data, $where)
    {
        if ($this->exists($where)) {
            $this->db->where($where)->update($this->table, $data);
            return $this->get_all($where);
        } else {
            $this->db->insert($this->table, $data);
            $id = $this->db->insert_id();
            return $this->get($id);
        }
    }
}