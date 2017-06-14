class ActivityLog
{
	constructor( timingFunction )		//user might not want server time, let them decide
	{
		this.timingFunction = timingFunction || Date.now;
		this.clients = new Map();
	}

	addNewClient( uniqueID, alias, newAddHandler, updateHandler, leaveHandler )
	{
		this.clients.set(uniqueID, {	alias:			alias,
										lastActive: 	this.timingFunction(),
										addHandler: 	newAddHandler,
										updateHandler:	updateHandler,
										leaveHandler:	leaveHandler		});

		this.clients.forEach(
			function(value, key, mObj){
				if (key !== uniqueID)
					value.addHandler(alias)})
	}

	update( uniqueID )
	{
		let AcLogger = this.clients.get(uniqueID)

		AcLogger.lastActive = this.timingFunction();	//update Time
		let alias = AcLogger.alias;						//get alias

		this.clients.forEach(
			function(value, key, mObj){
				if (key !== uniqueID)
					value.updateHandler(alias)})
	}

	remove( uniqueID )
	{
		let alias = this.clients.get(uniqueID).alias

		this.clients.forEach(
			function(value, key, mObj){
				if (key !== uniqueID)
					value.leaveHandler(alias)})

		this.clients.remove(uniqueID);
	}
}



module.exports = ActivityLog;
