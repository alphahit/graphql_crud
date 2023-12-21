
import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = "mongodb+srv://prateeklipu:vsnWvHXu71ob3SMa@cluster0.iytbv1e.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  let db;
  
  async function connect() {
    try {
      await client.connect();
      db = client.db("gamedatabase"); // Specify your database name
      console.log("Connected successfully to MongoDB");
    } catch (error) {
      console.error("Could not connect to MongoDB", error);
    }
  }
  
  function getDb() {
    return db;
  }
  
  export { connect, getDb };