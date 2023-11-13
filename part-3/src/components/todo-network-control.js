const template = document.createElement("template");

class TodoNetworkControl extends HTMLElement {
  static get observedAttributes() {
    return ["default-latency"];
  }

  #lantencyInput;
  #networkForm;
  #changeNotification;
  #changeNotificationTimeout;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#render({ defaultLatency: this.defaultLatency });
  }

  attributeChangedCallback() {
    this.#render({ defaultLatency: this.defaultLatency });
  }

  get defaultLatency() {
    const parsed = parseInt(this.getAttribute("default-latency"), 10);
    if (isNaN(parsed)) {
      return 0;
    }
    return parsed;
  }

  set defaultLatency(value) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      this.removeAttribute("default-latency");
    }
    this.setAttribute("default-latency", value);
  }

  #handleChange(event) {
    this.#networkForm.requestSubmit();
    // this.#dispatchLatencyChange(event.target.value);
  }

  #handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    this.#dispatchLatencyChange(formData.get("latency"));
  }

  #handleReset(_event) {
    // NOTE: we get the "value" from next tick, since on "reset"
    // the value does not change until then
    this.#dispatchLatencyChange(this.#lantencyInput.getAttribute("value"));
  }

  #dispatchLatencyChange(latency) {
    // FIXME notification should probably be a component
    clearTimeout(this.#changeNotificationTimeout);
    this.#changeNotification.textContent = `Latency has changed to ${latency} ms`;
    this.#changeNotification.classList.remove("hide");
    this.#changeNotificationTimeout = setTimeout(() => {
      this.#changeNotification.classList.add("hide");
    }, 2000);

    this.dispatchEvent(
      new CustomEvent("todo-network-control:change", {
        bubbles: true,
        composed: true,
        detail: { latency },
      })
    );
  }

  #render({ defaultLatency }) {
    if (!this.isConnected) {
      return;
    }

    template.innerHTML = `
      <style>
        .network-form {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .network-form > label {
          font-size: 0.8em;
        }

        .notification {
          color: #47c430;
          font-size: 0.8em;
          margin: 0.5em 0;
        }

        .hide {
          visibility: hidden;
        }
      </style>
      <form class="network-form" action="#">
        <label for="latency">Latency(ms)</label>
        <input
          type="number"
          id="latency"
          name="latency"
          value="${defaultLatency}"
          min="0"
          required
        />
        <input type="reset" value="Reset" />
      </form>
      <span id="changeNotification" class="notification hide">
        Latency has changed to blah
      </span>
    `;
    this.shadowRoot.replaceChildren(template.content.cloneNode(true));

    this.#lantencyInput = this.shadowRoot.querySelector("input[type='number']");
    this.#networkForm = this.shadowRoot.querySelector("form");
    this.#changeNotification =
      this.shadowRoot.getElementById("changeNotification");

    this.shadowRoot.addEventListener("change", this.#handleChange.bind(this));
    this.shadowRoot.addEventListener("reset", this.#handleReset.bind(this));

    this.#networkForm.addEventListener("submit", this.#handleSubmit.bind(this));
  }
}

customElements.define("todo-network-control", TodoNetworkControl);
