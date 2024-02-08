<?php

function create_hash()
{
    return round(microtime(true) * 10000) . rand(0, 1000);
}

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

