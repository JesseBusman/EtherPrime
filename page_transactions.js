"use strict";

function linkPrime(prime)
{
	return "<a href='#search:"+prime+"' class='nobtn'>"+prime+"</a>";
}

function linkAddress(address)
{
	return "<a href='#search:"+address+"' class='nobtn' style='font-size: 8.5pt;'>"+address+"</a>";
}

function describeFunctionCall(funcName, value, gas, gasPrice, args, isCallToChatContract)
{
	if (typeof value === "string") value = new BN(value);
	else if (value instanceof BN || value.constructor === BN) {}
	else
	{
		console.error("describeFunctionCall received value of unknown type:");
		console.error(value);
		return "ERROR";
	}
	if (typeof gas === "string") gas = new BN(gas);
	if (typeof gasPrice === "string") gasPrice = new BN(gasPrice);
	
	{
		const funcParameterNamesAndTypes = functionName_to_parameterNamesAndTypes(funcName, isCallToChatContract);
		for (let i=0; i<args.length; i++)
		{
			if (funcParameterNamesAndTypes[i].name !== "") args[funcParameterNamesAndTypes[i].name] = args[i];
			else args["["+i+"]"] = args[i];
		}
	}

	try
	{
		if (funcName === "compute" ||
			funcName === "computeAndGiveTo" ||
			funcName === "computeWithPrimesToMemorize" ||
			funcName === "computeWithPrimesToMemorizeAndLowLevelGas" ||
			funcName === "computeWithParams")
		{
			return "Try to compute definite prime numbers<br/>Gas: "+gas.toString(10)+"<br/>Gas price: "+((new BigNumber(gasPrice.toString()).div(1000*1000*1000).toString())+" Gwei / gas");
		}
		else if (funcName === "claimProbablePrime") return "Claim the number "+linkPrime(args[0])+" as a probable prime";
		else if (funcName === "setUsername") return "Set username to '"+escapeHtml(bytes32_to_string(args[0]))+"'";
		else if (funcName === "depositEther") return "Deposit "+web3.utils.fromWei(value) + " ETH";
		else if (funcName === "tryCancelBuyOrders")
		{
			const uniquePrimes = [];
			for (let i=0; i<args[0].length; i++)
			{
				const prime = args[0].toString();
				if (uniquePrimes.indexOf(prime) === -1) uniquePrimes.push(prime);
			}

			if (uniquePrimes.length === 0)
			{
				return "Do nothing";
			}
			else if (uniquePrimes.length === 1)
			{
				if (args[0].length === 1) return "Try to cancel buy order on prime "+linkPrime(uniquePrimes[0]);
				else return "Try to cancel "+args[0].length+" buy orders on prime "+linkPrime(uniquePrimes[0]);
			}
			else
			{
				return "Try to cancel buy orders on primes: "+uniquePrimes.map(linkPrime).join(", ");
			}
		}
		else if (funcName === "withdrawEther") return "Withdraw "+web3.utils.fromWei(args[0]) + " ETH";
		else if (funcName === "sendChatMessage") return "Send a chat message:<br/><i>"+escapeHtml(args[0]) + "</i>";
		else if (funcName === "setSellPrice") return "Create a sell order of "+web3.utils.fromWei(args[1]) + " ETH for prime "+linkPrime(args[0]);
		else if (funcName === "transfer") return "Transfer "+linkPrime(args[1])+" to<br/>"+linkAddress(args[0]);
		else if (funcName === "depositEtherAndCreateBuyOrder")
		{
			let ret = "Create a buy order of "+web3.utils.fromWei(args[1])+" ETH for prime "+linkPrime(args[0]);
			if (value.cmpn(0) !== 0) ret += " and deposit "+web3.utils.fromWei(value)+" ETH";
			return ret;
		}
	}
	catch (e)
	{
		console.error("Error in describeFunctionCall("+funcName+"):");
		console.error(e);
	}

	console.error("No proper description for call to function "+funcName+" has been programmed. Defaulting...");

	const argCount = args.__length__;
	if (argCount === 0)
	{
		return "Call to contract function <i>"+funcName+"</i>"+(value.cmpn(0) === 0 ? "" : " with "+web3.utils.fromWei(value)+" ETH")+"<ul>";
	}
	else
	{
		let ret = "Call to contract function <i>"+funcName+"</i> with"+(value.cmpn(0) === 0 ? "" : " "+web3.utils.fromWei(value)+" ETH and")+" these arguments:<ul>";
		for (let key in args)
		{
			if (key.toString() === parseInt(key).toString()) continue;
			if (key === "__length__") continue;
			if (args.hasOwnProperty(key))
			{
				ret += "<li>" + key + ": "+escapeHtml(args[key].toString())+"</li>";
			}
		}
		ret += "</ul>";
		return ret;
	}
}

