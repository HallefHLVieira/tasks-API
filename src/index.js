const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
    const user = users.find(user => user.username === username);

    if(!user){
        return response.status(404).json({error: "User not found!"});
    }

    request.user = user;

    return next();
}

function checksExistsUserAndTodo(request, response, next) {
  const {id} = request.params;
  const {username} = request.headers;

  const user = users.find(user => user.username === username);

    if(user){
      const todo = user.todos.find(todo => todo.id === id);

      if(!todo){
        return response.status(404).json({error: "Todo not found!"});
      }
      request.user = user;
      request.todo = todo;
      return next();

    }else{

      return response.status(404).json({error: "User not found!"});
    }

}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userExists = users.find(user => user.username === username);

  if(userExists){
      return response.status(400).json({error: "User already exists!"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;

  const todo = {
    id: uuidv4(),
    title,
    done:false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAndTodo, (request, response) => {
  const {title, deadline} = request.body;
  const {todo} = request;
  const {user} = request;

  const todo_index = user.todos.findIndex(
    index_todo => index_todo.id === todo.id);

  user.todos[todo_index].title = title;
  user.todos[todo_index].deadline = new Date(deadline);

  return response.status(201).json(user.todos[todo_index]);
});

app.patch('/todos/:id/done', checksExistsUserAndTodo, (request, response) => {
  const {todo} = request;
  const {user} = request;

  const todo_index = user.todos.findIndex(
    index_todo => index_todo.id === todo.id);

  user.todos[todo_index].done = true;
  return response.status(201).json(user.todos[todo_index]);
});

app.delete('/todos/:id', checksExistsUserAndTodo, (request, response) => {
  const {todo} = request;
  const {user} = request;

  const todo_index = user.todos.findIndex(
    index_todo => index_todo.id === todo.id);

  user.todos.splice(todo_index,1);
  return response.status(204).send();
});

module.exports = app;