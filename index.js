const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = process.env.MONGO_DB_URI;

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

    const database = client.db("hire_loop_db");
    const jobsCollection = database.collection("job");

    // ✅ FIXED ROUTE (THIS IS THE ONLY CORRECT WAY)
    app.post("/jobs", async (req, res) => {
      try {
        const newJob = req.body;
        const result = await jobsCollection.insertOne(newJob);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });
    app.get("/api/jobs",async (req,res)=>{
      const query={};
      if(req.query.companyId){
        query.companyId=req.query.companyId;
      }
      if(req.query.status){
        query.status=req.query.status;
      }
      const jobs=await jobsCollection.find(query).toArray();
      res.send(jobs);
    });

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.log(err);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});