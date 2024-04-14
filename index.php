<?php
$list = array(array("kit" => 10), array("kit" => 11));

$index = 0;
$filtered = array_filter($list, function ($item) use ($index) {
    $item['index'] = $index;
    $index++;
    return $item['kit'] == 11;
});

echo json_encode($filtered);