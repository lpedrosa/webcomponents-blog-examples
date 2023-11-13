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

export class TodoApiClient {
  #todos;
  #nextTodoId;

  constructor(opts = {}) {
    this.inducedLatency = opts?.inducedLatency ?? DEFAULT_SLEEP_TIME_MS;
    this.#todos = INITIAL_TODOS;
    this.#nextTodoId = Math.max(...INITIAL_TODOS.map((t) => t.todoId)) + 1;
  }

  async create(content) {
    const newTodo = {
      todoId: this.#nextTodoId++,
      content,
      done: false,
    };

    this.#todos.push(newTodo);

    return new Promise((resolve) =>
      setTimeout(resolve, this.inducedLatency)
    ).then(() => ({ ...newTodo }));
  }

  async getAll() {
    return new Promise((resolve) =>
      setTimeout(resolve, this.inducedLatency)
    ).then(() => [...this.#todos]);
  }

  async remove(todoId) {
    this.#todos = this.#todos.filter((todo) => todo.todoId !== todoId);
    return new Promise((resolve) => setTimeout(resolve, this.inducedLatency));
  }
}
