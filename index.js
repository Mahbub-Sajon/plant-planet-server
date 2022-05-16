const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();


//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://dbPlantPlanet:R6fioYRhJlhwjSWE@cluster0.rjowz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
try{
    await client.connect();
    const productCollection = client.db('plantPlanet').collection('products');

   app.get('/products', async(req, res) => {
    const query = {};
    const cursor = productCollection.find(query);
    const products = await cursor.toArray();
    res.send(products)
   })

}
finally{}
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('plant-planet server running')
});
app.listen(port, () => {
    console.log("plant running")
})