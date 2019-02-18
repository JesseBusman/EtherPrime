"use strict";

window.LOW_LEVEL_GAS = 200000;

const SUBTITLES =
[
	"Prime numbers done right: decentralized and collectible",
	"Prime numbers done right: tokenized and non-fungible",
	"Prime numbers done right: ownable and transferable",
	"Prime numbers done right: tradeable and marketable",
	"Prime numbers done right: edible and delicious",
	"Prime numbers done right: secured by proof-of-work",

	"It's like an ICO, except for mathematicians and prime numbers. An IPO of sorts.",
	"It's like CryptoKitties! Except they're not cute; they're numbers. Grow up.",
	"The first decentralized and trustless prime number database!",
	"Bid on your favourite prime number!",
	"Adopt a prime number today!",
];

// Note to self: When changing contract address, remember to whitelist it on infura.
const ETHER_PRIME_ADDRESS =
	(window.location.toString().indexOf("etherprimedev") === -1)
	? "" // Mainnet contract address
	: "0x72e6db9fdc91befb017a00aa96644d0271e65ac7"; // Ropsten testnet contract address

const ETHER_PRIME_CHAT_ADDRESS = 
	(window.location.toString().indexOf("etherprimedev") === -1)
	? "" // Mainnet contract address
	: "0x9f3a0c391e3429bccb1ac9caf0385212cf4935f0"; // Ropsten testnet contract address


