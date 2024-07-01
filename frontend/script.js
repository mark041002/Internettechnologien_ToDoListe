let TODOS;
const url = 'http://localhost:3000/todos';
const status = ['Fertig', 'In Arbeit', 'Offen'];
    
//document.addEventListener('DOMContentLoaded', init);


//Initialisierung der Seite

async function init(){
    const button = document.getElementById('create-todo');
    const todoListDiv = document.createElement('div');
    todoListDiv.className = 'todo-list';
    todoListDiv.id = 'todo-list';
    button.insertAdjacentElement("afterend", todoListDiv);
    const response = await fetch(url);
    TODOS = await response.json();
    loadTodos();
}



//Laden aller Todos
function loadTodos(){
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

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    
    const editButton = document.createElement('button');
    editButton.className = 'todo-edit';
    editButton.textContent = 'Bearbeiten';
    editButton.addEventListener('click',() => editTodo(todoElement));
    buttonContainer.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'todo-delete';
    deleteButton.textContent = 'Loeschen'; 
    deleteButton.addEventListener('click', () => deleteTodo(todoElement));
    buttonContainer.appendChild(deleteButton);

    todoElement.appendChild(buttonContainer);
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

    const buttonContainer = document.createElement('div');

    const editInput = document.createElement('button');
    editInput.className = 'todo-edit';
    editInput.id = 'input-edit';
    editInput.textContent = 'Speichern';
    editInput.addEventListener('click', async () =>      //Hier ist der eigentliche Update Teil
    {
        const updateTodo = {
            _id: todoElement.dataset.id,
            title: titleInput.value,
            due: dueInput.value,
            status: statusInput.value
        };
        const response = await fetch(url+ '/' + updateTodo._id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateTodo)
        });
        const result = await response.json();
        console.log(result);
        const index = TODOS.findIndex(todo => todo._id === result._id);
        TODOS[index] = result;
        loadTodos();
   });
    buttonContainer.appendChild(editInput);

    const cancelButton = document.createElement('button');
    cancelButton.className = 'todo-delete';
    cancelButton.id = 'input-cancel';
    cancelButton.textContent = 'Abbrechen';
    cancelButton.addEventListener('click',() => loadTodos());
    buttonContainer.appendChild(cancelButton);
    todoElement.replaceChild(buttonContainer, todoElement.querySelector('.button-container'));
}

//Löschen eines Todos mit Implementierung des Backends (DELETE)
async function deleteTodo(todoElement){
    const index = TODOS.findIndex(todo => todo._id === todoElement.dataset.id);
    const todo = TODOS[index];
    const response = await fetch(url + '/' + todo._id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo)
    });
    TODOS.splice(index, 1);
    todoElement.remove();
}


//Erstellen eines neuen Todos
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
    status.forEach(status => 
        { //Erstellt für jeden Status ein Option-Element
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            state.appendChild(option);
        });
    stateLabel.appendChild(state);

    const buttonContainer = document.createElement('div');

    const submitButton = document.createElement('button');
    submitButton.className = 'todo-edit';
    submitButton.id = 'submit';
    submitButton.type = 'submit';
    submitButton.textContent = 'To-Do hinzufügen';
    buttonContainer.appendChild(submitButton);

    const cancelButton = document.createElement('button');
    cancelButton.className = 'todo-delete';
    cancelButton.id = 'cancel';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Abbrechen';
    cancelButton.addEventListener('click',() => document.body.removeChild(overlay));
    buttonContainer.appendChild(cancelButton);

    form.appendChild(buttonContainer);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await addTodo();
        cancelButton.click();
    });
    overlay.appendChild(form);
    document.body.appendChild(overlay);
}

//Hinzufügen eines Todos mit Implementierung des Backends (POST)
async function addTodo()
{
    const todo = {
        _id: Date.now().toString(),
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


