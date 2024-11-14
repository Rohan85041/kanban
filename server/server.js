const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost/kanban-board', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

// User model
const User = mongoose.model('User', {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Task model
const Task = mongoose.model('Task', {
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  dueDate: { type: Date },
  status: { type: String, enum: ['to-do', 'in-progress', 'done'], default: 'to-do' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10)
  });

  try {
    await user.save();
    const token = generateToken(user);
    res.status(201).send({ token });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password');

  const isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(400).send('Invalid email or password');

  const token = generateToken(user);
  res.send({ token });
});

app.post('/api/auth/logout', (req, res) => {
  // For this simple example, we'll just destroy the token on the client side
  res.send({ message: 'Logged out successfully' });
});

// Task routes
app.post('/api/tasks', authenticateUser, async (req, res) => {
  const { error } = validateTask(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const task = new Task({
    ...req.body,
    owner: req.user.id
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get('/api/tasks', authenticateUser, async (req, res) => {
  const { status } = req.query;
  const filter = { owner: req.user.id };
  if (status) filter.status = status;

  try {
    const tasks = await Task.find(filter);
    res.send(tasks);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.put('/api/tasks/:id', authenticateUser, async (req, res) => {
  const { error } = validateTask(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).send('Task not found');
    res.send(task);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.patch('/api/tasks/:id/status', authenticateUser, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['to-do', 'in-progress', 'done'];
  if (!validStatuses.includes(status)) {
    return res.status(400).send('Invalid task status');
  }

  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { status },
      { new: true }
    );
    if (!task) return res.status(404).send('Task not found');
    res.send(task);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.delete('/api/tasks/:id', authenticateUser, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!task) return res.status(404).send('Task not found');
    res.send(task);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Middleware
function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, 'secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('Invalid token.');
  }
}

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  return schema.validate(user);
}

function validateTask(task) {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    priority: Joi.string().valid('low', 'medium', 'high'),
    dueDate: Joi.date(),
    status: Joi.string().valid('to-do', 'in-progress', 'done')
  });
  return schema.validate(task);
}

function generateToken(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email }, 'secret-key', {
    expiresIn: '1h'
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));