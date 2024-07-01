import { MongoClient, ObjectId } from 'mongodb';

const url = 'mongodb://localhost:27017/todos';
const dbName = 'todos';
let db = null;
let collection = null;

export default class DB {
    async connect() {
        try{
        let client = await MongoClient.connect(url)
        db = client.db(dbName);
        collection = db.collection('todos');
        } catch (error) {
            console.log("Fehler beim Verbinden zur Datenbank:" + error);
            if (collection == null) {
                console.log("Keine Verbindung zur Datenbank");
            }
        }
    }

    // Lesen aller ToDos (GET)
    queryAll() {
        return collection.find().toArray();
    }
    // Lesen eines einzelnen ToDos (GET)
    queryId(id) {
        return collection.findOne({_id: id});
    }
    // Aktualisieren eines ToDos (PUT)
    async updateReturn(id, todo) {
        await collection.updateOne({_id: id}, {$set: todo}); 
        return collection.findOne({_id: id});
    }
    // Löschen eines ToDos (DELETE)
    delete(id) {
        return collection.deleteOne({_id: id});
    }
    // Erstellen eines neuen ToDos (POST)
    async insertReturn(todo) {
        await collection.insertOne(todo);
        return collection.findOne(todo);
    }
}