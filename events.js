"use strict";

const processedEvents = {};

let highestEventBlockNumberSeen = 0;

// If we receive an event from Web3:
// - Interpret it,
// - Invalidate the cached values the transaction may have affected
// - Trigger an update of the relevant UI elements
function receivedEvent(result)
{
	{
		const eventID = result.id + "_"+result.logIndex+"_"+result.blockNumber+"_"+result.signature;
		if (processedEvents.hasOwnProperty(eventID) || localStorage.getItem(eventID) !== null)
		{
			//console.log("Ignoring a "+result.event+" event because we've already processed it.");
			return;
		}
        processedEvents[eventID] = true;
        localStorage.setItem(eventID, "");
    }
    
    if (result.blockNumber > highestEventBlockNumberSeen)
    {
        highestEventBlockNumberSeen = result.blockNumber;
        localStorage.setItem("lastEventsBlockProcessed", ""+highestEventBlockNumberSeen);
    }

	if (result.event === "EtherDeposited")
	{
        console.log("EtherDeposited event! result:", result);
        console.log("depositer="+result.returnValues.depositer);
		console.log("amount="+result.returnValues.amount);
		
		invalidateContractCallCache("addressToEtherBalance", result.returnValues.depositer);

        if (result.returnValues.depositer === userAccount)
        {
            updateAccountBoxData();
		}

		updateUI();
	}
	else if (result.event === "ChatMessageSent")
	{
		console.log("ChatMessageSent event!", result);

		invalidateContractCallCache("amountOfChatMessages");
		invalidateContractCallCache("getChatMessage", new BN(result.returnValues.index));
		invalidateContractCallCache("chatMessages", new BN(result.returnValues.index));
		invalidateContractCallCache("addressToGasUsedTowardsChatMessage", result.returnValues.sender);

		updateChatPage();
	}
	else if (result.event === "DefinitePrimeDiscovered")
	{
        console.log("definite prime discover event! result:", result);
        console.log("discoverer="+result.returnValues.discoverer);
        console.log("prime="+result.returnValues.prime.toString(10));
        console.log("result.returnValues.definitePrimesArrayIndex="+result.returnValues.definitePrimesArrayIndex);

        invalidateContractCallCache("amountOfDefinitePrimesFound");
        invalidateContractCallCache("definitePrimes", new BN(result.returnValues.definitePrimesArrayIndex));
        invalidateContractCallCache("addressPrimeCount", result.returnValues.discoverer);
        invalidateContractCallCache("isPrime", new BN(result.returnValues.prime));
        invalidateContractCallCache("addressToGasSpent", result.returnValues.discoverer);
        invalidateContractCallCache("addressToEtherSpent", result.returnValues.discoverer);
        invalidateContractCallCache("numberBeingTested");
        invalidateContractCallCache("divisorIndexBeingTested");
        invalidateContractCallCache("numberToDivisor", new BN(result.returnValues.prime));
        invalidateContractCallCache("getPrimeFactors", new BN(result.returnValues.prime));

		invalidateContractCallCache("ownerOf", new BN(result.returnValues.prime));
		invalidateContractCallCache("getOwner", new BN(result.returnValues.prime));
        invalidateContractCallCache("addressPrimeCount", result.returnValues.discoverer);
        invalidateContractCallCache("amountOfParticipants");
		
        if (searchPageIsDisplayingNumber !== false &&
            (new BN(result.returnValues.prime)).cmp(new BN(searchPageIsDisplayingNumber)) === 0)
        {
            forceRedrawSearchResults();
        }

		updateUI();
	}
	else if (result.event === "ProbablePrimeDiscovered")
	{
		console.log("probable prime discover event! result:", result);
        console.log("discoverer="+result.returnValues.discoverer);
        console.log("probable prime="+result.returnValues.prime.toString(10));
        console.log("result.returnValues.probablePrimesArrayIndex="+new BN(result.returnValues.probablePrimesArrayIndex));

        invalidateContractCallCache("amountOfProbablePrimesFound");
        invalidateContractCallCache("addressToProbablePrimesClaimed", result.returnValues.discoverer);
        invalidateContractCallCache("probablePrimes", new BN(result.returnValues.probablePrimesArrayIndex));
        invalidateContractCallCache("addressPrimeCount", result.returnValues.discoverer);
        invalidateContractCallCache("addressToGasSpent", result.returnValues.discoverer);
        invalidateContractCallCache("addressToEtherSpent", result.returnValues.discoverer);
        invalidateContractCallCache("isPrime", new BN(result.returnValues.prime));
        invalidateContractCallCache("getPrimeFactors", new BN(result.returnValues.prime));

		invalidateContractCallCache("ownerOf", new BN(result.returnValues.prime));
		invalidateContractCallCache("getOwner", new BN(result.returnValues.prime));
        invalidateContractCallCache("addressPrimeCount", result.returnValues.discoverer);
        invalidateContractCallCache("amountOfParticipants");
		
        if (searchPageIsDisplayingNumber !== false &&
            (new BN(result.returnValues.prime).cmp(new BN(searchPageIsDisplayingNumber)) === 0))
        {
            forceRedrawSearchResults();
        }

		updateUI();
	}
	else if (result.event === "ProbablePrimeDisproven")
	{
		console.log("probable prime disproven event! result:", result);
        console.log("disprover="+result.returnValues.disprover);
        console.log("ex-owner="+result.returnValues.owner);
        console.log("divisor="+result.returnValues.divisor.toString(10));
        console.log("probable prime="+result.returnValues.prime.toString(10));
        console.log("result.returnValues.probablePrimesArrayIndex="+result.returnValues.probablePrimesArrayIndex);

        invalidateContractCallCache("amountOfProbablePrimesFound");
        invalidateContractCallCache("probablePrimes", new BN(result.returnValues.probablePrimesArrayIndex));

        invalidateContractCallCache("addressPrimeCount", result.returnValues.disprover);
        invalidateContractCallCache("addressPrimeCount", result.returnValues.owner);

        invalidateContractCallCache("addressToProbablePrimesDisprovenBy", result.returnValues.disprover);
        invalidateContractCallCache("addressToProbablePrimesDisprovenFrom", result.returnValues.owner);
        invalidateContractCallCache("isPrime", new BN(result.returnValues.prime));
        invalidateContractCallCache("numberToDivisor", new BN(result.returnValues.prime));
        invalidateContractCallCache("getPrimeFactors", new BN(result.returnValues.prime));
        
		invalidateContractCallCache("ownerOf", new BN(result.returnValues.prime));
		invalidateContractCallCache("getOwner", new BN(result.returnValues.prime));
        invalidateContractCallCache("addressPrimeCount", result.returnValues.owner);
        invalidateContractCallCache("amountOfParticipants");
		
        if (owner_to_prime_to_ownerArrayIndex_cache.hasOwnProperty(result.returnValues.owner) &&
            owner_to_prime_to_ownerArrayIndex_cache[result.returnValues.owner].hasOwnProperty(result.returnValues.prime.toString()))
        {
            invalidateContractCallCache("tokenOfOwnerByIndex", result.returnValues.owner, owner_to_prime_to_ownerArrayIndex_cache[result.returnValues.owner][result.returnValues.prime.toString()]);
            delete owner_to_prime_to_ownerArrayIndex_cache[result.returnValues.owner][result.returnValues.prime.toString()];
        }

        if (searchPageIsDisplayingNumber !== false &&
            (new BN(result.returnValues.prime)).cmp(new BN(searchPageIsDisplayingNumber)) === 0)
        {
            forceRedrawSearchResults();
        }

		updateUI();
	}
	else if (result.event === "Transfer")
	{
        console.log("prime Transfer event! result:", result);
        console.log("from="+result.returnValues.from);
        console.log("to="+result.returnValues.to);
        console.log("prime="+result.returnValues.prime.toString(10));
        
        invalidateContractCallCache("addressPrimeCount", result.returnValues.from);
        invalidateContractCallCache("addressPrimeCount", result.returnValues.to);
        invalidateContractCallCache("amountOfParticipants");
        invalidateContractCallCache("getOwner", new BN(result.returnValues.prime));
        invalidateContractCallCache("ownerOf", new BN(result.returnValues.prime));
        
        if (owner_to_prime_to_ownerArrayIndex_cache.hasOwnProperty(result.returnValues.from) &&
            owner_to_prime_to_ownerArrayIndex_cache[result.returnValues.from].hasOwnProperty(result.returnValues.prime.toString()))
        {
            console.log("uncached owner="+result.returnValues.from+" prime="+result.returnValues.prime+" ownerArrayIndex="+owner_to_prime_to_ownerArrayIndex_cache[result.returnValues.from][result.returnValues.prime.toString()]);
            invalidateContractCallCache("tokenOfOwnerByIndex", result.returnValues.from, owner_to_prime_to_ownerArrayIndex_cache[result.returnValues.from][result.returnValues.prime.toString()]);
            delete owner_to_prime_to_ownerArrayIndex_cache[result.returnValues.from][result.returnValues.prime.toString()];
        }
        if (owner_to_prime_to_ownerArrayIndex_cache.hasOwnProperty(result.returnValues.to))
        {
            delete owner_to_prime_to_ownerArrayIndex_cache[result.returnValues.to  ][result.returnValues.prime.toString()];
        }
        
        if (result.returnValues.to === userAccount || result.returnValues.from === userAccount)
        {
			updateAccountBoxData();
		}

		updateUI();
	}
	else if (result.event === "BuyOrderCreated")
	{
        console.log("BuyOrderCreated event! result:", result);
        console.log("buyer="+result.returnValues.buyer);
        console.log("price="+result.returnValues.bid);
        console.log("prime="+result.returnValues.prime.toString(10));
        console.log("buyOrdersArrayIndex="+result.returnValues.buyOrdersArrayIndex);

        invalidateContractCallCache("findHighestBidBuyOrder", new BN(result.returnValues.prime));
		invalidateContractCallCache("findFreeBuyOrderSlot", new BN(result.returnValues.prime));
		invalidateContractCallCache("countPrimeBuyOrders", new BN(result.returnValues.prime));
		invalidateContractCallCache("getPrimeBuyOrder", new BN(result.returnValues.prime), new BN(result.returnValues.buyOrdersArrayIndex));
		invalidateContractCallCache("findBuyOrdersOfUserOnPrime", userAccount, new BN(result.returnValues.prime));

        /*if (searchPageIsDisplayingNumber !== false &&
            (new BN(result.returnValues.prime)).cmp(new BN(searchPageIsDisplayingNumber)) === 0)
        {
            forceRedrawSearchResults();
        }*/

		updateUI();
	}
	else if (result.event === "BuyOrderDestroyed")
	{
        console.log("BuyOrderDestroyed event! result:", result);
        console.log("buyer="+result.returnValues.buyer);
        console.log("prime="+result.returnValues.prime.toString(10));
        console.log("buyOrdersArrayIndex="+result.returnValues.buyOrdersArrayIndex);

        invalidateContractCallCache("findHighestBidBuyOrder", new BN(result.returnValues.prime));
        invalidateContractCallCache("findFreeBuyOrderSlot", new BN(result.returnValues.prime));
		invalidateContractCallCache("countPrimeBuyOrders", new BN(result.returnValues.prime));
		invalidateContractCallCache("getPrimeBuyOrder", new BN(result.returnValues.prime), new BN(result.returnValues.buyOrdersArrayIndex));
		invalidateContractCallCache("findBuyOrdersOfUserOnPrime", userAccount, new BN(result.returnValues.prime));
		
        /*if (searchPageIsDisplayingNumber !== false &&
            (new BN(result.returnValues.prime)).cmp(new BN(searchPageIsDisplayingNumber)) === 0)
        {
            forceRedrawSearchResults();
		}*/
		
		updateUI();
	}
	else if (result.event === "SellPriceSet")
	{
        console.log("SellPriceSet event! result:", result);
        console.log("seller="+result.returnValues.seller);
        console.log("prime="+result.returnValues.prime.toString(10));
        console.log("price="+result.returnValues.price);

        invalidateContractCallCache("primeToSellOrderPrice", new BN(result.returnValues.prime));
		
        /*if (searchPageIsDisplayingNumber !== false &&
            (new BN(result.returnValues.prime)).cmp(new BN(searchPageIsDisplayingNumber)) === 0)
        {
            forceRedrawSearchResults();
        }*/

		updateUI();
	}
	else if (result.event === "PrimeTraded")
	{
        console.log("PrimeTraded event! result:", result);
        console.log("seller="+result.returnValues.seller);
        console.log("buyer="+result.returnValues.buyer);
        console.log("prime="+result.returnValues.prime.toString(10));
        console.log("price="+result.returnValues.price);
        console.log("buyOrdersArrayIndex="+result.returnValues.buyOrdersArrayIndex);

        invalidateContractCallCache("findHighestBidBuyOrder", new BN(result.returnValues.prime));
		invalidateContractCallCache("findFreeBuyOrderSlot", new BN(result.returnValues.prime));
		invalidateContractCallCache("addressToEtherBalance", result.returnValues.seller);
		invalidateContractCallCache("addressToEtherBalance", result.returnValues.buyer);
		invalidateContractCallCache("getOwner", new BN(result.returnValues.prime));
		invalidateContractCallCache("ownerOf", new BN(result.returnValues.prime));
		
        /*if (searchPageIsDisplayingNumber !== false &&
            (new BN(result.returnValues.prime)).cmp(new BN(searchPageIsDisplayingNumber)) === 0)
        {
            forceRedrawSearchResults();
        }*/

		updateUI();
	}
	else if (result.event === "UsernameSet")
	{
        console.log("UsernameSet event! result:", result);
        console.log("user="+result.returnValues.user);
        console.log("username="+result.returnValues.username);

        invalidateContractCallCache("addressToUsername", result.returnValues.user);
        invalidateContractCallCache("usernameToAddress", result.returnValues.username);

        if (result.returnValues.user === userAccount)
        {
            updateAccountBoxData();
		}

        if (searchPageIsDisplayingAddress !== false && result.returnValues.user.toLowerCase() === searchPageIsDisplayingAddress.toLowerCase())
        {
            updateSearchPage();
        }

		updateUserBoxesUsernames();
	}
	else if (result.event === "EtherWithdrawn")
	{
        console.log("EtherWithdrawn event! result:", result);
        console.log("withdrawer="+result.returnValues.withdrawer);
        console.log("amount="+result.returnValues.amount);
		
		invalidateContractCallCache("addressToEtherBalance", result.returnValues.withdrawer);

        if (result.returnValues.withdrawer === userAccount)
        {
            updateAccountBoxData();
		}
		
		updateUI();
	}
	else
	{
		throw "receivedEvent() unknown event type: "+result.event;
	}
}

function processMissedEvents()
{
    let lastEventsBlockProcessed = localStorage.getItem("lastEventsBlockProcessed");
    if (lastEventsBlockProcessed === null)
    {
        return;
    }
    else
    {
        lastEventsBlockProcessed = parseInt(lastEventsBlockProcessed);
        etherPrime.getPastEvents("allEvents", {"fromBlock": lastEventsBlockProcessed}, function(err, result){
            if (err !== null)
            {
                console.error("Error in getPastEvents:");
                console.error(err);
                return;
            }

            console.log("Processing a missed event...");
            receivedEvent(result);
        });
    }
}

function startListeningEvents()
{
	etherPrime.events.allEvents(function(err, result){
        if (err !== null)
        {
            console.error("Error in allEvents:");
            console.error(err);
            return;
        }
		receivedEvent(result);
	});

	// Listen for new blocks
	const subscription = web3.eth.subscribe('newBlockHeaders', function(error, result){
		if (!error)
		{
			console.log("Block received! Updating UI in 2.5 seconds...");
			setTimeout(updateUI, 2500);
			return;
		}

		console.error("ERROR fetching new block headers:");
		console.error(error);
	}).on("data", function(blockHeader)
	{
	}).on("error", console.error);
}
