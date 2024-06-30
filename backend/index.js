import express from 'express';
import cors from 'cors';
/** Zentrales Objekt für unsere Express-Applikation */
const app = express();
app.use(express.json());  
app.use(cors());
/*app.use((req, res, next) => {
    req.db = todo_database;
    next();
});*/

/**
 * Liste aller ToDos. 
 * Wird später durch Datenbank ersetzt!
 */
let TODOS = [
    {
        "_id": 1671056616571,
        "title": "Übung 4 machen",
        "due": "2022-11-12T00:00:00.000Z",
        "status": 0
    },
    {
        "_id": 1671087245763,
        "title": "Für die Klausur Webentwicklung lernen",
        "due": "2023-01-14T00:00:00.000Z",
        "status": 2
    },
    {
        "_id": 1671087245764,
        "title": "Einen Kuchen backen",
        "due": "2023-01-14T00:00:00.000Z",
        "status": 1
    }
];

// Lesen aller ToDos (GET)
app.get('/todos', (req, res) => { //Ouput: Kompletter Datensatz
    res.json(TODOS);
});

// Lesen eines einzelnen ToDos (GET)
app.get('/todos/:id', (req, res) => { //Output: Einzelner Datensatz
    const id = parseInt(req.params.id);
    const todo = TODOS.find(todo => todo._id === id);
    if (todo) {
        res.json(todo);
    } else {
        res.status(404).send();
    }
});

// Erstellen eines neuen ToDos (POST)
app.post('/todos', (req, res) => {  //Input: Neuer Datensatz
    const newTodo = {
        _id: Date.now(),
        title: req.body.title,
        due: req.body.due,
        status: req.body.status
    }
    TODOS.push(newTodo);
    res.status(201).json(newTodo);
});

// Aktualisieren eines ToDos (PUT)
app.put('/todos/:id', (req, res) => { // Update eines Datensatzes
    const id = parseInt(req.params.id);
    const index = TODOS.findIndex(todo => todo._id === id);
    if (index !== -1) {
        const updatedTodo = {
            _id: id,
            title: req.body.title,
            due: req.body.due,
            status: req.body.status
        }
        TODOS[index] = updatedTodo;
        res.json(TODOS[index]);
    } else {
        res.status(404).send();
    }
});

// Löschen eines ToDos (DELETE)
app.delete('/todos/:id', (req, res) => { //Löschen eines Datensatzes
    const id = parseInt(req.params.id);
    const index = TODOS.findIndex(todo => todo._id === id);
    if (index !== -1) {
        TODOS.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).send();
    }
});

app.listen(3000);