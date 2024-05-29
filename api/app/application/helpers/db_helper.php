<?php

function create_hash()
{
   // return round(microtime(true) * 10000) . rand(0, 1000);
   return generateUnique9DigitNumber();
}

function generateUnique9DigitNumber() {
    // Get the current time in microseconds and remove the dot
    $microtime = str_replace('.', '', microtime(true));
    
    // Take the last 8 digits from the microtime
    $uniquePart = substr($microtime, -8);
    
    // Generate a random digit between 0 and 9
    $randomDigit = mt_rand(0, 9);
    
    // Combine the unique part and the random digit
    $unique9DigitNumber = $uniquePart . $randomDigit;
    
    return $unique9DigitNumber;
}



