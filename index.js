const express = require("express");
const cors = require("cors");
require('dotenv').config();

// initialize express app
const app = express();

// middlewares
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("From Sunglass Garden Server...")
})


const port = process.env.PORT || 5000;
// start server
app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
})