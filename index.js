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
        const howItWorksStepsCollection = db.collection('how_it_works_steps');
        const usersCollection = db.collection('users');
        const userChallengesCollection = db.collection('user_challenges');

        // USER REELATED API
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email };
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                res.send({ message: 'USER ALREADY EXITS' })
            }
            else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }
        })

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

        // USER CHALLENGES RELATED API
        app.get('/user_challenges', async (req, res) => {
            const email = req.query.email;
            const query = {};

            if (email) {
                query.userId = email;
            }

            const cursor = userChallengesCollection.find(query).sort({ startDate: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/user_challenges', async (req, res) => {
            try {
                const newUserChallenge = req.body;
                const result = await userChallengesCollection.insertOne(newUserChallenge);

                await challengesCollection.updateOne(
                    { _id: new ObjectId(newUserChallenge.challengeId) },
                    { $inc: { participants: 1 } }
                );

                res.send({ success: true, insertedId: result.insertedId });
            } catch (error) {
                console.error(error);
                res.status(500).send({ success: false, error: 'Failed to join challenge' });
            }
        });

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

        // HOW IT WORKS STEPS RELATED API
        app.get('/how_it_works_steps', async (req, res) => {
            const cursor = howItWorksStepsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`EcoTrack server is running on port: ${port}`);
})