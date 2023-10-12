import "./my-counter.js";

const ReactionState = Object.freeze({
  Low: { message: "Now it's too low!" },
  Normal: { message: "Looks good." },
  High: { message: "It's way to high" },
});

class CounterReaction extends HTMLElement {
  #reactionState;
  #counterValue;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#reactionState = ReactionState.Normal;
    this.#counterValue = 5;
  }

  connectedCallback() {
    this.#update();

    this.addEventListener("my-counter:change", (event) => {
      const counterValue = event.detail.newValue;

      if (counterValue > 10) {
        this.#reactionState = ReactionState.High;
        this.#counterValue = counterValue;
        this.#update();
      } else if (counterValue < 1) {
        this.#reactionState = ReactionState.Low;
        this.#counterValue = counterValue;
        this.#update();
      } else {
        this.#reactionState = ReactionState.Normal;
        this.#counterValue = counterValue;
        this.#update();
      }
    });
  }

  #update() {
    this.#render({
      reactionMessage: this.#reactionState.message,
      counterValue: this.#counterValue,
    });
  }

  #render({ reactionMessage, counterValue }) {
    this.shadowRoot.innerHTML = `
      <p>${reactionMessage}</p>
      <my-counter value=${counterValue}></my-counter>
    `;
  }
}

customElements.define("counter-reaction", CounterReaction);
