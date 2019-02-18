"use strict";

let firstUpdate = true;
async function updateComputePage()
{
	const [numberBeingTested, divisorIndexBeingTested, amountOfDefinitePrimesFound] = await Promise.all([callContract("numberBeingTested"), callContract("divisorIndexBeingTested"), callContract("amountOfDefinitePrimesFound")]);

	$("computePage_amountOfDefinitePrimesFound").innerHTML = amountOfDefinitePrimesFound.toString(10);
	$("computePrimesToMemorize").setAttribute("max", amountOfDefinitePrimesFound.toString(10));
	$("numberCurrentlyBeingCheckedForPrimality").innerHTML = numberBeingTested.toString(10);

	const divisorBeingTested = await callContract("definitePrimes", divisorIndexBeingTested);

	$("divisorCurrentlyBeingUsedToCheckForPrimality").innerHTML = divisorBeingTested.toString(10);

	if (firstUpdate)
	{
		$("computePrimesToMemorizeDisplay").textContent = $("computePrimesToMemorize").value = Math.ceil(parseInt(amountOfDefinitePrimesFound.toString(10), 10)/2);
	}

	firstUpdate = false;
}

async function initComputePage()
{
	$("btnCompute").onclick = function(e){

		(async function(){
			if (!await needUserAccount())
			{
				alert("Please connect or unlock your wallet to use this feature.");
				return;
			}

			const gasPrice = new BN(((new BigNumber($("computeGasPrice").value)).mul(new BigNumber(1000*1000*1000))).toString());
			const gasLimit = new BN($("computeGasLimit").value);

			callContract("computeWithPrimesToMemorizeAndLowLevelGas",
				parseInt($("computePrimesToMemorize").value),
				LOW_LEVEL_GAS,
				{
					"gas": gasLimit,
					"gasPrice": gasPrice
				},
			);
		})();
		return false;
	};

	function recalculateComputeEther()
	{
		const gasPrice = new BN((new BigNumber($("computeGasPrice").value).mul(new BigNumber(1000*1000*1000))).toString()); // Convert from Gwei/gas to wei/gas
		const gasLimit = new BN($("computeGasLimit").value);
		const wei = gasLimit.mul(gasPrice);
		$("computeEtherCost").innerHTML = (new BigNumber(web3.utils.fromWei(wei).toString())).toFixed(5, 0);
	}

	function computeGasPriceChanged()
	{
		const gasPrice = new BigNumber($("computeGasPrice").value);
		$("computeGasPriceDisplay").innerHTML = gasPrice.toFixed(1, 0);
		recalculateComputeEther();
	}

	function computeGasLimitChanged()
	{
		$("computeGasLimitDisplay").innerHTML = $("computeGasLimit").value;
		recalculateComputeEther();
	}

	web3.eth.getGasPrice(function(err, result){
		if (currentDisplayedPage !== $("pageCompute"))
		{
			$("computeGasPrice").value = (new BigNumber(result.toString())).dividedBy(new BigNumber(1000*1000*1000)).toString(10);
			computeGasPriceChanged();
		}
	});


	$("computeGasPrice").addEventListener("input", computeGasPriceChanged);
	$("computeGasPrice").addEventListener("change", computeGasPriceChanged);
	$("computeGasLimit").addEventListener("input", computeGasLimitChanged);
	$("computeGasLimit").addEventListener("change", computeGasLimitChanged);
	$("computePrimesToMemorize").addEventListener("input", function(e){
		$("computePrimesToMemorizeDisplay").innerHTML = $("computePrimesToMemorize").value;
	});
	$("computePrimesToMemorize").addEventListener("change", function(e){
		$("computePrimesToMemorizeDisplay").innerHTML = $("computePrimesToMemorize").value;
	});

	computeGasLimitChanged();
	computeGasPriceChanged();
}
