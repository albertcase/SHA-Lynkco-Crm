<?php
namespace CampaignBundle;

use Core\Controller;

class PageController extends Controller {

	public function indexAction() {	
		$this->render('index');
	}

	public function testAction() {	
		
		$SmsAPI = new \Lib\SmsAPI();
		echo $SmsAPI->sendMessage('15121038676','abcdef');
		exit;
	}
	

	public function loginAction() {
		$request = $this->request;
		$fields = array(
			'id' => array('notnull', '120'),
		);
		$request->validation($fields);
		$id = $request->query->get('id');
		$user = new \stdClass();
		$user->uid = $id;
		$user->openid = 'openid_'.$id;
		$user->nickname = 'user_'.$id;
		$user->headimgurl = '111';
		setcookie('_user0206', json_encode($user), time()+3600*24*30, '/');
		echo 'user:login:'.$id;
		exit;

	}

	public function clearDataAction() {
		exit;
		$databaseAPI = new \Lib\DatabaseAPI();
		$databaseAPI->clearMake();
		$data = array('status' => 1, 'msg' => 'clear');
			$this->dataPrint($data);
		exit;

	}

	public function clearCookieAction() {
		setcookie('_user', json_encode($user), time(), '/');
		$this->statusPrint('success');
	}

}