
// income statement

const apiUrl = 'https://www.alphavantage.co/query?function=INCOME_STATEMENT&apikey=6VWT72JNHHLBF3MH';

let chart;

function fetchData() {
    const companySymbolInput = document.getElementById('companySymbol');
    const companySymbol = companySymbolInput.value.toUpperCase();
    if (!companySymbol) {
        alert('Please enter a company symbol.');
        return;
    }



    // document.getElementById('companySymbolDisplay1').textContent = `Stock Name: ${companySymbol}`;

    // Clear the input field
    companySymbolInput.value = '';
    const apiQuery = `${apiUrl}&symbol=${companySymbol}`;

    fetch(apiQuery)
        .then(response => response.json())
        .then(data => {
            if (data.annualReports && data.annualReports.length > 0) {
                const revenueData = data.annualReports.map(report => report.totalRevenue);
                const netProfitData = data.annualReports.map(report => report.netIncome);

                createOrUpdateChart(data, revenueData, netProfitData);
            } else {
                alert('No financial data found for the specified company symbol.');
            }
        })
        .catch(error => {
            alert('Error fetching data:', error);
        });

}

function createOrUpdateChart(data, revenueData, netProfitData) {
    const ct = document.getElementById('stockChart1').getContext('2d');

    if (chart) {
        // If a chart exists, clear it first before creating a new one
        chart.destroy();
    }

    const years = data.annualReports.map(report => report.fiscalDateEnding.split('-')[0]);

    chart = new Chart(ct, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Revenue',
                    data: revenueData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Net Profit',
                    data: netProfitData,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}





// balance sheet
function getFinancialData() {
    const apiUrl = 'https://www.alphavantage.co/query?function=BALANCE_SHEET&apikey=6VWT72JNHHLBF3MH'; // Replace with your actual API key

    const companySymbolInput = document.getElementById('companySymbol');
    const companySymbol = companySymbolInput.value.trim().toUpperCase(); // Trim any leading/trailing spaces

    if (!companySymbol) {
        alert('Please enter a company symbol.');
        return;
    }

    // Clear the input field
    companySymbolInput.value = '';

    const apiQuery = `${apiUrl}&symbol=${companySymbol}`;

    fetch(apiQuery)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            if (data.annualReports && data.annualReports.length > 0) {
                const companyName = data.symbol; // Assuming the API response includes the company symbol as "symbol"
                const cash = data.annualReports.map(report => report.cashAndShortTermInvestments);
                const longTermDebt = data.annualReports.map(report => report.longTermDebt);
                const commonStockShares = data.annualReports.map(report => report.commonStockSharesOutstanding);

                // Display the company symbol
                document.getElementById('companySymbolDisplay').textContent = `Company Symbol: ${companyName} (${companySymbol})`;

                createBarChart(data, cash, longTermDebt, commonStockShares);
            } else {
                alert('No financial data found for the specified company symbol.');
            }
        })
        .catch(error => {
            alert('Error fetching data: ' + error.message);
        });
}

function createBarChart(data, cash, longTermDebt, commonStockShares) {
    const ctx1 = document.getElementById('financialChart').getContext('2d');



    const years = data.annualReports.map(report => report.fiscalDateEnding.split('-')[0]);

    window.chart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Total cash',
                    data: cash,
                    backgroundColor: 'rgba(0, 179, 134, 1)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'longTermDebt',
                    data: longTermDebt,
                    backgroundColor: 'rgba(0, 128, 255, 1)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Total Shares',
                    data: commonStockShares,
                    backgroundColor: 'rgba(204, 255, 0, 1)',
                    // borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Common Stock Shares Outstanding'
                }
            }
        }
    });
}

function clearInput1() {
    document.getElementById('companySymbol').value = '';
    document.getElementById('companySymbolDisplay').textContent = '';

    const ctx1 = document.getElementById('financialChart').getContext('2d');
    const existingChart = Chart.getChart(ctx1); // Get the existing chart instance

    if (existingChart) {
        existingChart.destroy(); // Destroy the existing chart if it exists
    }
}


// stock price chart
async function fetchAndPlotData() {
    const apiKey = '6VWT72JNHHLBF3MH';
    const stockSymbol = document.getElementById('companySymbol').value.toUpperCase();
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${stockSymbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const timeSeries = data['Monthly Time Series'];

        if (!timeSeries) {
            alert('Data not found for the given stock symbol. Please check the symbol or try again later.');
            return;
        }

        const dates = Object.keys(timeSeries).slice(0, 120); // Last 10 years (12 months * 10 years = 120 months)
        const stockPrices = dates.map(date => parseFloat(timeSeries[date]['4. close']));

        const ctx = document.getElementById('stockChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: `${stockSymbol} Stock Price`,
                    data: stockPrices,
                    borderColor: 'rgb(75, 192, 192)',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: `${stockSymbol} Stock Price (Last 10 Years)`
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Stock Price (USD)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        alert('Error fetching data. Please try again later.');
        console.error(error);
    }
}
function clearInput() {
    document.getElementById('priceChart').value = '';
    document.getElementById('priceChart').textContent = '';
    const ctx = document.getElementById('stockChart').getContext('2d');


    const existingChart = Chart.getChart(ctx); // Get the existing chart instance

    if (existingChart) {
        existingChart.destroy(); // Destroy the existing chart if it exists
    }
}