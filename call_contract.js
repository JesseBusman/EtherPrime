"use strict";

const nonPersistingCache = {};

function equals(val1, val2)
{
	// Convert BN library arguments to BigNumber arguments
	if (val1.constructor === BN) val1 = new BigNumber(val1.toString());
	if (val2.constructor === BN) val2 = new BigNumber(val2.toString());
	
	if (val1 === val2) return true;
	else if (typeof val1 === "string" && typeof val2 === "number") return val2.toString() === val1;
	else if (typeof val1 === "number" && typeof val2 === "string") return val1.toString() === val2;
	else if (typeof val1 === "string" && typeof val2 === "string") { return val1 === val2; }
	else if (typeof val1 === "boolean" && typeof val2 === "boolean") return val1 === val2;
	else if (typeof val1 === "number" && typeof val2 === "number") return val1 === val2;
	else if (val1.constructor === BigNumber && (val2.constructor === BigNumber || typeof val2 === "number")) return val1.equals(val2);
	else if (val2.constructor === BigNumber && (val1.constructor === BigNumber || typeof val1 === "number")) return val2.equals(val1);
	else
	{
		console.log("equals on: "+(typeof val1)+","+(typeof val2));
		console.log(val1);
		console.log(val2);
		throw "equals was called on an invalid argument type combination.";
	}
}

/**
 * @return {[number, boolean]} [cacheTimeout, persistAcrossPageReloads]
 * @param {*} returnValue 
 * @param {*} cacheSettings 
 */
function returnValue_and_cacheSettings_to_cacheTimeoutAndPersistance(returnValue, cacheSettings)
{
	if (cacheSettings.constructor !== Array) throw "cache settings is not an array: "+JSON.stringify(cacheSettings);

	// Loop over all cache settings.
	// cacheSettings is this part of the FUNCTION_TO_CACHE_SETTINGS constant defined in constants.js:
	// "definitePrimes": [
	//                      {"returnValueNotIn": [0], "cacheTimeout": Infinity, "persistAcrossPageReloads": true},
	//                      {"returnValueIn": [0], "cacheTimeout": 30, "persistAcrossPageReloads": false}
	//                   ],
	//                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

	// Search for the first cache setting that matches the value, and return its cacheTimeout and persistAcrossPageReloads properties.
	for (let i=0; i<cacheSettings.length; i++)
	{
		const cacheConditions = cacheSettings[i];

		if (!cacheConditions.hasOwnProperty("cacheTimeout")) throw "cacheTimeout property is missing in cacheSettings: "+JSON.stringify(cacheSettings);

		let allConditionsFullfilled = true;

		// If the cache setting has a returnValueIn property...
		if (cacheConditions.hasOwnProperty("returnValueIn"))
		{
			const returnValueIn = cacheConditions.returnValueIn;

			// If the returnValueIn property is an array, the returnValue must be inside it.
			if (returnValueIn.constructor === Array)
			{
				let found = false;

				for (let j=0; j<returnValueIn.length; j++)
					if (equals(returnValueIn[j], returnValue)) { found = true; break; }
				
				// If the returnValue is not in the returnValueIn array, continue the main loop. This cache setting does not match.
				if (!found) continue;
			}

			// If the returnValueIn property is an object, the returnValue is an Array.
			// The returnValueIn property might look like: {0: [1, 2, 3, 4], 1: [5, 10, 15]}
			// The returnValue [4, 5] would match, but [4, 6] would not match.
			else if (typeof returnValueIn === "object")
			{
				if (returnValue.constructor !== Array) throw "returnValueIn is object, but return value is not an array! value="+returnValue;

				// Loop over the returnValue array's elements.
				for (let j=0; j<returnValue.length; j++)
				if (returnValueIn.hasOwnProperty(j))
				{
					// Search for the returnValue element (e.g. 6) in the returnValueIn array (e.g. [5, 10, 15])
					let found = false;
					for (let k=0; k<returnValueIn[j].length; k++)
						if (equals(returnValueIn[j][k], returnValue[j])) { found = true; break; }

					
					// If we did not find the returnValue element (e.g. 6), continue the main loop. This cache setting does not match.
					if (!found) { allConditionsFullfilled = false; break; }
				}
			}
			else throw "wtf";
		}

		// If not all conditions were fulfilled so far, continue the main loop. This cache setting does not match.
		if (!allConditionsFullfilled) continue;

		// If the cache setting has a returnValueNotIn property...
		if (cacheConditions.hasOwnProperty("returnValueNotIn"))
		{
			// Similar to the returnValueIn matching above, except the result is opposite.
			// If the returnValue is in the array, it's NOT a match.
			const returnValueNotIn = cacheConditions.returnValueNotIn;

			if (returnValueNotIn.constructor === Array)
			{
				let found = false;
				for (let j=0; j<returnValueNotIn.length; j++)
					if (equals(returnValueNotIn[j], returnValue)) { found = true; break; }

				// We found the element in the array, continue the main loop. This cache setting does not match.
				if (found) { continue; }
			}
			else if (typeof returnValueNotIn === "object")
			{
				if (returnValue.constructor !== Array) throw "returnValueNotIn is object, but return value is not an array! returnValue="+returnValue;

				for (let j=0; j<returnValue.length; j++)
				if (returnValueNotIn.hasOwnProperty(j))
				{
					let found = false;
					for (let k=0; k<returnValueNotIn[j].length; k++)
						if (equals(returnValueNotIn[j][k], returnValue[j])){ found = true; break; }

					// We found the element in the array, continue the main loop. This cache setting does not match.
					if (found) { allConditionsFullfilled = false; break; }
				}
			}
			else throw "wtf";
		}

		// If all conditions are fulfilled, return this cache setting's parameters.
		if (allConditionsFullfilled)
		{
			return [cacheConditions.cacheTimeout, cacheConditions.persistAcrossPageReloads];
		}
	}

	throw "WTF! No matching cache conditions were found for value="+returnValue+" cacheSettings="+JSON.stringify(cacheSettings);
}

