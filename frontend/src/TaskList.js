import axios from 'axios';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Update port if needed

const TaskList = () => {
	const [tasks, setTasks] = useState([]);
	const [taskName, setTaskName] = useState('');

	const fetchTasks = () => {
		axios
			.get('http://localhost:3000/tasks')
			.then((res) => setTasks(res.data))
			.catch((err) => console.error(err));
	};

	useEffect(() => {
		fetchTasks();

		socket.on('taskAdded', (newTask) => {
			setTasks((prev) => [...prev, newTask]);
		});

		socket.on('taskUpdated', (updatedTask) => {
			setTasks((prev) => prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
		});

		socket.on('taskDeleted', (deletedId) => {
			setTasks((prev) => prev.filter((task) => task._id !== deletedId));
		});

		return () => {
			socket.off('taskAdded');
			socket.off('taskUpdated');
			socket.off('taskDeleted');
		};
	}, []);

	const handleAddTask = () => {
		if (!taskName.trim()) return;

		axios
			.post('http://localhost:3000/tasks', {
				name: taskName,
				status: false,
			})
			.then(() => setTaskName(''))
			.catch((err) => console.error('Error creating task:', err));
	};

	const markComplete = (id) => {
		axios
			.patch(`http://localhost:3000/tasks/${id}/complete`)
			.catch((err) => console.error('Error marking complete:', err));
	};

	const deleteTask = (id) => {
		axios
			.delete(`http://localhost:3000/tasks/${id}`)
			.catch((err) => console.error('Error deleting task:', err));
	};

	return (
		<div style={{ paddingTop: '20px' }}>
			<h2>📝 Task List</h2>

			<div style={{ marginBottom: '20px' }}>
				<input
					type="text"
					value={taskName}
					onChange={(e) => setTaskName(e.target.value)}
					placeholder="Enter new task"
					style={{ padding: '8px', marginRight: '10px', width: '250px' }}
				/>
				<button onClick={handleAddTask} style={{ padding: '8px 16px' }}>
					➕ Add Task
				</button>
			</div>

			<ul>
				{tasks.length === 0 ? (
					<p>No tasks found or backend not reachable.</p>
				) : (
					tasks.map((task) => (
						<li key={task._id} style={{ marginBottom: '8px' }}>
							{task.name} — {task.status ? '✅ Done' : '❌ Pending'}{' '}
							{!task.status && (
								<button onClick={() => markComplete(task._id)} style={{ marginRight: '5px' }}>
									✔️ Complete
								</button>
							)}
							<button onClick={() => deleteTask(task._id)}>🗑️ Delete</button>
						</li>
					))
				)}
			</ul>
		</div>
	);
};

export default TaskList;
