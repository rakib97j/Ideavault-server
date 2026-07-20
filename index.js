const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
const cors =require('cors');
dotenv.config()
const app = express();
app.use(cors())
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
