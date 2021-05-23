import { LCDClient } from '@terra-money/terra.js';

const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainID: 'columbus-4',
});

export const CUSTODY = "terra1ptjp2vfjrwh0j0faj9r6katm640kgjxnwwq9kn";
export const MARKET = "terra1sepfj7s0aeg5967uxnfk4thzlerrsktkpelm5s";
export const ORACLE = "terra1cgg6yef7qcdm070qftghfulaxmllgmvk77nc7t";

let borrower_infos = [];
let borrowers = [];
let price = 8.1;

function fetchBorrowers() {
	let borrowersCount = borrowers.length;
	
	let borrowersQuery = {
		"borrowers": {
		"limit": 100, //limit is actually 30
		}
	}

	if (borrowersCount > 0) {
		let last = borrowers[borrowersCount-1];
		let start_after = last.borrower;
		borrowersQuery['borrowers'].start_after = start_after;
	}

	terra.wasm.contractQuery(CUSTODY, borrowersQuery).then(res => {
		borrowers.push.apply(borrowers, res.borrowers);
		if (res.borrowers.length == 30) {
			fetchBorrowers();
		} else {
		}
		console.log('borrowers', borrowers.length + ' loaded');
	})
}

function fetchBorrowerInfos() {
	let borrowerInfosQuery = {"borrower_infos":{"limit":100}};

	let borrowerInfosCount = borrower_infos.length;
	if (borrowerInfosCount > 0) {
		let last = borrower_infos[borrowerInfosCount-1];
		let start_after = last.borrower;
		borrowerInfosQuery['borrower_infos'].start_after = start_after;
	}

	terra.wasm.contractQuery(MARKET, borrowerInfosQuery).then((res) => {
		borrower_infos.push.apply(borrower_infos, res.borrower_infos);
		//borrower_infos.push.apply(borrower_infos, results);
		if (res.borrower_infos.length == 30) {
			fetchBorrowerInfos();
		} else {
			processData();
		}
		console.log('borrower_infos', borrower_infos.length);
	}).catch(err => {
		console.error(err)
	});
}

fetchBorrowerInfos();
fetchBorrowers();

function processData() {
	let borrowerInfosByBorrower = [];
	borrower_infos.forEach(b => {
		borrowerInfosByBorrower[b.borrower] = b;
	})

	borrowers.forEach(b => {
		let borrowerInfo = borrowerInfosByBorrower[b.borrower];
		if (borrowerInfo) {
			let loanAmount = parseFloat(borrowerInfosByBorrower[b.borrower].loan_amount);
			if (b.balance > 1000000) {
				let ltv = (loanAmount / ((b.balance * price) * 0.5));
				if (ltv >= 0.98) {
					console.log('found', ltv, loanAmount/1000000, b.balance/1000000, b.borrower);
				}
			}
		}
	})

	//console.log('borrowers', borrowerInfosByBorrower)
}
