var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 80;

var holeChat = __dirname + '/holeChat/client'

//add static chat page to express
app.use(express.static(holeChat))

//return the chat when main page is called
app.get('/', function(req, res){
	res.sendFile(path.join(holeChat, 'chat.html'));
});


app.get('/coup', function(req, res){
	res.sendFile(__dirname + '/html/test.html');
});

app.get('/beep', function(req, res){
	res.send('boop')
});

app.get('/:typed', function(req, res){
	res.status(404).send("404 bb, sorry \"" + req.params.typed + "\" does not exist");
});


app.listen(port);
console.log('server running on ' + port);
