<?php

function is__array($str)
{
    $arr = json_decode($str, true);
    return is_array($arr);
}

$config = array(
    "get_data" => array(
        array(
            'field' => 'lab_id',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
        array(
            'field' => 'data',
            'rules' => 'required|is__array',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'is__array' => 'يجب ادخال قيمة مصفوفة'
            )
        )
    ), "package" => array(
        array(
            'field' => 'name',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        // array(
        //     'field' => 'catigory_id',
        //     'rules' => 'required|numeric',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //         'numeric' => 'يجب ادخال قيمة رقمية'
        //     )
        // ),
        // array(
        //     'field' => 'cost',
        //     'rules' => 'required|numeric',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //         'numeric' => 'يجب ادخال قيمة رقمية'
        //     )
        // ),
        // array(
        //     'field' => 'price',
        //     'rules' => 'required|numeric',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //         'numeric' => 'يجب ادخال قيمة رقمية'
        //     )
        // )
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
        // array(
        //     'field' => 'jop',
        //     'rules' => 'required',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //     )
        // ),
        // array(
        //     'field' => 'jop_en',
        //     'rules' => 'required',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //     )
        // ),
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
        // array(
        //     'field' => 'jop',
        //     'rules' => 'required',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //     )
        // ),
        // array(
        //     'field' => 'phone',
        //     'rules' => 'required|numeric',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //         'numeric' => 'يجب ادخال قيمة رقمية'
        //     )
        // ),
        // array(
        //     'field' => 'commission',
        //     'rules' => 'required|numeric',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //         'numeric' => 'يجب ادخال قيمة رقمية'
        //     )
        // ),
        // array(
        //     'field' => 'partmen_hash',
        //     'rules' => 'required|numeric',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //         'numeric' => 'يجب ادخال قيمة رقمية'
        //     )
        // ),
    ),

    // name, username, password
    "users" => array(
        // array(
        //     'field' => 'name',
        //     'rules' => 'required',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //     )
        // ),
        array(
            'field' => 'username',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        // array(
        //     'field' => 'password',
        //     'rules' => 'required',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //     )
        // ),
    ),

    //main_tests => test_name, test_type, option_test, category_hash
    "main_tests" => array(
        // array(
        //     'field' => 'test_name',
        //     'rules' => 'required',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //     )
        // ),
        // array(
        //     'field' => 'test_type',
        //     'rules' => 'required',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //     )
        // ),
        // array(
        //     'field' => 'option_test',
        //     'rules' => 'required',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //     )
        // ),
        // array(
        //     'field' => 'category_hash',
        //     'rules' => 'required|numeric',
        //     'errors' => array(
        //         'required' => 'هذا الحقل مطلوب',
        //         'numeric' => 'يجب ادخال قيمة رقمية'
        //     )
        // ),
    ),

    // aliases => test_hash, alias, type
    "aliases" => array(
        array(
            'field' => 'test_hash',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
        array(
            'field' => 'alias',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'type',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
    ),

    "visit" => array(
        // visit_date, gender ,dicount total_price, net_price, tests[]
        array(
            'field' => 'visit_date',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'gender',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب ويجب ان يكون ذكر او انثى',
            ),
        ),
        array(
            'field' => 'dicount',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
        array(
            'field' => 'total_price',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
        array(
            'field' => 'net_price',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
        array(
            'field' => 'tests[]',
            'rules' => 'required',
            'errors' => array(
                'required' => 'يجب اختيار تحليل واحد على الاقل',
            )
        ),
        array(
            'field' => 'age_year',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
        array(
            'field' => 'age_month',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
        array(
            'field' => 'age_month',
            'rules' => 'required|numeric',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'numeric' => 'يجب ادخال قيمة رقمية'
            )
        ),
    ),
    "tubes" => array(
        array(
            'field' => 'name',
            'rules' => 'required',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
            )
        ),
        array(
            'field' => 'tests',
            'rules' => 'required|is__array',
            'errors' => array(
                'required' => 'هذا الحقل مطلوب',
                'is__array' => 'يجب ادخال قيمة صحيحة'
            )
        ),
    ),
);
