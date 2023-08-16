

// JavaScript code goes herefunction toggleNews() {
const newsContainer = document.querySelector('.news');
newsContainer.classList.toggle('active');

// If the container is active, fetch the news
if (newsContainer.classList.contains('active')) {
    getStockMarketNews();
}


// Function to fetch stock market news from Alpha Vantage API
function getStockMarketNews() {
    const apiUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=6VWT72JNHHLBF3MH`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const newsContainer = document.getElementById('news-container');
            newsContainer.innerHTML = ""; // Clear previous content

            // Process the news articles and display them
            for (let i = 0; i < 5; i++) {
                const article = data.feed[i];


                // Create elements for article details
                const articleTitle = document.createElement('h3');
                const articleLink = document.createElement('a');
                const articleTime = document.createElement('p');
                const articleAuthors = document.createElement('p');
                const articleSummary = document.createElement('p');
                const articleImage = document.createElement('img');
                const articleSource = document.createElement('p');

                // Set content for article elements
                articleTitle.textContent = article.title;
                articleLink.textContent = "Read More";
                articleLink.href = article.url;
                // articleTime.textContent = `Published: ${article.time_published}`;
                const timestamp = article.time_published;

                const date = timestamp.slice(0, 4) + "/" + timestamp.slice(4, 6) + "/" + timestamp.slice(6, 8);
                const time = timestamp.slice(9, 11) + ":" + timestamp.slice(11, 13);
                articleTime.textContent = `Published:${date}`;
                articleAuthors.textContent = `Authors: ${article.authors.join(', ')}`;
                articleSummary.textContent = article.summary;
                articleImage.src = article.banner_image;
                articleSource.textContent = `Source: ${article.source}`;

                // Append elements to news container
                newsContainer.appendChild(articleTitle);
                newsContainer.appendChild(articleImage);


                newsContainer.appendChild(articleSummary);
                newsContainer.appendChild(articleLink);
                newsContainer.appendChild(articleTime);
                newsContainer.appendChild(articleAuthors);
                newsContainer.appendChild(articleSource);

                // Add a line break for better separation between articles
                newsContainer.appendChild(document.createElement('hr'));
            }
        })
        .catch(error => {
            console.error("Error fetching stock news:", error);
        });
}

        // Call the function to get stock market news and display the first 5 articles


