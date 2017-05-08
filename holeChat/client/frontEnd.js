$(function () {
    "use strict";
    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
	let connectionCount = $('#connectionCount');
	let stalkers = $('#stalkers');

    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection
    var connection = new WebSocket('ws://104.158.175.164:1337/'); //this is the server //NOTE: had to change from thehole.ca to this ip and port

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.html('Choose&nbsp;name:');
    };

    connection.onerror = function (error) {
        //test just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.' } ));
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
			console.log(message);
			console.log(e);
            //console.log('This doesn\'t look like a valid JSON: ', message);
            return;
        }

        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        if (json.type === 'color') { // first response from the server with user's color
			myColor = json.color;
            status.text(myName + ': ').css('color', myColor);
            input.removeAttr('disabled').focus();
            // from now user can start sending messages
			
        } else if (json.type === 'history') { // entire message history and current connections
			// insert every single message to the chat window
            for (var i=0; i < json.history.length - 1; i++)
                addMessage(json.history[i]);
			addMessageWithScroll(json.history[i]);

        } else if (json.type === 'message') { // it's a single message
            input.removeAttr('disabled').focus(); // let the user write another message
			addMessageWithScroll(json);

		} else if (json.type === 'serverMessege') {
			addMessageWithScroll(json);
			updateStalkers(json.stalkers);

        } else if (json.type === "userSummary") {
			updateStalkers(json.stalkers);
			connectionCount.html("Connections:&nbsp;" + json.connections);
        }
		else {
            console.log('This type of messege is not implemented yet: ', json);
        }
    };


    /**
     * Send mesage when user presses Enter key
     */
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            // send the message as an ordinary text
            connection.send(msg);
            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');

            // we know that the first message sent from a user their name
            if (myName === false) {
                myName = msg;
            }
        }
    });

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                 + 'with the WebSocket server.');
        }
    }, 3000);

	function updateStalkers(stalkCount){
		let stalkStr = "";
		if(stalkCount === 0)
			stalkStr = "No stalkers"
		else if (stalkCount === 1)
		 	if (myName === false)
				stalkStr = "You are the only stalker";
			else
				stalkStr = "There's a stalker";
		else
			if (myName === false)
				if (stalkCount === 2)
					stalkStr = "There one stalker and you!";
				else
					stalkStr = "There are " + (stalkCount-1) + " stalkers and you!";
			else
				stalkStr = "There are " + stalkCount + " stalkers!";
		stalkers.html(stalkStr);
	}

	function addMessageWithScroll(messege)
	{
		addMessage(messege);
		content.animate({scrollTop: content[0].scrollHeight},500);		//animate chatScroll //NOTE: I do not know whay this [0] is for
	}//"You need [0] to get the dom element from jquery to get scrollHeight"

    /**
     * Add message to the chat window
     */
    function addMessage(messege) {
		let dt = new Date(messege.time);
		if (messege.type == "serverMessege")
			content.append('<p><span><b>Server:</b></span> User <span class="blackOutLine" style="color:' + messege.color +'">' + messege.author + '</span> @ ' +
             	+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             	+ (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             	+ ': ' + messege.text + '</p>');
		else
        	content.append('<p><span class="blackOutLine" style="color:' + messege.color +'">' + messege.author + '</span> @ ' +
             	+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             	+ (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             	+ ': ' + messege.text + '</p>');

    }
});
