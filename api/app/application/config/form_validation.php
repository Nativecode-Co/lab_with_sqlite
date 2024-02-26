<?php

$config = array(
    "package" => array(
        array(
            'field' => 'name',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'catigory_id',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
        array(
            'field' => 'cost',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
        array(
            'field' => 'price',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        )
    ),
    // name, jop, jop_en
    "workers" => array(
        array(
            'field' => 'name',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'jop',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'jop_en',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
    ),
    //name, jop, phone, commission, partmen_hash
    "doctors" => array(
        array(
            'field' => 'name',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'jop',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'phone',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
        array(
            'field' => 'commission',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
        array(
            'field' => 'partmen_hash',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
    ),

    // name, username, password
    "users" => array(
        array(
            'field' => 'name',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'username',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'password',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
    ),

    //main_tests => test_name, test_type, option_test, category_hash
    "main_tests" => array(
        array(
            'field' => 'test_name',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'test_type',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'option_test',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'category_hash',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
    ),
);