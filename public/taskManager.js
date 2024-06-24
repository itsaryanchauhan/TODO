export class TaskManager {
    constructor(api) {
        this.api = api;
    }

    init(form, list) {
        this.form = form;
        this.list = list;
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.list.addEventListener('click', this.handleListClick.bind(this));
    }

    async loadTasks() {
        try {
            const tasks = await this.api.getTasks();
            this.renderTasks(tasks);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const task = {
            title: this.form.elements['task-title'].value,
            description: this.form.elements['task-desc'].value,
            date: this.form.elements['task-date'].value,
            time: this.form.elements['task-time'].value
        };

        try {
            await this.api.addTask(task);
            this.form.reset();
            this.loadTasks();
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    }

    async handleListClick(event) {
        if (event.target.classList.contains('delete-btn')) {
            const taskId = event.target.dataset.id;
            try {
                await this.api.deleteTask(taskId);
                this.loadTasks();
            } catch (error) {
                console.error('Failed to delete task:', error);
            }
        }
    }

    renderTasks(tasks) {
        this.list.innerHTML = tasks.map(task => `
            <li>
                <strong>${task.title}</strong>
                <p>${task.description}</p>
                <p>${task.date} ${task.time}</p>
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            </li>
        `).join('');
    }
}