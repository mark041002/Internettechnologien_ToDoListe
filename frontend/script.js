let TODOS;
const url = 'http://localhost:3000/todos';
const status = ['done', 'doing', 'open'];
    
//document.addEventListener('DOMContentLoaded', init);


//Initialisierung der Seite

function init(){
    const button = document.getElementById('create-todo');
    const todoListDiv = document.createElement('div');
    todoListDiv.id = 'todo-list';
    button.insertAdjacentElement("afterend", todoListDiv);
    loadTodos();
}



//Laden aller Todos
async function loadTodos(){
    const response = await fetch(url);
    TODOS = await response.json();
    document.getElementById('todo-list').innerHTML = '';
    const todoList = document.getElementById('todo-list');
    TODOS.forEach(todo => addTodoToDOM(todo,todoList));
}


//Hinzufügen eines Todos in die DOM-Struktur
function addTodoToDOM(todo,todoList){
    const todoElement = document.createElement('div');
    todoElement.className = 'todo';
    todoElement.dataset.id = todo._id;
        
    const titleElement = document.createElement('div');
    titleElement.className = 'todo-title';
    titleElement.type = 'text';
    titleElement.textContent = todo.title;
    todoElement.appendChild(titleElement);

    const dueElement = document.createElement('datetime-local');
    dueElement.className = 'todo-due';
    dueElement.type = 'datetime-local';
    dueElement.value = todo.due;
    dueElement.textContent = new Date(todo.due).toLocaleString(); //Konvertiert den Wert des DateTime-Elements in ein lesbares Datum
    todoElement.appendChild(dueElement);

    const statusElement = document.createElement('div');
    statusElement.className = 'todo-status';
    statusElement.type = 'text';
    statusElement.textContent = todo.status;
    todoElement.appendChild(statusElement);

    const editButton = document.createElement('button');
    editButton.className = 'todo-edit';
    editButton.textContent = 'Bearbeiten';
    editButton.addEventListener('click',() => editTodo(todoElement));
    todoElement.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'todo-delete';
    deleteButton.textContent = 'Loeschen'; 
    deleteButton.addEventListener('click', () => deleteTodo(todoElement));
    todoElement.appendChild(deleteButton);

    todoList.appendChild(todoElement);
}


//Bearbeiten eines Todos mit Implementierung des Backends (PUT)
function editTodo(todoElement)
{    
    const titleInput = document.createElement('input');
    titleInput.className = 'input-title';
    titleInput.type = 'text';
    titleInput.value = todoElement.querySelector('.todo-title').textContent;
    todoElement.replaceChild(titleInput, todoElement.querySelector('.todo-title'));

    const dueInput = document.createElement('input');
    dueInput.className = 'input-due';
    dueInput.type = 'datetime-local';
    dueInput.value = new Date(todoElement.querySelector('.todo-due').value).toISOString().slice(0, 16); //Konvertiert den Wert des DateTime-Elements in ein ISO-String, und schneidet ab Sekunden ab
    todoElement.replaceChild(dueInput, todoElement.querySelector('.todo-due'));


    const statusInput = document.createElement('select');
    statusInput.className = 'input-status';
    status.forEach(status => { //Erstellt für jeden Status ein Option-Element
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        if (status === todoElement.querySelector('.todo-status').textContent) //Checkt ob der Status des Todos dem Status des Selects entspricht
        {
            option.selected = true;
        }
        statusInput.appendChild(option);
        });
    todoElement.replaceChild(statusInput, todoElement.querySelector('.todo-status'));

    const editInput = document.createElement('button');
    editInput.className = 'input-edit';
    editInput.textContent = 'Speichern';
    editInput.addEventListener('click', async () =>      //Hier ist der eigentliche Update Teil
    {const id = todoElement.dataset.id;
        const updateTodo = {
            title: titleInput.value,
            due: dueInput.value,
            status: statusInput.value
        };
        const response = await fetch(url+ '/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateTodo)
        });
        const todo = await response.json();
        const index = TODOS.findIndex(todo => todo.id === Number(id));
        TODOS[index] = todo;
        loadTodos();
   });
    todoElement.replaceChild(editInput, todoElement.querySelector('.todo-edit'));

}
//Hinzufügen eines Todos mit Implementierung des Backends (POST)
async function addTodo()
{
    const todo = {
        id: Date.now(),
        title: document.getElementById('title').value,
        due: document.getElementById('dueDate').value,
        status: document.getElementById('state').value
    };
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo)
    });
    const newTodo = await response.json();
    TODOS.push(newTodo);
    loadTodos();
}


//Löschen eines Todos mit Implementierung des Backends (DELETE)
async function deleteTodo(todoElement){
    const id = todoElement.dataset.id;
    const response = await fetch(url + '/' + id, { method: 'DELETE' });
    const index = TODOS.findIndex(todo => todo._id === id);
    TODOS.splice(index, 1);
    todoElement.remove();
}



function createTodo() {
    
    const overlay = document.createElement('div');
    overlay.id = 'todo-overlay';
    const form = document.createElement('form');
    form.id = 'todo-form';


    const ueberschrift = document.createElement('h1');
    ueberschrift.textContent = 'Neues To-Do';
    form.appendChild(ueberschrift);

    const titleLabel = document.createElement('label');
    titleLabel.htmlFor = 'title';
    titleLabel.textContent = 'Titel:';
    form.appendChild(titleLabel);

    const titleInput = document.createElement('input');
    titleInput.id = 'title';
    titleInput.type = 'text';
    titleInput.required = true;
    titleInput.placeholder = 'Was ist zu tun?';
    titleLabel.appendChild(titleInput);

    const dueDateLabel = document.createElement('label');
    dueDateLabel.htmlFor = 'dueDate';
    dueDateLabel.textContent = 'Bis:';
    form.appendChild(dueDateLabel);

    const dueDate = document.createElement('input');
    dueDate.id = 'dueDate';
    dueDate.type = 'datetime-local';
    dueDate.required = true;
    dueDateLabel.appendChild(dueDate);

    const stateLabel = document.createElement('label');
    stateLabel.htmlFor = 'state';
    stateLabel.textContent = 'Status:';
    form.appendChild(stateLabel);

    const state = document.createElement('select');
    state.id = 'state';
    state.type = 'text';
    state.required = true;
    status.forEach(status => { //Erstellt für jeden Status ein Option-Element
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        state.appendChild(option);
        });
    stateLabel.appendChild(state);


    const submitButton = document.createElement('button');
    submitButton.id = 'submit';
    submitButton.type = 'submit';
    submitButton.textContent = 'To-Do hinzufügen';
    submitButton.addEventListener('click', () => addTodo() && cancelButton.click());
    form.appendChild(submitButton);

    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancel';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Abbrechen';
    cancelButton.addEventListener('click',() => document.body.removeChild(overlay));
    form.appendChild(cancelButton);

    //overlay.addEventListener('click', () => document.body.removeChild(overlay));
    overlay.appendChild(form);
    document.body.appendChild(overlay);
}




