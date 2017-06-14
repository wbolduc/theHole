let liveCons = [];	//users connected
let awayCons = [];	//users afk

let takenIDs = [];	//ranges are [n to k)

function findNewID(){
	if (takenIDs.length == 0)
	{
		takenIDs.push([0,1]);
		return 0;
	}
	if (takenIDs[0][0] > 0)	//gap in front
	{
		if (takenIDs[0][0] == 1)
			takenIDs[0][0] = 0;
		else
			takenIDs.splice(0,0,[0,1]);
		return 0;
	}

	let newID = takenIDs[0][1];	//store new ID
	takenIDs[0][1] += 1;		//add that ID to the range of taken IDs

	if (takenIDs.length > 1 && takenIDs[0][1] == takenIDs[1][0])
	{
		takenIDs[0][1] = takenIDs[1][1];
		takenIDs.splice(1, 1);
	}
	return newID;
}

function removeID(id){		//NOTE: could be made faster with a binary tree
	let i;
	console.log("removing "+ id);
	for (i = 0; i < takenIDs.length; i++)
	{
		if (id == takenIDs[i][0])	//remove from front of this partition
		{
			takenIDs[i][0]++;
			if (takenIDs[i][0] == takenIDs[i][1])	//resulting range is of size 0
			{
				takenIDs.splice(i, 1);
			}
			return;
		}
		if(id > takenIDs[i][0])
		{
			if(id == takenIDs[i][1] - 1) //end of range
			{
				console.log("endRange i="+i);
				takenIDs[i][1]--;
				if (takenIDs[i][0] == takenIDs[i][1])	//resulting range is of size 0
				{
					takenIDs.splice(i, 1);
				}
				return;
			}
			if (id < takenIDs[i][1] - 1)	//middle of range
			{
				console.log("middle i="+i);
				takenIDs.splice(i+1, 0, [id + 1, takenIDs[i][1]]);
				takenIDs[i][1] = id;
				return;
			}
		}
	}
	console.log("None");
}

function tests()
{
	let i;
	console.log("this is a test");
	for( i = 0; i < 10; i++)
		console.log(findNewID());
	console.log(takenIDs);

	removeID(0);
	console.log(takenIDs);
	removeID(3);
	console.log(takenIDs);
	removeID(5);
	console.log(takenIDs);

	console.log(findNewID());
	console.log(takenIDs);
	console.log(findNewID());
	console.log(takenIDs);
	console.log(findNewID());
	console.log(takenIDs);
	console.log(findNewID());
	console.log(takenIDs);

	removeID(4);
	removeID(6);
	removeID(5);
	removeID(11);
	console.log(takenIDs);

	console.log(findNewID());
	console.log(takenIDs);
	console.log(findNewID());
	console.log(takenIDs);
	console.log(findNewID());
	console.log(takenIDs);
	console.log(findNewID());
	console.log(takenIDs);

	console.log("RANDOMTEST 1----------------------");
	let randomRemList = [];
	for (i = 0; i < 12; i++)
	{
		randomRemList.push(i);
	}
	for (i = 0; i < 12; i++)
	{
		let rem = Math.floor((Math.random() * randomRemList.length));
		removeID(randomRemList[rem]);
		randomRemList.splice(rem, 1);
		console.log(takenIDs);
	}


	if (takenIDs.length != 0)
		console.log("Failure");
	else
		console.log("Success");

	console.log("RANDOMTEST 1----------------------");
	for (i = 0; i < 200; i++)	//add 200
		randomRemList.push(findNewID());

	for (i = 0; i < 100; i++)	//remove 100
	{
		let rem = Math.floor((Math.random() * randomRemList.length));
		removeID(randomRemList[rem]);
		randomRemList.splice(rem, 1);
		console.log(takenIDs);
	}

	for (i = 0; i < 200; i++) //add back 200
		randomRemList.push(findNewID());

	for (i = 0; i < 300; i++)	//remove all
	{
		let rem = Math.floor((Math.random() * randomRemList.length));
		removeID(randomRemList[rem]);
		randomRemList.splice(rem, 1);
		console.log(takenIDs);
	}

	if (takenIDs.length != 0)
		console.log("Failure");
	else
		console.log("Success");
}

tests();
/*exports.addLiveUser = function(username){
	liveCons.append(username)
}*/
