const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    const { iterations } = JSON.parse(event.body);

    if (iterations > 100) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Maximum number of iterations is 100' }),
        };
    }

    return new Promise((resolve) => {
        const command = `node ${path.resolve(__dirname, '../../experiment_runs/run_experiments.js')} ${iterations}`;
        console.log(`Executing command: ${command}`);
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to run experiment' }),
                });
            }

            const resultsPath = path.resolve(__dirname, '../../experiment_runs/results.json');
            fs.readFile(resultsPath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`readFile error: ${err}`);
                    return resolve({
                        statusCode: 500,
                        body: JSON.stringify({ error: 'Failed to read results' }),
                    });
                }

                const results = JSON.parse(data);
                const response = { iterations: results };

                return resolve({
                    statusCode: 200,
                    body: JSON.stringify(response),
                });
            });
        });
    });
};
