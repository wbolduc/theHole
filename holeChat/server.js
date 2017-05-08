process.title = 'node-chat';

var WebSocketServerPort = 1337;
var WebSocketServer = require('websocket').server;
var http = require('http');


// how far back the server remembers
var chatMem = 200;
var chatHistory = [];

// list of connected clients
var clients = [];

// Helper function for escaping input strings
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

//randomize colours
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
colors.sort(function(a,b) { return Math.random() > 0.5; } ); //<<kinda like a function pointer


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
	if (chatHistory.length > 0)
	{
		connection.sendUTF(JSON.stringify({ type: 'history', data: chatHistory}));
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
				userColor = colors.shift();
				connection.sendUTF(JSON.stringify({type:'color', date: userColor}));
				console.log((new Date()) + ' User is known as: ' + userName
                            + ' with ' + userColor + ' color.');

				var obj = {
					time: (new Date()).getTime(),
					text: "Connected",
					author: userName,
					color: userColor
				}

			}
			else //process message
			{
				console.log((new Date()) + ' Received Message from '
                            + userName + ': ' + message.utf8Data);

				var obj = {
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

function updateChatlog(obj)
{
	chatHistory.push(obj);
	chatHistory = chatHistory.slice(-chatMem);
}

function broadcast(obj)
{
	//broadcast message to connected clients
	var json = JSON.stringify({ type: 'message', data: obj });
	for(var i = 0; i < clients.length; i++)
	{
		clients[i].sendUTF(json);
	}
}


	connection.on('close', function(connection){
		//close user connection
		if (userName !== false && userColor !== false)
		{
			console.log((new Date()) + " Peer named \"" + userName + "\" "+ connection.remoteAddress + " disconnected.");

			var obj = {
				time: (new Date()).getTime(),
				text: "Disconnected",
				author: userName,
				color: userColor
			}
			updateChatlog(obj);
			broadcast(obj);

			//remove user from list of clients
			clients.splice(index, 1);
			//put back user color
			colors.push(userColor);
		}
	});
});
