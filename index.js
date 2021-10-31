const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();
// Initialize Port Number
const port = process.env.PORT || 5000;

// Initializing Application
const app = express();

// Application MiddleWare
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.p4naa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const run = async () => {
	try {
		await client.connect(() => {
			console.log('Database connection established');
		});
		// DataBase
		const db = client.db('holidays_travel');
		// Selecting Collections
		const events = db.collection('events');
		const bookings = db.collection('orders');

		app.post('/events', async (req, res) => {
			const event = req.body;
			const result = await events.insertOne(event);
			res.send(result.acknowledged);
		});

		app.get('/events', async (req, res) => {
			const limit = req.query.limit;
			if (limit) {
				const cursor = events.find({}).sort({ _id: -1 }).limit(parseInt(limit));
				const result = await cursor.toArray();
				res.send(JSON.stringify(result));
			} else {
				const cursor = events.find({});
				const result = await cursor.toArray();
				res.send(JSON.stringify(result));
			}
		});
		app.delete('/events/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await events.deleteOne(query);
			res.send(JSON.stringify(result));
		});
		app.get('/events/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await events.findOne(query);
			res.send(JSON.stringify(result));
		});
		// For Specific User
		app.get('/my-events', async (req, res) => {
			const id = req.query.user;
			const query = { user: id };
			const result = await events.find(query).toArray();
			res.send(JSON.stringify(result));
		});
		app.put('/events/:id', async (req, res) => {
			const id = req.params.id;
			const updateEvents = {
				$set: req.body,
			};
			const query = { _id: ObjectId(id) };
			const result = await events.updateOne(query, updateEvents);
			res.send(JSON.stringify(result));
		});

		// bookings API
		app.post('/bookings', async (req, res) => {
			const booking = req.body;
			const result = await bookings.insertOne(booking);
			res.send(result.acknowledged);
		});
		app.get('/bookings', async (req, res) => {
			const result = await bookings.find({}).toArray();
			res.send(JSON.stringify(result));
		});
	} finally {
		// await client.close();
	}
};
run().catch(console.dir);

// Listening Server On Port
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
