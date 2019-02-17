async function updateMarketPage()
{
	if (!userAccount)
	{
		$("marketError").style.display = "block";
	}
	else
	{
		$("marketError").style.display = "none";
		
		// (uint256[] memory _primes, uint256[] memory _buyOrderIndices, address[] memory _buyers, uint256[] memory _bids, bool[] memory _buyersHaveEnoughFunds)

		const [
			buyOrdersOnUsersPrimes,
			primeCount
		] = await Promise.all([
			callContract("findBuyOrdersOnUsersPrimes", userAccount),
			callContract("addressPrimeCount"),
		]);


		


		let primes = [];
		for (let i=0; i<parseInt(primeCount); i++)
		{
			primes.push(callContract("ownerToPrimes", userAccount, i));
		}
		primes = await Promise.all(primes);

		let primeSellOrderPrices = [];
		for (let i=0; i<primes.length; i++)
		{
			primeSellOrderPrices.push(callContract("primeToSellOrderPrice", primes[i]));
		}
		primeSellOrderPrices = await Promise.all(primeSellOrderPrices);


	}
}
