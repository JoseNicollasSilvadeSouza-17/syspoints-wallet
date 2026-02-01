require("dotenv").config();

const WalletService = require("./WalletService");
const SYMBOL = process.env.SYMBOL;

const readline = require("readline");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

let myAddress = null;

function menu() {
	setTimeout(() => {
		console.clear();

		if(myAddress) {
			console.log(`You are logged as ${myAddress}`);
		} else {
			console.log("You aren't logged!");
		}

		console.log("1 - Create Wallet");
		console.log("2 - Recover Wallet");
		console.log("3 - Balance");
		console.log("4 - Send " + SYMBOL);
		console.log("5 - Search Tx");
		console.log("6 - Exit");

		rl.question("Choose your options: ", (answer) => {
			switch(answer) {
				case "1": {
					createWallet();
					break;
				}

				case "2": {
					recoverWallet();
					break;
				}

				case "3": {
					getBalance();
					break;
				}

				case "4": {
					sendTx();
					break;
				}

				case "5": {
					getTransaction();
					break;
				}

				case "6": {
					rl.close();
					break;
				}

				default: {
					console.log("Wrong option!");
					preMenu();
					break;
				}
			}
		});
	}, 1000);
}

function preMenu () {
	rl.question("Press any key to continue...", () => {
		menu();
	});
}

function createWallet() {
	const myWallet = WalletService.createWallet();
	myAddress = myWallet.address;

	console.log(`Your new wallet: ${myAddress}`);
	preMenu();
}

function recoverWallet() {
	console.clear();

	rl.question("What is your private key or phrase mnemonic? ", (pkOrMnemonic) => {
		const myWallet = WalletService.recoverWallet(pkOrMnemonic);
		myAddress = myWallet.address;

		console.log(`Your recovered wllet: ${myAddress}`);

		preMenu();
	});
}

async function getBalance() {
	console.clear();

	if(!myAddress) {
		console.log("Your don't have a wallet yet!");
		return preMenu();
	}

	const { balanceInEth } = await WalletService.getBalance(myAddress);
	console.log(`${SYMBOL} ${balanceInEth}`);

	preMenu();
}

function sendTx() {
	console.clear();

	if(!myAddress) {
		console.log("You don't have a wallet yet!");
		return preMenu();
	}

	console.log(`Your wallet is ${myAddress}`);

	rl.question("To Wallet: ", (toWallet) => {
		if(!WalletService.addressIsValid(toWallet)) {
			console.log("Invalid wallet!");
			return preMenu();
		}

		rl.question(`Amount (in ${SYMBOL}): `, async (amountInEth) => {
			if(!amountInEth) {
				console.log("Invalid amount!");
				return preMenu();
			}

			const tx = await WalletService.buildTransaction(toWallet, amountInEth);

			if(!tx) {
				console.log("Insufficient balance (amount + fee)!");
				return preMenu();
			}

			try {
				const txReceipt = await WalletService.sendTransaction(tx);

				console.log("Transaction successful!");
				console.log(txReceipt);
			} catch(err) {
				console.error(err);
			}

			return preMenu();
		});
	});

	preMenu();
}

function getTransaction() {
	console.clear();

	rl.question("Your tx Hash: ", async (hash) => {
		const txReceipt = await WalletService.getTransaction(hash);

		console.log(`Your tx receipt: ${txReceipt}`);
	});

	preMenu();
}

menu();