/**
 * @return {boolean} True if the given function is view or pure. False if the give function is mutable or payable.
 * @param {string} funcName 
 * @param {boolean} isChatContractFunction 
 */
function isFunctionViewOrPure(funcName, isChatContractFunction)
{
	const ABI = isChatContractFunction ? ETHER_PRIME_CHAT_ABI : ETHER_PRIME_ABI;
	for (let i=0; i<ABI.length; i++)
	{
		const func = ABI[i];
		if (func.name === funcName)
		{
			if (func.payable !== false) return false;
			if (func.stateMutability === "nonpayable") return false;
			if (func.stateMutability === "pure") return true;
			if (func.stateMutability === "view") return true;
			throw "wtf stateMutability="+func.stateMutability;
		}
	}
}

/**
 * @return {[string, {name: string, type: string, indexed: boolean}[]]} [functionName, parameterTypes]
 * @param {string} funcSig 
 * @param {boolean} isChatContractFunction 
 */
function functionSignature_to_functionName_and_parameterTypes(funcSig, isChatContractFunction)
{
	const ABI = isChatContractFunction ? ETHER_PRIME_CHAT_ABI : ETHER_PRIME_ABI;

	// Sanitize funcSig argument
	if (typeof funcSig !== "string") { throw "functionSignature_to_functionName_and_parameterTypes received non-string funcSig: "+funcSig; }
	if (funcSig.startsWith("0x") || funcSig.startsWith("0X")) funcSig = funcSig.substring(2);
	if (!/^[a-fA-F0-9]{8}$/.test(funcSig)) { throw "functionSignature_to_functionName_and_parameterTypes funcSig argument must be 8 hex chars: "+funcSig; }

	for (let i=0; i<ABI.length; i++)
	{
		const currentFunc = ABI[i];

		if (!currentFunc.name) { console.error("ABI func has no name ", currentFunc); continue; }

		let currentFuncSig = web3.eth.abi.encodeFunctionSignature(currentFunc);

		if (currentFuncSig.startsWith("0x") || currentFuncSig.startsWith("0X")) currentFuncSig = currentFuncSig.substring(2);
		if (!/^[a-fA-F0-9]{8}$/.test(currentFuncSig)) { throw "web3.eth.abi.encodeFunctionSignature return value was not 8 hex chars: "+currentFuncSig; }

		if (currentFuncSig.toLowerCase() === funcSig.toLowerCase())
		{
			return [currentFunc.name, currentFunc.inputs];
		}
	}

	throw "functionSignature_to_functionName_and_parameterTypes could not find function with signature "+funcSig+" isChatContractFunction="+isChatContractFunction;
}

