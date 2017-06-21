module.exports = class ActivityLog
{
	let timingFunction;
	let clients = new Map();

	constructor()
	{
		this.timingFunction = Date.now;
	}
	constructor( timingFunction )		//user might not want server time, let them decide
	{
		this.timingFunction = timingFunction;
	}

	addNewClient( uniqueID )
	{
		return new updateNode(clients, uniqueID, timingFunction)
	}

	class updateNode()
	{
		let clients;
		let currClient;
		let timingFunction;

		constructor(clients, thisClient, timingFunction)
		{
			this.clients = clients;
			this.currClient = thisClient;
			this.timingFunction = timingFunction;
		}

		update()
		{
			clients.set(currClient, timingFunction)());
		}
	}
}
