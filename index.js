const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pdzlhd7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
   
    client.connect();

    const toyCollection = client.db("toyUniverse").collection("toyInfo");

    app.get("/toys", async (req, res) => {
      const toys = toyCollection.find().limit(20);
      const result = await toys.toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const toy = await toyCollection.findOne({ _id: new ObjectId(id) });
      res.send(toy);
    });

    app.get("/seller", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/tabs", async (req, res) => {
      let query = {};
      if (req.query?.sub_category) {
        query = { subCategory: req.query.sub_category };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/sort", async (req, res) => {
      let sort_type = {};
      if (req.query?.sortby) {
        sort_type = { sort_by: req.query.sortby };
      }
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }

      const asc_des = sort_type.sort_by === "ascending" ? 1 : -1;
      const toys = toyCollection.find(query, { sort: { price: asc_des } });
      const result = await toys.toArray();
      res.send(result);
    });

    app.get("/search", async (req, res) => {
      const searchQuery = req.query?.query;
      const result = await toyCollection
        .find({ productName: { $regex: searchQuery, $options: "i" } })
        .toArray();
      res.send(result);
    });

    app.post("/add-toy", async (req, res) => {
      const data = req.body;
      const toy = {
        productImage: data.productImage,
        productName: data.productName,
        sellerName: data.sellerName,
        sellerEmail: data.sellerEmail,
        subCategory: data.subCategory,
        price: data.price,
        rating: data.rating,
        availableQuantity: data.availableQuantity,
        description: data.description,
      };
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });

    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const data = req.body;
      const result = await toyCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            productImage: data.productImage,
            productName: data.productName,
            sellerName: data.sellerName,
            sellerEmail: data.sellerEmail,
            subCategory: data.subCategory,
            price: data.price,
            rating: data.rating,
            availableQuantity: data.availableQuantity,
            description: data.description,
          },
        },
        {
          upsert: true,
        }
      );
      res.send(result);
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toyCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    client.db("admin").command({ ping: 1 });
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
  res.send("server is running well");
});
app.listen(port, () => {
  console.log(`server is running in port ${port}`);
});
