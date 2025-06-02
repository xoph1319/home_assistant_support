import styles from "./styles.js";

class AlarmCard extends HTMLElement {
  set hass(hass) {
    if (!this._initialized) {
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `
        <style>${styles}</style>
        <ha-card header="Alarm Clock">
          <div class="card-content">
            <div id="alarms"></div>
            <div class="add-alarm">
              <mwc-button @click="${this._addAlarm}">Add Alarm</mwc-button>
            </div>
          </div>
        </ha-card>
      `;

      this._initialized = true;
      this._hass = hass;
      this._alarms = [];
    }

    const alarms = Object.values(hass.states).filter((entity) =>
      entity.entity_id.startsWith("alarm_clock.")
    );

    if (JSON.stringify(alarms) !== JSON.stringify(this._alarms)) {
      this._alarms = alarms;
      this._renderAlarms();
    }
  }

  _renderAlarms() {
    const alarmsDiv = this.shadowRoot.querySelector("#alarms");
    alarmsDiv.innerHTML = "";

    this._alarms.forEach((alarm) => {
      const alarmDiv = document.createElement("div");
      alarmDiv.className = "alarm-item";

      const time = alarm.attributes.time;
      const enabled = alarm.attributes.enabled;
      const repeat = alarm.attributes.repeat;
      const days = alarm.attributes.days;

      alarmDiv.innerHTML = `
        <div class="alarm-row">
          <div class="alarm-time">
            <input type="time" value="${time}" 
              @change="${(e) =>
                this._updateTime(alarm.entity_id, e.target.value)}">
          </div>
          <div class="alarm-controls">
            <ha-switch
              .checked="${enabled}"
              @change="${(e) => this._toggleAlarm(alarm.entity_id)}">
            </ha-switch>
            <ha-icon-button
              .path="${
                enabled
                  ? "M9,7H11V12H16V14H9V7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"
                  : "M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z"
              }"
              @click="${(e) => this._toggleAlarm(alarm.entity_id)}">
            </ha-icon-button>
            <ha-icon-button
              .path="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"
              @click="${(e) => this._removeAlarm(alarm.entity_id)}">
            </ha-icon-button>
          </div>
        </div>
        <div class="alarm-details">
          <div class="days-selector">
            ${["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
              .map(
                (day) => `
              <mwc-button
                class="${days.includes(day) ? "selected" : ""}"
                @click="${(e) => this._toggleDay(alarm.entity_id, day)}">
                ${day.charAt(0).toUpperCase()}
              </mwc-button>
            `
              )
              .join("")}
          </div>
          <div class="repeat-toggle">
            <ha-switch
              .checked="${repeat}"
              @change="${(e) => this._toggleRepeat(alarm.entity_id)}">
            </ha-switch>
            <span>Repeat</span>
          </div>
        </div>
      `;

      alarmsDiv.appendChild(alarmDiv);
    });
  }

  _addAlarm() {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    this._hass.callService("alarm_clock", "add_alarm", {
      name: `Alarm ${this._alarms.length + 1}`,
      time: time,
      enabled: true,
      repeat: false,
      days: [],
    });
  }

  _toggleAlarm(entityId) {
    this._hass.callService("alarm_clock", "toggle_alarm", {
      entity_id: entityId,
    });
  }

  _updateTime(entityId, time) {
    this._hass.callService("alarm_clock", "set_time", {
      entity_id: entityId,
      time: time,
    });
  }

  _toggleDay(entityId, day) {
    const alarm = this._alarms.find((a) => a.entity_id === entityId);
    const days = [...alarm.attributes.days];

    if (days.includes(day)) {
      days.splice(days.indexOf(day), 1);
    } else {
      days.push(day);
    }

    this._hass.callService("alarm_clock", "set_days", {
      entity_id: entityId,
      days: days,
    });
  }

  _toggleRepeat(entityId) {
    const alarm = this._alarms.find((a) => a.entity_id === entityId);

    this._hass.callService("alarm_clock", "set_repeat", {
      entity_id: entityId,
      repeat: !alarm.attributes.repeat,
    });
  }

  _removeAlarm(entityId) {
    this._hass.callService("alarm_clock", "remove_alarm", {
      entity_id: entityId,
    });
  }

  static getConfigElement() {
    return document.createElement("alarm-card-editor");
  }

  static getStubConfig() {
    return {};
  }
}

customElements.define("alarm-card", AlarmCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "alarm-card",
  name: "Alarm Clock Card",
  description: "A card to manage alarm clock entities",
});
