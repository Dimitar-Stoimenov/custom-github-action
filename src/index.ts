import { getInput, setFailed } from "@actions/core";
import { getOctokit, context } from "@actions/github";
import * as fs from "fs";

async function run() {
	const token = getInput("gh-token");

	const octokit = getOctokit(token);
	const pullRequest = context.payload.pull_request;

	const filePath = "./tsc_errors.txt";	
console.log(filePath);
	try {
		if (!pullRequest) {
			throw new Error("This action can only be run on Pull Requests");
		}

		fs.readFile(filePath, 'utf8', (err: any, data: string) => {
			if (err) {
			  console.error(err);
			  return;
			}
		  
			// Split the file content by new lines to get an array of lines
			const lines = data.split('\n').filter((line: string) => line !== "");
		  
			for (let i = 0; i < lines.length; i += 1) {
				const line = lines[i];
				
			}
		  });

		// await octokit.rest.issues.addLabels({
		// 	owner: context.repo.owner,
		// 	repo: context.repo.repo,
		// 	issue_number: pullRequest.number,
		// 	labels: [label]
		// })
	} catch (error) {
		setFailed((error as Error)?.message ?? "Unknown error");
	}
}

run()
