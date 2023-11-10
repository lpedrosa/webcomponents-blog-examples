const template = document.createElement("template");
template.innerHTML = `
  <style>
    .todo-form {
      display: flex;
      gap: 0.5em;
    }

    .todo-form input[type="text"] {
      flex-grow: 2;
    }

    :host([submitting]) input[type="submit"] {
      opacity: 0.6;
    }
  </style>
  <form class="todo-form" method="post" action="/todo/add">
    <label for="todo-content">New TODO:</label>
    <input
      type="text"
      id="todo-content"
      name="todo-content"
      placeholder="Build something great..."
      required
    />
    <input type="submit" value="Create" />
  </form>
`;

class TodoForm extends HTMLElement {
  #form;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.#form = this.shadowRoot.querySelector("form");
  }

  connectedCallback() {
    this.#form.addEventListener("submit", this.#handleSubmit.bind(this));
  }

  reset() {
    this.#form.reset();
  }

  get submitting() {
    return this.hasAttribute("submitting");
  }

  set submitting(value) {
    value = Boolean(value);
    value
      ? this.setAttribute("submitting", "")
      : this.removeAttribute("submitting");
  }

  #handleSubmit(ev) {
    ev.preventDefault();

    if (this.submitting) {
      return;
    }

    const formData = new FormData(ev.target);
    const todoContent = formData.get("todo-content");

    this.dispatchEvent(
      new CustomEvent("todo-form:new", {
        bubbles: true,
        composed: true,
        detail: { content: todoContent },
      })
    );
  }
}

customElements.define("todo-form", TodoForm);
