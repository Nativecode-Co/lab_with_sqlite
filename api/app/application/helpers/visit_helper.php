<?php

function get_birth_date($age_year, $age_month, $age_day)
{
    $year = date('Y') - $age_year;
    $month = date('m') - $age_month;
    $day = date('d') - $age_day;
    if ($month < 0) {
        $year--;
        $month += 12;
    }
    if ($day < 0) {
        $month--;
        $day += 30;
    }
    return $year . '-' . $month . '-' . $day;
}

function get_age($birth_date)
{
    $birth_date = new DateTime($birth_date);
    $today = new DateTime('today');
    $age = $birth_date->diff($today)->y;
    return $age;
}

function split_data($data)
{
    $birth = get_birth_date($data["age_year"], $data["age_month"], $data["age_day"]);
    $age = get_age($birth);
    $visits_patient_id = isset($data["patient"]) ? $data["patient"] : create_hash();
    $patient_data = array(
        "name" => $data["name"],
        "birth" => $birth,
        "age_year" => $data["age_year"],
        "age_month" => $data["age_month"],
        "age_day" => $data["age_day"],
        "gender" => $data["gender"],
        "address" => $data["address"],
        "phone" => $data["phone"],
        "hash" => $visits_patient_id
    );
    $visit_hash = isset($data["visit_hash"]) ? $data["visit_hash"] : create_hash();
    $visit_data = array(
        "visits_patient_id" => $visits_patient_id,
        "visit_date" => $data["visit_date"],
        "doctor_hash" => $data["doctor_hash"],
        "visits_status_id" => 2,
        "note" => $data["note"],
        "total_price" => $data["total_price"],
        "dicount" => $data["dicount"],
        "net_price" => $data["net_price"],
        "age" => $age,
        "hash" => $visit_hash
    );
    $tests = json_decode($data["tests"], true);
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