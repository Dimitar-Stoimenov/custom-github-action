import { getInput, setFailed } from '@actions/core';
import * as fs from 'fs';

interface CoverageInterface {
	"total": number;
	"covered": number;
	"skipped": number;
	"pct": number;
}

interface SingleFileInterface {
	"lines": CoverageInterface;
	"functions": CoverageInterface;
	"statements": CoverageInterface;
	"branches": CoverageInterface;
}

interface JSONInterface {
	[x: string]: SingleFileInterface;
}

const compareFileCoverage = (prFile: SingleFileInterface, baseFile: SingleFileInterface, fileName: string) => {
	if (!baseFile) {
		console.log(`${fileName} is a new file. Write tests for it!`)
	}

};

async function run() {
    const basePath = './coverage-base/coverage-summary.json';
    const prPath = './coverage-pr/coverage-summary.json';

    try {
		const baseResultJSON = fs.readFileSync(basePath, 'utf8');
		const prResultJSON = fs.readFileSync(prPath, 'utf8');

		const baseResultObject: JSONInterface = JSON.parse(baseResultJSON);
		const prResultObject: JSONInterface = JSON.parse(prResultJSON);

		const baseResultTotal = baseResultObject.total;
		const prResultTotal = prResultObject.total;

		const statementsDiff = prResultTotal.statements.pct - baseResultTotal.statements.pct;
		const branchesDiff = prResultTotal.branches.pct - baseResultTotal.branches.pct;
		const functionsDiff = prResultTotal.functions.pct - baseResultTotal.functions.pct;
		const linesDiff = prResultTotal.lines.pct - baseResultTotal.lines.pct;

		const prFiles = Object.keys(prResultObject);

		for (let i = 0; i < prFiles.length; i++) {
			const fileName = prFiles[i];

			const result = compareFileCoverage(prResultObject[fileName], baseResultObject[fileName], fileName);
			

		}

		console.log("=============================== Coverage summary ===============================")
		console.log(`Statements   : ${statementsDiff > 0 ? "+" + statementsDiff.toFixed(2) : statementsDiff.toFixed(2)}%`)
		console.log(`Branches     : ${branchesDiff > 0 ? "+" + branchesDiff.toFixed(2) : branchesDiff.toFixed(2)}%`)
		console.log(`Functions    : ${functionsDiff > 0 ? "+" + functionsDiff.toFixed(2) : functionsDiff.toFixed(2)}%`)
		console.log(`Lines        : ${linesDiff > 0 ? "+" + linesDiff.toFixed(2) : linesDiff.toFixed(2)}%`)
		console.log("================================================================================");
    } catch (error) {
        setFailed((error as Error)?.message ?? 'Unknown error');
    }
}

run();
