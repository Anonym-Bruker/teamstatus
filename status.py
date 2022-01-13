import RPi.GPIO as GPIO
import time
import requests
from requests.exceptions import HTTPError


token = ''
headers ={"Authorization" : "Bearer " +  token}
url = "https://graph.microsoft.com/beta/me/presence"

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

green = 17;
red = 22;
blue = 27;

GPIO.setup(red,GPIO.OUT)
GPIO.setup(blue,GPIO.OUT)
GPIO.setup(green,GPIO.OUT)

while 1<2:

	try:
	    response = requests.get(url, headers = headers)
	    response.raise_for_status()
	    # access JSOn content
	    jsonResponse = response.json()
	    #print("Entire JSON response")
	    #print(jsonResponse)
	    print("Status: " + jsonResponse["availability"])


	except HTTPError as http_err:
		error = f'{http_err}'
		if(error == "401 Client Error: Unauthorized for url: https://graph.microsoft.com/beta/me/presence"):
			print("Unauthorized, log inn på nytt")
			GPIO.output(red,GPIO.HIGH)
			GPIO.output(blue,GPIO.LOW)
			GPIO.output(green,GPIO.HIGH)
			while True:
				try:
					token = input("Enter new token:")
					headers ={"Authorization" : "Bearer " +  token}
					continue
				except:
					print("Waiting for token....")
					GPIO.output(red,GPIO.HIGH)
					GPIO.output(blue,GPIO.LOW)
					GPIO.output(green,GPIO.HIGH)
					time.sleep(2)
					GPIO.output(red,GPIO.HIGH)
					GPIO.output(blue,GPIO.HIGH)
					GPIO.output(green,GPIO.HIGH)
					time.sleep(2)
				        #run this while there is no input
		else:
			print('HTTP error occurred: ' + error)
			time.sleep(30)
			continue
		print(error)
		print(f'HTTP error: {http_err}')
	except Exception as err:
	    print(f'Other error occurred: {err}')

	if(jsonResponse["availability"] == "Available"):
		GPIO.output(red,GPIO.HIGH)
		GPIO.output(blue,GPIO.HIGH)
		GPIO.output(green,GPIO.LOW)
	else:
		GPIO.output(green,GPIO.HIGH)
		GPIO.output(blue,GPIO.HIGH)
		GPIO.output(red,GPIO.LOW)
