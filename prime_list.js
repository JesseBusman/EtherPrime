"use strict";

let updateAllPrimesLists_shouldRunAgainWhenFinished = false;
let updateAllPrimesLists_running = false;
async function updateAllPrimesLists()
{
	if (updateAllPrimesLists_running)
	{
		console.log("updateAllPrimesLists() called but was already running");
		updateAllPrimesLists_shouldRunAgainWhenFinished = true;
		return;
	}
	updateAllPrimesLists_running = true;

	console.log("updateAllPrimesLists() started");

	const elements = document.getElementsByClassName("primesList");
	const promises = [];
	for (let i=0; i<elements.length; i++)
	{
		promises.push(updatePrimesList(elements[i]));
	}
	await Promise.all(promises);

	updateAllPrimesLists_running = false;

	if (updateAllPrimesLists_shouldRunAgainWhenFinished)
	{
		updateAllPrimesLists_shouldRunAgainWhenFinished = false;
		setTimeout(updateAllPrimesLists, 250);
	}
}


let updatePrimesList__randid_to_lastCallTime = {};
async function updatePrimesList(primesListDiv, circumventRateLimiter=false, forceRerender=false)
{
	if (typeof primesListDiv === "string" && primesListDiv.startsWith("randid_"))
	{
		const lists = document.getElementsByClassName("primesList");
		for (let i=0; i<lists.length; i++)
		{
			if (lists[i].getAttribute("randid") === primesListDiv)
			{
				primesListDiv = lists[i];
				break;
			}
		}
	}

	let randid;
	if (!primesListDiv.hasAttribute("randid"))
	{
		randid = "randid_"+Math.floor(Math.random() * 1000000000).toString(16);
		primesListDiv.setAttribute("randid", randid);
	}
	else
	{
		randid = primesListDiv.getAttribute("randid");
	}



	if (updatePrimesList__randid_to_lastCallTime.hasOwnProperty(randid) && circumventRateLimiter === false)
	{
		if (updatePrimesList__randid_to_lastCallTime[randid] + 1000 > Date.now()) return;
	}
	updatePrimesList__randid_to_lastCallTime[randid] = Date.now();


	if (forceRerender === true)
	{
		primesListDiv.textContent = "";
	}



	if (primesListDiv.childNodes.length === 0)
	{
		primesListDiv.setAttribute("loading", "yes");
	}


	//console.log("Primes list is updating...");


	const sourceType = primesListDiv.getAttribute("sourceType");

	let primes;
	let shouldRemovePrimesNotInPrimesArray;
	let appendPrimesAtStart;
	//let primesDefinite = null;
	let owners = null;
	if (sourceType === "allDefinitePrimes")
	{
		const amountAlreadyDisplayed = primesListDiv.childElementCount;
		const amountOfDefinitePrimesFound = parseInt(await callContract("amountOfDefinitePrimesFound"));
		primes = await getDefinitePrimesRange(0, Math.min(amountOfDefinitePrimesFound, amountAlreadyDisplayed+25));

		//primesDefinite = [];
		//for (let i=0; i<primes.length; i++) primesDefinite.push(true);

		if (primes.length === amountOfDefinitePrimesFound) primesListDiv.setAttribute("listIsComplete", "yes");
		else primesListDiv.setAttribute("listIsComplete", "no");
		
		// Primes can never disappear from the "all definite primes" list. They can only be added
		shouldRemovePrimesNotInPrimesArray = false;
		appendPrimesAtStart = false; // Ascending order
	}
	else if (sourceType === "recentDefinitePrimes")
	{
		const amountOfDefinitePrimesFound = parseInt(await callContract("amountOfDefinitePrimesFound"));
		
		if (!primesListDiv.hasAttribute("previousAmountFound"))
		{
			primesListDiv.setAttribute("previousAmountFound", "0");
		}
		
		const amountAlreadyDisplayed = primesListDiv.childElementCount;
		
		let amount, startIndex;
		
		// If there are newer definite primes not in the list,
		// add most recent batch of primes to the start
		if (parseInt(primesListDiv.getAttribute("previousAmountFound")) < amountOfDefinitePrimesFound)
		{
			startIndex = parseInt(primesListDiv.getAttribute("previousAmountFound"));
			amount = amountOfDefinitePrimesFound - startIndex;

			if (amount > 250)
			{
				const overflow = amount - 250;
				startIndex += overflow;
				amount -= overflow;
			}
			
			shouldRemovePrimesNotInPrimesArray = false;
			appendPrimesAtStart = true;
		}
		
		// Otherwise, add older primes to the end until there are >= 250 displayed
		else
		{
			startIndex = Math.max(amountOfDefinitePrimesFound - amountAlreadyDisplayed - 25, 0);
			amount = Math.max(amountOfDefinitePrimesFound - startIndex, 0);

			if (amountAlreadyDisplayed + amount > 250)
			{
				amount = 250 - amountAlreadyDisplayed;
				amount = Math.max(0, amount);
			}

			
			shouldRemovePrimesNotInPrimesArray = false;
			appendPrimesAtStart = false;
		}
		
		primesListDiv.setAttribute("previousAmountFound", ""+amountOfDefinitePrimesFound);
		
		primes = await getDefinitePrimesRange(
			startIndex,
			amount
		);
		
		primes = primes.reverse();
		
		primesListDiv.setAttribute("listIsComplete", ((amountAlreadyDisplayed + amount) >= 250) ? "yes" : "no");
	}
	else if (sourceType === "primesOfOwner")
	{
		let sortDiv = $("sortDiv_"+randid);
		if (!sortDiv)
		{
			sortDiv = document.createElement("div");
			{
				sortDiv.classList.add("primesListSortBar");
				sortDiv.setAttribute("id", "sortDiv_"+randid);
				sortDiv.textContent = "Sort: ";
				sortDiv.innerHTML += "<input type='radio' id='sortNewestFirst_"+randid+"' name='sort_"+randid+"' onclick='updatePrimesList(\""+randid+"\", true, true);'/> <label for='sortNewestFirst_"+randid+"'>Newest first</label>";
				sortDiv.innerHTML += "<input type='radio' id='sortOldestFirst_"+randid+"' name='sort_"+randid+"' onclick='updatePrimesList(\""+randid+"\", true, true);'/> <label for='sortOldestFirst_"+randid+"'>Oldest first</label>";
				sortDiv.innerHTML += "<input type='radio' id='sortAscending_"  +randid+"' name='sort_"+randid+"' onclick='updatePrimesList(\""+randid+"\", true, true);' checked='checked'/> <label for='sortAscending_"+randid+"'>Ascending</label>";
				sortDiv.innerHTML += "<input type='radio' id='sortDescending_" +randid+"' name='sort_"+randid+"' onclick='updatePrimesList(\""+randid+"\", true, true);'/> <label for='sortDescending_"+randid+"'>Descending</label>";
			}
			primesListDiv.parentElement.insertBefore(sortDiv, primesListDiv);
		}
		
		let owner = primesListDiv.getAttribute("owner");
		if (owner === "user")
		{
			if (userAccount === null)
			{
				if (primesListDiv.getAttribute("noAccount") !== "true")
				{
					primesListDiv.setAttribute("noAccount", "true");
					primesListDiv.innerHTML = "No account found. Please unlock and connect your MetaMask to view your primes.<br/><br/><a href='#' onclick='btnConnectClicked();return false;'>Connect</a>";
				}
				setTimeout(updatePrimesList, 70, primesListDiv, true);
				return;
			}
			else
			{
				primesListDiv.removeAttribute("noAccount");
				owner = userAccount;
			}
		}
		else if (!web3.utils.isAddress(owner)) throw "wtf";

		const addressPrimeCount = parseInt(await callContract("addressPrimeCount", owner));
		
		primes = [];
		for (let i=0; i<addressPrimeCount; i++)
		{
			primes.push(callContract("tokenOfOwnerByIndex", owner, i));
		}
		primes = await Promise.all(primes);

		if ($("sortNewestFirst_"+randid).checked) { primes = primes.reverse(); console.log("Sorting by newest first"); }
		else if ($("sortOldestFirst_"+randid).checked) { console.log("Sorting by oldest first"); }
		else if ($("sortAscending_"+randid).checked) { primes = primes.sort((a, b) => a.cmp(b)); console.log("Sorting by ascending"); }
		else if ($("sortDescending_"+randid).checked) { primes = primes.sort((a, b) => b.cmp(a)); console.log("Sorting by descending"); }
		else throw "wtf";

		owners = [];
		for (let i=0; i<primes.length; i++) owners.push(owner);
		
		if ($("sortNewestFirst_"+randid).checked) { appendPrimesAtStart = true; }
		else if ($("sortDescending_"+randid).checked) { appendPrimesAtStart = true; }
		else { appendPrimesAtStart = false; }
		shouldRemovePrimesNotInPrimesArray = true;
	}
	else if (sourceType === "singlePrime")
	{
		primes = [new BN(primesListDiv.getAttribute("prime"))];
		
		appendPrimesAtStart = false;
		shouldRemovePrimesNotInPrimesArray = false;
	}
	else
	{
		throw "Unknown primesList sourceType: "+sourceType;
	}

	if (primes.length === 0 && shouldRemovePrimesNotInPrimesArray)
	{
		if (sourceType === "primesOfOwner")
		{
			const owner = primesListDiv.getAttribute("owner");
			if (owner === userAccount || owner === "user")
			{
				primesListDiv.innerHTML =
					"<br/><br/>You don't own any primes :(<br/><br/><br/>"+
					"There are two ways to get primes:<br/>"+
					"<ol>"+
						"<li>Burn some gas by pressing the big compute button on the Compute tab. This will advance the prime number generator. You will receive all primes found in this process.</li>"+
						"<li>Enter a prime number on the Search tab and claim it as a probable prime. This mode of prime ownership has a lower priority than the main prime generator. If the prime generator ever reaches your probable prime, you will lose it. You should therefore only claim very large primes as probable primes.</li>"+
					"</ol>";
			}
			else
			{
				primesListDiv.innerHTML = owner+" doesn't own any primes :(";
			}
		}
		else
		{
			primesListDiv.innerHTML = "This list is empty :(";
		}
		return;
	}
	
	if (primes.length !== 1 && primesListDiv.getElementsByTagName("ul").length > 0)
	{
		primesListDiv.textContent = "";
	}

	//console.log("primes=", primes);

	/*if (primesDefinite === null)
	{
		primesDefinite = [];
		for (let i=0; i<primes.length; i++) primesDefinite.push(callContract("isPrime", primes[i]));
		primesDefinite = Promise.all(primesDefinite);
	}*/

	if (owners === null)
	{
		owners = [];
		for (let i=0; i<primes.length; i++)
		{
			//console.log("calling getOwner with primes[i]=", primes[i]);
			owners.push(callContract("getOwner", primes[i]));
		}
		owners = Promise.all(owners);
	}




	let sellOrderPrices = [];
	for (let i=0; i<primes.length; i++)
	{
		sellOrderPrices.push(callContract("primeToSellOrderPrice", primes[i]));
	}
	sellOrderPrices = Promise.all(sellOrderPrices);



	let highestBidBuyOrders = [];
	for (let i=0; i<primes.length; i++)
	{
		highestBidBuyOrders.push(callContract("findHighestBidBuyOrder", primes[i]));
	}
	highestBidBuyOrders = Promise.all(highestBidBuyOrders);



	let buyOrdersOfUserOnPrime = [];
	for (let i=0; i<primes.length; i++)
	{
		if (userAccount === null)
		{
			buyOrdersOfUserOnPrime.push([[], []]);
		}
		else
		{
			buyOrdersOfUserOnPrime.push(callContract("findBuyOrdersOfUserOnPrime", userAccount, primes[i]));
		}
	}
	buyOrdersOfUserOnPrime = Promise.all(buyOrdersOfUserOnPrime);


	
	let isPrimeBoolys = [];
	for (let i=0; i<primes.length; i++)
	{
		isPrimeBoolys.push(callContract("isPrime", primes[i]));
	}
	isPrimeBoolys = Promise.all(isPrimeBoolys);



	[owners, sellOrderPrices, highestBidBuyOrders, isPrimeBoolys, buyOrdersOfUserOnPrime] = await Promise.all([owners, sellOrderPrices, highestBidBuyOrders, isPrimeBoolys, buyOrdersOfUserOnPrime]);

	//isPrimeBoolys = isPrimeBoolys.map((a) => parseInt(a.toString()));

	const rowsUpdated = [];
	
	let insertBeforeThisRow = null;

	for (let i=0; i<primes.length; i++)
	{
		let row;

		let transferButton;
		let buyNowDiv, placeBuyOrderDiv;
		let sellNowButton, placeSellOrderButton, cancelSellOrderButton;
		let disproveButton;
		let primeIsProbableDiv;
		let cancelBuyOrderButton, editBuyOrderButton;
		const rowID = randid+"_row"+primes[i].toString(10);
		if (row = $(rowID))
		{
			transferButton = row.childNodes[2];
			buyNowDiv = row.childNodes[3];
			placeBuyOrderDiv = row.childNodes[4];
			sellNowButton = row.childNodes[5];
			placeSellOrderButton = row.childNodes[6];
			cancelSellOrderButton = row.childNodes[7];
			disproveButton = row.childNodes[8];
			primeIsProbableDiv = row.childNodes[9];
			cancelBuyOrderButton = row.childNodes[10];
			editBuyOrderButton = row.childNodes[11];
		}
		else
		{
			row = document.createElement("div");
			{
				row.setAttribute("id", rowID);

				const primeField = document.createElement("div");
				{
					const str = primes[i].toString(10);

					const pt = Math.max(Math.min(Math.floor(130.0 / str.length), 20), 8);

					if (pt < 20) primeField.style.lineHeight = pt + "pt";

					primeField.style.fontSize = pt + "pt";
					primeField.innerHTML = str;
				}
				row.appendChild(primeField);



				const ownerField = document.createElement("div");
				{
				}
				row.appendChild(ownerField);



				transferButton = document.createElement("a");
				{
					transferButton.innerHTML = "Transfer";
					transferButton.setAttribute("href", "#");
				}
				row.appendChild(transferButton);


				buyNowDiv = document.createElement("div");
				{
					buyNowDiv.classList.add("buyNowDiv");

					const buyNowButton = document.createElement("a");
					{
						buyNowButton.setAttribute("href", "#");
					}
					buyNowDiv.appendChild(buyNowButton);

					const buyNowUseBalanceCheckbox = document.createElement("input");
					{
						buyNowUseBalanceCheckbox.setAttribute("type", "checkbox");
						buyNowUseBalanceCheckbox.setAttribute("id", rowID+"_buyNowUseBalanceCheckbox");
						buyNowUseBalanceCheckbox.setAttribute("name", rowID+"_buyNowUseBalanceCheckbox");
					}
					buyNowDiv.appendChild(buyNowUseBalanceCheckbox);

					const buyNowUseBalanceCheckboxLabel = document.createElement("label");
					{
						buyNowUseBalanceCheckboxLabel.setAttribute("for", rowID+"_buyNowUseBalanceCheckbox");
						buyNowUseBalanceCheckboxLabel.innerHTML = "Use balance";
					}
					buyNowDiv.appendChild(buyNowUseBalanceCheckboxLabel);
				}
				row.appendChild(buyNowDiv);


				placeBuyOrderDiv = document.createElement("div");
				{
					placeBuyOrderDiv.classList.add("placeBuyOrderDiv");

					const placeBuyOrderButton = document.createElement("a");
					{
						placeBuyOrderButton.textContent = "Place buy order";
						placeBuyOrderButton.setAttribute("href", "#");
					}
					placeBuyOrderDiv.appendChild(placeBuyOrderButton);

					const placeBuyOrderUseBalanceCheckbox = document.createElement("input");
					{
						placeBuyOrderUseBalanceCheckbox.setAttribute("type", "checkbox");
						placeBuyOrderUseBalanceCheckbox.setAttribute("id", rowID+"_placeBuyOrderUseBalanceCheckbox");
						placeBuyOrderUseBalanceCheckbox.setAttribute("name", rowID+"_placeBuyOrderUseBalanceCheckbox");
					}
					placeBuyOrderDiv.appendChild(placeBuyOrderUseBalanceCheckbox);

					const placeBuyOrderUseBalanceCheckboxLabel = document.createElement("label");
					{
						placeBuyOrderUseBalanceCheckboxLabel.setAttribute("for", rowID+"_placeBuyOrderUseBalanceCheckbox");
						placeBuyOrderUseBalanceCheckboxLabel.innerHTML = "Use balance";
					}
					placeBuyOrderDiv.appendChild(placeBuyOrderUseBalanceCheckboxLabel);
				}
				row.appendChild(placeBuyOrderDiv);

				sellNowButton = document.createElement("a");
				{
					sellNowButton.setAttribute("href", "#");
				}
				row.appendChild(sellNowButton);

				placeSellOrderButton = document.createElement("a");
				{
					placeSellOrderButton.setAttribute("href", "#");
				}
				row.appendChild(placeSellOrderButton);

				cancelSellOrderButton = document.createElement("a");
				{
					cancelSellOrderButton.setAttribute("href", "#");
					cancelSellOrderButton.innerHTML = "Cancel sell order";
				}
				row.appendChild(cancelSellOrderButton);

				disproveButton = document.createElement("a");
				{
					disproveButton.setAttribute("href", "#");
					disproveButton.innerHTML = "Disprove";
				}
				row.appendChild(disproveButton);

				primeIsProbableDiv = document.createElement("div");
				{
					primeIsProbableDiv.innerHTML = (isPrimeBoolys[i].cmpn(3) === 0) ? "Probable" : "Definite";
					primeIsProbableDiv.classList.add("primeIsProbableDiv");
				}
				row.appendChild(primeIsProbableDiv);

				cancelBuyOrderButton = document.createElement("a");
				{
					cancelBuyOrderButton.innerHTML = "Cancel buy order of ...";
					cancelBuyOrderButton.setAttribute("href", "#");
				}
				row.appendChild(cancelBuyOrderButton);

				editBuyOrderButton = document.createElement("a");
				{
					editBuyOrderButton.innerHTML = "Edit buy order";
					editBuyOrderButton.setAttribute("href", "#");
				}
				row.appendChild(editBuyOrderButton);

				const displayPrimeFunc = (function(thePrime){
					return function(){
						searchFor(thePrime.toString(10));
					};
				})(primes[i]);
				primeField.onclick = displayPrimeFunc;
			}
			
			if (appendPrimesAtStart)
			{
				if (insertBeforeThisRow === null) insertBeforeThisRow = primesListDiv.childNodes[0];
				primesListDiv.insertBefore(row, insertBeforeThisRow);
			}
			else primesListDiv.appendChild(row);
		}


		if (!row.hasAttribute("owner") || row.getAttribute("owner").toString().trim() !== owners[i].toString().trim())
		{
			row.childNodes[1].innerHTML = "";
			row.childNodes[1].appendChild(createUserBox(owners[i]));
			row.setAttribute("owner", owners[i]);
		}



		const displayOwnerFunc = (function(theAddress){
			return function(){
				searchFor(theAddress);
			};
		})(owners[i]);
		row.childNodes[1].onclick = displayOwnerFunc;


		if (userAccount === null)
		{
			transferButton.style.display = "none";

			buyNowDiv.style.display = "none";
			placeBuyOrderDiv.style.display = "none";
			cancelBuyOrderButton.style.display = "none";
			editBuyOrderButton.style.display = "none";

			sellNowButton.style.display = "none";
			placeSellOrderButton.style.display = "none";
			cancelSellOrderButton.style.display = "none";
			disproveButton.style.display = "none";
		}
		else if (owners[i] === userAccount)
		{
			transferButton.style.display = "inline-block";
			placeBuyOrderDiv.style.display = "none";
			buyNowDiv.style.display = "none";
			placeSellOrderButton.style.display = "inline-block";
			cancelBuyOrderButton.style.display = "none";
			editBuyOrderButton.style.display = "none";

			transferButton.onclick = (function(thePrime){return function(){
				(async function(){
					let destinationAddress = prompt("Enter the Ethereum address that "+thePrime+" should be transfered to:", "");
					if (destinationAddress === null || isNaN(destinationAddress) || destinationAddress === undefined || destinationAddress === "") return;
					if (!destinationAddress) { alert("Invalid address!"); return; }
					if (typeof destinationAddress !== "string") { alert("Invalid address!"); return; }
					destinationAddress = destinationAddress.trim();
					if (destinationAddress === "") return;

					if (!web3.utils.isAddress(destinationAddress)) { alert("Invalid address!"); return; }

					if (destinationAddress.toLowerCase() === destinationAddress) {}
					else if (destinationAddress.toUpperCase() === destinationAddress) {}
					else if (web3.utils.isAddress(destinationAddress)) {}
					else { alert("Invalid address! Checksum is not correct!"); return; }

					callContract("transfer", destinationAddress, thePrime);
				})();
				
				return false;
			};})(primes[i]);

			if (sellOrderPrices[i].cmpn(0) === 0)
			{
				placeSellOrderButton.innerHTML = "Place sell order";
				cancelSellOrderButton.style.display = "none";
			}
			else
			{
				placeSellOrderButton.innerHTML = "Modify sell order ("+fromWei_short(sellOrderPrices[i])+")";
				cancelSellOrderButton.style.display = "inline-block";
			}


			placeSellOrderButton.onclick = (function(thePrime){return function(){
				(async function(){
					let sellPrice = prompt("Enter the amount of ETH you'd like to sell "+thePrime+" for:", "");
					if (sellPrice === null || isNaN(sellPrice) || sellPrice === undefined || sellPrice === "") return false;
					if (typeof sellPrice !== "string") { alert("Invalid ETH amount!"); return false; }
					sellPrice = sellPrice.trim();
					if (sellPrice === "") return false;

					try
					{
						sellPrice = web3.utils.toWei(sellPrice);
					}
					catch (e)
					{
						console.error(e);
						alert("Invalid ETH amount!");
						return false;
					}

					callContract("setSellPrice", thePrime, sellPrice, 0, 0);
				})();
				
				return false;
			};})(primes[i]);

			cancelSellOrderButton.onclick = (function(thePrime){return function(){
				(async function(){
					callContract("setSellPrice", thePrime, 0, 0, 0);
				})();
				
				return false;
			};})(primes[i]);


			if (!highestBidBuyOrders[i][0] || !(highestBidBuyOrders[i][2] instanceof BN && highestBidBuyOrders[i][2].constructor !== BN) || highestBidBuyOrders[i][2].cmpn(0) === 0)
			{
				sellNowButton.style.display = "none";
			}
			else
			{
				const buyOrderIndex = highestBidBuyOrders[i][1];
				const bid = highestBidBuyOrders[i][2];

				sellNowButton.style.display = "inline-block";
				sellNowButton.innerHTML = "Sell now for "+fromWei_short(bid);
				sellNowButton.onclick = (function(thePrime, theBid, theBuyOrderIndex){return function(){
					(async function(){
						callContract("setSellPriceAndMatchRange", thePrime, theBid, theBuyOrderIndex, theBuyOrderIndex);
					})();
				
					return false;
				};})(primes[i], bid, buyOrderIndex);
			}
		}
		else
		{
			transferButton.style.display = "none";
			placeSellOrderButton.style.display = "none";
			cancelSellOrderButton.style.display = "none";
			sellNowButton.style.display = "none";

			if (buyOrdersOfUserOnPrime[i][0].length === 0)
			{
				cancelBuyOrderButton.style.display = "none";
				editBuyOrderButton.style.display = "none";
				placeBuyOrderDiv.style.display = "inline-block";
			}
			else
			{
				const allBuyOrderIndices = [];

				let highestBidIndexSoFar = new BN(buyOrdersOfUserOnPrime[i][0][0]);
				let highestBidSoFar = new BN(buyOrdersOfUserOnPrime[i][1][0]);
				allBuyOrderIndices.push(highestBidIndexSoFar);
				for (let j=1; j<buyOrdersOfUserOnPrime[i][0].length; j++)
				{
					const bid = new BN(buyOrdersOfUserOnPrime[i][1][j]);
					const bidIndex = new BN(buyOrdersOfUserOnPrime[i][0][j]);
					allBuyOrderIndices.push(bidIndex);
					//console.log("highestBidSoFar="+highestBidSoFar+" bid="+bid);
					if (bid.cmp(highestBidSoFar) === 1)
					{
						//console.log("new highest bid!");
						highestBidIndexSoFar = bidIndex;
						highestBidSoFar = bid;
					}
				}
				
				placeBuyOrderDiv.style.display = "none";
				cancelBuyOrderButton.style.display = "inline-block";
				editBuyOrderButton.style.display = "inline-block";

				if (allBuyOrderIndices.length === 1)
				{
					cancelBuyOrderButton.innerHTML = "Cancel buy order of "+fromWei_short(highestBidSoFar);
				}
				else
				{
					cancelBuyOrderButton.innerHTML = "Cancel buy orders (up to "+fromWei_short(highestBidSoFar)+")";
				}

				cancelBuyOrderButton.onclick = (function(thePrime, theBuyOrderIndex, theAllBuyOrderIndices){
					return function(){
						callContract("tryCancelBuyOrders", Array.from({length: theAllBuyOrderIndices.length}).map(x => thePrime), theAllBuyOrderIndices);
						return false;
					};
				})(primes[i], highestBidIndexSoFar, allBuyOrderIndices);

				editBuyOrderButton.onclick = (function(thePrime, theBuyOrderIndex, theOldBid){
					return function(){
						(async function(){
							let newBid = web3.utils.fromWei(theOldBid);
							while(true)
							{
								try
								{
									newBid = prompt("Please enter the new buy order amount:", newBid);
									if (newBid === null || newBid === undefined || newBid === false) break;
									newBid = newBid.trim();
									if (newBid === "") break;
									if (! /^([0-9\.]+)$/.test(newBid)) throw "Incorrect number";
									newBid = web3.utils.toWei(newBid);
								}
								catch (e)
								{
									alert("Input error. Please enter a valid amount of ETH");
									continue;
								}
								callContract("modifyBuyOrder", thePrime, theBuyOrderIndex, newBid);
								break;
							}
						})();
						return false;
					};
				})(primes[i], highestBidIndexSoFar, highestBidSoFar);
			}
			
			if (sellOrderPrices[i].cmpn(0) === 0)
			{
				buyNowDiv.style.display = "none";
			}
			else
			{
				buyNowDiv.style.display = "inline-block";
				const buyNowButton = buyNowDiv.childNodes[0];
				const buyNowUseBalanceCheckbox = buyNowDiv.childNodes[1];
				buyNowButton.innerHTML = "Buy now for "+fromWei_short(sellOrderPrices[i]);
				buyNowButton.onclick = (function(thePrime, theBid, theBuyNowUseBalanceCheckbox){return function(){
					(async function(){
						if (!(await needUserAccount()))
						{
							alert("Please connect or unlock your Ethereum wallet to use the buy feature.");
							return;
						}

						let [
							buyOrderIndexHint,
							addressToEtherBalance
						] = await Promise.all([
							callContract("findFreeBuyOrderSlot", thePrime),
							callContract("addressToEtherBalance", userAccount)
						]);

						console.log("thePrime="+thePrime+" theBid="+theBid+" buyOrderIndexHint="+buyOrderIndexHint);


						/*etherPrime.createBuyOrder.sendTransaction(
							thePrime, theBid, buyOrderIndexHint,
							{value: theBid, from: userAccount},
							function(err, result) {
								if (err !== null) console.error(err);
								else console.log("createBuyOrder result="+result);
							}
						);*/

						let valueToSend;
						if (theBuyNowUseBalanceCheckbox.checked)
						{
							if (addressToEtherBalance.cmp(theBid) === -1) valueToSend = theBid.sub(addressToEtherBalance);
							else valueToSend = 0;
						}
						else
						{
							valueToSend = theBid;
						}

						callContract("depositEtherAndCreateBuyOrder",
							thePrime, theBid, buyOrderIndexHint,
							{value: valueToSend, from: userAccount},
						);

						//callContract("createBuyOrder", , , );
					})();

					return false;
				};})(primes[i], sellOrderPrices[i], buyNowUseBalanceCheckbox);
			}

			const placeBuyOrderButton = placeBuyOrderDiv.childNodes[0];
			const placeBuyOrderUseBalanceCheckbox = placeBuyOrderDiv.childNodes[1];

			placeBuyOrderButton.onclick = (function(thePrime, thePlaceBuyOrderUseBalanceCheckbox){return function(){
				(async function(){
					let [
						buyOrderIndexHint,
						addressToEtherBalance
					 ] = [
						 callContract("findFreeBuyOrderSlot", thePrime),
						 callContract("addressToEtherBalance", userAccount)
					 ];

					if (!(await needUserAccount()))
					{
						alert("Please connect or unlock your Ethereum wallet to use the buy feature.");
						return;
					}

					let buyPrice = prompt("Enter the amount of ETH you'd like to buy "+thePrime+" for:", "");
					if (buyPrice === null || isNaN(buyPrice) || buyPrice === undefined || buyPrice === "" || buyPrice === false) return false;
					if (typeof buyPrice !== "string") { alert("Invalid ETH amount!"); return false; }
					buyPrice = buyPrice.trim();
					if (buyPrice === "") return false;

					try
					{
						buyPrice = new BN(web3.utils.toWei(buyPrice));
					}
					catch (e)
					{
						console.error(e);
						alert("Invalid ETH amount!");
						return false;
					}
					
					buyOrderIndexHint = await buyOrderIndexHint;

					console.log("thePrime="+thePrime+" buyPrice="+buyPrice+" buyOrderIndexHint="+buyOrderIndexHint);

					let valueToSend;
					if (thePlaceBuyOrderUseBalanceCheckbox.checked)
					{
						addressToEtherBalance = await addressToEtherBalance;
						console.log("'Place buy order' is using the user's current balance which is "+addressToEtherBalance+" buyPrice="+buyPrice+" addressToEtherBalance.cmp(buyPrice)="+addressToEtherBalance.cmp(buyPrice));
						console.log(addressToEtherBalance);
						console.log(buyPrice);

						// If the user does not have enough balance...
						if (addressToEtherBalance.cmp(buyPrice) === -1)
						{
							valueToSend = buyPrice.sub(addressToEtherBalance);
							console.log("User does not have enough balance! Sending "+valueToSend);
						}

						// ... if they do have enough balance, send nothing
						else valueToSend = 0;
					}
					else
					{
						console.log("'Place buy order' is NOT using the user's current balance");
						valueToSend = buyPrice;
					}

					callContract("depositEtherAndCreateBuyOrder",
						thePrime, buyPrice, buyOrderIndexHint,
						{
							"from": userAccount,
							"value": valueToSend
						},
					);

					//callContract("createBuyOrder", thePrime, buyPrice, await buyOrderIndexHint);
				})();
				return false;
			};})(primes[i], placeBuyOrderUseBalanceCheckbox);
		}

		if (isPrimeBoolys[i].cmpn(3) === 0)
		{
			disproveButton.style.display = "inline-block";
			disproveButton.onclick = (function(thePrime){return function(){
				(async function(){
					let presetText = "";
					while (true)
					{
						let divisor = prompt("Please enter a divisor of "+thePrime.toString(10), presetText);
						if (divisor === null || divisor === undefined || divisor === false || divisor === "") return;
						divisor = divisor.trim();
						try
						{
							divisor = new BN(divisor);
						}
						catch (e)
						{
							presetText = divisor;
							alert("Please enter a valid number!");
							continue;
						}
						callContract("disproveProbablePrime", thePrime, divisor);
						return;
					}
				})();
				return false;
			};})(primes[i]);
		}
		else
		{
			disproveButton.style.display = "none";
		}

		rowsUpdated.push(row);
	}

	if (shouldRemovePrimesNotInPrimesArray)
	{
		// Remove primes that are in the list, but not in the primes array that this function received.
		for (let i=0; i<primesListDiv.childNodes.length; i++)
		{
			if (rowsUpdated.indexOf(primesListDiv.childNodes[i]) === -1)
			{
				primesListDiv.removeChild(primesListDiv.childNodes[i]);
				i--;
			}
		}
	}
	
	// If the list has not been completely loaded yet, trigger another update
	if (primesListDiv.hasAttribute("listIsComplete") &&
		primesListDiv.getAttribute("listIsComplete") === "no")
	{
		console.log("Primes list "+primesListDiv.getAttribute("id")+" is incomplete! Triggering another update...");
		setTimeout(updatePrimesList, 50, primesListDiv, true);
	}

	primesListDiv.setAttribute("loading", "no");
}

