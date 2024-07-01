import express from 'express';
import DB from './db.js';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

/** Zentrales Objekt für unsere Express-Applikation */
const app = express();
const db = new DB();
const todoValidationRules = [
    check('title')
        .notEmpty()
        .withMessage('Titel darf nicht leer sein')
        .isLength({ min: 3 })
        .withMessage('Titel muss mindestens 3 Zeichen lang sein'),
    check('due')
        .notEmpty()
        .withMessage('Fälligkeitsdatum darf nicht leer sein')
        .isISO8601()
        .withMessage('Fälligkeitsdatum muss ein gültiges Datum sein'),
    check('status')
        .notEmpty()
        .withMessage('Status darf nicht leer sein')
        .isIn(['Fertig', 'In Arbeit', 'Offen'])
        .withMessage('Status muss "offen" oder "erledigt" sein'),
    check('_id')
        .notEmpty()
        .withMessage('ID darf nicht leer sein')
        .isNumeric()
        .withMessage('ID muss numerisch sein')
  ];
const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Todo API',
        version: '1.0.0',
        description: 'Todo API Dokumentation',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
    },
    apis: ['./index.js'],
    components: 
    {
        schemas: 
        {
            Todo: 
            {
                type: 'object',
                properties: 
                {
                    title: {
                        type: 'string',
                    },
                    due: {
                        type: 'string',
                    },
                    status: {
                        type: 'integer',
                    },
                },
            },
        },
        securitySchemes: 
        {
            bearerAuth: 
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        },
    },
    security: 
    [{
        bearerAuth: []
    }]
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use(cors());  
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(async (req, res, next) => {
    try {
        await db.connect();
        next();
    } catch (error) {
        res.status(500).send("Fehler beim Verbinden zur Datenbank:" + error);
    }
});

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Gibt alle Todos zurück
 *     tags: [Todos]
 *     responses:
 *       '200':
 *         description: Eine Liste aller Todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */
app.get('/todos',todoValidationRules,async (req, res) => { //Ouput: Kompletter Datensatz
    db.queryAll()
    .then(todos => {
        res.json(todos);
    })
    .catch(() => {
        res.status(500).send();
    });
});

/**
 * @swagger
  * /todos/{id}:
 *   get:
 *     summary: Gibt ein einzelnes Todo zurück
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Die ID des Todos
 *     responses:
 *       '201':
 *         description: Das angeforderte Todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       '404':
 *         description: Todo nicht gefunden
 */
app.get('/todos/:id',todoValidationRules, async (req, res) => { //Output: Einzelner Datensatz
    db.queryId(req.params.id)
    .then(todo => {
            res.status(201).json(todo);
    })
    .catch(error => {
        res.status(404).send(error);
    });
});

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Erstellt ein neues Todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       '201':
 *         description: Das erstellte Todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       '422':
 *         description: Ungültige Eingabedaten
 *       '404':
 *         description: Todo nicht gefunden
*/
app.post('/todos',todoValidationRules, async (req, res) => {  //Input: Neuer Datensatz
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
       
    const newTodo = {
        _id: req.body._id,
        title: req.body.title,
        due: req.body.due,
        status: req.body.status
    }
    db.insertReturn(newTodo)
    .then(result => {
       res.status(201).json(result); 
    })
    .catch(() => {
        res.status(404).send();
    });
});

/**
 * @swagger
  *   put:
 *     summary: Aktualisiert ein bestehendes Todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Die ID des zu aktualisierenden Todos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       '201':
 *         description: Das aktualisierte Todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       '422':
 *         description: Ungültige Eingabedaten
 *       '404':
 *         description: Todo nicht gefunden
 */ 
app.put('/todos/:id',todoValidationRules,async (req, res) => { // Update eines Datensatzes
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    
    try{
    db.updateReturn(req.params.id, req.body)
    .then(result => {
        res.status(201).json(result);
    })
    }
    catch(error){
        res.status(404).send(error);
    }
});

/**
 * @swagger
 *   delete:
 *     summary: Löscht ein bestehendes Todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Die ID des zu löschenden Todos
 *     responses:
 *       '201':
 *         description: Das aktualisierte Todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       '422':
 *         description: Ungültige Eingabedaten
 *       '404':
 *         description: Todo nicht gefunden
 */
app.delete('/todos/:id',todoValidationRules,async (req, res) => { //Löschen eines Datensatzes
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    
    db.delete(req.params.id)
    .then(result => {
        res.status(204).json(result);
    })
    .catch(() => {
        res.status(404).send();
    });

});

app.listen(3000);