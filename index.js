const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0hgquea.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const productsCollection = client.db('emaJohnDB').collection('products');

    app.get('/products', async(req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page * page);
      const result = await productsCollection.find().skip(skip).limit(limit).toArray();
      res.send(result);
    })

    app.get('/totalProducts', async(req, res) => {
      const result = await productsCollection.estimatedDocumentCount();
      res.send({totalProducts: result});
    })

    app.post('/productsByIds', async(req, res) => {
      const ids =  req.body;
      const objectIds = ids.map(id => new ObjectId(id));
      const query = { _id: {$in: objectIds }}
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("john is running");
});

app.listen(port, (req, res) => {
  console.log(`port is running ${port}`);
});
