const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ['http://task.paresh.work'],
		methods: ['GET', 'POST', 'PATCH', 'DELETE'],
		credentials: true,
	},
});

app.use(cors());
app.use(express.json());

const mongoURL = process.env.MONGO_URL || 'mongodb://mongo:27017/devops_demo';

mongoose.connect(mongoURL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const Task = mongoose.model('Task', {
	name: String,
	status: Boolean,
});

// WebSocket connection
io.on('connection', (socket) => {
	console.log('A client connected');

	socket.on('disconnect', () => {
		console.log('A client disconnected');
	});
});

// Routes
app.get('/', (req, res) => res.send('🚀 DevOps Practice API Running'));

app.get('/tasks', async (req, res) => {
	const tasks = await Task.find();
	res.json(tasks);
});

app.post('/tasks', async (req, res) => {
	const task = new Task(req.body);
	await task.save();
	io.emit('taskAdded', task); // Broadcast to all clients
	res.json(task);
});

// Mark task as complete
app.patch('/tasks/:id/complete', async (req, res) => {
	try {
		const updatedTask = await Task.findByIdAndUpdate(
			req.params.id,
			{ status: true },
			{ new: true }
		);
		io.emit('taskUpdated', updatedTask);
		res.json(updatedTask);
	} catch (err) {
		res.status(500).json({ error: 'Failed to mark task as complete' });
	}
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
	try {
		await Task.findByIdAndDelete(req.params.id);
		io.emit('taskDeleted', req.params.id);
		res.json({ message: 'Task deleted' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to delete task' });
	}
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`🚀 Backend API listening on http://0.0.0.0:${PORT}`);
});
