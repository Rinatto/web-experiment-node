const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    console.log('Event:', event);

    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is missing' }),
        };
    }

    let iterations;
    try {
        iterations = JSON.parse(event.body).iterations;
        console.log('Iterations:', iterations);
    } catch (parseError) {
        console.error(`JSON parse error: ${parseError}`);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON input' }),
        };
    }

    if (iterations > 100) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Maximum number of iterations is 100' }),
        };
    }

    return new Promise((resolve) => {
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

                try {
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
                } catch (parseError) {
                    console.error(`JSON parse error: ${parseError}`);
                    return resolve({
                        statusCode: 500,
                        body: JSON.stringify({ error: 'Failed to parse results' }),
                    });
                }
            });
        });
    });
};
