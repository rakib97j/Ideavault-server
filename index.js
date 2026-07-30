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

    // show trending data in Home Page 
    app.get("/trending" , async (req ,res)=>{
      const result =await ideasCollection.find().limit(6).toArray();
      res.send(result)
    })
    // main Api
    app.get("/ideas" ,async (req ,res )=>{
      const userId = req.query.userId;
      const query = userId ? { userId: userId } : {};
      const result = await ideasCollection.find(query).toArray();
      res.send(result)
    });
    // search and short Api
   app.get("/idea", async (req, res) => {
  const search = req.query.search?.trim();

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  const result = await ideasCollection.find(query).toArray();

  res.send(result);
});
    
    // details Api
    app.get("/ideas/:ideaId" ,async (req ,res )=>{
      const {ideaId} = req.params;
      const result = await ideasCollection.findOne({_id :new ObjectId(ideaId)})
      res.send(result)
    })
    // add Data Api
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
  res.send("HLWWW");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
