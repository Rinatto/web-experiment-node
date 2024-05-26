const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const runCount = process.argv[2] || 1;
const results = [];

const runTest = (command, label) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        exec(command, (error, stdout, stderr) => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            if (error) {
                reject(`Error executing ${command}: ${error}`);
            } else {
                const result = { label, output: stdout.trim(), duration };
                results.push(result);
                resolve(result);
            }
        });
    });
};

const runTests = async () => {
    for (let i = 0; i < runCount; i++) {
        console.log(`Running iteration ${i + 1} of ${runCount}`);
        await runTest('npm run test:ts', 'test:ts');
        await runTest('npm run test:js', 'test:js');
    }

    fs.writeFileSync(path.resolve(__dirname, 'results.json'), JSON.stringify(results, null, 2));
    console.log(`Results saved to ${path.resolve(__dirname, 'results.json')}`);
};

runTests().catch(error => console.error(error));
