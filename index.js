const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();


//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://dbPlantPlanet:R6fioYRhJlhwjSWE@cluster0.rjowz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('plantPlanet').collection('products');

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

   //posting data
   app.post('/products', async(req, res) =>{
       const newProduct = req.body;
       const result = await productCollection.insertOne(newProduct);
       res.send(result);
   });

   //restocking
   app.put('/update-product/:id', async(req, res) => {
       const id = req.params.id;
       const updateProduct = req.body;
       const query = { _id: ObjectId(id) };
       const options = {upsert: true};
       const updatedDoc ={
           $set: {
               quantity: updateProduct.quantity
           }
       };
       const result = await productCollection.updateOne(query, updatedDoc, options);
       res.send(result);
   })

    //deleting
    app.delete('/products/:id',async(req, res) =>{
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await productCollection.deleteOne(query);
        res.send(result);

    })



    }
    finally { }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('plant-planet server running')
});
app.listen(port, () => {
    console.log("plant running")
})