const FUNCTION_TO_CACHE_SETTINGS = {
	// Never invalidated
	"symbol": [{"cacheTimeout": Infinity, "persistAcrossPageReloads": true}],
	"name": [{"cacheTimeout": Infinity, "persistAcrossPageReloads": true}],

	// Invalidated by DefinitePrimeDiscovered
  "definitePrimes": [
		{"returnValueNotIn": [0], "cacheTimeout": Infinity, "persistAcrossPageReloads": true},
		{"returnValueIn": [0], "cacheTimeout": 30, "persistAcrossPageReloads": false}
	],

	// Invalidated by ProbablePrimeDiscovered, ProbablePrimeDisproven
    "probablePrimes": [
		{"returnValueNotIn": [0], "cacheTimeout": 120, "persistAcrossPageReloads": false},
		{"returnValueIn": [0], "cacheTimeout": 30, "persistAcrossPageReloads": false}
	],

	// Never invalidated
	"isPrime_probabilistic": [{"cacheTimeout": Infinity, "persistAcrossPageReloads": true}],

	// Invalidated by DefinitePrimeDiscovered, ProbablePrimeDiscovered, ProbablePrimeDisproven
	"isPrime": [
		{"returnValueIn": [0, 4], "cacheTimeout": Infinity, "persistAcrossPageReloads": true},	// DEFINITELY_NOT and DEFINITELY can never be invalidated
		{"returnValueIn": [1, 3], "cacheTimeout": 360, "persistAcrossPageReloads": true},		// PROBABLY_NOT and PROBABLY
		{"returnValueIn": [2], "cacheTimeout": 60, "persistAcrossPageReloads": true}			// UNKNOWN
	],

	// Not actively invalidated
  "getPrimeFactors": [
		{"returnValueIn": {0: [true]}, "cacheTimeout": Infinity, "persistAcrossPageReloads": true}, // if getPrimeFactors succeeded, it can never be invalidated.
		{"returnValueIn": {0: [false]}, "cacheTimeout": 0, "persistAcrossPageReloads": false}
	],

	// Not actively invalidated
  "numberToDivisor": [
		{"returnValueIn": [0], "cacheTimeout": 30, "persistAcrossPageReloads": true}, // numberToDivisor failed
		{"returnValueNotIn": [0], "cacheTimeout": Infinity, "persistAcrossPageReloads": true}, // numberToDivisor succeeded
	],

	// Invalidated by events: Transfer
  "getOwner": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],
	"ownerOf": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],
	
	// Invalidated by events: DefinitePrimeDiscovered
	"amountOfDefinitePrimesFound": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],
	"largestDefinitePrimeFound": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],
	
	// Invalidated by events: SellPriceSet
	"primeToSellOrderPrice": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],

	// Invalidated by events: BuyOrderCreated, BuyOrderDestroyed
	"findHighestBidBuyOrder": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],
	"findFreeBuyOrderSlot": [{"cacheTimeout": 0, "persistAcrossPageReloads": false}],
	"countPrimeBuyOrders": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],
	"getPrimeBuyOrder": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],
	"findBuyOrdersOfUserOnPrime": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],

	// Invalidated by events: none
	"tokenOfOwnerByIndex": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],

	// Invalidated by events: DefinitePrimeDiscovered, ProbablePrimeDiscovered, ProbablePrimeDisproven, Transfer
	"addressPrimeCount": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],

	// Invalidated by events: DefinitePrimeDiscovered, ProbablePrimeDiscovered
	"addressToGasSpent": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],
	"addressToEtherSpent": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],

	// Invalidated by events: ProbablePrimeDiscovered
	"addressToProbablePrimesClaimed": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],
	"amountOfProbablePrimesFound": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],

	// Invalidated by events: ProbablePrimeDisproven
	"addressToProbablePrimesDisprovenBy": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],
	"addressToProbablePrimesDisprovenFrom": [{"cacheTimeout": 360, "persistAcrossPageReloads": true}],

	// Invalidated by events: Transfer
	"amountOfParticipants": [{"cacheTimeout": 10, "persistAcrossPageReloads": false}],

	// Invalidated by events: none
	"participants": [
		{"returnValueIn": ["0x0000000000000000000000000000000000000000"], "cacheTimeout": 1, "persistAcrossPageReloads": false},
		{"returnValueNotIn": ["0x0000000000000000000000000000000000000000"], "cacheTimeout": Infinity, "persistAcrossPageReloads": true}
	],

	// Invalidated by events: DefinitePrimeDiscovered
	"numberBeingTested": [{"cacheTimeout": 360, "persistAcrossPageReloads": false}],
	"divisorIndexBeingTested": [{"cacheTimeout": 360, "persistAcrossPageReloads": false}],

	// Invalidated by events: EtherDeposited, EtherWithdrawn, PrimeTraded
	"addressToEtherBalance": [{"cacheTimeout": 360, "persistAcrossPageReloads": false}],

	// Invalidated by events: UsernameSet
	"addressToUsername": [
		{"returnValueIn": ["0x0000000000000000000000000000000000000000000000000000000000000000"], "cacheTimeout": 360, "persistAcrossPageReloads": false},
		{"returnValueNotIn": ["0x0000000000000000000000000000000000000000000000000000000000000000"], "cacheTimeout": Infinity, "persistAcrossPageReloads": true}
	],
	"usernameToAddress": [
		{"returnValueIn": ["0x0000000000000000000000000000000000000000"], "cacheTimeout": 360, "persistAcrossPageReloads": false},
		{"returnValueNotIn": ["0x0000000000000000000000000000000000000000"], "cacheTimeout": Infinity, "persistAcrossPageReloads": true}
	],

	// Invalidated by events: ChatMessageSent
	"amountOfChatMessages": [{"cacheTimeout": 20, "persistAcrossPageReloads": false}],
	"getChatMessage": [
		{"returnValueIn": {0: ["0x0000000000000000000000000000000000000000"]}, "cacheTimeout": 20, "persistAcrossPageReloads": false},
		{"returnValueNotIn": {0: ["0x0000000000000000000000000000000000000000"]}, "cacheTimeout": Infinity, "persistAcrossPageReloads": true},
	],
	"chatMessages": [
		{"returnValueIn": [""], "cacheTimeout": 20, "persistAcrossPageReloads": false},
		{"returnValueNotIn": [""], "cacheTimeout": Infinity, "persistAcrossPageReloads": true},
	],

	// Invalidated by events: ChatMessageSent
	"addressToGasUsedTowardsChatMessage": [{"cacheTimeout": 360, "persistAcrossPageReloads": false}],

	// Never invalidated
	"GAS_PER_CHAT_MESSAGE": [{"cacheTimeout": Infinity, "persistAcrossPageReloads": true}],

	// Invalidated by events: none
	"isBalancedPrime": [
		{"returnValueIn": {0: [0, 4]}, "cacheTimeout": Infinity, "persistAcrossPageReloads": true},
		{"returnValueNotIn": {0: [0, 4]}, "cacheTimeout": 0, "persistAcrossPageReloads": false}
	],
	"isNTupleMersennePrime": [
		{"returnValueIn": {0: [0, 4]}, "cacheTimeout": Infinity, "persistAcrossPageReloads": true},
		{"returnValueNotIn": {0: [0, 4]}, "cacheTimeout": 0, "persistAcrossPageReloads": false}
	],
	"isGoodPrime": [
		{"returnValueIn": [0, 4], "cacheTimeout": Infinity, "persistAcrossPageReloads": true},
		{"returnValueNotIn": [0, 4], "cacheTimeout": 0, "persistAcrossPageReloads": false}
	],
	"isFactorialPrime": [
		{"returnValueIn": {0: [0, 4]}, "cacheTimeout": Infinity, "persistAcrossPageReloads": true},
		{"returnValueNotIn": {0: [0, 4]}, "cacheTimeout": 0, "persistAcrossPageReloads": false}
	],
	"isCullenPrime": [
		{"returnValueIn": {0: [0, 4]}, "cacheTimeout": Infinity, "persistAcrossPageReloads": true},
		{"returnValueNotIn": {0: [0, 4]}, "cacheTimeout": 0, "persistAcrossPageReloads": false}
	],
	"isFermatPrime": [
		{"returnValueIn": {0: [0, 4]}, "cacheTimeout": Infinity, "persistAcrossPageReloads": true},
		{"returnValueNotIn": {0: [0, 4]}, "cacheTimeout": 0, "persistAcrossPageReloads": false}
	],
	"isSuperPrime": [
		{"returnValueIn": {0: [0, 4]}, "cacheTimeout": Infinity, "persistAcrossPageReloads": true},
		{"returnValueNotIn": {0: [0, 4]}, "cacheTimeout": 0, "persistAcrossPageReloads": false}
	],
	"isFibonacciPrime": [
		{"returnValueIn": [0, 4], "cacheTimeout": Infinity, "persistAcrossPageReloads": true},
		{"returnValueNotIn": [0, 4], "cacheTimeout": 0, "persistAcrossPageReloads": false}
	],
};

