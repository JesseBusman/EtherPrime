"use strict";

let updateRankingPage_running = false;

let currentRankingPageAddressesAndData = null;
let sortColumn = 0;
$("pageRanking").getElementsByTagName("th")[sortColumn+1].style.textDecoration = "underline";
async function updateRankingPage()
{
	// Prevent re-entrancy
	if (updateRankingPage_running) return;
	updateRankingPage_running = true;

	currentRankingPageAddressesAndData = null;


	let participants = [];
	{
		const amountOfParticipants = parseInt(await callContract("amountOfParticipants"));
		for (let i=0; i<amountOfParticipants; i++)
		{
			participants.push(callContract("participants", i));
		}
		participants = await Promise.all(participants);
	}


	for (let i=0; i<participants.length; i++)
	{
		if (participants[i].toLowerCase() === ETHER_PRIME_ADDRESS.toLowerCase() || participants[i] === "0x0000000000000000000000000000000000000000")
		{
			participants.splice(i, 1);
			i--;
		}
	}


	let participantsData = [];
	for (let i=0; i<participants.length; i++)
	{
		participantsData.push(Promise.all([
			callContract("addressPrimeCount", participants[i]),
			callContract("addressToGasSpent", participants[i]),
			callContract("addressToEtherSpent", participants[i]),
			callContract("addressToProbablePrimesClaimed", participants[i]),
			callContract("addressToProbablePrimesDisprovenBy", participants[i]),
			callContract("addressToProbablePrimesDisprovenFrom", participants[i]),
			//callContract("addressToUsername", participants[i])
		]));
	}
	participantsData = await Promise.all(participantsData);


	const participantAddressesAndData = [];
	for (let i=0; i<participants.length; i++)
	{
		participantAddressesAndData.push({"address": participants[i], "data": participantsData[i]});
	}

	participantAddressesAndData.sort((a, b) => b.data[sortColumn].cmp(a.data[sortColumn]));
	// Don't put any await's after this .sort

	for (let i=0; i<participantAddressesAndData.length; i++)
	{
		const {"address": address, "data": data} = participantAddressesAndData[i];
		if (address.toLowerCase() === ETHER_PRIME_ADDRESS.toLowerCase() || address === "0x0000000000000000000000000000000000000000") continue;

		const rankingTable = $("rankingTable");

		let rankingRow = $("rankingRow_"+address);
		if (!rankingRow)
		{
			rankingRow = document.createElement("tr");
			{
				rankingRow.setAttribute("id", "rankingRow_"+address);
				const addressCell = document.createElement("td");
				{
					addressCell.appendChild(createUserBox(address));
				}
				rankingRow.appendChild(addressCell);
                rankingRow.appendChild(document.createElement("td"));
                rankingRow.appendChild(document.createElement("td"));
                rankingRow.appendChild(document.createElement("td"));
                rankingRow.appendChild(document.createElement("td"));
                rankingRow.appendChild(document.createElement("td"));
                rankingRow.appendChild(document.createElement("td"));
			}
			rankingTable.appendChild(rankingRow);
		}
		participantAddressesAndData[i]["tableRowElement"] = rankingRow;

		const cell1 = rankingRow.childNodes[1];
		cell1.innerHTML = ""+data[0];

		const cell2 = rankingRow.childNodes[2];
		cell2.innerHTML = ""+data[1];

		const cell3 = rankingRow.childNodes[3];
		cell3.innerHTML = ""+web3.utils.fromWei(data[2]);

		const cell4 = rankingRow.childNodes[4];
		cell4.innerHTML = ""+data[3];

		const cell5 = rankingRow.childNodes[5];
		cell5.innerHTML = ""+data[4];

		const cell6 = rankingRow.childNodes[6];
		cell6.innerHTML = ""+data[5];
	}



	currentRankingPageAddressesAndData = participantAddressesAndData;

	updateRankingPage_running = false;
}

function sortRankingPage(column)
{
	sortColumn = column;

	const ths = $("rankingTableHeadersRow").getElementsByTagName("th");
	for (let i=0; i<ths.length; i++)
	{
		if (i-1 === sortColumn)
		{
			ths[i].style.textDecoration = "underline";
		}
		else
		{
			ths[i].style.textDecoration = "none";
		}
	}

	if (currentRankingPageAddressesAndData !== null && updateRankingPage_running === false)
	{
		const rankingTable = $("rankingTable");
		for (let i=0; i<currentRankingPageAddressesAndData.length; i++)
		{
			let row = currentRankingPageAddressesAndData[i]["tableRowElement"];
			rankingTable.removeChild(row);
		}
		
		currentRankingPageAddressesAndData.sort((a, b) => b.data[sortColumn].cmp(a.data[sortColumn]));

		for (let i=0; i<currentRankingPageAddressesAndData.length; i++)
		{
			rankingTable.appendChild(currentRankingPageAddressesAndData[i].tableRowElement);
		}
	}
}
