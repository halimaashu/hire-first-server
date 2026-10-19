const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

client
  .connect(() => {
    console.log("mongo db connected");
  })
  .catch(console.dir);

const database = client.db("hire_loop_db");
const jobsCollection = database.collection("job");
const companyCollection = database.collection("company");
const userCollection = database.collection("user");
const applicationsCollection = database.collection("applications");
//  jobs related api

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// get all users
app.get("/users", async (req, res) => {
  try {
    const result = await userCollection.find().toArray();
    res.status(201).json({
      message: "ok",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed to access the users" });
  }
});
// Update user role
app.post("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await userCollection.updateOne(
      { _id: id },
      { $set: { role: "pro" } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Update error:", error);

    return res.status(500).json({
      success: false,
      message: "Database update failed",
    });
  }
});


app.get("/api/allJobs", async (req, res) => {
  const result = await jobsCollection.find().skip(64).toArray();
  res.send(result);
});
// find by unique id
app.get("/api/allJobs/:id", async (req, res) => {
  const id = req.params.id;

  const query = { _id: new ObjectId(id) };

  const result = await jobsCollection.findOne(query);

  res.send(result);
});

// Application related Api
app.get("/api/applications", async (req, res) => {
  const query = {};
  if (req.query.jobId) {
    query.jobId = req.query.jobId;
  }
  if (req.query.applicantId) {
    query.applicantId = req.query.applicantId;
  }
  const cursor = applicationsCollection.find(query);
  const result = await cursor.toArray();
  // console.log(result,";;;;;;;;;;;;;;;;;;;;;;;;;;;;")
  res.send(result);
});
app.post("/api/applications", async (req, res) => {
  const applicationData = await req.body;
  const application = {
    ...applicationData,
    applicationDate: new Date(),
  };
  const result = await applicationsCollection.insertOne(application);
  res.send(result);
});

// ✅ FIXED ROUTE (THIS IS THE ONLY CORRECT WAY)
app.post("/jobs", async (req, res) => {
  try {
    const job = req.body;
    const newJob = {
      ...job,
      createDate: new Date(),
    };
    const result = await jobsCollection.insertOne(newJob);
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
app.get("/api/jobs", async (req, res) => {
  const query = {};
  if (req.query.companyId) {
    query.companyId = req.query.companyId;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }
  const jobs = await jobsCollection.find(query).toArray();
  res.send(jobs);
});

// Company routes is here
app.get("/api/my/companies", async (req, res) => {
  const query = {};

  if (req.query.recruiterId) {
    query.recruiterId = req.query.recruiterId;
  }

  const result = await companyCollection.findOne(query);
  // console.log(result,"on the _________-----")
  res.send(result || {});
});
app.post("/api/companies", async (req, res) => {
  try {
    const company = req.body;
    const newCompany = {
      ...company,
      createDate: new Date(),
    };
    const result = await companyCollection.insertOne(newCompany);
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
// get all companies
app.get("/api/companies",async(req,res)=>{
  try{
    const result= await companyCollection.find().toArray()
    res.json(result)

  }catch(error){
    console.log(error)
    res.status(400).json({message:"Failed to access the users"})
  }
})

console.log("MongoDB connected successfully");

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