const ETHER_PRIME_CHAT_ABI = [
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "chatMessageReplyToIndices",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "usernameToAddress",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_username",
				"type": "bytes32"
			}
		],
		"name": "setUsername",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_index",
				"type": "uint256"
			}
		],
		"name": "getChatMessage",
		"outputs": [
			{
				"name": "_sender",
				"type": "address"
			},
			{
				"name": "_message",
				"type": "string"
			},
			{
				"name": "_replyToIndex",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_message",
				"type": "string"
			},
			{
				"name": "_replyToIndex",
				"type": "uint256"
			}
		],
		"name": "sendChatMessage",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "GAS_PER_CHAT_MESSAGE",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "chatMessages",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "chatMessageSenders",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "addressToUsername",
		"outputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "amountOfChatMessages",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "addressToGasUsedTowardsChatMessage",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_etherPrime",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "username",
				"type": "bytes32"
			}
		],
		"name": "UsernameSet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "index",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "replyToIndex",
				"type": "uint256"
			}
		],
		"name": "ChatMessageSent",
		"type": "event"
	}
];

const ETHER_PRIME_ABI = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "claimMersennePrimePower",
		"outputs": [
			{
				"name": "_rootProbablePrime",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "claimProbablePrime",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_start",
				"type": "uint256"
			},
			{
				"name": "_end",
				"type": "uint256"
			}
		],
		"name": "claimProbablePrimeInRange",
		"outputs": [
			{
				"name": "_success",
				"type": "bool"
			},
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "compute",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_recipient",
				"type": "address"
			}
		],
		"name": "computeAndGiveTo",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_primesToMemorize",
				"type": "uint256"
			},
			{
				"name": "_lowLevelGas",
				"type": "uint256"
			},
			{
				"name": "_recipient",
				"type": "address"
			}
		],
		"name": "computeWithParams",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_primesToMemorize",
				"type": "uint256"
			}
		],
		"name": "computeWithPrimesToMemorize",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_primesToMemorize",
				"type": "uint256"
			},
			{
				"name": "_lowLevelGas",
				"type": "uint256"
			}
		],
		"name": "computeWithPrimesToMemorizeAndLowLevelGas",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "depositEther",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			},
			{
				"name": "_bid",
				"type": "uint256"
			},
			{
				"name": "_indexHint",
				"type": "uint256"
			}
		],
		"name": "depositEtherAndCreateBuyOrder",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			},
			{
				"name": "_divisor",
				"type": "uint256"
			}
		],
		"name": "disproveProbablePrime",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			},
			{
				"name": "_index",
				"type": "uint256"
			},
			{
				"name": "_newBid",
				"type": "uint256"
			}
		],
		"name": "modifyBuyOrder",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_from",
				"type": "address"
			},
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_from",
				"type": "address"
			},
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_prime",
				"type": "uint256"
			},
			{
				"name": "_data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_operator",
				"type": "address"
			},
			{
				"name": "_allowed",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			},
			{
				"name": "_price",
				"type": "uint256"
			},
			{
				"name": "_matchStartBuyOrderIndex",
				"type": "uint256"
			},
			{
				"name": "_matchEndBuyOrderIndex",
				"type": "uint256"
			}
		],
		"name": "setSellPrice",
		"outputs": [
			{
				"name": "_sold",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "takeOwnership",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_prime",
				"type": "uint256"
			},
			{
				"name": "_data",
				"type": "bytes"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "ok",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_from",
				"type": "address"
			},
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_primes",
				"type": "uint256[]"
			},
			{
				"name": "_buyOrderIndices",
				"type": "uint256[]"
			}
		],
		"name": "tryCancelBuyOrders",
		"outputs": [
			{
				"name": "_amountCancelled",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_primes",
				"type": "uint256[]"
			},
			{
				"name": "_buyOrderIndices",
				"type": "uint256[]"
			},
			{
				"name": "_amountToWithdraw",
				"type": "uint256"
			}
		],
		"name": "tryCancelBuyOrdersAndWithdrawEther",
		"outputs": [
			{
				"name": "_amountCancelled",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_mersennePrime",
				"type": "uint256"
			}
		],
		"name": "tryClaimMersennePrimePower",
		"outputs": [
			{
				"name": "_success",
				"type": "bool"
			},
			{
				"name": "_rootProbablePrime",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "tryClaimProbablePrime",
		"outputs": [
			{
				"name": "_success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			},
			{
				"name": "_startBuyOrderIndex",
				"type": "uint256"
			},
			{
				"name": "_endBuyOrderIndex",
				"type": "uint256"
			}
		],
		"name": "tryMatchSellAndBuyOrdersRange",
		"outputs": [
			{
				"name": "_sold",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "withdrawEther",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "fallback"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "prime",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "discoverer",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "definitePrimesArrayIndex",
				"type": "uint256"
			}
		],
		"name": "DefinitePrimeDiscovered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "prime",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "discoverer",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "probablePrimesArrayIndex",
				"type": "uint256"
			}
		],
		"name": "ProbablePrimeDiscovered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "prime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "divisor",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "disprover",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "probablePrimesArrayIndex",
				"type": "uint256"
			}
		],
		"name": "ProbablePrimeDisproven",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "prime",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "prime",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "prime",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "buyOrdersArrayIndex",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "bid",
				"type": "uint256"
			}
		],
		"name": "BuyOrderCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "prime",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "buyOrdersArrayIndex",
				"type": "uint256"
			}
		],
		"name": "BuyOrderDestroyed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "prime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "SellPriceSet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "prime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "buyOrdersArrayIndex",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "PrimeTraded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "depositer",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "EtherDeposited",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "withdrawer",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "EtherWithdrawn",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "addressPrimeCount",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "addressToEtherBalance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "addressToEtherSpent",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "addressToGasSpent",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "addressToProbablePrimesClaimed",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "addressToProbablePrimesDisprovenBy",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "addressToProbablePrimesDisprovenFrom",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			},
			{
				"name": "_spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "amountOfDefinitePrimesFound",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "amountOfParticipants",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "amountOfPrimesFound",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "owner",
				"type": "address"
			}
		],
		"name": "amountOfPrimesOwnedByOwner",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "amountOfProbablePrimesFound",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "countPrimeBuyOrders",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "DEFINITELY",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "DEFINITELY_NOT",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "definitePrimes",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "divisorIndexBeingTested",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_user",
				"type": "address"
			},
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "findBuyOrdersOfUserOnPrime",
		"outputs": [
			{
				"name": "_buyOrderIndices",
				"type": "uint256[]"
			},
			{
				"name": "_bids",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_user",
				"type": "address"
			}
		],
		"name": "findBuyOrdersOnUsersPrimes",
		"outputs": [
			{
				"name": "_primes",
				"type": "uint256[]"
			},
			{
				"name": "_buyOrderIndices",
				"type": "uint256[]"
			},
			{
				"name": "_buyers",
				"type": "address[]"
			},
			{
				"name": "_bids",
				"type": "uint256[]"
			},
			{
				"name": "_buyersHaveEnoughFunds",
				"type": "bool[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "findFreeBuyOrderSlot",
		"outputs": [
			{
				"name": "_buyOrderSlotIndex",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "findHighestBidBuyOrder",
		"outputs": [
			{
				"name": "_found",
				"type": "bool"
			},
			{
				"name": "_buyOrderIndex",
				"type": "uint256"
			},
			{
				"name": "_buyer",
				"type": "address"
			},
			{
				"name": "_bid",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getInsecureRandomDefinitePrime",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getInsecureRandomProbablePrime",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "getOwner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			},
			{
				"name": "_index",
				"type": "uint256"
			}
		],
		"name": "getPrimeBuyOrder",
		"outputs": [
			{
				"name": "_buyer",
				"type": "address"
			},
			{
				"name": "_bid",
				"type": "uint256"
			},
			{
				"name": "_buyerHasEnoughFunds",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "getPrimeFactors",
		"outputs": [
			{
				"name": "_success",
				"type": "bool"
			},
			{
				"name": "_primeFactors",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "implementsERC721",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			},
			{
				"name": "_operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "isBalancedPrime",
		"outputs": [
			{
				"name": "result",
				"type": "uint8"
			},
			{
				"name": "lowerPrime",
				"type": "uint256"
			},
			{
				"name": "higherPrime",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "isCullenPrime",
		"outputs": [
			{
				"name": "_result",
				"type": "uint8"
			},
			{
				"name": "_n",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "isFactorialPrime",
		"outputs": [
			{
				"name": "_result",
				"type": "uint8"
			},
			{
				"name": "_n",
				"type": "uint256"
			},
			{
				"name": "_delta",
				"type": "int256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "isFermatPrime",
		"outputs": [
			{
				"name": "result",
				"type": "uint8"
			},
			{
				"name": "_2_pow_n",
				"type": "uint256"
			},
			{
				"name": "_n",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "isFibonacciNumber",
		"outputs": [
			{
				"name": "_result",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "isFibonacciPrime",
		"outputs": [
			{
				"name": "_result",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "isGoodPrime",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			},
			{
				"name": "_n",
				"type": "uint256"
			}
		],
		"name": "isNTupleMersennePrime",
		"outputs": [
			{
				"name": "_result",
				"type": "uint8"
			},
			{
				"name": "_powers",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "isPrime",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "isPrime_probabilistic",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "isSuperPrime",
		"outputs": [
			{
				"name": "_result",
				"type": "uint8"
			},
			{
				"name": "_indexStartAtOne",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "largestDefinitePrimeFound",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "numberBeingTested",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "numberToDivisor",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "bytes"
			}
		],
		"name": "onERC721Received",
		"outputs": [],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_prime",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "participants",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "primeToAllowedAddress",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "primeToSellOrderPrice",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "probablePrimes",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "PROBABLY",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "PROBABLY_NOT",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_interfaceID",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_index",
				"type": "uint256"
			}
		],
		"name": "tokenByIndex",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "bytes"
			}
		],
		"name": "tokenFallback",
		"outputs": [],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			},
			{
				"name": "_index",
				"type": "uint256"
			}
		],
		"name": "tokenOfOwnerByIndex",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "tokensOf",
		"outputs": [
			{
				"name": "",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			},
			{
				"name": "",
				"type": "bytes"
			},
			{
				"name": "",
				"type": "bytes"
			}
		],
		"name": "tokensReceived",
		"outputs": [],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "UNKNOWN",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];
