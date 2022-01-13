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
	});
})


app.post('/', function (req, res) {
	token = req.body.inputtoken;
	teamstatus();
	res.render('index', {
	});
})

teamstatus();

setInterval(() => {
	teamstatus();
}, 30000);



async function teamstatus() {

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
			if(bodyJSON["availability"] == "Available"){
				greenled.pwmWrite(0);
				redled.pwmWrite(255);
				blueled.pwmWrite(255);
				logging("Status: Available");
			} else if(bodyJSON["availability"] == "Away"){
				greenled.pwmWrite(175);
				redled.pwmWrite(0);
				blueled.pwmWrite(255);
				logging("Status: Away");
			} else if(bodyJSON["availability"] == "Busy"){
				greenled.pwmWrite(255);
				redled.pwmWrite(0);
				blueled.pwmWrite(255);
				logging("Status: Busy");
			} else {
				greenled.pwmWrite(255);
				redled.pwmWrite(255);
				blueled.pwmWrite(0);
				logging("Status: Unknown");
			}
                } else {
			greenled.pwmWrite(255);
			redled.pwmWrite(255);
			blueled.pwmWrite(0);
		}
        });


}



var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Application up and running at http://%s:%s", host, port)
})
