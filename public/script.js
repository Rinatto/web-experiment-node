document.getElementById('experiment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const iterations = document.getElementById('iterations').value;

    try {
        const response = await fetch('/.netlify/functions/runExperiment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ iterations }),
        });

        const result = await response.json();
        document.getElementById('results').textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        console.error('Error:', error);
    }
});
