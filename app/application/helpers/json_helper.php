<?php
class Json
{
  public function __construct($string)
  {
    $json = json_decode($string, true);
    $refrences = [];
    $this->type = $json['type'] ?? 'normal';
    $this->default_refrence = $json;
    if (isset($json['component'])) {
      $json = $json['component'];
      $json = $json[0];
    } else {
      $json = array();
    }
    if (isset($json['reference'])) {
      $refrences = $json['reference'];
    }
    $this->json = $json;
    $this->refrences = $refrences;
  }

  public function filter($fields)
  {
    $refrences = $this->refrences;
    if ($this->type != 'normal') {
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
    $refrences = array_values($refrences);
    $this->refrences = $refrences;
    return $this;
  }
  public function setHeight()
  {
    if ($this->type != 'normal') {
      return $this;
    }
    $refrences = $this->refrences;
    $refrences = array_map(function ($refrence) {
      $rangeCount = count($refrence['range']);
      $refrence['height'] = $rangeCount;
      return $refrence;
    }, $refrences);
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

  public function getAgeRange($refrence)
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