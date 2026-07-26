const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const cors =require('cors');
dotenv.config()
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 9090




const uri = process.env.MONGODB_URI;

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
    const db = client.db("idea_vault");
    const ideasCollection = db.collection("ideas")

    app.get("/ideas" ,async (req ,res )=>{
      const result = await ideasCollection.find().toArray();
      res.send(result)
    });
    app.get("/ideas/:ideaId" ,async (req ,res )=>{
      const {ideaId} = req.params;
      const result = await ideasCollection.findOne({_id :new ObjectId(ideaId)})
      res.send(result)
    })
    app.post("/ideas" , async (req ,res) =>{
      const ideasData = req.body;
      const result = await ideasCollection.insertOne(ideasData);
      res.send(result);
    })



    
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir); 




app.get("/", (req, res) => {
  res.send("hey");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
