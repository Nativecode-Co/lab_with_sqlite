<?php
/*
{
  "component": [
    {
      "name": "Anti-Proteinase-3",
      "result": "number",
      "options": [],
      "shortcut": "",
      "reference": [
        {
          "kit": "10",
          "note": "",
          "unit": "16531501191676627",
          "range": [
            {
              "low": "5",
              "high": "10",
              "name": "low"
            },
            {
              "low": "10",
              "high": "20",
              "name": "high"
            }
          ],
          "gender": "ذكر",
          "age low": "20",
          "age high": "60",
          "age unit low": "عام",
          "age unit high": "عام"
        },
        {
          "kit": "10",
          "note": "",
          "unit": "16531501191676627",
          "range": [
            {
              "low": "5",
              "high": "10",
              "name": "low"
            },
            {
              "low": "10",
              "high": "20",
              "name": "high"
            }
          ],
          "gender": "ذكر",
          "age low": "20",
          "age high": "60",
          "age unit low": "عام",
          "age unit high": "عام"
        }
      ]
    }
  ]
}
*/
class Json
{
  public function __construct($string)
  {
    $json = json_decode($string, true);
    $refrences = [];
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

  public function getRefrenceByFields($fields)
  {
    $refrences = $this->refrences;
    $refrences = array_filter($refrences, function ($refrence) use ($fields) {
      $result = true;
      foreach ($fields as $key => $value) {
        if (isset($refrence[$key])) {
          if ($refrence[$key] != $value) {
            $result = false;
          }
        }
      }
      return $result;
    });
    return $refrences;
  }

}