#import RPi.GPIO as GPIO
import sys
import pigpio
import time
import requests
from requests.exceptions import HTTPError

from threading import Thread
import datetime

thread_running = True
running = True

global jsonResponse

token = ""
headers ={"Authorization" : "Bearer " +  token}
url = "https://graph.microsoft.com/beta/me/presence"
jsonResponse = {}


#GPIO.setmode(GPIO.BCM)
#GPIO.setwarnings(False)

green = 17;
red = 22;
blue = 27;

pi = pigpio.pi()

#GPIO.setup(red,GPIO.OUT)
#GPIO.setup(blue,GPIO.OUT)
#GPIO.setup(green,GPIO.OUT)

def LEDblue():
	pi.set_PWM_dutycycle(red, 255)
	pi.set_PWM_dutycycle(blue, 0)
	pi.set_PWM_dutycycle(green, 255)
	#GPIO.output(red,GPIO.HIGH)
	#GPIO.output(blue,GPIO.LOW)
	#GPIO.output(green,GPIO.HIGH)

def LEDgreen():
	pi.set_PWM_dutycycle(red, 255)
	pi.set_PWM_dutycycle(blue, 255)
	pi.set_PWM_dutycycle(green, 0)
	#GPIO.output(red,GPIO.HIGH)
	#GPIO.output(blue,GPIO.HIGH)
	#GPIO.output(green,GPIO.LOW)

def LEDred():
	pi.set_PWM_dutycycle(red, 0)
	pi.set_PWM_dutycycle(blue, 255)
	pi.set_PWM_dutycycle(green, 255)
	#GPIO.output(red,GPIO.LOW)
	#GPIO.output(blue,GPIO.HIGH)
	#GPIO.output(green,GPIO.HIGH)

def LEDyellow():
	pi.set_PWM_dutycycle(red, 0)
	pi.set_PWM_dutycycle(blue, 255)
	pi.set_PWM_dutycycle(green, 175)
	#GPIO.output(red,GPIO.LOW)
	#GPIO.output(blue,GPIO.HIGH)
	#GPIO.output(green,GPIO.LOW)


def LEDblack():
	pi.set_PWM_dutycycle(red, 255)
	pi.set_PWM_dutycycle(blue, 255)
	pi.set_PWM_dutycycle(green, 255)
	#GPIO.output(red,GPIO.HIGH)
	#GPIO.output(blue,GPIO.HIGH)
	#GPIO.output(green,GPIO.HIGH)


def my_forever_while():
	global thread_running
	start_time = time.time()
	#print("Starter tid")
	# run this while there is no input
	while thread_running:
		#print("Blink")
		LEDblue()
		time.sleep(1.1)
		#Do something....
		LEDblack()
		time.sleep(0.1)
		LEDblue()
		time.sleep(0.1)
		LEDblack()
		time.sleep(0.1)


def take_input():
	global headers
	global running
	token = input("Enter new token:")
	if(token == "exit"):
		running = False

	headers ={"Authorization" : "Bearer " +  token}
	#print("Headers: " + headers["Authorization"])


while running:
	try:
		#print("Headers: " + headers["Authorization"])
		response = requests.get(url, headers = headers)
		response.raise_for_status()
		# access JSOn content
		jsonResponse = response.json()
		timestamp = datetime.datetime.now()
		ts = timestamp.strftime("%H:%M:%S")
		print(ts + ": Status: " + jsonResponse["availability"])
		if(jsonResponse["availability"] == "Available"):
			LEDgreen()
		elif(jsonResponse["availability"] == "Away"):
			LEDyellow()
		else:
			LEDred()
		time.sleep(30)

	except HTTPError as http_err:
		error = f'{http_err}'
		if(error == "401 Client Error: Unauthorized for url: https://graph.microsoft.com/beta/me/presence"):
			jsonResponse = {}
			print("Unauthorized, log inn på nytt")
			LEDblue()

			t1 = Thread(target=my_forever_while)
			t2 = Thread(target=take_input)
			thread_running = True

			t1.start()
			t2.start()

			t2.join()  # interpreter will wait until your process get completed or terminated
			thread_running = False
			#print('The end')
		else:
			print('HTTP error occurred: ' + error)
			time.sleep(30)
			continue
		#print(error)
		print(f'HTTP error: {http_err}')
	except Exception as err:
		print(f'Other error occurred: {err}')

print("Exiting")
time.sleep(1.5)
pi.stop()
