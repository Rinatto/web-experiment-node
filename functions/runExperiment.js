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
        const command = `node ${path.resolve(__dirname, '../experiment_runs/run_experiments.js')} ${iterations}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to run experiment' }),
                });
            }

            const resultsPath = path.resolve(__dirname, '../experiment_runs/results.json');
            fs.readFile(resultsPath, 'utf8', (err, data) => {
                if (err) {
                    return resolve({
                        statusCode: 500,
                        body: JSON.stringify({ error: 'Failed to read results' }),
                    });
                }

                const results = JSON.parse(data);
                const response = { 
                    iterations: results,
                    averageResults: null 
                };

                if (iterations > 1) {
                    const tsResults = results.filter(r => r.label === 'test:ts').map(r => parseFloat(r.output.match(/TS Dynamic Structure Change: (\d+\.\d+)ms/)[1]));
                    const jsResults = results.filter(r => r.label === 'test:js').map(r => parseFloat(r.output.match(/Dynamic Structure Change: (\d+\.\d+)ms/)[1]));

                    const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

                    response.averageResults = [
                        {
                            label: 'test:ts',
                            average: average(tsResults),
                        },
                        {
                            label: 'test:js',
                            average: average(jsResults),
                        }
                    ];
                }

                return resolve({
                    statusCode: 200,
                    body: JSON.stringify(response),
                });
            });
        });
    });
};
