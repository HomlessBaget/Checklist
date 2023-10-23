const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

const connection = mysql.createConnection({
  host: '192.168.1.161',
  user: 'nguyen.quoc',
  password: 'jajsempatrik22',
  database: 'checklist',
  port: 3001,
});

connection.connect();

app.post('/', (req, res) => {
  const task = req.body.task;
  const deadline = req.body.deadline;
  const priority = req.body.priority;

  connection.query(
    'INSERT INTO tasks (tasks, deadline, priority) VALUES (?, ?, ?)',
    [task, deadline, priority],
    function (error) {
      if (error) throw error;
      res.redirect('/');
    }
  );
});

app.post('/update/:id', (req, res) => {
  const taskId = req.params.id;
  const isCompleted = req.query.completed === '1'; // Ensure it's '1'

  // Update the task status in the database
  connection.query(
    'UPDATE tasks SET is_completed = ? WHERE id = ?',
    [isCompleted, taskId],
    function (error) {
      if (error) {
        console.error(error);
        res.status(500).send('Error updating task status.');
      } else {
        res.status(200).send('Task status updated.');
      }
    }
  );
});

app.get('/', (req, res) => {
  connection.query('SELECT * FROM tasks', function (error, results) {
    if (error) {
      console.error(error);
      return res.status(500).send('Error retrieving tasks.');
    }

    const tasks = results;
    const todoTasks = tasks.filter((task) => task.is_completed === 0);
    const doneTasks = tasks.filter((task) => task.is_completed === 1);

    res.render('main.ejs', { todoTasks, doneTasks });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
