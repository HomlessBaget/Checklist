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
app.use('/css', express.static(path.join(__dirname, 'styles/css'))); //Css link

const connection = mysql.createConnection({
  host: '192.168.1.161',
  user: 'nguyen.quoc',
  password: 'jajsempatrik22',
  database: 'checklist',
  port: 3001,
});

connection.connect();

//inserts new data into the database
app.post('/', (req, res) => {
  const task = req.body.task;
  const datetime = req.body.datetime; // This will capture the date and time input.
  const priority = req.body.priority;

  connection.query(
    'INSERT INTO tasks (tasks, deadline, priority) VALUES (?, ?, ?)', // Include datetime
    [task, datetime, priority], // Add datetime variable
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

// Displays tasks in table rows
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

app.post('/delete/:id', (req, res) => {
  const taskId = req.params.id;

  // Smazat záznam z obou tabulek (To-Do Task a Done Task)
  connection.query(
    'DELETE FROM tasks WHERE id = ?',
    [taskId],
    function (error) {
      if (error) {
        console.error(error);
        res.status(500).send('Error deleting the task in the database');
      } else {
        res.status(200).send('Task deleted successfully');
      }
    }
  );
});


app.get('/tasks', (req, res) => {
  connection.query('SELECT * FROM tasks', function (error, results) {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving tasks.' });
    } else {
      res.status(200).json(results);
    }
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})
