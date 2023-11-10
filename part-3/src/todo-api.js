const DEFAULT_SLEEP_TIME_MS = 2000;

const INITIAL_TODOS = [
  {
    todoId: 1,
    content: "An example todo",
    done: false,
  },
  {
    todoId: 2,
    content: "A longer example TODO with many words in it",
    done: false,
  },
];

let todos = INITIAL_TODOS;

let nextTodoId = 3;

export async function createTodo(content) {
  const newTodo = {
    todoId: nextTodoId++,
    content,
    done: false,
  };

  todos.push(newTodo);

  return new Promise((resolve) =>
    setTimeout(resolve, DEFAULT_SLEEP_TIME_MS)
  ).then(() => ({ ...newTodo }));
}

export async function getAllTodos() {
  return new Promise((resolve) =>
    setTimeout(resolve, DEFAULT_SLEEP_TIME_MS)
  ).then(() => [...todos]);
}

export async function removeTodo(todoId) {
  todos = todos.filter((todo) => todo.todoId !== todoId);
  return new Promise((resolve) => setTimeout(resolve, DEFAULT_SLEEP_TIME_MS));
}
