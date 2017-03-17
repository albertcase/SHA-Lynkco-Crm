<?php
namespace CampaignBundle;

use Core\Controller;

class PageController extends Controller {

	public function indexAction() {	
		$this->render('index');
	}

	public function testAction() {	
		
		//$SmsAPI = new \Lib\SmsAPI();
		//echo $SmsAPI->sendMessage('15121038676','abcdef');
		$url = "http://120.27.136.31:8086/LeadApiGroup";
		$lead = array('name'=>'测试','cellPhone1'=>'15121038676','extDescription'=>'{ [ {"question": "你有车吗", "answer": "没有"}, { "question": "你有车吗", "answer": "没有" }, { "question": "你有车吗", "answer": "没有"}]}');
		$lead1 = json_encode($lead);
		$leadSource = array('name'=>'官网','code'=>'Official_Site');
		$leadSource1 = json_encode($leadSource);
		$data = array('_api_name'=>'LeadAssortedOemService.createOriginLead', '_api_version'=>'1.0.0','_api_access_key'=>'de8cc2d4745e4b64ae4d46904d9b38cd','leadWithCarCodeDto'=>$lead1,'leadSource'=>$leadSource1,'leadType'=>'0');
		$api = "LeadAssortedOemService.createOriginLead"; 
		$version = '1.0.0';
		$ak = 'de8cc2d4745e4b64ae4d46904d9b38cd';
		$sk = 'iZlNm7cvWb0e5zWvk71NzC3V6fg=';
		$phpCaller = new \Lib\HttpcallerAPI();

		$result = $phpCaller->doPost($url, $data, $api, $version, $ak, $sk); 
		echo $result;

		exit;
	}
	

	public function smsAction() {
		if (isset($_SESSION['check_timestamp']) &&time() <= ( $_SESSION['check_timestamp']+60)) {
			$data = array('status' => 0, 'msg' => '请勿重复调用');
			$this->dataPrint($data);
		}
		$request = $this->request;
		$fields = array(
			'mobile' => array('cellphone', '120'),
		);
		$request->validation($fields);
		$mobile = $request->request->get('mobile');
		$SmsAPI = new \Lib\SmsAPI();
		$code = mt_rand(100000, 999999);
		$_SESSION['check_code'] = $code;
		$_SESSION['check_timestamp'] = time();
		$SmsAPI->sendMessage($mobile, $code);
		$data = array('status' => 1, 'msg' => '发送成功');
		$this->dataPrint($data);
		exit;

	}

	public function submitAction() {
		if (!isset($_SESSION['check_code'])) {
			$data = array('status' => 0, 'msg' => '请先请求验证码');
			$this->dataPrint($data);
		}
		$request = $this->request;
		$fields = array(
			'q1' => array('notnull', '120'),
			'q2' => array('notnull', '121'),
			'q3' => array('notnull', '122'),
			'name' => array('notnull', '124'),
			'tel' => array('notnull', '125'),
			'code' => array('notnull', '126'),
		);
		
		$request->validation($fields);
		$q1 = $request->request->get('q1');
		$q2 = $request->request->get('q2');
		$q3 = $request->request->get('q3');
		$name = $request->request->get('name');
		$tel = $request->request->get('tel');
		$code = $request->request->get('code');
		if ($code != $_SESSION['check_code']) {
			$data = array('status' => 2, 'msg' => '验证码不正确');
			$this->dataPrint($data);
		}
		
		unset($_SESSION['check_timestamp']);
		unset($_SESSION['check_code']);
		$answer = array();
		$answer[] = array('question'=>'您是否愿意见证一个全新汽车品牌的诞生？', 'answer'=>$q1);
		$answer[] = array('question'=>'您是否计划购买一辆新车？', 'answer'=>$q2);
		$answer[] = array('question'=>'您是否愿意到LYNK & CO的活动现场先睹为快？', 'answer'=>$q3);
		$extDescription = json_encode($answer);
		$rs = $this->sendData($name, $tel, $extDescription);
		$rs = json_decode($rs);
		if ($rs->code == 200) {
			$data = array('status' => 1, 'msg' => '提交成功');
			$this->dataPrint($data);
		} else {
			$data = array('status' => $rs->code, 'msg' => $rs->message);
			$this->dataPrint($data);
		}
		exit;

	}

	private function sendData($name, $tel, $extDescription) {
		$url = WS_URL;
		$lead = array('name'=>$name,'cellPhone1'=>$tel,'extDescription'=>$extDescription);
		$lead1 = json_encode($lead);
		$leadSource = array('name'=>'官网','code'=>'Official_Site');
		$leadSource1 = json_encode($leadSource);
		$ak = CSB_AK;
		$sk = CSB_SK;
		$api = CSB_API;
		$api_name = CSB_API_NAME;
		$version = CSB_VERSION;
		$data = array('_api_name'=>$api_name, '_api_version' => $version,'_api_access_key' => $ak,'leadWithCarCodeDto'=>$lead1,'leadSource'=>$leadSource1,'leadType'=>'0');
		$phpCaller = new \Lib\HttpcallerAPI();

		$result = $phpCaller->doPost($url, $data, $api, $version, $ak, $sk); 
		return $result;
	}

	public function clearCookieAction() {
		setcookie('_user', json_encode($user), time(), '/');
		$this->statusPrint('success');
	}

}