function describeEvent(event)
{
	try
	{
		if (event.event === "DefinitePrimeDiscovered") return "Definite prime <i>"+event.returnValues.prime+"</i> (#"+(event.returnValues.definitePrimesArrayIndex)+") discovered"
		else if (event.event === "Transfer")
		{
			if (event.returnValues.from === "0x0000000000000000000000000000000000000000") return null;
			else return "Prime "+linkPrime(event.returnValues.prime)+" transfered from "+linkAddress(event.returnValues.from)+" to "+linkAddress(event.returnValues.to);
		}
		else if (event.event === "EtherDeposited") return "Deposited "+web3.utils.fromWei(event.returnValues.amount)+" ETH";
		else if (event.event === "EtherWithdrawn") return "Withdrawed "+web3.utils.fromWei(event.returnValues.amount)+" ETH";
		else if (event.event === "ProbablePrimeDiscovered") return "Probable prime "+event.returnValues.prime+" claimed";
		else if (event.event === "UsernameSet") return "Username of address "+linkAddress(event.returnValues.user)+" set to "+escapeHtml(bytes32_to_string(event.returnValues.username));
		else if (event.event === "BuyOrderCreated") return "Created a buy order of "+web3.utils.fromWei(event.returnValues.bid)+" ETH for prime "+linkPrime(event.returnValues.prime);
		else if (event.event === "SellPriceSet")
		{
			event.returnValues.price = new BN(event.returnValues.price);
			if (event.returnValues.price === 0 || event.returnValues.price === "0" || event.returnValues.price.cmpn(0) === 0)
				return "Canceled sell order of prime "+linkPrime(event.returnValues.prime);
			else return "Set sell price of prime "+linkPrime(event.returnValues.prime)+" to "+web3.utils.fromWei(event.returnValues.price)+" ETH";
		}
		else if (event.event === "ChatMessageSent") return "Sent chat message";
	}
	catch (e)
	{
		console.error("Error in describeEvent("+event.event+"):");
		console.error(e);
	}

	console.error("No proper description event "+event.event+" has been programmed. Defaulting...");

	let ret = "Event "+event.event+" with these values:<ul>";
	for (let param in event.returnValues)
	{
		if (parseInt(param).toString() === param.toString()) continue;
		if (param === "__length__") continue;
		ret += "<li>"+param+": "+event.returnValues[param]+"</li>";
	}
	ret += "</ul>";
	return ret;
}

const txhash_to_row = {};


function createTransactionRow(txhash, funcName, value, gas, gasPrice, args, isCallToChatContract)
{
    if (txhash_to_row.hasOwnProperty(txhash))
    {
        console.error("row with that txhash already exists!");
        return txhash_to_row[txhash];
    }
    const row = document.createElement("tr");
    {
        const cellTxHash = document.createElement("td");
        {
			if (window.location.toString().indexOf("etherprimedev") === -1)
			{
				cellTxHash.innerHTML = txhash + " <a href='https://etherscan.io/tx/"+txhash+"' class='nobtn' target='_black'>Etherscan</a>";
			}
			else
			{
				cellTxHash.innerHTML = txhash + " <a href='https://ropsten.etherscan.io/tx/"+txhash+"' class='nobtn' target='_black'>Etherscan</a>";
			}
        }
        row.appendChild(cellTxHash);

        const cellAction = document.createElement("td");
        {
            cellAction.innerHTML = describeFunctionCall(funcName, value, gas, gasPrice, args, isCallToChatContract);
        }
        row.appendChild(cellAction);

        const cellConfirmations = document.createElement("td");
        {
            cellConfirmations.innerText = "Loading ...";
        }
        row.appendChild(cellConfirmations);

        
        const cellResult = document.createElement("td");
        {
            cellResult.innerText = "Loading ...";
        }
        row.appendChild(cellResult);
    }
    txhash_to_row[txhash] = row;
    return row;
}

async function addUnconfirmedTransactionToTransactionPage(txhash, funcName, value, gas, gasPrice, args, isCallToChatContract)
{
	console.log("addUnconfirmedTransactionToTransactionPage received args ", args);

	const row = createTransactionRow(txhash, funcName, value, gas, gasPrice, args, isCallToChatContract);
	
    row.setAttribute("confirmed", "no");

    row.childNodes[2].innerText = "No";
    row.childNodes[3].innerText = "Waiting...";

    const table = $("transactionsTable");
    table.insertBefore(row, table.childNodes[0]); // insert at top

    let arr = localStorage.getItem("submittedTransactionHashes");
    if (arr === null) arr = [];
    else arr = JSON.parse(arr);

    arr.push(txhash);

    localStorage.setItem("submittedTransactionHashes", JSON.stringify(arr));
}

