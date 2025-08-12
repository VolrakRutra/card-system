import { rotateClockwiseSvg, rotateCounterClockwiseSvg } from "../icons";

interface EventData<T extends any = any> {
  data: T;
}

export class OptionClickEvent extends Event implements EventData<string> {
  static eventTypes = {
    optionClick: "option-click",
  };

  data: string;

  constructor(clicked: string) {
    const eventType = OptionClickEvent.eventTypes.optionClick;
    super(eventType, { bubbles: true, cancelable: true, composed: true });
    this.data = clicked;
  }
}

export type OptionData = {
  value: string;
  content: string;
};

export const allOptions = [
  { value: "flip", content: "Flip" },
  {
    value: "rotate-cw",
    content: `<div style="display: flex; align-items:center; justify-content: space-between; gap: 1rem;">Rotate ${rotateClockwiseSvg}</div>`,
  },
  {
    value: "rotate-ccw",
    content: `<div style="display: flex; align-items:center; justify-content: space-between; gap: 1rem;">Rotate ${rotateCounterClockwiseSvg}</div>`,
  },
  {
    value: "discard",
    content: "Discard",
  },
];

export class ContextMenu extends HTMLElement {
  static tagName = "context-menu";

  static define(): void {
    customElements.define(ContextMenu.tagName, ContextMenu);
  }

  static create(attributes: Record<string, string> = {}): ContextMenu {
    if (!customElements.get(ContextMenu.tagName)) {
      ContextMenu.define();
    }

    const elem = document.createElement(ContextMenu.tagName) as ContextMenu;

    for (let [k, v] of Object.entries(attributes)) {
      elem.setAttribute(k, v);
    }
    return elem;
  }
  constructor(options: OptionData[]) {
    super();

    for (let opt of options) {
      const { content, value } = opt;
      const elem = document.createElement("div");
      elem.classList.add("context-menu-item");
      elem.innerHTML = content;
      this.append(elem);
      elem.addEventListener("click", () => {
        const event = new OptionClickEvent(value);
        this.dispatchEvent(event);
      });
    }
  }

  hide() {
    this.style.setProperty("display", "none");
  }
  show() {
    this.style.setProperty("display", "block");
  }
}

customElements.define("context-menu", ContextMenu);
