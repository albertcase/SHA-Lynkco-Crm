<?php 
include_once("SmsAPI.php");

$smsapi = new SmsAPI();
echo $smsapi->sendMessage('15121038676', 'abcdef');
exit;