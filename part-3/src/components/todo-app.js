import { createTodo, getAllTodos, removeTodo } from "../todo-api.js";
import "./todo-form.js";
import "./todo-list-v2.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    div[id="notifications"] {
      color: red;
    }
  </style>
  <div id="notifications">
  </div>
  <h1>My TODOs</h1>
  <todo-form></todo-form>
  <todo-list-v2 loading></todo-list>
`;

class TodoApp extends HTMLElement {
  #todoForm;
  #todoList;
  #notifications;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.#todoForm = this.shadowRoot.querySelector("todo-form");
    this.#todoList = this.shadowRoot.querySelector("todo-list-v2");
    this.#notifications = this.shadowRoot.querySelector(
      "div[id='notifications']"
    );
  }

  async connectedCallback() {
    const todos = await getAllTodos();
    this.#renderTodos(todos);

    this.addEventListener("todo-holder:done", this.#onTodoDone.bind(this));
    this.addEventListener("todo-form:new", this.#onNewTodo.bind(this));
  }

  async #onTodoDone(ev) {
    const { todoId } = ev.detail;

    const todoHolder = this.#todoList.getTodo(todoId);
    todoHolder.processing = true;

    try {
      await removeTodo(todoId);
      this.#todoList.removeTodo(todoId);
    } catch (err) {
      this.#dispatchNotification(err.toString());
      todoHolder.processing = false;
    }
  }

  async #onNewTodo(ev) {
    const { content } = ev.detail;
    this.#todoForm.submitting = true;

    let newTodo;
    try {
      newTodo = await createTodo(content);
    } catch (err) {
      this.#dispatchNotification(err.toString());
    }

    if (newTodo) {
      // here we opt for loading the entire list
      const todos = await getAllTodos();
      this.#renderTodos(todos);
    }

    this.#todoForm.submitting = false;
    this.#todoForm.reset();
  }

  #dispatchNotification(msg) {
    const messageHolder = document.createElement("p");
    messageHolder.textContent = msg;

    setTimeout(() => this.#notifications.removeChild(messageHolder), 2000);
    this.#notifications.appendChild(messageHolder);
  }

  #renderTodos(todos) {
    this.#todoList.loading = false;
    this.#todoList.replaceTodos(todos);
  }
}

customElements.define("todo-app", TodoApp);
