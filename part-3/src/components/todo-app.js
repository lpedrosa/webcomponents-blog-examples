import { TodoApiClient } from "../todo-api.js";
import "./todo-form.js";
import "./todo-list-v2.js";
import "./todo-network-control.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    div[id="notifications"] {
      color: red;
    }
    #network-control {
      margin: 1em 0;
      padding: 0 1em;
      border-color: #a9c8fb;
      border-radius: 0.2em;
      border-width: 2px;
      border-style: solid;
      background-color: #f0f3f7;
    }
  </style>
  <div id="network-control">
    <p>Change the API latency below:</p>
    <todo-network-control default-latency="2000"></todo-network-control>
  </div>
  <div id="notifications">
  </div>
  <h1>My TODOs</h1>
  <todo-form></todo-form>
  <todo-list-v2 loading></todo-list>
`;

class TodoApp extends HTMLElement {
  #todoClient;
  #networkControl;
  #todoForm;
  #todoList;
  #notifications;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#todoClient = new TodoApiClient();
  }

  async connectedCallback() {
    this.#render();

    const todos = await this.#todoClient.getAll();
    this.#renderTodos(todos);

    this.addEventListener("todo-holder:done", this.#onTodoDone.bind(this));
    this.addEventListener("todo-form:new", this.#onNewTodo.bind(this));

    // latency control setup
    this.#todoClient.inducedLatency = this.#networkControl.defaultLatency;
    this.addEventListener(
      "todo-network-control:change",
      this.#onLatency.bind(this)
    );
  }

  async #onTodoDone(ev) {
    const { todoId } = ev.detail;

    const todoHolder = this.#todoList.getTodo(todoId);
    todoHolder.processing = true;

    try {
      await this.#todoClient.remove(todoId);
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
      newTodo = await this.#todoClient.create(content);
    } catch (err) {
      this.#dispatchNotification(err.toString());
    }

    if (newTodo) {
      // here we opt for loading the entire list
      const todos = await this.#todoClient.getAll();
      this.#renderTodos(todos);
    }

    this.#todoForm.submitting = false;
    this.#todoForm.reset();
  }

  #onLatency(event) {
    const { latency } = event.detail;
    this.#todoClient.inducedLatency = latency;
  }

  #dispatchNotification(msg) {
    const messageHolder = document.createElement("p");
    messageHolder.textContent = msg;

    setTimeout(() => this.#notifications.removeChild(messageHolder), 2000);
    this.#notifications.appendChild(messageHolder);
  }

  #render() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.#networkControl = this.shadowRoot.querySelector(
      "todo-network-control"
    );
    this.#todoForm = this.shadowRoot.querySelector("todo-form");
    this.#todoList = this.shadowRoot.querySelector("todo-list-v2");
    this.#notifications = this.shadowRoot.querySelector(
      "div[id='notifications']"
    );
  }

  #renderTodos(todos) {
    this.#todoList.loading = false;
    this.#todoList.replaceTodos(todos);
  }
}

customElements.define("todo-app", TodoApp);
