const { exec } = require('child_process');
const fs = require('fs');

// Получаем количество запусков из аргументов командной строки
const runCount = process.argv[2] || 1;
const results = [];

// Функция для выполнения команды
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

// Основная функция для выполнения тестов
const runTests = async () => {
    for (let i = 0; i < runCount; i++) {
        console.log(`Running iteration ${i + 1} of ${runCount}`);
        await runTest('npm run test:ts', 'test:ts');
        await runTest('npm run test:js', 'test:js');
    }

    fs.writeFileSync('experiment_runs/results.json', JSON.stringify(results, null, 2));
    console.log(`Results saved to experiment_runs/results.json`);
};

// Запуск тестов и обработка ошибок
runTests().catch(error => console.error(error));