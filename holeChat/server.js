process.title = 'node-chat';

var WebSocketServerPort = 1337;
var WebSocketServer = require('websocket').server;
var http = require('http');


// how far back the server remembers
var chatMem = 200;
var chatHistory = [];

// list of connected clients
let clients = [];
var liveClients = [];
var awayClients = [];
var stalkers = 0;
let	totalConnections = 0;

// Helper function for escaping input strings
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**from https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex

* Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * s, l are contained in the set [0, 100]**/
function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function randomColor()
{
	return hslToHex(Math.floor((Math.random() * 360)),		//degree
					Math.floor((Math.random() * 100)),		//sturation
					Math.floor((Math.random() * 70)+ 30));		//lightness
}

var server = http.createServer(function(request, response){
	//not important since it's a web socket server
});

server.listen(WebSocketServerPort, function(){
	console.log((new Date()) + " Server is listening on port " + WebSocketServerPort);
});

//create server
wsServer = new WebSocketServer({
	httpServer: server
});

//websocket server
wsServer.on('request', function(request){
	console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
	var connection = request.accept(null, request.origin);
	//should check request origin -- sercurity reasons

	var index = clients.push(connection) - 1;
	var userName = false;
	var userColor = false;

	console.log((new Date()) + " Connection accepted.");

	//send chat history
	stalkers++;
	updateUserSummary();

	if (chatHistory.length > 0)
	{
		connection.sendUTF(JSON.stringify({	type: 'history',
											history: chatHistory}));
	}

	//user sends message
	connection.on('message', function(message){
		if (message.type === 'utf8'){ // only text
			//process message
			if (userName === false) //first message is the name
			{
				//remember userName
				userName = htmlEntities(message.utf8Data);
				//get random color and send back to user
				userColor = randomColor();
				connection.sendUTF(JSON.stringify({	type: 'color',
													date: userColor}));
				console.log((new Date()) + ' User is known as: ' + userName + ' with ' + userColor + ' color.');

				totalConnections++;
				stalkers--;
				updateUserSummary();

				var obj = {	type: 'serverMessege',
							time: (new Date()).getTime(),
							text: 'Connected',
							author: userName,
							color: userColor}
			}
			else //process message
			{
				console.log((new Date()) + ' Received Message from '
                            + userName + ': ' + message.utf8Data);

				var obj = {
					type: 'message',
					time: (new Date()).getTime(),
					text: htmlEntities(message.utf8Data),
					author: userName,
					color: userColor
				};
			}
			updateChatlog(obj);
			broadcast(obj);
		}
	});



	connection.on('close', function(connection){
		//close user connection
		if (userName !== false && userColor !== false)
		{
			console.log((new Date()) + " Peer named \"" + userName + "\" "+ connection.remoteAddress + " disconnected.");
			var obj = {
				type: 'serverMessege',
				time: (new Date()).getTime(),
				text: 'Disconnected',
				author: userName,
				color: userColor
			}
			updateChatlog(obj);
			broadcast(obj);
			//remove user from list of clients
			clients.splice(index, 1);
			totalConnections--;
		}
		else {
			//must have been a stalker
			stalkers--;
		}
		updateUserSummary();
	});

	function updateUserSummary()
	{
		console.log(" ------------ " + stalkers + " ------------ ");
		console.log(" ------------ " + totalConnections + " ------------ ");
		broadcast({	type: 			"userSummary",
					connections: 	totalConnections,
					stalkers:		stalkers	});
	}

	function updateChatlog(obj)
	{
		chatHistory.push(obj);
		chatHistory = chatHistory.slice(-chatMem);
	}

	function broadcast(obj)
	{
		//broadcast message to connected clients
		var json = JSON.stringify(obj);
		for(var i = 0; i < clients.length; i++)
		{
			clients[i].sendUTF(json);
		}
	}
});