/**
 * @return {{name: string, type: string, indexed: boolean}[]}
 * @param {string} funcName 
 * @param {boolean} isChatContractFunction 
 */
function functionName_to_parameterNamesAndTypes(funcName, isChatContractFunction)
{
	if (isChatContractFunction === null || isChatContractFunction === undefined)
	{
		try       { return functionName_to_parameterNamesAndTypes(funcName, true ); }
		catch (e) { return functionName_to_parameterNamesAndTypes(funcName, false); }
	}
	
	const ABI = isChatContractFunction ? ETHER_PRIME_CHAT_ABI : ETHER_PRIME_ABI;
	
	for (let i=0; i<ABI.length; i++)
		if (ABI[i].type === "function" && ABI[i].name === funcName)
			return ABI[i].inputs;
	
	throw "functionName_to_parameterNamesAndTypes could not find function '"+funcName+"' isChatContractFunction="+isChatContractFunction;
}


/**
 * @return {{name: string, type: string, indexed: boolean}[]}
 * @param {string} funcName 
 * @param {boolean} isChatContractFunction 
 */
function functionName_to_returnNamesAndTypes(funcName, isChatContractFunction)
{
	if (isChatContractFunction === null || isChatContractFunction === undefined)
	{
		try       { return functionName_to_returnNamesAndTypes(funcName, true ); }
		catch (e) { return functionName_to_returnNamesAndTypes(funcName, false); }
	}
	
	const ABI = isChatContractFunction ? ETHER_PRIME_CHAT_ABI : ETHER_PRIME_ABI;
	
	for (let i=0; i<ABI.length; i++)
		if (ABI[i].type === "function" && ABI[i].name === funcName)
			return ABI[i].outputs;
	
	throw "functionName_to_parameterNamesAndTypes could not find function '"+funcName+"' isChatContractFunction="+isChatContractFunction;
}

/**
 * @return {string}
 * @param {*} value 
 */
function cacheEncode(value)
{
	if (value === null || value == undefined) throw "cacheEncode called on "+value;

	if (value.constructor === BigNumber || value.constructor === BN) { return "BN$"+value.toString(10); }
	else if (typeof value === "number" && Number.isInteger(value)) { return "BN$"+value.toString(10); }
	else if (value.constructor === Array) { return "ARR$" + JSON.stringify(value.map((a) => cacheEncode(a))); }
	else if (typeof value === "string") { return "STR$"+value; }
	else if (typeof value === "boolean") { return "BOOL$"+value.toString().toLowerCase(); }
	else
	{
		console.error(value.constructor);
		throw "Unknown cache value type="+value+"="+JSON.stringify(value)+"="+(typeof value);
	}
}

/**
 * @return {.}
 * @param {string} value 
 */
function cacheDecode(value)
{
	if (value.startsWith("BN$")) { return new BN(value.substring(3)); }
	else if (value.startsWith("STR$")) { return value.substring(4);}
	else if (value.startsWith("BOOL$"))
	{
		const boolVal = value.substring(5);
		if (boolVal === "true") return true;
		if (boolVal === "false") return false;
		throw "wtf";
	}
	else if (value.startsWith("ARR$")) return JSON.parse(value.substring(4)).map((a) => cacheDecode(a));
	else throw "Could not decode cache-encoded value: "+value;
}

