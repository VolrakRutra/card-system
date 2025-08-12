export class MenuHandler {
  isOpen = false;
  openMenuIcon: HTMLDivElement | null = null;
  closeMenuIcon: HTMLDivElement | null = null;
  menuContainer: HTMLDivElement | null = null;

  constructor() {
    this.openMenuIcon = document.querySelector<HTMLDivElement>("#open-menu");
    this.closeMenuIcon = document.querySelector<HTMLDivElement>("#close-menu");
    this.menuContainer =
      document.querySelector<HTMLDivElement>("#menu-container");

    this.menuContainer?.setAttribute("data-state", "closed");
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    if (!this.menuContainer) return;
    this.openMenuIcon?.style.setProperty("display", "none");
    this.closeMenuIcon?.style.setProperty("display", "block");

    this.menuContainer.setAttribute("data-state", "opening");

    this.menuContainer.setAttribute("data-state", "open");
    this.isOpen = true;
  }

  close() {
    if (!this.menuContainer) return;
    this.openMenuIcon?.style.setProperty("display", "block");
    this.closeMenuIcon?.style.setProperty("display", "none");

    this.menuContainer.setAttribute("data-state", "closing");

    const onDone = (e: TransitionEvent) => {
      if (e.propertyName !== "opacity") {
        return;
      }
      this.menuContainer?.setAttribute("data-state", "closed");
      this.menuContainer?.removeEventListener("transitionend", onDone);
    };
    this.menuContainer.addEventListener("transitionend", onDone);

    this.isOpen = false;
  }
}
