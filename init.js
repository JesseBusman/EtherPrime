"use strict";

async function init()
{
	// This is useful for development purposes.
	// If the contract was redeployed, nuke the cache.
	const previousEtherPrimeContract = localStorage.getItem("ETHER_PRIME_ADDRESS");
	if (previousEtherPrimeContract !== ETHER_PRIME_ADDRESS)
	{
		console.error("Contract address changed from "+previousEtherPrimeContract+" to "+ETHER_PRIME_ADDRESS+"! Wiping cache...");
		localStorage.clear();
		localStorage.setItem("ETHER_PRIME_ADDRESS", ETHER_PRIME_ADDRESS);
	}

	// If the user presses Enter in the search box, it should search.
	$("searchBox").addEventListener("keydown", function(e){
		if (e.keyCode === 13)
		{
			searchFor($("searchBox").value.trim());
		}
	});


	showPage("loadingPage");
	
	// Randomize subtitle. Don't display the same one twice in a row.
	let currentSubtitleIndex = null;
	function changeSubtitle()
	{
        let newSubtitleIndex;
        do
        {
            newSubtitleIndex = Math.floor(Math.random()*SUBTITLES.length);
        }
        while (newSubtitleIndex === currentSubtitleIndex);
        
        currentSubtitleIndex = newSubtitleIndex;
		$("subtitle").innerHTML = SUBTITLES[newSubtitleIndex];
	}
    setInterval(changeSubtitle, 120 * 1000);
    $("subtitle").addEventListener("click", changeSubtitle);
	changeSubtitle();
	
	// Only display the init log on the loading page after 250ms.
	// This prevents unnecessarily flashy appearing & disappearing.
	// Removing this will damage a user's eyes and possibly its sanity.
	setTimeout(function(){
		if (currentDisplayedPage === $("loadingPage"))
		{
			$("initLog").style.visibility = "visible";
		}
	}, 250);
	
	// Yup :)
	$("initLog").innerHTML += "<h2>Connecting to the Ethereum network...</h2>";

	let networkID = null;

	try
	{
		// Modern dapp browsers/plugins...
		if (window.ethereum)
		{
			window.web3 = new Web3(window.ethereum);
		}

		// Legacy dapp browsers/plugins...
		// Checking if Web3 has been injected by the browser
		// (Mist, MetaMask or some other plugin or add-on)
		else if (typeof web3 !== 'undefined')
		{
			window.browserInjectedPlugin = true;
			window.web3 = new Web3(web3.currentProvider);
		}
		else
		{
			window.browserInjectedPlugin = false;

			$("initLog").innerHTML += "<h3>The browser has not injected web3. Connecting to infura.io ...</h3>";

			if (window.location.toString().indexOf("etherprimedev") === -1) window.web3 = new Web3(new Web3.providers.HttpProvider("http://mainnet.infura.io/v3/00ea02d5eed24f99afd8cefec288999c:8545"));
			else window.web3 = new Web3(new Web3.providers.HttpProvider("http://ropsten.infura.io/v3/00ea02d5eed24f99afd8cefec288999c:8545"));
		}
		
		// Check if we're on the correct Ethereum network
		// TODO check if we're on Ethereum Classic
		networkID = await web3.eth.net.getId();
		
		if (window.location.toString().indexOf("etherprimedev") === -1)
		{
			if (networkID !== 1)
			{
				$("initLog").innerHTML += "<h3 style='color: red;'>Please switch to the main Ethereum network</h3>";
				showPage("loadingPage");
				allowPageChange = false;
				return;
			}
		}
		else
		{
			if (networkID !== 3)
			{
				$("initLog").innerHTML += "<h3 style='color: red;'>Please switch to Ropsten testnet</h3>";
				showPage("loadingPage");
				allowPageChange = false;
				return;
			}
		}
		
		// Create contract objects
		etherPrime = new window.web3.eth.Contract(ETHER_PRIME_ABI, ETHER_PRIME_ADDRESS);
		etherPrimeChat = new window.web3.eth.Contract(ETHER_PRIME_CHAT_ABI, ETHER_PRIME_CHAT_ADDRESS);

		window.BN = web3.utils.BN;
	}
	catch (e)
	{
		console.error(e);
		$("initLog").innerHTML += "<h3 style='color: red;'>Failed to connect to the Ethereum network!</h3> <h3>You should consider installing a web3-enabled browser plugin. We recommend MetaMask</h3>";
		showPage("loadingPage");
		allowPageChange = false;
		return;
	}

	initComputePage();

	// If the URL links to a specific page, go there.
	if (typeof window.location.hash === "string" && window.location.hash !== "#" && window.location.hash.length >= 1)
	{
		gotoCurrentLocationHash();
	}
	
	// Load & display all UI data
	setInterval(updateAccountData, 250);
	setInterval(updateComputePage, 1000);
	
	await updateAccountData();
	userAccountChanged();
	updateUI();

	startListeningEvents();

	// If we haven't displayed a proper page yet, default to the "All primes" page.
	if (currentDisplayedPage === $("loadingPage")) showPage("pageAllPrimes");
}

async function updateUI()
{
	console.log("updateUI() is running...");
	
	updateAccountData();
	updateComputePage();
	updateTitleStatistics();
	updateAllPrimesLists();
	updateRankingPage();
	updateTransactionsPage();
	updateChatPage();
	updateSearchPage();
}

async function updateTitleStatistics()
{
	[
		$("largestPrimeCounter").innerText,
		$("definitePrimeCounter").innerText,
		$("probablePrimeCounter").innerText,
	] = await Promise.all([
		callContract("largestDefinitePrimeFound"),
		callContract("amountOfDefinitePrimesFound"),
		callContract("amountOfProbablePrimesFound"),
	])
	
}







//////////////////////////////////////////////////////////////////
// Everything below this line is fancy useless graphics nonsense

const flyingPrimes = [];

function createBackgroundFlyingPrime()
{
	const startX = (Math.random() < 0.5) ? -200 : ((document.documentElement.clientWidth || 2000) + 200);
	const startY = Math.floor(Math.random() * 1000);
	const startVx = (startX < 0) ? (Math.random() * 5) : (-Math.random() * 5);
	const startVy = -1.0 + (Math.random() * 2.0);
	const div = document.createElement("div");
	{
		div.classList.add("flyingPrime");
		div.innerText = Math.floor(Math.random()*1000).toString();
		div.style.position = "fixed";
		div.style.zIndex = -1000;
	}
	document.body.appendChild(div);
	flyingPrimes.push({"div": div, "x": startX, "y": startY, "vx": startVx, "vy": startVy});
}

function flyingPrimePhysics(){
	for (let i=0; i<flyingPrimes.length; i++)
	{
		const fp = flyingPrimes[i];
		if (fp.x < -300 || fp.x > ((document.documentElement.clientWidth || 2000) + 300) ||
			fp.y < -300 || fp.y > ((document.documentElement.clientHeight || 1500) + 300))
		{
			flyingPrimes.splice(i, 1);
			i--;
			continue;
		}
		
		fp.x += fp.vx;
		fp.y += fp.vy;
		
		fp.div.style.top  = fp.y;
		fp.div.style.left = fp.x;
	}
	setTimeout(flyingPrimePhysics, 25);
}
flyingPrimePhysics();
