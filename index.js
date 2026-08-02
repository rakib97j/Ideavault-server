const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const cors =require('cors');
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
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

// verify token
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)



const verifyToken = async (req ,res ,next) =>{
  const authHeader = req?.headers.authorization
  if(!authHeader){
    return res.status(401).json({massage: "Unauthorized"})
  }
  const token = authHeader.split(" ")[1]
    
 if(!token){
    return res.status(401).json({massage: "Unauthorized"})
  }


  try{
    const {payload}  =await jwtVerify(token , JWKS)
    next()

  }catch (error) {
    return res.status(403).json({massage: "Forbidden"})
  } 
}


async function run() {
  try {
    // await client.connect();
    const db = client.db("idea_vault");
    const ideasCollection = db.collection("ideas")
    const commentCollection = db.collection('comment')

    // show trending data in Home Page 
    app.get("/trending" , async (req ,res)=>{
      const result =await ideasCollection.find().limit(6).toArray();
      res.send(result)
    })
    // main Api with my idea 
    app.get("/ideas" ,async (req ,res )=>{
      const userId = req.query.userId;
      const query = userId ? { userId: userId } : {};
      const result = await ideasCollection.find(query).toArray();
      res.send(result);
    });
    // user My idea delete
    app.delete("/ideas/:id", verifyToken , async (req, res) => {
    const { id } = req.params;
    const result = await ideasCollection.deleteOne({_id :new ObjectId(id)});

    res.send(result);
    });

    //  my idea edit api
    app.patch("/ideas/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const updatedIdea = req.body;

  const filter = {
    _id: new ObjectId(id),
  };

  const updateDoc = {
    $set: {
      title: updatedIdea.title,
      shortDescription: updatedIdea.shortDescription,
      detailedDescription: updatedIdea.detailedDescription,
      category: updatedIdea.category,
      tags: updatedIdea.tags,
      imageUrl: updatedIdea.imageUrl,
      budget: updatedIdea.budget,
      targetAudience: updatedIdea.targetAudience,
      problemStatement: updatedIdea.problemStatement,
      proposedSolution: updatedIdea.proposedSolution,
    },
  };

  const result = await ideasCollection.updateOne(filter, updateDoc);

  res.send(result);
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
    
    //idea  details Api
    app.get("/ideas/:ideaId" , verifyToken ,async (req ,res )=>{
      const {ideaId} = req.params;
      const result = await ideasCollection.findOne({_id :new ObjectId(ideaId)})
      res.send(result)
    })
    // add Data Api
    app.post("/ideas" , verifyToken, async (req ,res) =>{
      const ideasData = req.body;
      const result = await ideasCollection.insertOne(ideasData);
      res.send(result);
    })

    // comment Api 

    // post api 
    app.post('/comment', verifyToken, async (req ,res)=>{
      const commentData =req.body;
      const result = await commentCollection.insertOne(commentData)
      res.send(result)
    })

    // comment get api 
    app.get('/comment' , async (req ,res) => {
      const result = await commentCollection.find().toArray()
      res.send(result)
    })
    app.get('/comment/:detailsDataId' , async (req ,res ) => {
      const {detailsDataId} = req.params;
      const result = await commentCollection.find({detailsDataId :detailsDataId}).toArray()
      res.send(result)
    })
    // my-Comment api
    
    app.get('/my-comment/:userId' , async (req ,res ) => {
      const {userId} = req.params;
      const result = await commentCollection.find({userId :userId}).toArray()
      res.send(result)
    })


  //  comment delete api 

    app.delete("/comment/:id" ,  verifyToken , async (req , res )=>{
      const {id} = req.params;
      const result = await commentCollection.deleteOne({_id :new ObjectId(id)}) ;
      res.send(result)
    })

    // comment edit/update api
    app.patch("/comment/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    const result = await commentCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: { comment },
    }
  );

  res.send(result);
});


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
