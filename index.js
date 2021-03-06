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
        const orders = database.collection('orders');
        const reviews = database.collection('reviews');


        // get all products
        app.get('/products', async (req, res) => {
            const cursor = await products.find({});
            const data = await cursor.toArray();
            try {
                res.send(data);
            } catch {
                res.send({ error: { message: "Something Went Wrong" } });
            }
        });

        // get single product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await products.findOne(query);
            try {
                res.send(product);
            } catch {
                res.send({ error: { message: "Something Went Wrong" } });
            }
        });

        // add orders
        app.post('/product', async (req, res) => {
            const { name, image, price, optics, height, width, material } = req.body;
            const data = {
                name,
                image,
                price,
                details: {
                    optics,
                    height,
                    width,
                    material
                }
            };
            try {
                const result = await products.insertOne(data);
                if (result) {
                    res.send(result);
                }
            } catch {
                res.send({ error: { message: "Something Went Wrong" } });
            }
        });

        // update product
        app.put('/product/update/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: ObjectId(id) };
            const { name, image, price, optics, height, width, material } = req.body;
            const updateDoc = {
                $set: {
                    name,
                    image,
                    price,
                    details: {
                        optics,
                        height,
                        width,
                        material
                    }
                }
            };
            try {
                const result = await products.updateOne(query, updateDoc);
                if (result) {
                    res.send(result);
                }
            } catch {
                res.send({ error: { message: "Something Went Wrong" } });
            }
        });

        // delete product
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await products.deleteOne(query);
            try {
                res.send(result);
            } catch {
                res.send({ error: { message: "Something Went Wrong" } });
            }
        });

        // get specific user's orders
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const cursor = await orders.find({});
            const allOrders = await cursor.toArray();
            const userOrders = await allOrders.filter(order => order.customer.email === email);
            if (userOrders) {
                res.send(userOrders);
            } else {
                res.send({})
            }
        });

        // get all orders
        app.get('/orders', async (req, res) => {
            const cursor = await orders.find({});
            const allOrders = await cursor.toArray();
            if (allOrders) {
                res.send(allOrders)
            } else {
                res.send({})
            }
        });

        // add orders
        app.post('/order', async (req, res) => {
            const data = {
                ...req.body,
                payment: {
                    status: "unpaid"
                },
                delivery: {
                    status: "pending"
                }
            };
            const result = await orders.insertOne(data);
            try {
                res.send(result);
            } catch {
                res.send({ error: { message: "Something Went Wrong" } });
            }
        });

        // update order
        app.put('/order/payment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    payment: {
                        status: 'paid'
                    }
                },
            };
            const result = await orders.updateOne(query, updateDoc);
            res.send(result);
        });

        // update order
        app.put('/order/delivery/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    delivery: {
                        status: 'shipped'
                    }
                },
            };
            const result = await orders.updateOne(query, updateDoc);
            try {
                res.send(result);
            } catch {
                res.send({ error: { message: "Something Went Wrong" } });
            }
        });

        // delete order
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orders.deleteOne(query)
            try {
                res.send(result);
            } catch {
                res.send({ error: { message: "Something Went Wrong" } });
            }
        });

        // get all reviews
        app.get('/reviews', async (req, res) => {
            const cursor = await reviews.find({});
            const data = await cursor.toArray();
            try {
                res.send(data);
            } catch {
                res.send({ error: { message: "Something Went Wrong" } });
            }
        });

        // add review
        app.post('/review', async (req, res) => {
            const data = req.body;
            const result = await reviews.insertOne(data);
            try {
                res.send(result);
            } catch {
                res.send({ error: { message: "Something Went Wrong" } });
            }
        });

        // get all users
        app.get('/users', async (req, res) => {
            const cursor = await users.find({});
            const data = await cursor.toArray();
            try {
                res.send(data);
            } catch {
                res.send({ error: { message: "Something Went Wrong" } });
            }
        });

        // add and/ or get specific user
        app.post('/user', async (req, res) => {
            const data = {
                ...req.body,
                role: 'user'
            };
            const query = { email: data.email };
            const user = await users.findOne(query);
            if (!user) {
                const result = await users.insertOne(data);
                if (result.insertedId) {
                    const newUser = await users.findOne(query);
                    res.send(newUser);
                }
            } else {
                res.send(user);
            }
        });

        // update user role
        app.put('/user/update-role', async (req, res) => {
            const id = req.body.id;
            const query = { _id: ObjectId(id) };
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