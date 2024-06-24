const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const JWT_SECRET = 'your-secret-key';  // In production, use a secure secret

const users = [
    { id: 1, username: 'admin', password: 'admin', role: 'admin' },
    { id: 2, username: 'guest', password: 'guest', role: 'guest' }
];

const tasks = [];

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

async function checkPolicy(user, action, resource) {
    const input = { input: { user, action, resource } };
    try {
        const response = await fetch('http://localhost:8181/v1/data/todoapp/allow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });
        const result = await response.json();
        return result.result;
    } catch (error) {
        console.error('Error checking policy:', error);
        return false;
    }
}

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } else {
        res.status(400).send('Invalid credentials');
    }
});

app.post('/api/logout', authenticateToken, (req, res) => {
    // In a real application, you might want to invalidate the token here
    res.sendStatus(200);
});

app.get('/api/me', authenticateToken, (req, res) => {
    res.json(req.user);
});

app.get('/api/tasks', authenticateToken, async (req, res) => {
    if (await checkPolicy(req.user, 'read', 'tasks')) {
        res.json(tasks);
    } else {
        res.sendStatus(403);
    }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
    if (await checkPolicy(req.user, 'create', 'tasks')) {
        const task = { id: tasks.length + 1, ...req.body };
        tasks.push(task);
        res.status(201).json(task);
    } else {
        res.sendStatus(403);
    }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    if (await checkPolicy(req.user, 'delete', 'tasks')) {
        const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
        if (index !== -1) {
            tasks.splice(index, 1);
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(403);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
