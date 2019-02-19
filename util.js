function promiseNullIfRejected(promiseThatMightFail)
{
	return new Promise(async (resolve, reject) => {
		try
		{
			const result = await promiseThatMightFail;
			resolve(result);
		}
		catch (e)
		{
			resolve(null);
		}
	});
}

function string_to_bytes32(str)
{
	let bytes32 = web3.utils.fromUtf8(str);
	while (bytes32.length < 66) bytes32 += "00";
	if (bytes32.length > 66) return null;
	else return bytes32;
}

function bytes32_to_string(bytes32)
{
	if (typeof bytes32 !== "string")
	{
		if (bytes32 === 0x0) return "";
		if (bytes32.constructor === BigNumber && bytes32.isZero()) return "";
		if (bytes32.constructor === BN && bytes32.cmpn(0) === 0) return "";
		throw "bytes32_to_string must receive string or 0, but it received:"+bytes32;
	}

	while (bytes32.endsWith("00")) bytes32 = bytes32.substring(0, bytes32.length-2);

	if (bytes32.startsWith("0x")) return web3.utils.toUtf8(bytes32);
	else return "";
}

function escapeHtml(text)
{
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};

	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function fromWei_short(wei)
{
	if (typeof wei === "string") wei = new BN(wei);

	let str = web3.utils.fromWei(wei);
	if (str.length <= 6)
	{
		return str + " ETH";
	}
	else if (wei.cmpn(1000000) === -1)
	{
		return wei+" wei";
	}
	else
	{
		let digitsBeforeDecimalPoint = str.split(".")[0].length;
		if (digitsBeforeDecimalPoint > 6)
		{
			return "<span title='"+str+" ETH'>&gt;9000 ETH</span>";
		}

		let digitsAfterDecimalPoint = str.split(".")[1].length;
		let divisor = (new BigNumber(10)).pow(digitsBeforeDecimalPoint);
		let num = new BigNumber(str);
		num = num.div(divisor);
		num = num.round(6, 2);
		num = num.mul(divisor);
		
		return "<span title='"+str+" ETH'>~"+num.toString()+" ETH</span>";
	}
}

function nTupleMersenneForm(n)
{
	if (!Number.isInteger(n)) throw "wtf";
	if (n === 1) return "2<sup>n</sup> - 1";
	if (n >= 2) return "2<sup>"+nTupleMersenneForm(n-1)+"</sup> - 1";
	throw "wtf";
}

function intToTupleWord(n)
{
	if (n === 0) throw "wtf";
	if (n === 1) return "";
	if (n === 2) return "double";
	if (n === 3) return "triple";
	if (n === 4) return "quadruple";
	if (n === 5) return "quintuple";
	if (n === 6) return "sextuple";
	if (n === 7) return "septuple";
	if (n === 8) return "octuple";
	if (n === 9) return "nonuple";
	if (n === 10) return "decuple";
	return n+"-tuple";
}

function boolyToWords(booly)
{
	if (booly.cmpn(0) === 0) return "not";
	if (booly.cmpn(1) === 0) return "probably not";
	if (booly.cmpn(2) === 0) return "maybe or maybe not";
	if (booly.cmpn(3) === 0) return "probably";
	if (booly.cmpn(4) === 0) return "";
	throw "wtf wrong booly="+booly;
}

function ordinalString(num)
{
	const mod10 = num.mod(new BN(10));
	if (mod10.cmpn(1) === 0) return num.toString() + "st";
	if (mod10.cmpn(2) === 0) return num.toString() + "nd";
	if (mod10.cmpn(3) === 0) return num.toString() + "rd";
	return num.toString() + "th";
}


async function needUserAccount()
{
	// If we know the user's account, we're fine.
	if (userAccount !== null) return true;

	// Otherwise, if this is a modern web3, try to enable.
	else if (window.ethereum)
	{
		try
		{
			await ethereum.enable();
			await updateAccountData();
			
			return userAccount !== null;
		}
		catch (error)
		{
			return false;
		}
	}
	else
	{
		alert("Unfortunately we could not submit a transaction. Please make sure your Ethereum client or web3 interface is unlocked and connected to this DApp.");
		return false;
	}
}

