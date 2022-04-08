var express = require('express');
var app = express();

app.set('view engine', 'ejs');

const Gpio = require('pigpio').Gpio;
const bodyParser = require('body-parser');
const Request = require('request');

const greenPIN = 17;
const redPIN = 22;
const bluePIN = 27;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const greenled = new Gpio(greenPIN, {mode: Gpio.OUTPUT});
const redled = new Gpio(redPIN, {mode: Gpio.OUTPUT});
const blueled = new Gpio(bluePIN, {mode: Gpio.OUTPUT});

let dutyCycle = 0;

var token = "";
var status = "undefined";

var customColor = false;
var red = 255;
var blue = 255;
var green = 255;

function logging(logtext)
{
    console.log(new Date().toISOString() + " : " + logtext);
}



function pulse() {
	setInterval(() => {
		led.pwmWrite(dutyCycle);

		dutyCycle += 5;
		if (dutyCycle > 255) {
			dutyCycle = 0;
		}
	}, 20);
}

app.get('/', function (req, res) {
   res.render('index', {
		status,
		red: 255-red,
		green: 255-green,
		blue: 255-blue
	});
})


app.post('/', function (req, res) {
	red = 255;
	blue = 255;
	green = 255;
	if(req.body.inputred != undefined && req.body.inputred != "" && req.body.inputred  < 256){
		red = 255 - req.body.inputred;
		customColor = true;
	}
	if(req.body.inputgreen != undefined && req.body.inputgreen != "" && req.body.inputgreen  < 256){
		green = 255 - req.body.inputgreen;
		customColor = true;
	}
	if(req.body.inputblue != undefined && req.body.inputblue != "" && req.body.inputblue  < 256){
		blue = 255 - req.body.inputblue;
		customColor = true;
	}

	if(req.body.inputtoken != undefined && req.body.inputtoken != "") {
		customColor = false;
		token = req.body.inputtoken;
	}
	teamstatus(customColor, red, green, blue);
	res.render('index', {
		status,
		red: 255-red,
		green: 255-green,
		blue: 255-blue
	});
})

teamstatus(false, 0, 0, 0);

setInterval(() => {
	teamstatus(customColor, red, green, blue);
}, 30000);



async function teamstatus(customColorP, redP, greenP, blueP) {

	logging("Custom: " + customColorP + ", red: " + redP + ", green: " + greenP + ", blue: " + blueP);

	if(!customColor){
	var headers ={"Authorization" : "Bearer " +  token}
	var url = "https://graph.microsoft.com/beta/me/presence"

	Request.get( {
                url : url,
                headers : headers,
                rejectUnauthorized: false,
                requestCert: false,
                agent: false
        }, function(error, response, body) {
                if(body != undefined && body != "") {
                        var bodyJSON = JSON.parse(body);
			status = bodyJSON["availability"];
			if(status == "Available"){
				setGreen();
				logging("Status: Available");
			} else if(status == "Away"){
				setYellow();
				logging("Status: Away");
			} else if(status == "Busy"){
				setRed();
				logging("Status: Busy");
			} else {
				status = "Unknown";
				setBlue();
				logging("Status: Unknown");
			}
                } else {
			setBlue();
		}
        });
	} else {
		setCustomColor(redP, greenP, blueP);
	}

}

function setRed(){
	red = 0;
	green = 255;
	blue = 255;
	setCurrentColor();
}

function setGreen(){
	red = 255;
	green = 0;
	blue = 255;
	setCurrentColor();
}

function setBlue(){
	red = 255;
	green = 255;
	blue = 0;
	setCurrentColor();
}

function setYellow(){
	red = 0;
	green = 175;
	blue = 255;
	setCurrentColor();
}

function setCustomColor(redP, greenP, blueP){
	greenled.pwmWrite(greenP);
	redled.pwmWrite(redP);
	blueled.pwmWrite(blueP);
}

function setCurrentColor(){
	greenled.pwmWrite(green);
	redled.pwmWrite(red);
	blueled.pwmWrite(blue);
}


var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Application up and running at http://%s:%s", host, port)
})
