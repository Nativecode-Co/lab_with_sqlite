<?php
if(!function_exists('sg_load')){$__v=phpversion();$__x=explode('.',$__v);$__v2=$__x[0].'.'.(int)$__x[1];$__u=strtolower(substr(php_uname(),0,3));$__ts=(@constant('PHP_ZTS') || @constant('ZEND_THREAD_SAFE')?'ts':'');$__f=$__f0='ixed.'.$__v2.$__ts.'.'.$__u;$__ff=$__ff0='ixed.'.$__v2.'.'.(int)$__x[2].$__ts.'.'.$__u;$__ed=@ini_get('extension_dir');$__e=$__e0=@realpath($__ed);$__dl=function_exists('dl') && function_exists('file_exists') && @ini_get('enable_dl') && !@ini_get('safe_mode');if($__dl && $__e && version_compare($__v,'5.2.5','<') && function_exists('getcwd') && function_exists('dirname')){$__d=$__d0=getcwd();if(@$__d[1]==':') {$__d=str_replace('\\','/',substr($__d,2));$__e=str_replace('\\','/',substr($__e,2));}$__e.=($__h=str_repeat('/..',substr_count($__e,'/')));$__f='/ixed/'.$__f0;$__ff='/ixed/'.$__ff0;while(!file_exists($__e.$__d.$__ff) && !file_exists($__e.$__d.$__f) && strlen($__d)>1){$__d=dirname($__d);}if(file_exists($__e.$__d.$__ff)) dl($__h.$__d.$__ff); else if(file_exists($__e.$__d.$__f)) dl($__h.$__d.$__f);}if(!function_exists('sg_load') && $__dl && $__e0){if(file_exists($__e0.'/'.$__ff0)) dl($__ff0); else if(file_exists($__e0.'/'.$__f0)) dl($__f0);}if(!function_exists('sg_load')){$__ixedurl='https://www.sourceguardian.com/loaders/download.php?php_v='.urlencode($__v).'&php_ts='.($__ts?'1':'0').'&php_is='.@constant('PHP_INT_SIZE').'&os_s='.urlencode(php_uname('s')).'&os_r='.urlencode(php_uname('r')).'&os_m='.urlencode(php_uname('m'));$__sapi=php_sapi_name();if(!$__e0) $__e0=$__ed;if(function_exists('php_ini_loaded_file')) $__ini=php_ini_loaded_file(); else $__ini='php.ini';if((substr($__sapi,0,3)=='cgi')||($__sapi=='cli')||($__sapi=='embed')){$__msg="\nPHP script '".__FILE__."' is protected by SourceGuardian and requires a SourceGuardian loader '".$__f0."' to be installed.\n\n1) Download the required loader '".$__f0."' from the SourceGuardian site: ".$__ixedurl."\n2) Install the loader to ";if(isset($__d0)){$__msg.=$__d0.DIRECTORY_SEPARATOR.'ixed';}else{$__msg.=$__e0;if(!$__dl){$__msg.="\n3) Edit ".$__ini." and add 'extension=".$__f0."' directive";}}$__msg.="\n\n";}else{$__msg="<html><body>PHP script '".__FILE__."' is protected by <a href=\"https://www.sourceguardian.com/\">SourceGuardian</a> and requires a SourceGuardian loader '".$__f0."' to be installed.<br><br>1) <a href=\"".$__ixedurl."\" target=\"_blank\">Click here</a> to download the required '".$__f0."' loader from the SourceGuardian site<br>2) Install the loader to ";if(isset($__d0)){$__msg.=$__d0.DIRECTORY_SEPARATOR.'ixed';}else{$__msg.=$__e0;if(!$__dl){$__msg.="<br>3) Edit ".$__ini." and add 'extension=".$__f0."' directive<br>4) Restart the web server";}}$__msg.="</body></html>";}die($__msg);exit();}}return sg_load('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');