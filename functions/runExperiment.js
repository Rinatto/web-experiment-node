const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    console.log('Event:', event);
    console.log('Context:', context);

    const { iterations } = JSON.parse(event.body);
    console.log('Iterations:', iterations);

    if (iterations > 100) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Maximum number of iterations is 100' }),
        };
    }

    return new Promise((resolve, reject) => {
        const command = `node ${path.resolve(__dirname, '../experiment_runs/run_experiments.js')} ${iterations}`;
        console.log('Executing command:', command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to run experiment' }),
                });
            }

            console.log('Command stdout:', stdout);
            console.log('Command stderr:', stderr);

            const resultsPath = path.resolve(__dirname, '../experiment_runs/results.json');
            console.log('Reading results from:', resultsPath);

            fs.readFile(resultsPath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`readFile error: ${err}`);
                    return resolve({
                        statusCode: 500,
                        body: JSON.stringify({ error: 'Failed to read results' }),
                    });
                }

                console.log('Results data:', data);

                resolve({
                    statusCode: 200,
                    body: JSON.stringify(JSON.parse(data)),
                });
            });
        });
    });
};
