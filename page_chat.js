let displayedAmountOfChatMessages = 0;

let updateChatPage_running = false;

let submittingChatMessage = false;


let updateChatPage__shouldReRunWhenFinished = false;
async function updateChatPage()
{
	// Prevent re-entrancy
	if (updateChatPage_running) { updateChatPage__shouldReRunWhenFinished = true; return; }
	updateChatPage_running = true;

	console.log("updateChatPage() is running...");

	let [
		amountOfChatMessages,
		GAS_PER_CHAT_MESSAGE,
	] = await Promise.all([
		callContract("EtherPrimeChat::amountOfChatMessages"),
		callContract("EtherPrimeChat::GAS_PER_CHAT_MESSAGE"),
	]);
	
	if (userAccount === null)
	{
		$("chatMessageTextBox").enabled = false;
		$("chatMessageTextBox").disabled = true;
		$("chatMessageTextBox").setAttribute("placeholder", "Please unlock and connect your metamask");
	}
	else
	{
		let [
			gasSpentComputing,
			gasUsedTowardsChatMessages,
		] = await Promise.all([
			callContract("addressToGasSpent", userAccount),
			callContract("EtherPrimeChat::addressToGasUsedTowardsChatMessage", userAccount),
		]);

		const gasLeftToChat = gasSpentComputing.sub(gasUsedTowardsChatMessages);
		if (gasLeftToChat.cmp(GAS_PER_CHAT_MESSAGE) === -1)
		{
			const extraGasNeeded = GAS_PER_CHAT_MESSAGE.sub(gasLeftToChat);

			$("chatMessageTextBox").enabled = false;
			$("chatMessageTextBox").disabled = true;
			$("chatMessageTextBox").setAttribute("placeholder", "Please spend "+extraGasNeeded+" more gas on prime computations to send a chat message");
		}
		else
		{
			$("chatMessageTextBox").enabled = !submittingChatMessage;
			$("chatMessageTextBox").disabled = submittingChatMessage;
			$("chatMessageTextBox").setAttribute("placeholder", "Type your chat message here and press Enter to send");
		}
	}


	amountOfChatMessages = parseInt(amountOfChatMessages);

	console.log("There are "+(amountOfChatMessages - displayedAmountOfChatMessages) + " new chat messages!");

	let newChatMessages = [];
	for (let i=displayedAmountOfChatMessages; i<amountOfChatMessages; i++)
	{
		newChatMessages.push(callContract("EtherPrimeChat::getChatMessage", i));
	}
	newChatMessages = await Promise.all(newChatMessages);

	let newChatMessageStrings = [];
	for (let i=displayedAmountOfChatMessages; i<amountOfChatMessages; i++)
	{
		newChatMessageStrings.push(callContract("EtherPrimeChat::chatMessages", i));
	}
	newChatMessageStrings = await Promise.all(newChatMessageStrings);

	
	console.log("newChatMessages=", newChatMessages, "newChatMessageStrings=", newChatMessageStrings);

	const chatMessagesDiv = $("chatMessagesDiv");
	for (let i=0; i<newChatMessages.length; i++)
	{
		const msg = newChatMessages[i];
		const msgSender = msg[0];
		const msgText = newChatMessageStrings[i]; //msg[1];

		console.log("msgText=", msgText);

		const chatMessageDiv = document.createElement("div");
		{
			const userBoxDiv = document.createElement("div");
			{
				userBoxDiv.appendChild(createUserBox(msgSender));
			}
			chatMessageDiv.appendChild(userBoxDiv);
			const textDiv = document.createElement("div");
			{
				textDiv.innerText = msgText;
		
				textDiv.innerHTML = textDiv.innerHTML.replace(/([0-9]+)/gi, function(match){
					return "<a href='#search:"+match+"' class='nobtn'>"+match+"</a>";
				});
			}
			chatMessageDiv.appendChild(textDiv);
		}
		chatMessagesDiv.insertBefore(chatMessageDiv, chatMessagesDiv.childNodes[0]);
	}


	displayedAmountOfChatMessages = amountOfChatMessages;

	updateChatPage_running = false;

	if (updateChatPage__shouldReRunWhenFinished)
	{
		updateChatPage__shouldReRunWhenFinished = false;
		setTimeout(updateChatPage, 0);
	}
}

$("chatMessageTextBox").addEventListener("keydown", async function(e){
	if (e.keyCode === 13)
	{
		submittingChatMessage = true;
		$("chatMessageTextBox").disabled = true;
		$("chatMessageTextBox").enabled = false;
		const msg = $("chatMessageTextBox").value;
		try
		{
			await callContract("EtherPrimeChat::sendChatMessage", msg, "0x"+("F".repeat(64)));
			$("chatMessageTextBox").value = "";
		}
		catch (ee)
		{
			$("chatMessageTextBox").disabled = false;
			$("chatMessageTextBox").enabled = true;
		}
		submittingChatMessage = false;
		updateChatPage();
	}
});
