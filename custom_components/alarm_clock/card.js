class AlarmClockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Please define an entity");
    }
    this.config = config;
  }

  static getStubConfig() {
    return { entity: "alarm_clock.alarm" };
  }

  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }
}

customElements.define("alarm-clock-card", AlarmClockCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "alarm-clock-card",
  name: "Alarm Clock Card",
  preview: false,
  description: "A custom card for managing alarm clock entities",
});
