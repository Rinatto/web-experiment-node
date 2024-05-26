document.getElementById('runExperimentButton').addEventListener('click', () => {
    const iterations = document.getElementById('iterationsInput').value;
    const loader = document.getElementById('loader');
    const resultsChart = document.getElementById('resultsChart');
    const jsonOutput = document.getElementById('jsonOutput');

    loader.style.display = 'block';
    resultsChart.style.display = 'none';
    jsonOutput.style.display = 'none';

    fetch('/.netlify/functions/runExperiment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ iterations }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        loader.style.display = 'none';
        resultsChart.style.display = 'block';
        jsonOutput.style.display = 'block';
        jsonOutput.textContent = JSON.stringify(data.iterations, null, 2);

        const tsChanges = data.iterations.filter(result => result.label === 'test:ts').map(result => parseFloat(result.output.match(/TS Dynamic Structure Change: (\d+\.\d+)ms/)[1]));
        const jsChanges = data.iterations.filter(result => result.label === 'test:js').map(result => parseFloat(result.output.match(/Dynamic Structure Change: (\d+\.\d+)ms/)[1]));

        const ctx = document.getElementById('resultsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: tsChanges.length }, (_, i) => i + 1),
                datasets: [
                    {
                        label: 'TS Dynamic Structure Change (ms)',
                        data: tsChanges,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: false,
                    },
                    {
                        label: 'JS Dynamic Structure Change (ms)',
                        data: jsChanges,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        fill: false,
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Iteration'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Dynamic Structure Change (ms)'
                        }
                    }
                }
            }
        });
    })
    .catch((error) => {
        loader.style.display = 'none';
        console.error('Error:', error);
    });
});
