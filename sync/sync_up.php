<?php
if(!function_exists('sg_load')){$__v=phpversion();$__x=explode('.',$__v);$__v2=$__x[0].'.'.(int)$__x[1];$__u=strtolower(substr(php_uname(),0,3));$__ts=(@constant('PHP_ZTS') || @constant('ZEND_THREAD_SAFE')?'ts':'');$__f=$__f0='ixed.'.$__v2.$__ts.'.'.$__u;$__ff=$__ff0='ixed.'.$__v2.'.'.(int)$__x[2].$__ts.'.'.$__u;$__ed=@ini_get('extension_dir');$__e=$__e0=@realpath($__ed);$__dl=function_exists('dl') && function_exists('file_exists') && @ini_get('enable_dl') && !@ini_get('safe_mode');if($__dl && $__e && version_compare($__v,'5.2.5','<') && function_exists('getcwd') && function_exists('dirname')){$__d=$__d0=getcwd();if(@$__d[1]==':') {$__d=str_replace('\\','/',substr($__d,2));$__e=str_replace('\\','/',substr($__e,2));}$__e.=($__h=str_repeat('/..',substr_count($__e,'/')));$__f='/ixed/'.$__f0;$__ff='/ixed/'.$__ff0;while(!file_exists($__e.$__d.$__ff) && !file_exists($__e.$__d.$__f) && strlen($__d)>1){$__d=dirname($__d);}if(file_exists($__e.$__d.$__ff)) dl($__h.$__d.$__ff); else if(file_exists($__e.$__d.$__f)) dl($__h.$__d.$__f);}if(!function_exists('sg_load') && $__dl && $__e0){if(file_exists($__e0.'/'.$__ff0)) dl($__ff0); else if(file_exists($__e0.'/'.$__f0)) dl($__f0);}if(!function_exists('sg_load')){$__ixedurl='https://www.sourceguardian.com/loaders/download.php?php_v='.urlencode($__v).'&php_ts='.($__ts?'1':'0').'&php_is='.@constant('PHP_INT_SIZE').'&os_s='.urlencode(php_uname('s')).'&os_r='.urlencode(php_uname('r')).'&os_m='.urlencode(php_uname('m'));$__sapi=php_sapi_name();if(!$__e0) $__e0=$__ed;if(function_exists('php_ini_loaded_file')) $__ini=php_ini_loaded_file(); else $__ini='php.ini';if((substr($__sapi,0,3)=='cgi')||($__sapi=='cli')||($__sapi=='embed')){$__msg="\nPHP script '".__FILE__."' is protected by SourceGuardian and requires a SourceGuardian loader '".$__f0."' to be installed.\n\n1) Download the required loader '".$__f0."' from the SourceGuardian site: ".$__ixedurl."\n2) Install the loader to ";if(isset($__d0)){$__msg.=$__d0.DIRECTORY_SEPARATOR.'ixed';}else{$__msg.=$__e0;if(!$__dl){$__msg.="\n3) Edit ".$__ini." and add 'extension=".$__f0."' directive";}}$__msg.="\n\n";}else{$__msg="<html><body>PHP script '".__FILE__."' is protected by <a href=\"https://www.sourceguardian.com/\">SourceGuardian</a> and requires a SourceGuardian loader '".$__f0."' to be installed.<br><br>1) <a href=\"".$__ixedurl."\" target=\"_blank\">Click here</a> to download the required '".$__f0."' loader from the SourceGuardian site<br>2) Install the loader to ";if(isset($__d0)){$__msg.=$__d0.DIRECTORY_SEPARATOR.'ixed';}else{$__msg.=$__e0;if(!$__dl){$__msg.="<br>3) Edit ".$__ini." and add 'extension=".$__f0."' directive<br>4) Restart the web server";}}$__msg.="</body></html>";}die($__msg);exit();}}return sg_load('08FBE912C7C4FD5DAAQAAAAhAAAABMAAAACABAAAAAAAAAD/6Wbv7A08r+T3++IjIEo6q2RnxdKdlNcCpK2OB5A1aeNCBSlo7buJUCLOVguyG+1CA4DidzrzpgoYxJemkh17D7RzYjxgl6dQeaDsxYT5veC5BCoaS+NIo6dO8YVwbGGGM2nMywkduc4/AMMF+kiacnVA/XZd9jaA1RUCoRefdMMnUc7xUlruPi5UyreR0lkqL4uT4JfTmeMx3WqrhJVFpSQlb7EhF3GwiHykeXSYR/Pe310/88a8d3fobcNvWSXISgAAAOAIAADNEC8DNfTQEAY6tVd7a/AUQhindTvjwZJdqfEpJUEcHAOBAjvZhUztiDvfgQDk3q3vZhUyvxdQ83bKQvNELlXexvti2eMDJ1Vw7npJ8gaA/Js0VzFeoLKTB4MF8lmuK48bgmsDVlbCjnVsgCR6z0GY/Wh8FTXIqwul+whHBm0G87Oq0lC2RX5I6iRFPsKKc0yZJMMWR9PAB/c3qxX058PboULv25R30YGTiCqhpu+kuVo8LgvmQpHFiM5dvsx/WEqRUvMhxKnw9YoKye0bMqdWLtqtsl/vgyO5wzQ6aRzNZNFXTiX98LXUFt/8fsUYNrRl05rp0RtXlTzZ1iWJIKaJ2cFqzsxVXTVAIUo4A+AaULw57Bqzs/TkKntlhx7mg57qdRtTby0kQDLi5f2MRiH8sD0AWtLYmQTJ8/ZbAHxANRmO8LaYwEmKvqtnEhasbZv5P8hAVRA/j5zlJ2qWZOhorNTdbScnBxq4LZT/gMRHGta0d+ZaIkDY1Hnn0ZC8A4HiWrYxZsNyCn1A5JAnuc1v3bNyYNxZKFCnIjHRa9z694t8MpC/sUZ7tumM4/YjWdxbtMDPsyZ5eCDpguvC4nPDL4Dsv6m9n90VFXULWOqd8gA1gBDxm8IkbmBVg+T6HB/R6xMHRrMfdEvxlSp0Ui1dcBRQuyAbSMMhYm3h/1Q++LzdOKmvBqCe41xFIjB1VjKrvMZt3UdXhLPtHkY7Ngv4hl2rg6pb4QXYz0in8wWjTOAyBoo55ZWIv2JcsZXmr4ao2GM3zhHSm1LmRpIcHIOdFmVN325+3Q1/argMZTvMByjoCarJ/tXzoBNKTUwsFYo/3nIZdjaIYg4BaOb2D2psgZ1/ZG4LvzxMALlE1Co2vZW/F/25rrdsh5uCyAKW7CyvqIy8ON5wGIbC5AUDKHmiwgq+H0aaRKN2YpOEjZ7tx63k9zyHIj+m+la4AfeMTs3PsRJ0dkegQn6G212ceIl3mLwuBk/+cQq7mKdcK3EIq2z1SUd58jgZIntqel/gDVwhlaA20egkSnAO/WphmkVxmFBaw+PXGXUSitW1gURoMNl1R4xZKJfRqkpbSNsjDs2wC648GYG2YUYog930ItNP3us+PRKY5gGa8Gb5tdu8l0Q2+a/9cOrpnhy6cPuTkoAtQ7WN5rVdmjyLgrU2GySyJO8nP8wkKnqEEn/Kx+ErArtwn3OlvVc0lVIqqCH3php2gnNwQE77DfcKAAt1vOVXu4cRoNkcFitBS8v/B+aezOF/vQEye7up4sg8mJyZoOYj8zJDeMK244IMcHVXiOKPHa5+sdNuxxeajtw9IoIa+etjsoMvxwRI+AOsNLHluU8LzZBVCa42sRV9CX5oKUoZSaQKyn0B7JccEFQiPXy/BZEPc/CboEZ9kC5q4Kd4ywHU9nLJWTV7WC/EFtQDTW3ZZVMQ+x/U+z3SHuj7fGoJkP1rGTBZyECsVQVpC0CJc30pVV3P5+cHz89/xCzupxlE5E8D/Yk901551UnDvO8MII5/X4uXYbe3qMZsv14EFNMLbrLfvotJiPUx5kMezUASxyuwgJ9IxaQNZAxo6GmbQWHxik3Em832u62zruPKvdbshYfHqVrCwJny8HEdXXuxU7xkm7OQDw34xKMJKTSbS3a9YoNEs+/w5dk0xySVNM+trxnAdrhaRFnBGTYGuzyQLNvDwBROS4bzw2xKdFjZB1zyIcJO1LQ+vjSrrc1hNgj09cP6LP19LMkY5owmw8Iv5izZEDp2JhTrYDlrm8kETsUjCcgSFN7qDvH1ybNvsGTxDyDjUrQmWvtGkcq2YO4TBVI4LaCbEvx/KGGJ8Ru8AmVfFsyeiRUyj1XKfLFB45RLx4zJhXOR5XCzB2gAFv7+hrjtCIu6lRa8Bb4k0kY2iTA72nIKJaBRxsM7WxAKE78EcR0jTdYBabGneLOGdaIMFJjTV+P6b3pdjLe2v4J8pVstQrwhohFl7Xii8StT73PaaiS44xmw/4c9NuLTq/9GCiYlguJaiYkBkyrzux7AJFPMbXC3/hyjN4g+WlNEqHEjwhbHJm6TMta5Z4Z9K8M45oB1wKsVLwCY+i0Y1aQ+2vIrrj7nWY715XCivL1wHB24ZDSqr2LHbsxJJPIopQpZS6oKNU6egDWFHr7zXuFYXh3PZOXj6VhQQhsK935MGfmZMNeh+of0sfdBjdNTpUB4hcXquKsERIw5/kPE8kco5r9VxmQsAwPQ7Ar6CsPY0TjwE/055BRADIwVrbNoqvdXHO+G0BGD7EobpA0gCoxbs2BVrqPoFci/co9zBqOGgzc+JhaoNJQD+qge5NNFJiwATdCBEYm5Ybi4/+a90s/yCk0h/nNyhIdu3sMJHP+vMaIMpTwYbFtw8PCtoLcjB1z//J9Gt1qQ7qIqn3l5Ck1lJLoJ+fKRrjyS4Dj88TA2PoB986HoonQia/OgSoQFNSrF64LQUzT8PNHIhpDGGTsN++22c0B8taIrIUAle6mU7ic6rqoAAg9vcBP0g7XV8DV6N3hmqD4qgOgagpA8FZ3oKwP8xMkSfwz7ejhxRe2lkHi5miPbV91dX9MKHv7Fll85X1WiRgrbnkLAy1xI+35woEABeYLXRSwX6yvfvhvm9UdIHyMbJhaGE1SrdCtTGnJ/pHvRcu68e6n2LDZGvNY1/QuApU0qotYgm7h+QYs4i0aiU5skdyu+b7hYv/S6+PUnJ238nN83cEklOt/qt8f0X0loe2EixgR9wlwkPk2cGIImIHJkwIpZ2Tea5SMqL2v29qfr5tLfqZI6BLapsF9X+cHtqVLonYdz1QWXcrj0CCnemsXYZOhWIRt7YDZ/LAbhPdU0CDQw0U0M7Ld3SNx+hkMpWMA6RQkFAWs85Adn6RbVi1jVZszy8elKywuqRPFTPeIH3pKYhBWJ6AbhYem8NMKAPqFIqKgaWv6RlQen/nfG9TOzw5qNMnQqSnxbSWLgt4R0NEV+45RyMpyPCckW4yvpGrEWDPQ0d7O4TQVTWVA8cg2D09bTs2iXYzVLUEH3AAAAAA==');
