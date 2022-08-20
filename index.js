const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

const corsFonfig = {
    origin: true,
    Credentials: true,
}
app.use(cors(corsFonfig));
app.options("*", cors(corsFonfig));
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y4mhh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db("AccrossTheGlobeTask");
        const articleCollection = db.collection("article");
        const groupCollection = db.collection("group");
        const usersCollection = db.collection("users");

        // API to Run Server
        app.get("/", async (req, res) => {
            res.send("Server is Running");
        }
        );

        // API to get all articles
        app.get("/articles", async (req, res) => {
            const articles = await articleCollection.find({}).toArray();
            res.send(articles)
        }
        );

        //API to get all groups
        app.get("/groups", async (req, res) => {
            const groups = await groupCollection.find({}).toArray();
            res.send(groups)
        }
        );


        //API to post a unique user
        app.post("/users/:email", async (req, res) => {
            const { email } = req.params;
            const incomingUser = req.body;
            const user = await usersCollection.findOne({ email });
            if (user) {
                res.send("User already exists");
            } else {
                await usersCollection.insertOne(incomingUser);
                res.send("User created");
            }
        }
        );

        //API for user login
        app.get("/users/:email", async (req, res) => {
            const { email } = req.params;
            const loginRequest = req.body;
            const user = await usersCollection.findOne({ email });
            if (user) {
                if (user.password === loginRequest.password) {
                    res.send("Login Successful");
                } else {
                    res.send("Login Failed");
                }
            } else {
                res.send("User does not exist");
            }
        });

        //API to update user.password
        app.put("/users/:email", async (req, res) => {
            const { email } = req.params;
            const { password } = req.body;
            const user = await usersCollection.findOne({ email });
            if (user) {
                await usersCollection.updateOne({ email }, { $set: { password } });
                res.send("Password updated");
            } else {
                res.send("User does not exist");
            }
        }
        );

        //API to post a new article
        app.post("/articles", async (req, res) => {
            const article = req.body;
            await articleCollection.insertOne(article);
            res.send("Article created");
        }
        );

        //API to update an article
        app.put("/articles/:id", async (req, res) => {
            const id = req.params.id;
            const article = req.body;
            await articleCollection.updateOne({ _id: ObjectId(id) }, { $set: article });
            res.send("Article updated");
        }
        );

        //API to delete an article
        app.delete("/articles/:id", async (req, res) => {
            const id = req.params.id;
            await articleCollection.deleteOne({ _id: ObjectId(id) });
            res.send("Article deleted");
        }
        );



        // API to get all users
        app.get("/users", async (req, res) => {
            const users = await usersCollection.find({}).toArray();
            res.send(users)
        }
        );


    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => console.log(`Listening on port ${port}`));