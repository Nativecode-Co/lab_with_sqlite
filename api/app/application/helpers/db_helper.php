<?php

function create_hash()
{
    return round(microtime(true) * 10000) . rand(0, 1000);
}



