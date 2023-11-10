class TodoHolder extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  get todoId() {
    return parseInt(this.getAttribute("todo-id"), 10);
  }

  set todoId(value) {
    this.setAttribute("todo-id", value);
  }

  get content() {
    return this.getAttribute("content");
  }

  set content(value) {
    this.setAttribute("content", value);
  }

  get processing() {
    return this.hasAttribute("processing");
  }

  set processing(value) {
    value = Boolean(value);
    value
      ? this.setAttribute("processing", "")
      : this.removeAttribute("processing");
  }

  connectedCallback() {
    this.#render({ content: this.content });
  }

  markDone() {
    if (!this.processing) {
      this.dispatchEvent(
        new CustomEvent("todo-holder:done", {
          bubbles: true,
          composed: true,
          detail: { todoId: this.todoId },
        })
      );
    }
  }

  #render({ content }) {
    this.shadowRoot.innerHTML = `
      <style>
        .todo-holder {
          display: flex;
          align-items: center;
        }

        .todo-holder > span {
          flex: 1 80%;
        }

        :host([processing]) span {
          opacity: 0.6;
        }
        :host([processing]) button {
          opacity: 0.6;
        }
      </style>
      <li>
      <div class="todo-holder">
        <span>${content}</span><button type="button">Done</button>
      </div>
      </li>
    `;

    this.shadowRoot
      .querySelector("button")
      .addEventListener("click", this.markDone.bind(this));
  }
}

customElements.define("todo-holder", TodoHolder);
