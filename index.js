const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const res = require('express/lib/response');
const port = process.env.PORT || 5000;
const app = express();


//middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
    })
    next();
}



// const uri = `mongodb+srv://dbPlantPlanet:R6fioYRhJlhwjSWE@cluster0.rjowz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rjowz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('plantPlanet').collection('products');
        const myProductCollection = client.db('plantPlanet').collection('myProducts')

        //auth initialization
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });

            res.send({ accessToken });
        });


        //getting products 
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        });

        

        app.get('/update-product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result);
        });

        app.get('/update-my-product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await myProductCollection.findOne(query);
            res.send(result);
        });

        //posting data
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        //FOR MY PRODUCTS
        app.post('/my-products', async (req, res) => {
            const myProduct = req.body;
            const result = await myProductCollection.insertOne(myProduct);
            res.send(result);
        })

        //restocking and delivering for all (well all means from the first collection!)
        app.put('/update-product/:id', async (req, res) => {
            const id = req.params.id;
            console.log(req.body);
            const updateProduct = Number(req.body.newQuantity);
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: parseInt(updateProduct)
                }
            };
            const result = await productCollection.updateOne(query, updatedDoc, options);
            res.send(result);
        });

        //restocking and delivering for my products
        app.put('/update-my-product/:id', async (req, res) => {
            const id = req.params.id;
            console.log(req.body);
            const updateMyProduct = Number(req.body.newQuantity);
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: parseInt(updateMyProduct)
                }
            };
            const result = await myProductCollection.updateOne(query, updatedDoc, options);
            res.send(result);
        });

        //deleting
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        app.delete('/my-products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await myProductCollection.deleteOne(query);
            res.send(result);
        })



    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('plant-planet server running')
});
app.listen(port, () => {
    console.log("plant running")
})