async function updateTransactionsPage_transaction(txhash)
{
    let row = null;
    if (txhash_to_row.hasOwnProperty(txhash))
    {
        row = txhash_to_row[txhash];
        if (row.getAttribute("confirmed") === "yes") return;
    }

	let tx, txReceipt, txIsConfirmed;
	if (localStorage.getItem("tx_"+txhash) && localStorage.getItem("txReceipt_"+txhash))
	{
		tx = JSON.parse(localStorage.getItem("tx_"+txhash));
		txReceipt = JSON.parse(localStorage.getItem("txReceipt_"+txhash));
		txIsConfirmed = true;
	}
	else
	{
		[tx, txReceipt] = await Promise.all([
			new Promise(function(resolve, reject){
				web3.eth.getTransaction(txhash, function(err, result){
					if (err !== null) reject(err);
					else resolve(result);
				})
			}),
			new Promise(function(resolve, reject){
				web3.eth.getTransactionReceipt(txhash, function(err, result){
					if (err !== null) reject(err);
					else resolve(result);
				})
			})
		]);

		if (tx === null || tx === undefined)
		{
			console.error("tx is null or undefined");
			return;
		}

		txIsConfirmed = tx.blockNumber !== null && tx.blockNumber !== undefined && (new BN(tx.blockNumber)).cmpn(0) === 1;
		if (txIsConfirmed)
		{
			localStorage.setItem("tx_"+txhash, JSON.stringify(tx));
			localStorage.setItem("txReceipt_"+txhash, JSON.stringify(txReceipt));
		}
	}

	if (txReceipt.transactionHash === "0xb8cfb122ebd3e4960c881b198be562ed324b4a07458fce4018d4b8aa1bf8d935")
	{
		console.log(txReceipt);
	}
	
	const isTxToChatContract = tx.to.toLowerCase() === ETHER_PRIME_CHAT_ADDRESS.toLowerCase();

    if (row === null)
    {
        const functionSignature = tx.input.startsWith("0x") ? tx.input.substring(2, 10) : tx.input.substring(0, 8);
        const functionArgumentsHex = tx.input.startsWith("0x") ? tx.input.substring(10) : tx.input.substring(8);
        const [funcName, functionParameterTypes] = functionSignature_to_functionName_and_parameterTypes(functionSignature, isTxToChatContract);
        const functionArguments = web3.eth.abi.decodeParameters(functionParameterTypes, functionArgumentsHex);
    
        row = createTransactionRow(txhash, funcName, new BN(tx.value), new BN(tx.gas), new BN(tx.gasPrice), functionArguments);

        const table = $("transactionsTable");
        table.appendChild(row); // insert at bottom
    }

    if (tx.blockNumber && txIsConfirmed)
    {
        row.childNodes[2].innerText = "Yes";
		row.setAttribute("confirmed", "yes");

		// If the transaction reverted...
		if (txReceipt.status === false)
		{
			row.childNodes[3].innerHTML = "<span style='color:red;'>Transaction reverted!</span>";
		}

		else
		{
			const fetchedEventsCallback = (function(txhash, row) {
				return function(error, events) {
					if (error !== null)
					{
						console.error("could not fetch events! Error occurred");
						console.error(error);
						return;
					}

					const eventsForThisTx = [];
					for (let i=0; i<events.length; i++)
					{
						receivedEvent(events[i]);
						if (events[i].transactionHash === txhash) eventsForThisTx.push(events[i]);
					}

					localStorage.setItem("eventsOfTx_"+txhash, JSON.stringify(eventsForThisTx));

					let resultsHtml = "<ul class='transactionResultsList'>";
					for (let i=0; i<eventsForThisTx.length; i++)
					{
						const eventDescription = describeEvent(eventsForThisTx[i]);
						if (eventDescription !== null) resultsHtml += "<li>"+eventDescription+"</li>";
					}
					resultsHtml += "</ul>";

					row.childNodes[3].innerHTML = resultsHtml;
				}
			})(txhash, row);

			if (localStorage.getItem("eventsOfTx_"+txhash))
			{
				fetchedEventsCallback(null, JSON.parse(localStorage.getItem("eventsOfTx_"+txhash)));
			}
			else
			{
				(isTxToChatContract ? etherPrimeChat : etherPrime).getPastEvents("allEvents", {
					fromBlock: tx.blockNumber,
					toBlock: tx.blockNumber
				}, fetchedEventsCallback);
			}
		}
    }
    else
    {
        row.childNodes[2].innerText = "No";
        row.setAttribute("confirmed", "no");
        row.childNodes[3].innerText = "...";
    }
}

async function updateTransactionsPage()
{
    let arr = localStorage.getItem("submittedTransactionHashes");
    if (arr === null) arr = [];
    else arr = JSON.parse(arr);

    for (let i=arr.length-1; i>=0; i--)
    {
        await updateTransactionsPage_transaction(arr[i]);
    }
}
