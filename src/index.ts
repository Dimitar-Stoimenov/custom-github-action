import { getInput, setFailed } from '@actions/core';
import { getOctokit, context } from '@actions/github';
import * as fs from 'fs';

async function run() {
    const baseClientPath = './coverage-base/shortClient.txt';
    const baseServerPath = './coverage-base/shortServer.txt';
    const prClientPath = './coverage-PR/shortClient.txt';
    const prServerPath = './coverage-PR/shortServer.txt';

    const getParams = (input: string) => {
        const regex = /^(?<name>[a-zA-Z]+)\s*:\s(?<percentage>[0-9].*)%\s\(\s(?<tested>[0-9]*)\/(?<total>[0-9]*)\s\)/g;

        const match = regex.exec(input);

        if (match?.groups) {
            return {
                name: match.groups.name,
                percentage: +match.groups.percentage,
                tested: +match.groups.tested,
                total: +match.groups.total
            }
        }

        return null;
    }

    type FinalData = {
        [x: string]: number
    }

    try {
        const BCdata = fs.readFileSync(baseClientPath, 'utf8');
        const BCarr = BCdata.split(/\r?\n/);
        const BCFinalData: FinalData = {}; 

        const BSdata = fs.readFileSync(baseServerPath, 'utf8');
        const BSarr = BSdata.split(/\r?\n/);
        const BSFinalData: FinalData = {}; 

        const PCdata = fs.readFileSync(prClientPath, 'utf8');
        const PCarr = PCdata.split(/\r?\n/);
        const PCFinalData: FinalData = {}; 

        const PSdata = fs.readFileSync(prServerPath, 'utf8');
        const PSarr = PSdata.split(/\r?\n/);
        const PSFinalData: FinalData = {}; 

		for (let i = 1; i < BCarr.length; i++) {
			const element = BCarr[i];

			const result = getParams(element);

			if (!result) continue;
			BCFinalData[result.name] = result.percentage;        
		}

		for (let i = 1; i < BSarr.length; i++) {
			const element = BSarr[i];

			const result = getParams(element);

			if (!result) continue;
			BSFinalData[result.name] = result.percentage;        
		}

		for (let i = 1; i < PCarr.length; i++) {
			const element = PCarr[i];

			const result = getParams(element);

			if (!result) continue;
			PCFinalData[result.name] = result.percentage;        
		}

		for (let i = 1; i < PSarr.length; i++) {
			const element = PSarr[i];

			const result = getParams(element);

			if (!result) continue;
			PSFinalData[result.name] = result.percentage;        
		}

		const serverStatementsDiff = PSFinalData.Statements - BSFinalData.Statements;
		const serverBranchesDiff = PSFinalData.Branches - BSFinalData.Branches;
		const serverFunctionsDiff = PSFinalData.Functions - BSFinalData.Functions;
		const serverLinesDiff = PSFinalData.Lines - BSFinalData.Lines;

		const clientStatementsDiff = PCFinalData.Statements - BCFinalData.Statements;
		const clientBranchesDiff = PCFinalData.Branches - BCFinalData.Branches;
		const clientFunctionsDiff = PCFinalData.Functions - BCFinalData.Functions;
		const clientLinesDiff = PCFinalData.Lines - BCFinalData.Lines;

		console.log("================================ Server summary ================================")
		console.log(`Statements   : ${serverStatementsDiff > 0 ? "+" + serverStatementsDiff.toFixed(2) : serverStatementsDiff.toFixed(2)}%`)
		console.log(`Branches     : ${serverBranchesDiff > 0 ? "+" + serverBranchesDiff.toFixed(2) : serverBranchesDiff.toFixed(2)}%`)
		console.log(`Functions    : ${serverFunctionsDiff > 0 ? "+" + serverFunctionsDiff.toFixed(2) : serverFunctionsDiff.toFixed(2)}%`)
		console.log(`Lines        : ${serverLinesDiff > 0 ? "+" + serverLinesDiff.toFixed(2) : serverLinesDiff.toFixed(2)}%`)
		console.log("================================================================================");
		console.log(" ")
		console.log("================================ Client summary ================================")
		console.log(`Statements   : ${clientStatementsDiff > 0 ? "+" + clientStatementsDiff.toFixed(2) : clientStatementsDiff.toFixed(2)}%`)
		console.log(`Branches     : ${clientBranchesDiff > 0 ? "+" + clientBranchesDiff.toFixed(2) : clientBranchesDiff.toFixed(2)}%`)
		console.log(`Functions    : ${clientFunctionsDiff > 0 ? "+" + clientFunctionsDiff.toFixed(2) : clientFunctionsDiff.toFixed(2)}%`)
		console.log(`Lines        : ${clientLinesDiff > 0 ? "+" + clientLinesDiff.toFixed(2) : clientLinesDiff.toFixed(2)}%`)
		console.log("================================================================================");

      	if (
        	serverStatementsDiff < 0
			|| serverBranchesDiff < 0
			|| serverFunctionsDiff < 0
			|| serverLinesDiff < 0
			|| clientStatementsDiff < 0
			|| clientBranchesDiff < 0
			|| clientFunctionsDiff < 0
			|| clientLinesDiff < 0
        ) {
			const error = new Error();
			error.message = "The coverage is worse than before! You need to write some tests!"
			throw error;
		}

		console.log("The coverage is OK.")
    } catch (error) {
        setFailed((error as Error)?.message ?? 'Unknown error');
    }
}

run();
