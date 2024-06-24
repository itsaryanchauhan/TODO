export class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    getTasks() {
        return this.request('/tasks');
    }

    addTask(task) {
        return this.request('/tasks', 'POST', task);
    }

    updateTask(id, task) {
        return this.request(`/tasks/${id}`, 'PUT', task);
    }

    deleteTask(id) {
        return this.request(`/tasks/${id}`, 'DELETE');
    }

    login(credentials) {
        return this.request('/login', 'POST', credentials);
    }

    logout() {
        return this.request('/logout', 'POST');
    }
}