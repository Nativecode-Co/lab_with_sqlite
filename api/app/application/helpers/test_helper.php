<?php

function split_tests($tests)
{
    $normal = [];
    $special = [];
    foreach ($tests as $test) {
        $options = $test['options'];
        if (isset($options['type'])) {
            if ($options['type'] == 'type') {
                $special[] = $test;
            } else {
                $normal[] = $test;
            }
        } else {
            $normal[] = $test;
        }
    }
    return [
        'normal' => $normal,
        'special' => $special
    ];
}

function getResult($result)
{
    $result = json_decode($result, true);
    // delete options from result
    unset($result['options']);
    return $result;
}

function manageNormalTests($tests, $patient)
{
    $tests = array_map(function ($test) use ($patient) {
        try {
            $options = $test['options'];
            $component = $options["component"][0];
            $options = $options["component"][0]["reference"];
            $options = array_filter($options, function ($item) use ($patient, $test) {

                $lowAge = isset($item['age low']) ? $item['age low'] : 0;
                $highAge = isset($item['age high']) ? $item['age high'] : 100;
                $gender = isset($item['gender']) ? $item['gender'] : "كلاهما";
                $item_unit = isset($item['unit']) ? $item['unit'] : "";
                $test_unit = isset($test['unit']) ? $test['unit'] : "";
                $item_kit = isset($item['kit']) ? $item['kit'] : "";
                $test_kit = isset($test['kit']) ? $test['kit'] : "";
                if (
                    ($item_kit == $test_kit || bothIsset($item_kit, $test_kit)) &&
                    ($item_unit == $test_unit || bothIsset($item_unit, $test_unit)) &&
                    checkGender($patient["gender"], $gender) &&
                    checkAge($patient["age"], $lowAge, $highAge)
                ) {
                    return true;
                } else {
                    return false;
                }

            });
            $options = array_map(function ($item) use ($component, $test) {
                // merge component with item and test
                if (isset($component['name'])) {
                    $item['name'] = $component['name'];
                }

                if (isset($component['unit'])) {
                    $item['unit'] = $component['unit'];
                }

                if (isset($component['result'])) {
                    $item['result_type'] = $component['result'];
                }

                $item['device'] = $test['device'];
                $item['unit_name'] = $test['unit_name'];
                if (isset($test['result'])) {
                    $item['result'] = getResult($test['result']);
                } else if ($component['name']) {
                    $item['result'] = array(
                        "checked" => true,
                        $component['name'] => ""
                    );
                }
                if (isset($test['category'])) {
                    $item['category'] = $test['category'];
                } else {
                    $item['category'] = "Tests";
                }
                return $item;
            }, $options);
            $test = $options;

        } catch (Exception $e) {
            $test = [];
        }
        return $test;
    }, $tests);
    $tests = array_merge(...$tests);
    usort($tests, function ($a, $b) {
        return $a['category'] <=> $b['category'];
    });

    return $tests;
}