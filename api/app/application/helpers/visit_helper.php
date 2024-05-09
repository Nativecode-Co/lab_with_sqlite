<?php

function get_birth_date($age)
{
    $age = $age * 365;
    $birth = date('Y-m-d', strtotime("-$age days"));
    return $birth;
}

function get_age($age_year, $age_month, $age_day)
{
    $age = ($age_year * 365) + ($age_month * 30) + $age_day;
    return round($age / 365, 2);
}

function split_data($data)
{
    $age_month = (isset($data["age_month"]) && $data["age_month"] != "") ? $data["age_month"] : 0;
    $age_day = (isset($data["age_day"]) && $data["age_day"] != "") ? $data["age_day"] : 0;
    $age_year = (isset($data["age_year"]) && $data["age_year"] != "") ? $data["age_year"] : 0;
    $age = get_age($age_year, $age_month, $age_day);
    $birth = get_birth_date($age);

    $doctor_hash = (isset($data["doctor_hash"]) && $data["doctor_hash"] != "") ? $data["doctor_hash"] : "";
    $address = (isset($data["address"]) && $data["address"] != "") ? $data["address"] : "";
    $phone = (isset($data["phone"]) && $data["phone"] != "") ? $data["phone"] : "";
    $visits_patient_id = (isset($data["patient"]) && $data["patient"] != "") ? $data["patient"] : create_hash();
    $note = (isset($data["note"]) && $data["note"] != "") ? $data["note"] : "";
    $discount = (isset($data["dicount"]) && $data["dicount"] != "") ? $data["dicount"] : 0;
    $net_price = (isset($data["net_price"]) && $data["net_price"] != "") ? $data["net_price"] : 0;
    $total_price = (isset($data["total_price"]) && $data["total_price"] != "") ? $data["total_price"] : 0;
    $tests = (isset($data["tests"]) && $data["tests"] != "") ? $data["tests"] : "[]";
    $gender = (isset($data["gender"]) && $data["gender"] != "") ? $data["gender"] : "ذكر";
    $patient_data = array(
        "birth" => $birth,
        "age_year" => $age_year,
        "age_month" => $age_month,
        "age_day" => $age_day,
        "gender" => $data["gender"],
        "address" => $address,
        "phone" => $phone,
        "hash" => $visits_patient_id
    );
    if (isset($data["name"])) {
        $patient_data["name"] = $data["name"];
    }
    $visit_hash = isset($data["hash"]) ? $data["hash"] : create_hash();
    $visit_data = array(
        "visits_patient_id" => $visits_patient_id,
        "visit_date" => $data["visit_date"],
        "doctor_hash" => $doctor_hash,
        "visits_status_id" => 2,
        "note" => $note,
        "total_price" => $total_price,
        "dicount" => $discount,
        "net_price" => $net_price,
        "age" => $age,
        "hash" => $visit_hash
    );
    return array(
        "tests" => $tests,
        "patient_data" => $patient_data,
        "visit_data" => $visit_data
    );
}

function bothIsset($var1, $var2)
{
    if (
        ($var1 == "" || $var1 == null || $var1 == "undefined" || $var1 == "null" || $var1 == "0") &&
        ($var2 == "" || $var2 == null || $var2 == "undefined" || $var2 == "null" || $var2 == "0")
    ) {
        return true;
    }
    return false;
}

function checkGender($gender1, $gender2)
{
    // replace ى with ي
    $gender1 = str_replace('ى', 'ي', $gender1);
    $gender2 = str_replace('ى', 'ي', $gender2);
    if (($gender1 == $gender2) || ($gender1 == 'كلاهما') || ($gender2 == 'كلاهما')) {
        return true;
    } else {
        return false;
    }
}

function checkAge($age, $low, $high)
{
    if ($age >= $low && $age <= $high) {
        return true;
    } else {
        return false;
    }
}
