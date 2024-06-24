export class AuthManager {
    constructor(api) {
        this.api = api;
        this.user = null;
        this.listeners = [];
    }

    init(button) {
        this.button = button;
        this.button.addEventListener('click', this.toggleAuth.bind(this));
        this.checkAuth();
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const user = await this.api.request('/me');
                this.setUser(user);
            } catch (error) {
                this.setUser(null);
            }
        } else {
            this.setUser(null);
        }
    }

    async toggleAuth() {
        if (this.user) {
            await this.logout();
        } else {
            await this.login();
        }
    }

    async login() {
        const username = prompt('Enter username:');
        const password = prompt('Enter password:');
        try {
            const { token, user } = await this.api.login({ username, password });
            localStorage.setItem('token', token);
            this.setUser(user);
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please try again.');
        }
    }

    async logout() {
        try {
            await this.api.logout();
            localStorage.removeItem('token');
            this.setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    setUser(user) {
        this.user = user;
        this.button.textContent = user ? 'Logout' : 'Login';
        this.notifyListeners();
    }

    onAuthStateChanged(listener) {
        this.listeners.push(listener);
        listener(this.user);
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.user));
    }
}
