process.title = 'node-chat';
let WebSocketServerPort = 1337;
let WebSocketServer = require('websocket').server;
let http = require('http');
const uuidV1 = require('./node_modules/uuid/v1');

let ActivityLog = require('./connectionList/connectionList.js');
let randomColor = require('./colour.js').randomColor;

// how far back the server remembers
let chatMem = 200;
let chatHistory = [];

//connected clients
let clients = new Map();
let stalkers = 0;
let	totalConnections = 0;

// Helper function for escaping input strings
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let server = http.createServer(function(request, response){
	//not important since it's a web socket server
});

server.listen(WebSocketServerPort, function(){
	console.log((new Date()) + " Server is listening on port " + WebSocketServerPort);
});

//create server
wsServer = new WebSocketServer({
	httpServer: server
});

//create ActivityLog
let ActLog = new ActivityLog();

//websocket server
wsServer.on('request', function(request){
	console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
	var connection = request.accept(null, request.origin);	//should check request origin -- security reasons
	let userName = false;
	let userColor = false;
	let userObj = {};
	clients.set(connection, {});	//name and color fields will be added later

	//send chat history
	stalkers++;
	updateUserSummary();

	if (chatHistory.length > 0)
	{
		connection.sendUTF(JSON.stringify({	type: 'history',
											serverTime: Date.now(),
											history: chatHistory}));
	}


	//user sends message
	connection.on('message', function(message){
		if (message.type === 'utf8'){ //text type messege
			//process message
			let messageData = JSON.parse(message.utf8Data);

			if (messageData.type === "messege")
			{
				console.log((new Date()) + ' Received Message from '
                            + userName + ': ' + message.utf8Data);

				var obj = {
					type: 'message',
					time: (new Date()).getTime(),
					text: htmlEntities(messageData.messege),
					author: userName,
					color: userColor
				};
				userObj.lastActive = Date.now();
				updateUserSummary();
				updateChatlog(obj);
				broadcast(obj);
			}
			else if (messageData.type === "userName") {
				userName = htmlEntities(messageData.userName);	//remember userName
				userColor = randomColor();					//get random color and send back to user

				connection.sendUTF(JSON.stringify({	type: 'color',
													date: userColor	}));
				console.log((new Date()) + ' User is known as: ' + userName + ' with ' + userColor + ' color.');

				//add missing info from this client
				userObj = {	name :		userName,
							color :		userColor,
							looking:	true	};
				clients.set(connection, userObj);

				var obj = {	type: 'serverMessege',
							time: (new Date()).getTime(),
							text: 'Connected',
							author: userName,
							color: userColor	};

				totalConnections++;
				stalkers--;
				updateUserSummary();
				updateChatlog(obj);
				broadcast(obj);
			}
			else if (messageData.type === "visible") {
				console.log(userName + " in " + ((messageData.state) ? "active":"away") + " state");
				clients.get(connection).looking = messageData.state;	//let people know if users are looking
				updateUserSummary();
			}
			else
			{
				console.log("client sent back some weird shit");
			}
		}
	});



	connection.on('close', function(obj){
		//close user connection

		if (userName !== false && userColor !== false)
		{
			console.log((new Date()) + " Peer named \"" + userName + "\" "+ connection.remoteAddress + " disconnected.");
			let obj = {
				type: 'serverMessege',
				time: (new Date()).getTime(),
				text: 'Disconnected',
				author: userName,
				color: userColor
			}
			updateChatlog(obj);
			broadcast(obj);
			totalConnections--;
		}
		else {
			//must have been a stalker
			stalkers--;
		}
		//remove user from list of clients
		clients.delete(connection);
		updateUserSummary();
	});
});

//updates the connection log
function updateUserSummary()
{
	let userList = [];
	clients.forEach(function(value, key, mObj){
		if (value.name != undefined)
			userList.push(value);
	})

	broadcast({ type: 				"userSummary",
				connectionCount: 	totalConnections,
				connections:		userList,
				stalkers:			stalkers	});
}

function updateChatlog(obj)
{
	chatHistory.push(obj);
	chatHistory = chatHistory.slice(-chatMem);
}

function broadcast(obj)
{
	//broadcast message to connected clients
	let json = JSON.stringify(obj);
	clients.forEach(function(value, key, mObj){
		key.sendUTF(json);
	})
}

function printUserNames(list)
{
	clients.forEach(function(value, key, mObj){
		console.log(value.name + " " + value.color);
	})
}
