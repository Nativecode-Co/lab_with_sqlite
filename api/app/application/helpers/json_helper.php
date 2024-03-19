<?php

class Json
{
  public function __construct($string)
  {
    $json = json_decode($string, true);
    $refrences = [];
    $this->type = $json['type'] ?? 'normal';
    $this->default_refrence = $json;

    if (isset ($json['component'])) {
      $json = $json['component'];
      if (isset ($json[0]))
        $json = $json[0];
      else
        $json = array();
      $this->result_type = isset ($json['result']) ? $json['result'] : 'number';
    } else {
      $json = array();
    }
    if (isset ($json['reference'])) {
      $refrences = $json['reference'];
    }
    $this->json = $json;
    $this->refrences = $refrences;
  }



  public function filter($fields)
  {
    $refrences = $this->refrences;
    if ($this->type == 'type' || $this->type == 'culture') {
      $this->refrences = $this->default_refrence;
      return $this;
    }
    $refrences = array_filter($refrences, function ($refrence) use ($fields) {
      $result = true;
      foreach ($fields as $key => $value) {
        if (isset ($refrence[$key]) || $key == 'age' || $key = 'gender') {
          if ($key == 'age') {
            $ageRange = $this->getAgeRange($refrence);
            $age = $value * 365; // convert age to days
            // if age out of range return false
            if ($age < $ageRange['low'] || $age > $ageRange['high']) {
              $result = false;
            }
          } else if ($key == 'gender') {
            if ($refrence[$key] != 'كلاهما' && $refrence[$key] != $value) {
              $result = false;
            }
          } else if ($refrence[$key] != $value) {
            $result = false;
          }
        }
      }
      return $result;
    });
    $refrences = array_map(function ($refrence) {
      unset ($refrence['age low']);
      unset ($refrence['age high']);
      unset ($refrence['age unit low']);
      unset ($refrence['age unit high']);
      $refrence['result_type'] = $this->result_type;
      $refrence['type'] = $this->type;
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
        if (isset ($refrence[$key]) || $key == 'age' || $key = 'gender') {
          if ($key == 'age') {
            $ageRange = $this->getAgeRange($refrence);
            $age = $value * 365; // convert age to days
            // if age out of range return false
            if ($age < $ageRange['low'] || $age > $ageRange['high']) {
              $result = false;
            }
          } else if ($key == 'gender') {
            if ($refrence[$key] != 'كلاهما' && $refrence[$key] != $value) {
              $result = false;
            }
          } else if ($refrence[$key] != $value) {
            $result = false;
          }
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
    if (count($refrences) == 0) {
      $refrences = $this->default_refrence;
      unset($refrences['component']);
      $refrences['range'] = array();
      $refrences['type'] = $this->type;
      $refrences['result_type'] = $this->result_type;
      $height = isset ($refrences['range']) ? count($refrences['range']) : 1;
      $height = $height == 0 ? 1 : $height;
      $refrences['height'] = 9 + ($height * 5.5) + (1.15944 * $height * $font);
    } else {
      $refrences = array_map(function ($refrence) use ($font) {
        $height = isset ($refrence['range']) ? count($refrence['range']) : 1;
        $height = $height == 0 ? 1 : $height;
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
    return $this->refrences[0] ?? $this->refrences;
  }

  function getAgeRange($refrence)
  {
    $ageLow = $refrence['age low'];
    $ageHigh = $refrence['age high'];
    $ageUnitLow = $refrence['age unit low'];
    $ageUnitHigh = $refrence['age unit high'];
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