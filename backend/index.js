import express from 'express';
import DB from './db.js';
import { check, validationResult } from 'express-validator';

/** Zentrales Objekt für unsere Express-Applikation */
const app = express();
const db = new DB();
app.use(express.json());  

app.use(async (req, res, next) => {
    try {
        await db.connect();
        next();
    } catch (error) {
        res.status(500).send("Fehler beim Verbinden zur Datenbank:" + error);
    }
});

// Lesen aller ToDos (GET)
app.get('/todos', (req, res) => { //Ouput: Kompletter Datensatz
    db.queryAll()
    .then(todos => {
        res.json(todos);
    })
    .catch(() => {
        res.status(500).send();
    });
});

// Lesen eines einzelnen ToDos (GET)
app.get('/todos/:id', (req, res) => { //Output: Einzelner Datensatz
    db.queryById(req.params.id)
    .then(todo => {
            res.json(todo);
    })
    .catch(error => {
        res.status(500).send(error);
    });
});

// Erstellen eines neuen ToDos (POST)
app.post('/todos', (req, res) => {  //Input: Neuer Datensatz
    const newTodo = {
        _id: Date.now().toString(),
        title: req.body.title,
        due: req.body.due,
        status: req.body.status
    }
    db.insert(newTodo)
    .then(result => {
       res.status(201).json(result); 
    })
    .catch(() => {
        res.status(500).send();
    });
});

// Aktualisieren eines ToDos (PUT)
app.put('/todos/:id', (req, res) => { // Update eines Datensatzes
    db.update(req.params.id, req.body);
    return res.json(db.queryById(req.params.id));
        
});

// Löschen eines ToDos (DELETE)
app.delete('/todos/:id', (req, res) => { //Löschen eines Datensatzes
    db.delete(req.params.id)
    .then(result => {
        res.status(204).json(result);
    })
    .catch(() => {
        res.status(500).send();
    });

});

app.listen(3000);