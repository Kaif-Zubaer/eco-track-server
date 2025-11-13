const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zn65wpu.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('WELCOME TO ECO TRACK SERVER')
})

async function run() {
    try {
        await client.connect();

        const db = client.db('eco_track_db');
        const challengesCollection = db.collection('challenges');
        const tipsCollection = db.collection('tips');
        const eventsCollection = db.collection('events');

        // CHALLENGES RELATED API
        app.get('/challenges', async (req, res) => {
            const email = req.query.email;
            const query = {};

            if (email) {
                query.createdBy = email;
            }

            const cursor = challengesCollection.find(query).sort({ startDate: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/challenges/:id', async (req, res) => {
            const id = req.params.id;
            const qurey = { _id: new ObjectId(id) };
            const result = await challengesCollection.findOne(qurey);
            res.send(result);
        })

        app.post('/challenges', async (req, res) => {
            const newChallenge = req.body;
            const result = await challengesCollection.insertOne(newChallenge);
            res.send(result);
        })

        app.patch('/challenges/:id', async (req, res) => {
            const id = req.params.id;
            const updatedChallenge = req.body;
            const qurey = { _id: new ObjectId(id) };
            const update = {
                $set: updatedChallenge,
            }
            const options = {};
            const result = await challengesCollection.updateOne(qurey, update, options);
            res.send(result);
        })

        app.delete('/challenges/:id', async (req, res) => {
            const id = req.params.id;
            const qurey = { _id: new ObjectId(id) };
            const result = await challengesCollection.deleteOne(qurey);
            res.send(result);
        })

        // TIPS RELATED API
        app.get('/tips', async (req, res) => {
            const email = req.query.email;
            const query = {};

            if (email) {
                query.author = email;
            }

            const cursor = tipsCollection.find(query).sort({ createdAt: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        // EVENTS RELATED API
        app.get('/events', async (req, res) => {
            const email = req.query.email;
            const query = {};

            if (email) {
                query.organizer = email;
            }

            const cursor = eventsCollection.find(query).sort({ date: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`EcoTrack server is running on port: ${port}`);
})