<?php 
require_once 'http-caller.php';

$url = "http://120.27.136.31:8086/LeadApiGroup";
$data = array('name'=>'demon', 'cellPhone1'=>'15121038676','extDescription'=>'test');
$api = "LeadAssortedOemService.addSingleOriginLead"; 
$version = '1.0.0';
$ak = 'de8cc2d4745e4b64ae4d46904d9b38cd';
$sk = 'iZlNm7cvWb0e5zWvk71NzC3V6fg=';
$phpCaller = new HttpCaller();


$result = $phpCaller->doPost($url, $data, $api, $version, $ak, $sk); 
echo $result;
