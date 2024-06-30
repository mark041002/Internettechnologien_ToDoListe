import { MongoClient, ObjectId } from 'mongodb';

const url = 'mongodb://localhost:27017/todos';
const dbName = 'todos';

let db = null;
let collection = null;
export default class DB {
    async connect() {
        return MongoClient.connect(url)
            .then(function (client) {
                db = client.db(dbName);
                collection = db.collection('todos');
            })
    }

    // Lesen aller ToDos (GET)
    queryAll() {
        return collection.find().toArray()
    }
    // Lesen eines einzelnen ToDos (GET)
    async queryById(id) {
        return await collection.findOne({_id: id});
    }
    // Aktualisieren eines ToDos (PUT)
    update(id, todo) {
        let test = new ObjectId(id);
        collection.updateOne({_id: id}, {$set: todo}); 
        return Promise.resolve();
    }
    // Löschen eines ToDos (DELETE)
    delete(id) {
        return collection.deleteOne({_id: id});
    }
    // Erstellen eines neuen ToDos (POST)
    insert(todo) {
        return collection.insertOne(todo);
    }
}