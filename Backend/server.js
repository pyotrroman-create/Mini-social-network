const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Mini Social Network API is running');
});

const startServer = async () => {
    await connectDB();

    const PORT = process.env.PORT || 3333;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();