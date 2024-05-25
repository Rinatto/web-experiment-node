const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    const { iterations } = JSON.parse(event.body);

    if (iterations > 100) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Maximum number of iterations is 100' }),
        };
    }

    return new Promise((resolve, reject) => {
        exec(`node ${path.resolve(__dirname, '../ts/main.ts')} ${iterations}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to run experiment' }),
                });
            }

            fs.readFile(path.resolve(__dirname, '../experiment_runs/results.json'), 'utf8', (err, data) => {
                if (err) {
                    console.error(`readFile error: ${err}`);
                    return resolve({
                        statusCode: 500,
                        body: JSON.stringify({ error: 'Failed to read results' }),
                    });
                }

                resolve({
                    statusCode: 200,
                    body: JSON.stringify(JSON.parse(data)),
                });
            });
        });
    });
};
