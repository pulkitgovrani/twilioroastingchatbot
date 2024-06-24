import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const App = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [reminder, setReminder] = useState('');
  const [reminderType, setReminderType] = useState('minutes');
  const [agreed, setAgreed] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const handleAddTask = () => {
    if (task.trim()) {
      let reminderInMs;
      if (reminderType === 'minutes') {
        reminderInMs = reminder * 60000;
      } else if (reminderType === 'hours') {
        reminderInMs = reminder * 3600000;
      } else if (reminderType === 'days') {
        reminderInMs = reminder * 86400000;
      }
      const newTask = { text: task, reminder: reminderInMs, completed: false, number: whatsappNumber };
      const newTasks = [...tasks, newTask];
      setTasks(newTasks);
      setTask('');
      setReminder('');

      // Send tasks to backend
      axios.post('http://localhost:3000/api/tasks', newTasks)
        .then(response => {
          console.log(response.data.message);
        })
        .catch(error => {
          console.error('Error sending tasks:', error);
        });
    }
  };

  const handleCompleteTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const handleDeleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);

    // Send updated tasks to backend
    axios.post('http://localhost:3000/api/tasks', newTasks)
      .then(response => {
        console.log(response.data.message);
      })
      .catch(error => {
        console.error('Error sending tasks:', error);
      });
  };

  const handleSetupComplete = () => {
    setIsSetupComplete(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center mb-8">Complete or Get Roast by AI</h1>
        {!isSetupComplete ? (
          <>
            <div className="mb-4">
              <label htmlFor="whatsappNumber" className="block text-gray-400">WhatsApp Number</label>
              <input
                type="text"
                id="whatsappNumber"
                className="w-full mt-2 p-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                placeholder="Enter your WhatsApp number"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <input
                type="checkbox"
                id="agreement"
                className="mr-2"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="agreement" className="text-gray-400">
                This to-do list is used to encourage users to work on their goals by roasting them. By clicking this, you agree you are using it for fun purposes.
              </label>
            </div>
            <button
              onClick={handleSetupComplete}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-600"
              disabled={!whatsappNumber || !agreed}
            >
              Confirm
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="task" className="block text-gray-400">New Task</label>
              <input
                type="text"
                id="task"
                className="w-full mt-2 p-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                placeholder="Enter your task"
                value={task}
                onChange={(e) => setTask(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="reminder" className="block text-gray-400">Reminder</label>
              <div className="flex">
                <input
                  type="number"
                  id="reminder"
                  className="flex-1 mt-2 p-2 border border-gray-600 rounded-l-lg bg-gray-700 text-white"
                  placeholder="Enter reminder time"
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                />
                <select
                  className="flex-1 mt-2 p-2 border border-gray-600 rounded-r-lg bg-gray-700 text-white"
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value)}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleAddTask}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Add Task
            </button>
            <ul className="mt-8">
              {tasks.map((task, index) => (
                <li key={index} className={`p-4 rounded-lg mb-4 ${task.completed ? 'bg-green-600' : 'bg-gray-700'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`text-lg ${task.completed ? 'line-through' : ''}`}>{task.text}</p>
                      {task.reminder && (
                        <p className="text-sm text-gray-400">Reminder: {task.reminder / (reminderType === 'minutes' ? 60000 : reminderType === 'hours' ? 3600000 : 86400000)} {reminderType}</p>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => handleCompleteTask(index)}
                        className="mr-2 text-green-300 hover:text-green-400"
                      >
                        {task.completed ? 'Undo' : 'Complete'}
                      </button>
                      <button
                        onClick={() => handleDeleteTask(index)}
                        className="text-red-300 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
