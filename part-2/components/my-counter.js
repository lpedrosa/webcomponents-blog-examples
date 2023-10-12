class MyCounter extends HTMLElement {
  static get observedAttributes() {
    return ["value"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#render({ counterValue: this.value });
  }

  attributeChangedCallback(_name, _oldValue, _newValue) {
    this.#render({ counterValue: this.value });
  }

  get value() {
    const n = Number.parseInt(this.getAttribute("value"), 10);
    return Number.isNaN(n) ? 0 : n;
  }

  set value(v) {
    const n = Number.parseInt(v, 10);
    this.setAttribute("value", Number.isNaN(n) ? 0 : n);
  }

  #render({ counterValue }) {
    this.shadowRoot.innerHTML = `
      <button id="decrease" type="button">Decrease</button>
      <span>${counterValue}</span>
      <button id="increase" type="button">Increase</button>
    `;

    this.shadowRoot
      .getElementById("decrease")
      .addEventListener("click", (_event) => {
        this.value = this.value - 1;
        this.dispatchEvent(
          new CustomEvent("my-counter:change", {
            bubbles: true,
            composed: true,
            detail: { newValue: this.value },
          })
        );
      });
    this.shadowRoot
      .getElementById("increase")
      .addEventListener("click", (_event) => {
        this.value = this.value + 1;
        this.dispatchEvent(
          new CustomEvent("my-counter:change", {
            bubbles: true,
            composed: true,
            detail: { newValue: this.value },
          })
        );
      });
  }
}

customElements.define("my-counter", MyCounter);
