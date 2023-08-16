
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;
const path = require('path');
const { resourceLimits } = require('worker_threads');
require('dotenv').config(); // Load environment variables from .env file
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// Connect to MongoDB (replace 'mongodb://localhost/stockDB' with your actual MongoDB connection string)
mongoose.connect('mongodb+srv://project:project@cluster0.kos1k7l.mongodb.net/stock', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

const stockSchema = new mongoose.Schema({
    symbol: String,
    price: Number,
    quantity: Number,
});

const Stock = mongoose.model('Stock', stockSchema);


app.get('/', async (req, res) => {
    try {
        const stocks = await Stock.find();
        let totalValue = 0;
        stocks.forEach(stock => {
            totalValue += stock.price * stock.quantity;
        });
        res.render('index', { stocks, totalValue });
    } catch (err) {
        console.error('Error fetching stock data:', err);
        res.status(500).send('Error fetching stock data.');
    }
});
app.get('/stocks', async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (err) {
        console.error('Error fetching stock data:', err);
        res.status(500).json({ error: 'Error fetching stock data.' });
    }
});
// Routes
app.get('/index', (req, res) => {
    res.redirect('/');
});
app.get('/api', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'api.html');
    res.sendFile(filePath);
});
app.get('/news', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'news.html');
    res.sendFile(filePath);
});
app.get('/sitemap', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'sitemap.html');
    res.sendFile(filePath);
});
app.use('/js', (req, res, next) => {
    res.setHeader('Content-Type', 'application/javascript');
    next();
});
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

app.post('/addStock', async (req, res) => {
    try {
        const { stockSymbol, stockQuantity } = req.body;

        // Fetch stock data from API
        const stockData = await getStockData(stockSymbol);

        if (!stockData) {
            return res.status(404).send('Stock not found.');
        }

        // Check the number of existing stocks
        const existingStockCount = await Stock.countDocuments();
        if (existingStockCount >= 5) {
            return res.status(400).send('Maximum number of stocks reached.');
        }

        // Save stock data to MongoDB
        const stock = new Stock({
            symbol: stockData.symbol,
            price: stockData.price,
            quantity: stockQuantity,
        });
        await stock.save();

        res.redirect('/');
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error processing request.');
    }
});

app.post('/deleteStock', async (req, res) => {
    try {
        const { stockId } = req.body;

        // Find and delete the stock with the provided ID
        const deletedStock = await Stock.findByIdAndRemove(stockId);

        if (!deletedStock) {
            return res.status(404).send('Stock not found.');
        }

        res.redirect('/');
    } catch (err) {
        console.error('Error deleting stock:', err);
        res.status(500).send('Error deleting stock.');
    }
});
async function getStockData(symbol) {
    try {
        const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=6VWT72JNHHLBF3MH`);
        const data = response.data['Global Quote'];
        const stockData = {
            symbol: data['01. symbol'],
            price: parseFloat(data['05. price']),
        };
        return stockData;
    } catch (err) {
        console.error('Error fetching stock data:', err);
        return null;
    }
}


app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});


