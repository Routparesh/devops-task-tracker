import React from 'react';
import TaskList from './TaskList';

const App = () => {
	return (
		<div style={{ padding: '20px', fontFamily: 'Arial' }}>
			<h1>🚀 DevOps Task Tracker</h1>
			<TaskList />
		</div>
	);
};

export default App;
