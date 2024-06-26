<?php

class Json
{
  public function __construct($string)
  {
    $json = json_decode($string, true);
    $refrences = [];
    $this->type = $json['type'] ?? 'normal';
    $this->default_refrence = $json;
    if ($this->type == 'calc') {
      if (isset($json['value'])) {
        $this->value = $json['value'];
      }
    } else {
      $this->value = null;
    }
    if (isset($json['component'])) {
      $json = $json['component'];
      if (isset($json[0]))
        $json = $json[0];
      else
        $json = array();
      $this->result_type = isset($json['result']) ? $json['result'] : 'number';
    } else {
      $json = array();
    }
    if (isset($json['reference'])) {
      $refrences = $json['reference'];
    }
    $this->json = $json;
    $index = 0;
    $refrences = array_map(function ($refrence) use (&$index) {
      if (!isset($refrence['id'])) {
        $id = $index++;
      } else {
        $id = $refrence['id'];
        $index = $id + 1;
      }
      $refrence['id'] = $id;
      return $refrence;
    }, $refrences);
    $this->refrences = $refrences;
  }

  public function isnull($value)
  {
    return $value == null || $value == '' || $value == 'null' || $value == 'undefined' || $value == '0' || $value == 0;
  }



  public function filter($fields)
  {
    $refrences = $this->refrences;
    if ($this->type == 'type' || $this->type == 'culture') {
      $this->refrences = $this->default_refrence;
      return $this;
    }
    if ($this->type == 'calc') {
      $refrences = array_filter($refrences, function ($refrence) use ($fields) {
        $result = true;
        foreach ($fields as $key => $value) {
          if (isset($refrence[$key]) || $key == 'age' || $key == 'gender') {
            if ($key == 'kit' || $key == 'unit') {
              if ($this->isnull($value))
                $value = null;
              if ($this->isnull($refrence[$key]))
                $refrence[$key] = null;
            }
            if ($key == 'age') {
              $ageRange = $this->getAgeRange($refrence);
              $age = $value * 365; // convert age to days
              // if age out of range return false
              if ($age < $ageRange['low'] || $age > $ageRange['high']) {
                $result = false;
              }
            } else if ($key == 'gender') {
              // if key in['انثي','انثى'] and value in ['انثي','انثى'] return true
              if ($refrence[$key] == 'انثي' && $value == 'انثى') {
              } else if ($refrence[$key] == 'انثى' && $value == 'انثي') {
              } else if ($refrence[$key] != 'كلاهما' && $refrence[$key] != $value) {
                $result = false;
              }
            } else if ($key == 'unit') {
            } else if ($refrence[$key] != $value) {
              $result = false;
            }
          }
        }
        return $result;
      });
    } else {
      $refrences = array_filter($refrences, function ($refrence) use ($fields) {
        $result = true;
        foreach ($fields as $key => $value) {
          if (isset($refrence[$key]) || $key == 'age' || $key == 'gender') {
            if ($key == 'kit' || $key == 'unit') {
              if ($this->isnull($value))
                $value = null;
              if ($this->isnull($refrence[$key]))
                $refrence[$key] = null;
            }
            if ($key == 'age') {
              $ageRange = $this->getAgeRange($refrence);
              $age = $value * 365; // convert age to days
              // if age out of range return false
              if ($age < $ageRange['low'] || $age > $ageRange['high']) {
                $result = false;
              }
            } else if ($key == 'gender') {
              // if key in['انثي','انثى'] and value in ['انثي','انثى'] return true
              $gender = isset($refrence[$key]) ? $refrence[$key] : 'كلاهما';
              if ($gender == 'انثي' && $value == 'انثى') {
              } else if ($gender == 'انثى' && $value == 'انثي') {
              } else if ($gender != 'كلاهما' && $gender != $value) {
                $result = false;
              }
            } else if ($refrence[$key] != $value) {
              $result = false;
            }
          }
        }
        return $result;
      });
    }



    $refrences = array_map(function ($refrence) {
      $refrence['result_type'] = $refrence["result"] ?? $this->result_type;
      $refrence['type'] = $this->type;
      $refrence['value'] = $this->value;
      return $refrence;
    }, $refrences);

    $refrences = array_values($refrences);


    $this->refrences = $refrences;
    return $this;
  }

