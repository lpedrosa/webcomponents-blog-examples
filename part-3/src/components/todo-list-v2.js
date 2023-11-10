import "./todo-holder.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    .todo-list {
      padding-inline-start: 1.5em;
    }
    #empty {
      color: #a6a6a6;
    }
    .hide {
      display: none;
    }
  </style>
  <p id="loading" class="hide">Loading TODOs...</p>
  <div id="list-wrapper">
    <p id="empty">The list is empty</p>
    <ul class="todo-list">
      <slot name="item"></slot>
    </ul>
  </div>
`;

class TodoListV2 extends HTMLElement {
  static get observedAttributes() {
    return ["loading"];
  }

  #emptyListElement;
  #loadingListElement;
  #listWrapper;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#render();

    this.#emptyListElement = this.shadowRoot.querySelector("[id='empty']");
    this.#loadingListElement = this.shadowRoot.querySelector("[id='loading']");
    this.#listWrapper = this.shadowRoot.querySelector("[id='list-wrapper']");

    this.#renderLoading();

    this.shadowRoot.addEventListener(
      "slotchange",
      this.#handleSlotChange.bind(this)
    );
  }

  attributeChangedCallback() {
    this.#renderLoading();
  }

  get loading() {
    return this.hasAttribute("loading");
  }

  set loading(value) {
    value = Boolean(value);
    value ? this.setAttribute("loading", "") : this.removeAttribute("loading");
  }

  addTodo(todo) {
    const { todoId, content } = todo;

    const todoHolder = document.createElement("todo-holder");
    todoHolder.todoId = todoId;
    todoHolder.content = content;
    todoHolder.slot = "item";

    this.appendChild(todoHolder);
  }

  replaceTodos(todos) {
    this.clearTodos();

    const elements = todos.map(({ todoId, content }) => {
      const todoHolder = document.createElement("todo-holder");
      todoHolder.todoId = todoId;
      todoHolder.content = content;
      todoHolder.slot = "item";
      return todoHolder;
    });

    this.append(...elements);
  }

  getTodo(todoId) {
    return this.querySelector(`todo-holder[todo-id="${todoId}"]`);
  }

  removeTodo(todoId) {
    this.getTodo(todoId)?.remove();
  }

  clearTodos() {
    const allTodos = Array.from(this.querySelectorAll("[slot='item']"));
    allTodos.forEach((todoElement) => {
      this.removeChild(todoElement);
    });
  }

  #handleSlotChange(event) {
    const slot = event.target;
    const elements = slot.assignedElements();

    // toggle display empty list element based on todo items size
    if (
      !this.#emptyListElement.classList.contains("hide") &&
      elements.length !== 0
    ) {
      this.#emptyListElement.classList.add("hide");
    }

    if (
      this.#emptyListElement.classList.contains("hide") &&
      elements.length === 0
    ) {
      this.#emptyListElement.classList.remove("hide");
    }
  }

  #render() {
    if (!this.isConnected) {
      return;
    }

    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  #renderLoading() {
    if (!this.isConnected) {
      return;
    }

    if (this.loading) {
      this.#loadingListElement?.classList.remove("hide");
      this.#listWrapper?.classList.add("hide");
    } else {
      this.#loadingListElement?.classList.add("hide");
      this.#listWrapper?.classList.remove("hide");
    }
  }
}

customElements.define("todo-list-v2", TodoListV2);
