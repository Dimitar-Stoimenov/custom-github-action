import { getInput, setFailed } from '@actions/core';
import * as fs from 'fs';

async function run() {
	// let deltaInput = Number(getInput("delta"));
	// deltaInput = isNaN(deltaInput) || deltaInput === undefined ? 0 : -deltaInput;

    const basePath = './coverage-diff/base-summary.json';
    const prPath = './coverage-diff/pr-summary.json';

    try {
		const baseResultJSON = fs.readFileSync(basePath, 'utf8');
		const prResultJSON = fs.readFileSync(prPath, 'utf8');

		const baseResultObject = JSON.parse(baseResultJSON);
		const prResultObject = JSON.parse(prResultJSON);

		console.log('base total:')
		const keys = Object.keys(baseResultObject);

		console.log(keys[15])
		console.log(keys[125])
		console.log(keys[235])
		console.log(keys[245])
		// console.log("================================ Server summary ================================")
		// console.log(`Statements   : ${serverStatementsDiff > 0 ? "+" + serverStatementsDiff.toFixed(2) : serverStatementsDiff.toFixed(2)}%`)
		// console.log(`Branches     : ${serverBranchesDiff > 0 ? "+" + serverBranchesDiff.toFixed(2) : serverBranchesDiff.toFixed(2)}%`)
		// console.log(`Functions    : ${serverFunctionsDiff > 0 ? "+" + serverFunctionsDiff.toFixed(2) : serverFunctionsDiff.toFixed(2)}%`)
		// console.log(`Lines        : ${serverLinesDiff > 0 ? "+" + serverLinesDiff.toFixed(2) : serverLinesDiff.toFixed(2)}%`)
		// console.log("================================================================================");
		// console.log(" ")
		// console.log("================================ Client summary ================================")
		// console.log(`Statements   : ${clientStatementsDiff > 0 ? "+" + clientStatementsDiff.toFixed(2) : clientStatementsDiff.toFixed(2)}%`)
		// console.log(`Branches     : ${clientBranchesDiff > 0 ? "+" + clientBranchesDiff.toFixed(2) : clientBranchesDiff.toFixed(2)}%`)
		// console.log(`Functions    : ${clientFunctionsDiff > 0 ? "+" + clientFunctionsDiff.toFixed(2) : clientFunctionsDiff.toFixed(2)}%`)
		// console.log(`Lines        : ${clientLinesDiff > 0 ? "+" + clientLinesDiff.toFixed(2) : clientLinesDiff.toFixed(2)}%`)
		// console.log("================================================================================");
    } catch (error) {
        setFailed((error as Error)?.message ?? 'Unknown error');
    }
}

run();
