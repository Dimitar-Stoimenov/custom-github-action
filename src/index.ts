import { setFailed, getInput } from '@actions/core';
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

type CompareResult = {
	linesPct: number;
	functionsPct: number;
	statementsPct: number;
	branchesPct: number;
} | null;

async function run() {
	let diffs: string[] = [];

	const generalCoverageTolerance = +getInput("generalCoverageTolerance") || 0;
	const singleLineCoverageTolerance = +getInput("singleLineCoverageTolerance") || 0;

	console.log(`General coverage tolerance: ${generalCoverageTolerance.toFixed(2)}%`);
	console.log(`Single line coverage tolerance: ${singleLineCoverageTolerance.toFixed(2)}%`);
	console.log("");

    const basePath = './coverage-base/coverage-summary.json';
    const prPath = './coverage-pr/coverage-summary.json';

	const compareFileCoverage = (prFileObj: SingleFileInterface, baseFileObj: SingleFileInterface, fileName: string): CompareResult => {
		let diffCheck = false;
		let result = {
			linesPct: 0,
			functionsPct: 0,
			statementsPct: 0,
			branchesPct: 0
		};

		if (!baseFileObj) {
			diffs.push(`${fileName} is a new or renamed file. Write tests for it!`);

			return null;
		}

		if (prFileObj.lines.pct < baseFileObj.lines.pct) {
			if ((prFileObj.lines.pct + singleLineCoverageTolerance) < baseFileObj.lines.pct) {
				diffCheck = true;
			}
			result.linesPct = prFileObj.lines.pct - baseFileObj.lines.pct;
		}

		if (prFileObj.functions.pct < baseFileObj.functions.pct) {
			if ((prFileObj.functions.pct + singleLineCoverageTolerance) < baseFileObj.functions.pct) {
				diffCheck = true;
			}
			result.functionsPct = prFileObj.functions.pct - baseFileObj.functions.pct;
		}

		if (prFileObj.statements.pct < baseFileObj.statements.pct) {
			if ((prFileObj.statements.pct + singleLineCoverageTolerance) < baseFileObj.statements.pct) {
				diffCheck = true;
			}
			result.statementsPct = prFileObj.statements.pct - baseFileObj.statements.pct;
		}

		if (prFileObj.branches.pct < baseFileObj.branches.pct) {
			if ((prFileObj.branches.pct + singleLineCoverageTolerance) < baseFileObj.branches.pct) {
				diffCheck = true;
			}
			result.branchesPct = prFileObj.branches.pct - baseFileObj.branches.pct;
		}

		if (!diffCheck) return null;
	
		return result;
	};

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

		let generalDiffMessage = "";

		if (
			(prResultTotal.statements.pct - baseResultTotal.statements.pct) < -generalCoverageTolerance
			|| (prResultTotal.branches.pct - baseResultTotal.branches.pct) < -generalCoverageTolerance
			|| (prResultTotal.functions.pct - baseResultTotal.functions.pct) < -generalCoverageTolerance
			|| (prResultTotal.lines.pct - baseResultTotal.lines.pct) < -generalCoverageTolerance
		) {
			generalDiffMessage = "The general coverage is worse than before and above the tolerance. You need to write more tests!";
		}

		const prFiles = Object.keys(prResultObject);

		for (let i = 1; i < prFiles.length; i++) {
			const fileName = prFiles[i];

			const prFileCoverageObj = prResultObject[fileName];
			const baseFileCoverageObj = baseResultObject[fileName];

			const result = compareFileCoverage(prFileCoverageObj, baseFileCoverageObj, fileName);			
			if (!result) continue;

			const statementsMsg = result.statementsPct < 0 ? `Statements Diff: ${result.statementsPct.toFixed(2)}%` : ""
			const branchesMsg = result.branchesPct < 0 ? `Branches Diff: ${result.branchesPct.toFixed(2)}%` : ""
			const functionsMsg = result.functionsPct < 0 ? `Functions Diff: ${result.functionsPct.toFixed(2)}%` : ""
			const linesMsg = result.linesPct < 0 ? `Lines Diff: ${result.linesPct.toFixed(2)}%` : ""
			const message = [statementsMsg, branchesMsg, functionsMsg, linesMsg].join(" ").trim();

			diffs.push(`${fileName} >>> ${message}`);
		}

		console.log("============================== Coverage difference =============================")
		console.log(`Statements   : ${statementsDiff > 0 ? "+" + statementsDiff.toFixed(2) : statementsDiff.toFixed(2)}%`)
		console.log(`Branches     : ${branchesDiff > 0 ? "+" + branchesDiff.toFixed(2) : branchesDiff.toFixed(2)}%`)
		console.log(`Functions    : ${functionsDiff > 0 ? "+" + functionsDiff.toFixed(2) : functionsDiff.toFixed(2)}%`)
		console.log(`Lines        : ${linesDiff > 0 ? "+" + linesDiff.toFixed(2) : linesDiff.toFixed(2)}%`)
		console.log("================================================================================");
		console.log("")

		for (let i = 0; i < diffs.length; i++) {
			if (i === 0) {
				console.log("=========================== Files with worse coverage ==========================")
			}

			const diff = diffs[i];
			console.log(diff);

			if (i === diffs.length - 1) {
				console.log("================================================================================")
				console.log("")
			}
		}

		if (diffs.length > 0) {
			throw new Error("Coverage action failed - Write more tests!");
		} else if (generalDiffMessage !== "") {
			throw new Error(generalDiffMessage);
		} else {
			console.log("Coverage is OK.")
		}

    } catch (error) {
        setFailed((error as Error)?.message ?? 'Unknown error.');    
	}
}

run();