/**
 * @return {string} Cache key used to write & read localStorage
 * @param {string} funcName 
 * @param  {...any} args 
 */
function functionNameAndArgs_to_cacheKey(funcName, ...args)
{
	if (!FUNCTION_TO_CACHE_SETTINGS.hasOwnProperty(funcName)) throw "functionNameAndArgs_to_cacheKey called on unknown function '"+funcName+"'";

	const paramNamesAndTypes = functionName_to_parameterNamesAndTypes(funcName, null);

	for (let i=0; i<paramNamesAndTypes.length; i++)
	{
		const arg = args[i];
		const {"name": paramName, "type": paramType} = paramNamesAndTypes[i];

		// Check whether arg is member of param type
		if (paramType === "uint256")
		{
			if (arg.constructor !== BN && arg.constructor !== BigNumber && typeof arg !== "number")
			{
				console.error(arg);
				throw "Parameter "+paramName+" of "+funcName+" requires a "+paramType+" but got: "+JSON.stringify(arg);
			}
		}
		else if (paramType === "string")
		{
			if (typeof arg !== "string")
			{
				console.error(arg);
				throw "Parameter "+paramName+" of "+funcName+" requires a "+paramType+" but got: "+JSON.stringify(arg);
			}
		}
		else if (paramType === "bytes32")
		{
			if (typeof arg !== "string" || !arg.startsWith("0x"))
			{
				console.error(arg);
				throw "Parameter "+paramName+" of "+funcName+" requires a "+paramType+" but got: "+JSON.stringify(arg);
			}
		}
		else if (paramType === "address")
		{
			if (typeof arg !== "string" || !arg.startsWith("0x") || !web3.utils.isAddress(arg))
			{
				console.error(arg);
				throw "Parameter "+paramName+" of "+funcName+" requires a "+paramType+" but got: "+JSON.stringify(arg);
			}
		}
		else throw "Unknown paramType "+paramType;
	}

	let cacheKey = funcName+"___";
	for (let i=0; i<args.length; i++)
	{
		if (args[i] === null) throw "functionNameAndArgs_to_cacheKey on func "+funcName+" with arg "+i+" equal to null";
		if (args[i].constructor === Promise) throw "functionNameAndArgs_to_cacheKey on func "+funcName+" with arg "+i+" being a Promise";
		cacheKey += cacheEncode(args[i]) + "___";
	}

	return cacheKey;
}

/**
 * 
 * @param {string} funcName 
 * @param  {...any} args 
 */
function invalidateContractCallCache(funcName, ...args)
{
	if (!FUNCTION_TO_CACHE_SETTINGS.hasOwnProperty(funcName)) throw "invalidateContractCallCache called on unknown function '"+funcName+"'";

	const cacheKey = functionNameAndArgs_to_cacheKey(funcName, ...args);

	if (localStorage.getItem(cacheKey) || nonPersistingCache.hasOwnProperty(cacheKey))
	{
		console.log("Cached value of key "+cacheKey+" has been invalidated!");
		localStorage.removeItem(cacheKey);
		delete nonPersistingCache[cacheKey];

		console.log("Cache invalidated: "+cacheKey);
	}
}

