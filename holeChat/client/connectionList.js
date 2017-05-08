console.log("Ruined");
var liveCons = [];	//users connected
var awayCons = [];	//users afk

var takenIDs = [];	//ranges are [n to k)

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

	var newID = takenIDs[0][1];	//store new ID
	takenIDs[0][1] += 1;		//add that ID to the range of taken IDs

	if (takenIDs[0][1] == takenIDs[1][0])
	{
		takenIDs[0][1] == takenIDs[1][1];
		takenIDs.splice(i+1, 1);
	}
	return newID;
}

function removeID(id){
	for (i = 0; i < takenIDs.length; i++)
	{
		if (id == takenIDs[i][0])	//remove from front of this partition
		{
			takenIDs[i][0]++;
			return;
		}
		if(id == takenIDs[i][1] - 1) //end of range
		{
			takenIDs[i][1]--;
			if (takenIDs[i][0]==takenIDs[i][1])	//resulting range is of size 0
			{
				takenIDs.splice(i, 1);
			}
			return;
		}
		if (id < takenIDs[i][1] - 2)	//middle of range
		{
			takenIDs.splice(i, 0, [id + 1, takenIDs[i][1]]);
			takenIDs[i][1] = id;
			return;
		}
	}
}

console.log("this is a test");

console.log(findNewID());
console.log(findNewID());
console.log(findNewID());
console.log(findNewID());
console.log(findNewID());
console.log(findNewID());

console.log(removeID(1));
console.log(removeID(3));
console.log(removeID(5));

console.log(findNewID());
console.log(findNewID());
console.log(findNewID());
console.log(findNewID());

/*exports.addLiveUser = function(username){
	liveCons.append(username)
}*/
