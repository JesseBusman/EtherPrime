"use strict";

let searchPageIsDisplayingAddress = false;
let searchPageIsDisplayingNumber = false;

function claimProbablePrime(prime)
{
    callContract("claimProbablePrime", new BN(prime));
}

async function updateSearchPage()
{
	console.log("updateSearchPage() is running...");
	
	if (searchPageIsDisplayingAddress !== false)
	{
		const owner = searchPageIsDisplayingAddress;

		let [
			addressPrimeCount,
			addressToGasSpent,
			addressToEtherSpent,
			addressToProbablePrimesClaimed,
			addressToProbablePrimesDisprovenBy,
			addressToProbablePrimesDisprovenFrom,
			addressToUsername
		] = await Promise.all([
			callContract("addressPrimeCount", owner),
			callContract("addressToGasSpent", owner),
			callContract("addressToEtherSpent", owner),
			callContract("addressToProbablePrimesClaimed", owner),
			callContract("addressToProbablePrimesDisprovenBy", owner),
			callContract("addressToProbablePrimesDisprovenFrom", owner),
			callContract("EtherPrimeChat::addressToUsername", owner)
		]);
		
		addressPrimeCount = parseInt(addressPrimeCount);
		addressToProbablePrimesClaimed = parseInt(addressToProbablePrimesClaimed);
		addressToProbablePrimesDisprovenBy = parseInt(addressToProbablePrimesDisprovenBy);
		addressToProbablePrimesDisprovenFrom = parseInt(addressToProbablePrimesDisprovenFrom);

		$("addressPrimeCountDiv_searchResult").innerHTML = addressPrimeCount + " primes owned";
		$("addressToGasSpentDiv_searchResult").innerHTML = addressToGasSpent.toString(10) + " gas spent computing";
		$("addressToEtherSpentDiv_searchResult").innerHTML = web3.utils.fromWei(addressToEtherSpent) + " ether spent computing";
		$("addressToProbablePrimesClaimedDiv_searchResult").innerHTML = addressToProbablePrimesClaimed + " probable primes claimed";
		$("addressToProbablePrimesDisprovenByDiv_searchResult").innerHTML = addressToProbablePrimesDisprovenBy + " probable primes disproven by them";
		$("addressToProbablePrimesDisprovenFromDiv_searchResult").innerHTML = addressToProbablePrimesDisprovenFrom + " of their probable primes were disproven";
		$("addressToUsername_searchResult").textContent = owner + "\r\n" + bytes32_to_string(addressToUsername);
	}
	
	if (searchPageIsDisplayingNumber !== false)
	{
		console.log("Updating search page for number "+searchPageIsDisplayingNumber.toString(10));

		const qInt = searchPageIsDisplayingNumber;
		const propertiesUl = $("searchResults_number_properties_list");
		const buyOrdersDiv = $("searchResults_number_buyOrders");

		if (propertiesUl === null)
		{
			console.log("propertiesUl === null in updateSearchPage()");
			return;
		}

		const [
			isBalancedPrime,
			isGoodPrime,
			isFactorialPrime,
			isCullenPrime,
			isFermatPrime,
			isSuperPrime,
			isFibonacciPrime,
			buyOrderCount,
			owner,
		] = await Promise.all([
			callContract("isBalancedPrime", qInt),
			callContract("isGoodPrime", qInt),
			callContract("isFactorialPrime", qInt),
			callContract("isCullenPrime", qInt),
			callContract("isFermatPrime", qInt),
			callContract("isSuperPrime", qInt),
			callContract("isFibonacciPrime", qInt),
			callContract("countPrimeBuyOrders", qInt),
			callContract("ownerOf", qInt),
		]);

		let nTupleMersennePrimality = [null, await callContract("isNTupleMersennePrime", qInt, 1)];
		for (let n=2; nTupleMersennePrimality[n-1][0].cmpn(2) === 1; n++)
		{
			nTupleMersennePrimality.push(await callContract("isNTupleMersennePrime", qInt, n));
		}

		console.log("Prime "+qInt+" has "+buyOrderCount+" buy orders!");

		let buyOrders = [];
		for (let i=0; i<parseInt(buyOrderCount); i++)
		{
			buyOrders.push(callContract("getPrimeBuyOrder", qInt, i));
		}
		buyOrders = await Promise.all(buyOrders);

		buyOrders = buyOrders.sort((a, b) => b[1].cmp(a[1]));

		let newHTML = "";

		console.log("isBalancedPrime:");
		console.log(isBalancedPrime);

		if (isBalancedPrime[0].cmpn(2) !== 0 && isBalancedPrime[0].cmpn(0) !== 0)
		{
			newHTML += "<li>It is "+boolyToWords(isBalancedPrime[0])+" a balanced prime";
			if (isBalancedPrime[0].cmpn(0) === 0 &&
				isBalancedPrime[1].cmpn(0) !== 0)
			{
				newHTML += " because it is in between the primes "+isBalancedPrime[1].toString(10)+" and "+isBalancedPrime[2].toString(10)+" which are not equidistant";
			}
			else if (isBalancedPrime[0].cmpn(3) === 0 || isBalancedPrime[0].cmpn(4) === 0)
			{
				newHTML += " because it is in between the primes "+isBalancedPrime[1].toString(10)+" and "+isBalancedPrime[2].toString(10)+" which are equidistant (distance="+qInt.sub(isBalancedPrime[1])+")";
			}
			newHTML += "</li>";
		}

		for (let n=1; n<nTupleMersennePrimality.length; n++)
		{
			if (nTupleMersennePrimality[n][0].cmpn(2) !== 0 && nTupleMersennePrimality[n][0].cmpn(0) !== 0)
			{
				const form = nTupleMersenneForm(n);
				newHTML += "<li>It is "+boolyToWords(nTupleMersennePrimality[n][0])+" a "+intToTupleWord(n)+" mersenne prime, because it is of the form "+form+" where n="+nTupleMersennePrimality[n][1][nTupleMersennePrimality[n][1].length-1]+"</li>";
			}
			else break;
		}

		/*if (isMersennePrime[0].cmpn(2) !== 0 && isMersennePrime[0].cmpn(0) !== 0)
		{
			newHTML += "<li>It is "+boolyToWords(isMersennePrime[0])+" a mersenne prime, because it is of the form 2<sup>n</sup> - 1 where n="+isMersennePrime[1]+"</li>";
		}
		if (isDoubleMersennePrime[0].cmpn(2) !== 0 && isDoubleMersennePrime[0].cmpn(0) !== 0)
		{
			newHTML += "<li>It is "+boolyToWords(isDoubleMersennePrime[0])+" a double mersenne prime.</li>";
		}*/

		if (isGoodPrime.cmpn(2) !== 0 && isGoodPrime.cmpn(0) !== 0)
		{
			newHTML += "<li>It is "+boolyToWords(isGoodPrime)+" a good prime, because its square is greater than every product of equally distant (by index) primes</li>";
		}
		if (isFactorialPrime[0].cmpn(2) !== 0 && isFactorialPrime[0].cmpn(0) !== 0)
		{
			newHTML += "<li>It is "+boolyToWords(isFactorialPrime[0])+" a factorial prime, because it is equal to "+isFactorialPrime[1]+"! ";
			if (isFactorialPrime[2].cmpn(0) === -1) newHTML += "- "+(new BN(0)).sub(isFactorialPrime[2])+"</li>";
			else newHTML += "+ "+isFactorialPrime[2]+"</li>";
		}
		if (isCullenPrime[0].cmpn(2) !== 0 && isCullenPrime[0].cmpn(0) !== 0)
		{
			newHTML += "<li>It is "+boolyToWords(isCullenPrime[0])+" a cullen prime, because it is of the form n * 2<sup>n</sup> + 1 where n="+isCullenPrime[1]+"</li>";
		}
		if (isFermatPrime[0].cmpn(2) !== 0 && isFermatPrime[0].cmpn(0) !== 0)
		{
			newHTML += "<li>It is "+boolyToWords(isFermatPrime[0])+" a fermat prime.</li>";
		}
		if (isSuperPrime[0].cmpn(2) !== 0 && isSuperPrime[0].cmpn(0) !== 0)
		{
			newHTML += "<li>It is "+boolyToWords(isSuperPrime[0])+" a superprime because it is the "+ordinalString(isSuperPrime[1])+" prime, which is also prime</li>";
		}
		if (isFibonacciPrime.cmpn(2) !== 0 && isFibonacciPrime.cmpn(0) !== 0)
		{
			newHTML += "<li>It is "+boolyToWords(isFibonacciPrime)+" a fibonacci prime</li>";
		}

		propertiesUl.innerHTML = newHTML;

		const address_to_userBoxes = {};

		for (let i=0; i<buyOrdersDiv.childNodes.length; i++)
		{
			console.log("buyOrdersDiv.childNodes[i]=", buyOrdersDiv.childNodes[i]);
			const userBox = buyOrdersDiv.childNodes[i].childNodes[0];
			const address = userBox.getAttribute("address");
			if (!address_to_userBoxes[address]) address_to_userBoxes[address] = [];
			address_to_userBoxes[address].push(userBox);
			console.log("reusing a userBox for "+address);
		}

		buyOrdersDiv.innerHTML = "";

		let amountOfBuyOrdersDisplayed = 0;

		for (let i=0; i<buyOrders.length; i++)
		{
			const bidder = buyOrders[i][0];
			const bid = buyOrders[i][1];
			const bidderHasEnoughBalance = buyOrders[i][2];

			if (bid.cmpn(0) === 0) continue;
			if (!bidderHasEnoughBalance && bidder !== userAccount) continue;

			console.log("Buy order:", buyOrders[i]);
			const buyOrderDiv = document.createElement("div");
			{
				let userBox;
				if (address_to_userBoxes[bidder] && address_to_userBoxes[bidder].length >= 1) userBox = address_to_userBoxes[bidder].pop();
				else userBox = createUserBox(bidder);

				buyOrderDiv.appendChild(userBox);
				const priceDiv = document.createElement("div");
				{
					priceDiv.classList.add("bidAmount");
					priceDiv.innerHTML = fromWei_short(bid);
				}
				buyOrderDiv.appendChild(priceDiv);

				if (owner === userAccount)
				{
					const acceptBuyOrderButton = document.createElement("a");
					{
						acceptBuyOrderButton.setAttribute("href", "#");
						acceptBuyOrderButton.textContent = "Sell now for "+web3.utils.fromWei(bid)+" ETH";
						acceptBuyOrderButton.onclick = (function(thePrime, theBuyOrderIndex, theAmount){
							return function(){
								callContract("setSellPriceAndMatchRange", thePrime, theAmount, theBuyOrderIndex, theBuyOrderIndex);
								return false;
							};
						})(qInt, i, bid);
					}
					buyOrderDiv.appendChild(acceptBuyOrderButton);
				}

				if (bidder === userAccount)
				{
					const cancelBuyOrderButton = document.createElement("a");
					{
						cancelBuyOrderButton.setAttribute("href", "#");
						cancelBuyOrderButton.textContent = "Cancel buy order";
						cancelBuyOrderButton.onclick = (function(thePrime, theBuyOrderIndex){
							return function(){
								callContract("tryCancelBuyOrders", [thePrime], [theBuyOrderIndex]);
								return false;
							};
						})(qInt, i);
					}
					buyOrderDiv.appendChild(cancelBuyOrderButton);

					const editBuyOrderButton = document.createElement("a");
					{
						editBuyOrderButton.setAttribute("href", "#");
						editBuyOrderButton.textContent = "Edit buy order";
						editBuyOrderButton.onclick = (function(thePrime, theBuyOrderIndex, theOldBid){
							return function(){
								(async function(){
									let newBid = web3.utils.fromWei(theOldBid);
									while (true)
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
						})(qInt, i, bid);
					}
					buyOrderDiv.appendChild(editBuyOrderButton);

					if (!bidderHasEnoughBalance)
					{
						const div = document.createElement("div");
						{
							div.classList.add("inactiveBuyOrderText");
							div.textContent = "Buy order inactive because you don't have enough balance.";
						}
						buyOrderDiv.appendChild(div);
					}
				}
			}
			buyOrdersDiv.appendChild(buyOrderDiv);
			amountOfBuyOrdersDisplayed++;
		}

		if (amountOfBuyOrdersDisplayed === 0)
		{
			$("searchPage_buyOrdersTitle").style.display = "none";
		}
		else
		{
			$("searchPage_buyOrdersTitle").style.display = "block";
		}
	}
}

let currentSearchQuery = null;

async function forceRedrawSearchResults()
{
	const q = currentSearchQuery;
	console.log("forceRedrawSearchResults() on q="+q);
	searchFor("", false);
	searchFor(q, false);
}

async function searchFor(q, showPageSearch=true)
{
	if (showPageSearch) showPage("pageSearch");

	q = q.trim();

	const newHash = "search:" + encodeURIComponent(q);
	if (newHash !== window.location.hash) window.location.hash = newHash;

	if (q === currentSearchQuery) return;

	currentSearchQuery = q;

	$("searchBox").value = q;
	$("menuButton_pageSearch").setAttribute("href", "#search:"+q);
	

	$("searchResults").innerHTML = "Searching...";
	searchPageIsDisplayingAddress = false;
	searchPageIsDisplayingNumber = false;

	let qInt = null;
	if (!q.startsWith("0x") && !q.startsWith("0X") && /^([0-9]+)$/.test(q)) try { qInt = new BN(q); } catch (e) { }

	if (q === "")
	{
		$("searchResults").innerHTML = "";
		return;
	}
	else if (qInt !== null)
	{
		searchPageIsDisplayingNumber = qInt;

		console.log("qInt=", qInt);

		if (qInt.cmpn(0) == -1)
		{
			$("searchResults").innerHTML = qInt+" is not prime!<br/>It's negative";
		}
		else
		{
			console.log("Checking if "+qInt+" isPrime...");

			let [
				owner,
				isPrime
			] = await Promise.all([
				callContract("ownerOf", qInt),
				callContract("isPrime", qInt)
			]);

			console.log("isPrime("+qInt+") returned:");
			console.log(isPrime);
			console.log(isPrime.toString());

			isPrime = parseInt(isPrime.toString());

			if (isPrime === 0)
			{
				$("searchResults").innerHTML = "The number "+qInt.toString(10)+" is not prime!";
				if (qInt.cmpn(1) === 0)
				{
					$("searchResults").innerHTML += "<br/>Prime numbers are defined as having exactly 2 divisors. 1 only has 1 divisor: 1.";
				}
				else if (qInt.cmpn(0) === 0)
				{
					$("searchResults").innerHTML += "<br/>Prime numbers are defined as having exactly 2 divisors. 0 has infinite divisors: all integers.";
				}
				else if (qInt.mod(new BN(2)).cmpn(0) === 0)
				{
					$("searchResults").innerHTML += "<br/>It is divisible by 2.";
				}
				else
				{
					$("searchResults").innerHTML += "<br/>It is divisible by " + (await callContract("numberToDivisor", qInt)).toString(10) + ".";
				}
				
				if (qInt.cmpn(1) === 1)
				{
					const [success, primeFactors] = await callContract("getPrimeFactors", qInt);
					if (success)
					{
						const primeFactorsString = primeFactors.join(" x ");
						$("searchResults").innerHTML += "<br/>Prime factorization: " + primeFactorsString;
					}
				}
			}
			else if (isPrime === 2)
			{
				const resultResult = await callContract("isPrime_probabilistic", qInt);
				console.log("isPrime_probabilistic("+qInt+") result =");
				console.log(resultResult);console.log(resultResult.toString());

				const result = parseInt(resultResult.toString());


				console.log("isPrime_probabilistic result = "+result);
				
				if (result === 0)
				{
					$("searchResults").innerHTML = "The number "+qInt.toString(10)+" is not prime!";
				}
				else if (result === 1)
				{
					$("searchResults").innerHTML = "The number "+qInt.toString(10)+" is probably not prime!";
				}
				else if (result === 2)
				{
					$("searchResults").innerHTML = "The number "+qInt.toString(10)+" is of unknown primality!";
				}
				else if (result === 3 || result === 4)
				{
					$("searchResults").innerHTML = "The number "+qInt.toString(10)+" is probably prime!<br/><br/>It has not been claimed yet!</u><br/>You can claim it as a probable prime: <a href='#' onclick='claimProbablePrime(new BN(\""+q+"\"));return false;'>Claim</a><br/><br/><i>Nota bene: If this prime is ever reached by the definite prime compute function, you will lose ownership of it. It is therefore recommended to only claim very large primes as probable primes.</i>";
				}
				else
				{
					console.error("wtf isPrime_probabilistic says ", result, resultResult);
				}
			}
			else if (isPrime === 3 || isPrime === 4)
			{
				$("searchResults").innerHTML = "The number "+qInt.toString(10)+" is "+(isPrime == 3 ? "probably " : "")+"prime!<br/><br/>";

				if (owner !== "0x0000000000000000000000000000000000000000" && owner.startsWith("0x") && web3.utils.isAddress(owner) && parseInt(owner.substring(2), 16) !== 0)
				{
					const primesListDiv = document.createElement("div");
					primesListDiv.classList.add("primesList");
					primesListDiv.setAttribute("sourceType", "singlePrime");
					primesListDiv.setAttribute("prime", ""+qInt.toString(10));
					$("searchResults").appendChild(primesListDiv);

					updatePrimesList(primesListDiv);
				}

				const propertiesUl = document.createElement("ul");
				propertiesUl.setAttribute("id", "searchResults_number_properties_list");
				$("searchResults").appendChild(propertiesUl);

				const brClearBoth = document.createElement("br");
				brClearBoth.style.clear = "both";
				$("searchResults").appendChild(brClearBoth);

				const buyOrdersTitleH3 = document.createElement("h3");
				buyOrdersTitleH3.setAttribute("id", "searchPage_buyOrdersTitle");
				buyOrdersTitleH3.textContent = "Buy orders";
				buyOrdersTitleH3.style.textAlign = "center";
				buyOrdersTitleH3.style.marginTop = "30px";
				buyOrdersTitleH3.style.marginBottom = "0px";
				buyOrdersTitleH3.style.display = "none";
				$("searchResults").appendChild(buyOrdersTitleH3);

				const buyOrdersDiv = document.createElement("div");
				buyOrdersDiv.setAttribute("id", "searchResults_number_buyOrders");
				$("searchResults").appendChild(buyOrdersDiv);
				
				updateSearchPage();
			}
		}
		return;
	}
	else
	{
		let address = null;
		let username = null;
		if (web3.utils.isAddress(q))
		{
			address = q;
		}
		else
		{
			const bytes32 = string_to_bytes32(q);
			if (bytes32 === null || bytes32.length !== 66)
			{
				$("searchResults").innerHTML = "Invalid search query";
				return;
			}
			address = await callContract("EtherPrimeChat::usernameToAddress", bytes32);

			if (address === "0x0000000000000000000000000000000000000000")
			{

				$("searchResults").innerHTML = "No results for search query '"+escapeHtml(q)+"'";
				return;
			}

			username = q;
		}

		$("searchResults").innerHTML = "Loading address metadata...";

		if (username === null) username = bytes32_to_string(await callContract("EtherPrimeChat::addressToUsername", address));
		
		$("searchResults").innerHTML = "";

		const addressDiv = document.createElement("div");
		{
			addressDiv.classList.add("address");

			addressDiv.appendChild(blockies({seed: address.toLowerCase(), size: 8, scale: 10}));

			const subDiv = document.createElement("div");
			{
				subDiv.setAttribute("id", "addressToUsername_searchResult");
			}
			addressDiv.appendChild(subDiv);
		}
		$("searchResults").appendChild(addressDiv);
		
		const statsListUl = document.createElement("ul");
		{
			const addressPrimeCountDiv = document.createElement("li");
			{
				addressPrimeCountDiv.setAttribute("id", "addressPrimeCountDiv_searchResult");
				addressPrimeCountDiv.classList.add("addressPrimeCount");
			}
			statsListUl.appendChild(addressPrimeCountDiv);
			

			const addressToGasSpentDiv = document.createElement("li");
			{
				addressToGasSpentDiv.setAttribute("id", "addressToGasSpentDiv_searchResult");
				addressToGasSpentDiv.classList.add("addressToGasSpent");
			}
			statsListUl.appendChild(addressToGasSpentDiv);
			

			const addressToEtherSpentDiv = document.createElement("li");
			{
				addressToEtherSpentDiv.setAttribute("id", "addressToEtherSpentDiv_searchResult");
				addressToEtherSpentDiv.classList.add("addressToEtherSpent");
			}
			statsListUl.appendChild(addressToEtherSpentDiv);
			

			const addressToProbablePrimesClaimedDiv = document.createElement("li");
			{
				addressToProbablePrimesClaimedDiv.setAttribute("id", "addressToProbablePrimesClaimedDiv_searchResult");
				addressToProbablePrimesClaimedDiv.classList.add("addressToProbablePrimesClaimed");
			}
			statsListUl.appendChild(addressToProbablePrimesClaimedDiv);
			

			const addressToProbablePrimesDisprovenByDiv = document.createElement("li");
			{
				addressToProbablePrimesDisprovenByDiv.setAttribute("id", "addressToProbablePrimesDisprovenByDiv_searchResult");
				addressToProbablePrimesDisprovenByDiv.classList.add("addressToProbablePrimesDisprovenBy");
			}
			statsListUl.appendChild(addressToProbablePrimesDisprovenByDiv);
			

			const addressToProbablePrimesDisprovenFromDiv = document.createElement("li");
			{
				addressToProbablePrimesDisprovenFromDiv.setAttribute("id", "addressToProbablePrimesDisprovenFromDiv_searchResult");
				addressToProbablePrimesDisprovenFromDiv.classList.add("addressToProbablePrimesDisprovenFrom");
			}
			statsListUl.appendChild(addressToProbablePrimesDisprovenFromDiv);
		}
		$("searchResults").appendChild(statsListUl);

		const brClearBoth = document.createElement("br");
		brClearBoth.setAttribute("clear", "both");
		$("searchResults").appendChild(brClearBoth);

		const primesListDiv = document.createElement("div");
		primesListDiv.classList.add("primesList");
		primesListDiv.setAttribute("sourceType", "primesOfOwner");
		primesListDiv.setAttribute("owner", address);
		$("searchResults").appendChild(primesListDiv);

		searchPageIsDisplayingAddress = address;

		updatePrimesList(primesListDiv);
		updateSearchPage();
		return;
	}

	
}