function callContract(funcName)
{
	let isCallToChatContract;
	if (funcName.toLowerCase().startsWith("etherprimechat::"))
	{
		isCallToChatContract = true;
		funcName = funcName.substring("etherPrimeChat::".length);
	}
	else
	{
		isCallToChatContract = false;
	}

	const args = [];
	for (let i=1; i<arguments.length; i++)
	{
		args.push(arguments[i]);
	}


	let cacheKey = null;

	const isViewOrPure = isFunctionViewOrPure(funcName, isCallToChatContract);

	let transactionValue = new BN(0);
	let transactionObject = null;
	if (!isViewOrPure && args.length >= 1)
	{
		const lastArg = args[args.length-1];
		if (typeof lastArg === "object" && (lastArg.hasOwnProperty("gas") || lastArg.hasOwnProperty("gasLimit") || lastArg.hasOwnProperty("value") || lastArg.hasOwnProperty("from")))
		{
			transactionObject = args.pop();
			if (lastArg.hasOwnProperty("value")) transactionValue = transactionObject["value"] = lastArg["value"];
		}
	}


	for (let i=0; i<args.length; i++)
	{
		if (args[i] === null || args[i] === undefined || (isNaN(args[i]) && typeof args[i] === "number"))
		{
			console.error("Invalid argument "+args[i]+" passed to "+funcName);
			console.error(args);
			console.error(args[i]);
			throw "Invalid arg "+args[i];
		}
	}

	// If the called contract function is view or pure, try to load it from cache.
	if (isViewOrPure)
	{
		if (!FUNCTION_TO_CACHE_SETTINGS.hasOwnProperty(funcName)) throw "Contract function "+funcName+" has no specified cacheability conditions";

		cacheKey = functionNameAndArgs_to_cacheKey(funcName, ...args);
		
		const cacheSettings = FUNCTION_TO_CACHE_SETTINGS[funcName];

		const cached = localStorage.getItem(cacheKey) || nonPersistingCache[cacheKey];
		if (cached !== null && cached !== undefined)
		{
			let [cachedTimestamp, value] = cached.split("___", 2);
			cachedTimestamp = parseInt(cachedTimestamp);
			value = cacheDecode(value);

			const [cacheTimeout, cachePersistance] = returnValue_and_cacheSettings_to_cacheTimeoutAndPersistance(value, cacheSettings);
			
			if (typeof cacheTimeout !== "number")
			{
				throw "Unacceptable cacheTimeout for "+funcName+": "+cacheTimeout;
			}
			else if (cacheTimeout === Infinity)
			{
				return value;
			}
			else if (cacheTimeout === 0)
			{
				// Cache settings were reconfigured, this item is no longer cacheable
				localStorage.removeItem(cacheKey);
				delete nonPersistingCache[cacheKey];
			}
			else if (cachedTimestamp + cacheTimeout > Math.floor(Date.now() / 1000))
			{
				// Cached value has not expired yet
				return value;
			}
			else
			{
				// Cached value has expired
				localStorage.removeItem(cacheKey);
				delete nonPersistingCache[cacheKey];
			}
		}
	}
	
	return new Promise((function(theFuncName, theArgs, theCacheKey, theIsViewOrPure, theTransactionValue, theTransactionObject, theIsCallToChatContract){return async (resolve, reject) => {

		// If the function is mutable/payable, we should make sure the user is connected.
		if (!theIsViewOrPure)
		{
			if (!await needUserAccount())
			{
				alert("An error occurred.\r\nPlease make sure Metamask (or whatever client you're using) is unlocked and connected.");
				return;
			}
		}

		// Turn BigNumber library arguments into BN library arguments.
		for (let i=0; i<theArgs.length; i++)
		{
			if (theArgs[i].constructor === BigNumber)
			{
				console.log("Turning BigNumber arg into BN arg..");
				theArgs[i] = new BN(theArgs[i].toString());
			}
		}

		const callback = function(err, result){
			// If the function call failed, reject the promise and write error to console
			if (err != null)
			{
				if (err.toString().includes("User denied transaction")) console.error("User cancelled a call to function "+theFuncName);
				else console.error("Error in call to "+theFuncName+":", err);
				reject(err);
				return;
			}

			const returnNamesAndTypes = functionName_to_returnNamesAndTypes(theFuncName, theIsCallToChatContract);

			// If the result should be a uint or int, but we received a string from web3, convert it.
			if (typeof result === "string" && returnNamesAndTypes.length === 1 && (returnNamesAndTypes[0].type.startsWith("uint") || returnNamesAndTypes[0].type.startsWith("int")))
			{
				if (/^([0-9]+)$/.test(result)) result = new BN(result, 10);
				else throw "Web3 gave us a string '"+result+"' as return value of function "+theFuncName+", but it should have been a "+returnNamesAndTypes[0].type;
			}
			else if (result.constructor === Array && returnNamesAndTypes.length >= 2)
			{
				for (let i=0; i<returnNamesAndTypes.length; i++)
				{
					if (typeof result[i] === "string" && (returnNamesAndTypes[i].type.startsWith("uint") || returnNamesAndTypes[i].type.startsWith("int"))) result[i] = new BN(result[i], 10);
					else throw "Web3 gave us '"+result[i]+"' as return value #"+i+" ("+returnNamesAndTypes[i].name+") of function "+theFuncName+", but it should have been a "+returnNamesAndTypes[i].type;
				}
			}
			
			// TODO figure out what this is for
			else if (typeof result === "object" && result.constructor !== BN && result.constructor !== BigNumber && result.hasOwnProperty(0))
			{
				const arr = [];
				for (let i=0; result.hasOwnProperty(i); i++)
				{
					let val = result[i];
					if (typeof val === "string" && !val.startsWith("0x"))
					{
						try
						{
							val = new BN(val);
						}
						catch (e)
						{
						}
					}
					arr.push(val);
				}
				result = arr;
			}

			// If we should cache the return value, do it.
			if (theCacheKey !== null)
			{
				const cacheSettings = FUNCTION_TO_CACHE_SETTINGS[theFuncName];
				const [cacheTimeout, cachePersistance] = returnValue_and_cacheSettings_to_cacheTimeoutAndPersistance(result, cacheSettings);
				const cachedTimestamp = Math.floor(Date.now() / 1000);

				if (cacheTimeout > 0)
				{
					if (cachePersistance === true)
					{
						localStorage.setItem(theCacheKey, cachedTimestamp+"___"+cacheEncode(result));
					}
					else if (cachePersistance === false)
					{
						nonPersistingCache[theCacheKey] = cachedTimestamp+"___"+cacheEncode(result);
					}
					else throw "Cache setting persistAcrossPageReloads is not present for func "+theFuncName+" cacheSettings="+JSON.stringify(cacheSettings);
				}
			}

			// If this contract call was mutable (i.e. an actual Ethereum transaction),
			// add it to the transaction tab.
			if (!theIsViewOrPure)
			{
				addUnconfirmedTransactionToTransactionPage(result, theFuncName, theTransactionValue, theTransactionObject.gas, theTransactionObject.gasPrice, theArgs, theIsCallToChatContract);
			}
			
			// Resolve the promise with the actual result.
			resolve(result);
		};

		// Get the callable function from the contract object
		const func = theIsCallToChatContract ? etherPrimeChat.methods[theFuncName] : etherPrime.methods[theFuncName];
		if (!func) throw "Contract function "+theFuncName+" does not exist!";

		// Initiate the contract function call
		if (theIsViewOrPure)
		{
			if (theTransactionObject !== null) func(...theArgs).call(theTransactionObject, callback);
			else func(...theArgs).call(callback);
		}
		else
		{
			// Make sure there's a transaction object with the "from" field set to the user's Ethereum address
			if (theTransactionObject === null)
			{
				theTransactionObject = {"from": userAccount};
			}
			else if (!theTransactionObject.hasOwnProperty("from"))
			{
				if (userAccount === null) throw "wtf";
				theTransactionObject["from"] = userAccount;
			}
			
			func(...theArgs).send(theTransactionObject, callback);
		}
	};})(funcName, args, cacheKey, isViewOrPure, transactionValue, transactionObject, isCallToChatContract));
}
