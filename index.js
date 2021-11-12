const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

// initialize express app
const app = express();

// middlewares
app.use(express.json());
app.use(cors());

// database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASS}@cluster0.gofan.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('sunglass_garden');
        const products = database.collection('products');
        const users = database.collection('users');


        // get all services
        app.get('/products', async (req, res) => {
            const cursor = await products.find({});
            const data = await cursor.toArray();
            res.send(data)
        });

        // add and/ or get specific user
        app.post('/user', async (req, res) => {
            const data = {
                ...req.body,
                role: 'user'
            };
            const query = { email: data.email };
            const user = await users.findOne(query);
            if (user) {
                res.send(user);
            } else {
                const result = await users.insertOne(data);
                if (result.insertedId) {
                    const newUser = await users.findOne(query);
                    res.send(newUser);
                }
            }
        });
        // update user role
        app.post('/user/update-role', async (req, res) => {
            const data = req.body;
            const query = { email: data.email };
            const user = await users.findOne(query);
            if (user) {
                const updateDoc = {
                    $set: {
                        role: "admin"
                    },
                };
                const result = await users.updateOne(query, updateDoc)
                res.send(result);
            } else {
                res.send({});
            }
        });


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


const port = process.env.PORT || 5000;
// start server
app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
})