  public function filterToArray($fields)
  {
    $refrences = $this->refrences;
    $refrences = array_filter($refrences, function ($refrence) use ($fields) {
      $result = true;
      foreach ($fields as $key => $value) {
        if (isset($refrence[$key]) || $key == 'age' || $key == 'gender') {
          if ($key == 'kit' || $key == 'unit') {
            if ($this->isnull($value))
              $value = null;
            if ($this->isnull($refrence[$key]))
              $refrence[$key] = null;
          }
          if ($key == 'age') {
            $ageRange = $this->getAgeRange($refrence);
            $age = $value * 365; // convert age to days
            // if age out of range return false
            if ($age < $ageRange['low'] || $age > $ageRange['high']) {
              $result = false;
            }
          } else if ($key == 'gender') {
            // if key in['انثي','انثى'] and value in ['انثي','انثى'] return true
            if ($refrence[$key] == 'انثي' && $value == 'انثى') {
            } else if ($refrence[$key] == 'انثى' && $value == 'انثي') {
            } else if ($refrence[$key] != 'كلاهما' && $refrence[$key] != $value) {
              $result = false;
            }
          } else if ($refrence[$key] != $value) {
            $result = false;
          }
        } else {
          $result = false;
        }
      }
      return $result;
    });
    return array_values($refrences);
  }
  public function setHeight($font)
  {
    if ($this->type == 'type' || $this->type == 'culture') {
      return $this;
    }
    $refrences = $this->refrences;
    if(isset($this->json["name"])){
        $name = $this->json["name"];
        $line = strlen($name);
        $line = ($line / 25);
    }else{
        $line = 1;
    }
    if (count($refrences) == 0) {
      $refrences = $this->default_refrence;
      unset($refrences['component']);
      $refrences['range'] = array();
      $refrences['type'] = isset($this->type) ? $this->type : 'normal';
      $refrences['result_type'] = isset($this->result_type) ? $this->result_type : 'number';
      $height = isset($refrences['range']) ? count($refrences['range']) : 1;
      $height = $height == 0 ? 1 : $height;
      $height = $height + $line;
      $refrences['height'] = 9 + ($height * 5.5) + (1.15944 * $height * $font);
    } else {
      $refrences = array_map(function ($refrence) use ($font, $line) {
        $height = 0;
        if (isset($refrence['range'])) {
          // use range to calculate height
          foreach ($refrence['range'] as $range) {
            $name = isset($range['name']) ? $range['name'] : '';
            $low = isset($range['low']) ? $range['low'] : '';
            $high = isset($range['high']) ? $range['high'] : '';
            $length = strlen($name) + strlen($low) + strlen($high) + 6;
            $length = ($font * $length * 0.5) / 185; // =1.0835027027027
            $length = ceil($length);
            $height += $length;
          }
        } else {
          $height = 1;
        }
        $height = $height + $line;
        $refrence['height'] = 9.01 + ($height * 5.5) + (1.14 * $height * $font);
        return $refrence;
      }, $refrences);
    }

    $this->refrences = $refrences;
    return $this;
  }

  public function get()
  {
    return $this->refrences;
  }

  public function row()
  {
    if ($this->type == 'type' || $this->type == 'culture') {
      return $this->default_refrence;
    } else {
      if (!isset($this->refrences[0])) {
        return $this->refrences;
      } else {
        $length = count($this->refrences);
        if ($length == 0) {
          return array();
        } else if ($length == 1) {
          return $this->refrences[0];
        } else {
          $min = $this->refrences[0];
          foreach ($this->refrences as $refrence) {
            $ageRange = $this->getAgeRange($refrence);
            $minAgeRange = $this->getAgeRange($min);
            $def = $minAgeRange['high'] - $minAgeRange['low'];
            $new = $ageRange['high'] - $ageRange['low'];
            if ($new < $def) {
              $min = $refrence;
            }
          }
          return $min;
        }
      }
    }
  }


  function getAgeRange($refrence)
  {
    $ageLow = isset($refrence['age low']) ? $refrence['age low'] : 0;
    $ageHigh =  isset($refrence['age high']) ? $refrence['age high'] : 0;
    $ageUnitLow = isset($refrence['age unit low']) ? $refrence['age unit low'] : 'عام';
    $ageUnitHigh = isset($refrence['age unit high']) ? $refrence['age unit high'] : 'عام';
    switch ($ageUnitLow) {
      case 'عام':
        $ageLow = $ageLow * 365;
        break;
      case 'شهر':
        $ageLow = $ageLow * 30;
        break;
      default:
        break;
    }

    switch ($ageUnitHigh) {
      case 'عام':
        $ageHigh = $ageHigh * 365;
        break;
      case 'شهر':
        $ageHigh = $ageHigh * 30;
        break;
      default:
        break;
    }
    return [
      'low' => $ageLow,
      'high' => $ageHigh
    ];
  }
}
