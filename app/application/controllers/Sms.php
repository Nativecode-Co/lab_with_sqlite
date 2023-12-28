<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require __DIR__ . '/sms/autoload.php';
use Twilio\Rest\Client;
class Sms extends CI_Controller {


	function __construct()
	{
		parent::__construct();
		$this->load->helper('url');
		$this->load->library('session');
		$this->load->model('Menu_db');
		$this->load->library('pagination');
		$this->load->library('parser');



		$this->name = $this->session->userdata('name');
		$this->id = $this->session->userdata('id');
		$this->user_hash_ssesion=$this->session->userdata('user_hash');


		// if($this->name=="")
		// {
		// 	redirect('Login/logout');
		// }


	}

//here we used twillo library
	public function run_sms($phone,$message)
	{

		if($phone[0]=="0")
		{
			$phone=substr($phone, 1);
		}

		//  $account_sid = 'ACe026204b53b28afd69f8fca73044b4a1';
		//  $auth_token = '732e7d2b0a03e21beb40fa52efc202d6';



		$account_sid = 'ACe026204b53b28afd69f8fca73044b4a1';
		$auth_token = 'd4f3e28e635862c3786216359c37a537';

		//$twilio_number = "+18582511077";
		$twilio_number = "+12029913853";
		//(909) 895-3586
		//+19098953586

		$client = new Client($account_sid, $auth_token);
		$client->messages->create(
		// Where to send a text message (your cell phone?)
		// '+964 773 182 8699',
			"+964".$phone,
			array(
				'from' => $twilio_number,
				'body' => $message
			)
		);

		return "1";
	}



	public function send_sms($phone)   //send sms by send number if phone 
	{
		$message=$this->input->get("mes");
		// die($message." xx ".$phone);
		if($message!=""&&$phone!="")
		{
			// die($message." xx ".$phone);
			$this->run_sms($phone,$message);
			return 1;
		}
		else
		{
			return 0;
		}
	}






}
