"use strict";

let updateAccountData_running = false;
async function updateAccountData()
{
	if (updateAccountData_running) return;
	updateAccountData_running = true;

	// Use web3 to request the user's account address
	const accounts = await new Promise((resolve, reject) => { web3.eth.getAccounts(function(err, accounts){
		if (err != null) resolve(null);
		else resolve(accounts);
	})});

	// If no account is available...
	if (accounts === null || accounts.length == 0)
	{
		// If an account previously was available, trigger a UI update.
		if (userAccount !== null)
		{
			userAccount = null;
			userAccountChanged();
		}
	}

	// If an account is available...
	else
	{
		// If the returned account is different from what is was before, trigger a UI update.
		if (accounts[0] !== userAccount)
		{
			userAccount = accounts[0];
			web3.eth.defaultAccount = userAccount;
			userAccountChanged();
		}
	}

	updateAccountData_running = false;
}

// This function updates the information in the top-left account box
async function updateAccountBoxData()
{
	if (userAccount === null) return;

	let [
		username,
		primeCount,
		weiBalance
 	] = await Promise.all([
		 callContract("EtherPrimeChat::addressToUsername", userAccount),
		 callContract("addressPrimeCount", userAccount),
		 callContract("addressToEtherBalance", userAccount)
	]);
	username = bytes32_to_string(username);

	// If the user does not have a username, show them a link to allow them to get one.
	if (username === "") $("accountBox_username").innerHTML = "Anonymous <a href='#' onclick='setUsername();return false;' class='nobtn'>Set username</a>"

	// If the user has a username, display it
	else $("accountBox_username").textContent = username;

	$("accountBox_primeCount").textContent = primeCount.toString(10);

	// If the user's balance is 0, hide the Withdraw button. Otherwise, display it.
	// We should always display it.
	//$("accountBox_withdrawButton").style.display = (new BN(weiBalance)).cmpn(0) === 0 ? "none" : "inline-block";

	// Display and round the user's ether balance to 8 decimals
	$("accountBox_etherBalance").textContent = (new BigNumber(web3.utils.fromWei(weiBalance))).toFixed(8) + " ETH";
}

let lastAddressThat_userAccountChanged_wasCalledFor = undefined;
async function userAccountChanged()
{
	// Prevent userAccountChanged() from running if the user account did not change at all.
	if (lastAddressThat_userAccountChanged_wasCalledFor === userAccount) return;
	lastAddressThat_userAccountChanged_wasCalledFor = userAccount;

	console.log("User account changed! It's now "+userAccount);

	// Re-render the top-left user account box
	if (userAccount === null)
	{
		$("accountBox").innerHTML = "No Ethereum account found.<br/><a href='#' onclick='btnConnectClicked();return false;'>Connect</a>";
	}
	else
	{
		$("accountBox").innerHTML = "";

		// Add account picture
		const pic = blockies({seed: userAccount.toLowerCase(), size: 8, scale: 7});
		{
			pic.addEventListener("click", function(){
				searchFor(userAccount);
			});
		}
		$("accountBox").appendChild(pic);


		// Add account address
		const addrDiv = document.createElement("div");
		{
			addrDiv.innerHTML = userAccount;
		}
		$("accountBox").appendChild(addrDiv);


		// Add username
		const usernameDiv = document.createElement("div");
		{
			usernameDiv.setAttribute("id", "accountBox_username");
		}
		$("accountBox").appendChild(usernameDiv);

		// Add the "Username:" label
		const usernameTextDiv = document.createElement("div");
		{
			usernameTextDiv.setAttribute("id", "accountBox_textUsername");
			usernameTextDiv.textContent = "Username:";
		}
		$("accountBox").appendChild(usernameTextDiv);


		// Add ether balance
		const etherBalanceDiv = document.createElement("div");
		{
			etherBalanceDiv.setAttribute("id", "accountBox_etherBalance");
		}
		$("accountBox").appendChild(etherBalanceDiv);

		// Add the "Balance:" label
		const etherBalanceTextDiv = document.createElement("div");
		{
			etherBalanceTextDiv.setAttribute("id", "accountBox_textEthInContract");
			etherBalanceTextDiv.textContent = "Balance:";
		}
		$("accountBox").appendChild(etherBalanceTextDiv);

		// Add withdraw button
		const withdrawButtonA = document.createElement("a");
		{
			withdrawButtonA.classList.add("nobtn");
			withdrawButtonA.setAttribute("id", "accountBox_withdrawButton");
			withdrawButtonA.addEventListener("click", function(e){
				(async function(){
					const etherBalance = await callContract("addressToEtherBalance", userAccount);
					let amount = prompt("How much Ether do you want to withdraw?", web3.utils.fromWei(etherBalance));
					if (!amount) return;
					amount = amount.trim();
					if (!amount) return;
					callContract("withdrawEther", web3.utils.toWei(amount));
				})();
				return false;
			});
			withdrawButtonA.textContent = "Withdraw";
			//withdrawButtonA.style.display = "none";
		}
		$("accountBox").appendChild(withdrawButtonA);

		// Add deposit button
		const depositButtonA = document.createElement("a");
		{
			depositButtonA.classList.add("nobtn");
			depositButtonA.setAttribute("id", "accountBox_depositButton");
			depositButtonA.addEventListener("click", function(e){
				let amount = prompt("How much Ether do you want to deposit?", "");
				if (amount === "" || amount === false || amount === null || amount === undefined) return;
				amount = amount.trim();
				if (amount === "") return;
				callContract("depositEther", {"value": web3.utils.toWei(amount)});
			});
			depositButtonA.textContent = "Deposit";
		}
		$("accountBox").appendChild(depositButtonA);

		// Add prime count
		const primeCountDiv = document.createElement("div");
		{
			primeCountDiv.setAttribute("id", "accountBox_primeCount");
		}
		$("accountBox").appendChild(primeCountDiv);

		// Add the "Primes:" label
		const primeTextDiv = document.createElement("div");
		{
			primeTextDiv.setAttribute("id", "accountBox_primesText");
			primeTextDiv.textContent = "Primes:";
		}
		$("accountBox").appendChild(primeTextDiv);
	}

	// Trigger UI updates
	updateAccountBoxData();
	updateUI();
}

// This function runs when the user clicks the "Set username" link in the top-left account box
async function setUsername()
{
	if (userAccount === null) return;
	let presetText = "";
	while (true)
	{
		const username = prompt("Choose a username for your address "+userAccount+"\r\nMaximum size: 32 bytes\r\nMinimum length: 1 character", presetText);
		presetText = username;

		if (username === "" || username === null || username === false || username === undefined) return;

		// Convert the string to a bytes32
		let bytes32 = string_to_bytes32(username);

		// Verify output of string_to_bytes32
		if (bytes32 === null) { alert("Sorry, but the maximum size of a username is 32 bytes."); continue; }
		if (bytes32.length !== 66) { alert("Sorry, an error occurred."); return; }

		// Check if the username is already taken
		const addr = await callContract("EtherPrimeChat::usernameToAddress", bytes32);
		if (!web3.utils.isAddress(addr)) { alert("Sorry, an error occurred."); return; }
		if (addr !== "0x0000000000000000000000000000000000000000") { alert("Unfortunately the username '"+username+"' is already taken by "+addr); continue; }

		callContract("EtherPrimeChat::setUsername", bytes32);
		return;
	}
}
