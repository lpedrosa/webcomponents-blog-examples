import "./todo-holder.js";

class TodoList extends HTMLElement {
  static get observedAttributes() {
    return ["loading"];
  }

  #todos;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.#todos = [];
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    this.#render();
  }

  replaceTodos(todos) {
    this.#todos = todos;
    this.#render();
  }

  getTodo(todoId) {
    // FIXME this method shouldn't really return an Element instance
    // this is because callers can just call things like `Element.remove()`
    // and mess up internal state.
    //
    // Instead we should return a custom TodoItem class or something like that
    return this.shadowRoot.querySelector(`todo-holder[id="${todoId}"]`);
  }

  removeTodo(todoId) {
    this.#todos = this.#todos.filter((t) => t.todoId !== todoId);
    this.#render();
  }

  get loading() {
    return this.hasAttribute("loading");
  }

  set loading(value) {
    value = Boolean(value);
    value ? this.setAttribute("loading", "") : this.removeAttribute("loading");
  }

  #render() {
    if (!this.isConnected) {
      return;
    }

    let listContent;
    if (this.loading) {
      listContent = `<p>Loading todos...</p>`;
    } else {
      if (this.#todos.length === 0) {
        listContent = `<p>No TODOs to show</p>`;
      } else {
        const items = this.#todos
          .map(
            (t) => `
            <todo-holder id="${t.todoId}" content="${t.content}"></todo-holder>
          `
          )
          .join("");
        listContent = `
        <ul class="todo-list">
          ${items}
        </ul>
      `;
      }
    }

    this.shadowRoot.innerHTML = `
      <style>
        .todo-list {
          padding-inline-start: 1.5em;
        }
      </style>
      ${listContent}
    `;
  }
}

customElements.define("todo-list", TodoList);
