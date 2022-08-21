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
                res.send({ message: "User already exists" });
            } else {
                await usersCollection.insertOne(incomingUser);
                res.send({ user: incomingUser, message: "User created" });
            }
        }
        );

        //API for user login
        app.get("/users/:email", async (req, res) => {
            const { email } = req.params;
            const user = await usersCollection.findOne({ email });
            if (user) {
                res.send(user);
            } else {
                res.send({ message: "User not found" });
            }
        });

        //API to update user.password
        app.put("/users/:email", async (req, res) => {
            const { email } = req.params;
            const { password } = req.body;
            console.log(email, password);
            const user = await usersCollection.findOne({ email });
            if (user) {
                await usersCollection.updateOne({ email }, { $set: { password } });
                res.send({ message: "Password updated" });
            } else {
                res.send({ message: "User does not exist" });
            }
        }
        );

        //API to post a new article
        app.post("/articles", async (req, res) => {
            const article = req.body;
            await articleCollection.insertOne(article);
            res.send({ message: "Article created" });
        }
        );

        //Get signle article by id
        app.get("/articles/:id", async (req, res) => {
            const { id } = req.params;
            const article = await articleCollection.findOne({ _id: ObjectId(id) });
            res.send(article);
        })

        //API to update an article
        app.put("/articles/:id", async (req, res) => {
            const id = req.params.id;
            const article = req.body;
            const result = await articleCollection.updateOne({ _id: ObjectId(id) }, { $set: article });
            res.send(result);
        }
        );

        //API to delete an article
        app.delete("/articles/:id", async (req, res) => {
            const id = req.params.id;
            await articleCollection.deleteOne({ _id: ObjectId(id) });
            res.send({ message: "Article deleted" });
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