import { getInput, setFailed } from '@actions/core';
import { getOctokit, context } from '@actions/github';
import * as fs from 'fs';

async function run() {
    const token = getInput('gh-token');

    const octokit = getOctokit(token);
    const pullRequest = context.payload.pull_request;

    const filePath = './tsc_errors.txt';

    try {
        if (!pullRequest) {
            throw new Error(
                'This action can only be run on Pull Requests',
            );
        }

        fs.readFile(filePath, 'utf8', async (err: any, data: string) => {
            if (err) {
                console.error(err);
                return;
            }

            // Split the file content by new lines to get an array of lines
            const lines = data
                .split('\n')
                .filter((line: string) => line !== '');

            const annotations = [];

            for (let i = 0; i < lines.length; i += 1) {
                const line = lines[i];
                const regex = /^(.*\.tsx?)\((\d+),(\d+)\):\s(error .*)$/;
                const matches = line.match(regex);

                if (matches) {
                    const filePath = matches[1];
                    const lineNumber = parseInt(matches[2]);
                    const columnNumber = parseInt(matches[3]);
                    const errorMessage = matches[4];

                    const resultObject = {
                        filePath: filePath,
                        lineNumber: lineNumber,
                        columnNumber: columnNumber,
                        errorMessage: errorMessage,
                    };

                    annotations.push({
                        path: resultObject.filePath,
                        start_line: resultObject.lineNumber,
                        end_line: resultObject.lineNumber,
                        annotation_level: 'failure',
                        message: resultObject.errorMessage,
                    });
                }
            }

            if (annotations.length > 0) {
                await octokit.rest.checks.create({
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    name: 'Validator',
                    head_sha: context.sha,
                    status: 'completed',
                    conclusion: 'failure',
                    output: {
                        title: 'Typescript Error',
                        summary: '',
                        annotations: annotations,
                    },
                });
            }
        });
    } catch (error) {
        setFailed((error as Error)?.message ?? 'Unknown error');
    }
}

run();
