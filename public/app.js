import { ApiClient } from './apiClient.js';
import { TaskManager } from './taskManager.js';
import { AuthManager } from './authManager.js';

const api = new ApiClient('/api');
const taskManager = new TaskManager(api);
const authManager = new AuthManager(api);

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const authButton = document.getElementById('auth-button');

    authManager.init(authButton);
    taskManager.init(taskForm, taskList);

    authManager.onAuthStateChanged((user) => {
        if (user) {
            taskForm.style.display = 'block';
            taskManager.loadTasks();
        } else {
            taskForm.style.display = 'none';
            taskList.innerHTML = '';
        }
    });
});