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
      const entityId = alarm.entity_id;

      alarmDiv.innerHTML = `
        <div class="alarm-row">
          <div class="alarm-time">
            <input type="time" value="${time}" 
              @change="${(e) => this._updateTime(entityId, e.target.value)}">
          </div>
          <div class="alarm-controls">
            <ha-switch
              .checked="${enabled}"
              @change="${(e) => this._toggleAlarm(entityId)}">
            </ha-switch>
            <ha-icon-button
              .path="${
                enabled
                  ? "M9,7H11V12H16V14H9V7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"
                  : "M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z"
              }"
              @click="${(e) => this._toggleAlarm(entityId)}">
            </ha-icon-button>
            <ha-icon-button
              .path="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"
              @click="${(e) => this._removeAlarm(entityId)}">
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
                @click="${(e) => this._toggleDay(entityId, day)}">
                ${day.charAt(0).toUpperCase()}
              </mwc-button>
            `
              )
              .join("")}
          </div>
          <div class="repeat-toggle">
            <ha-switch
              .checked="${repeat}"
              @change="${(e) => this._toggleRepeat(entityId)}">
            </ha-switch>
            <span>Repeat</span>
          </div>
        </div>
        <div class="automation-section">
          <div class="automation-header">
            <h3>Automations</h3>
            <ha-icon-button
              .path="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
              @click="${(e) => this._showAutomationDialog(entityId)}">
            </ha-icon-button>
          </div>
          <div class="automation-list" id="automation-list-${entityId}">
            ${this._renderAutomations(entityId)}
          </div>
        </div>
      `;

      alarmsDiv.appendChild(alarmDiv);
    });
  }

  _renderAutomations(entityId) {
    const automations = Object.values(this._hass.states)
      .filter((entity) => entity.entity_id.startsWith("automation."))
      .filter((automation) => {
        const config = automation.attributes.trigger || [];
        return config.some(
          (trigger) =>
            trigger.platform === "state" && trigger.entity_id === entityId
        );
      });

    if (automations.length === 0) {
      return '<div class="no-automations">No automations configured</div>';
    }

    return automations
      .map(
        (automation) => `
      <div class="automation-item">
        <div class="automation-name">${
          automation.attributes.friendly_name || automation.entity_id
        }</div>
        <div class="automation-controls">
          <ha-switch
            .checked="${automation.state === "on"}"
            @change="${(e) => this._toggleAutomation(automation.entity_id)}">
          </ha-switch>
          <ha-icon-button
            .path="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
            @click="${(e) => this._editAutomation(automation.entity_id)}">
          </ha-icon-button>
          <ha-icon-button
            .path="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
            @click="${(e) => this._removeAutomation(automation.entity_id)}">
          </ha-icon-button>
        </div>
      </div>
    `
      )
      .join("");
  }

  async _showAutomationDialog(entityId) {
    const devices = await this._hass.callWS({ type: "device/list" });
    const services = await this._hass.callWS({ type: "get_services" });

    const content = document.createElement("div");
    content.innerHTML = `
      <div class="automation-dialog">
        <h2>Create Automation</h2>
        <div class="form-field">
          <label>Name</label>
          <input type="text" id="automation-name" placeholder="Automation name">
        </div>
        <div class="form-field">
          <label>Action Type</label>
          <select id="action-type">
            <option value="light">Light Control</option>
            <option value="script">Run Script</option>
            <option value="scene">Activate Scene</option>
            <option value="media_player">Media Player</option>
            <option value="notify">Send Notification</option>
          </select>
        </div>
        <div id="action-config"></div>
      </div>
    `;

    const actionTypeSelect = content.querySelector("#action-type");
    const actionConfig = content.querySelector("#action-config");

    actionTypeSelect.addEventListener("change", () => {
      this._updateActionConfig(
        actionConfig,
        actionTypeSelect.value,
        devices,
        services
      );
    });

    // Initialize with first option
    this._updateActionConfig(actionConfig, "light", devices, services);

    this._hass
      .callService("browser_mod", "dialog", {
        dialog: "generic",
        title: "Create Automation",
        content: content.innerHTML,
        dismissable: true,
        confirmation: true,
        confirm_text: "Create",
        cancel_text: "Cancel",
      })
      .then((result) => {
        if (result) {
          this._createAutomation(entityId, content);
        }
      });
  }

  _updateActionConfig(container, type, devices, services) {
    let html = '<div class="form-field">';

    switch (type) {
      case "light":
        const lights = devices.filter((device) =>
          device.entities.some((entity) =>
            entity.entity_id.startsWith("light.")
          )
        );
        html += `
          <label>Select Light</label>
          <select id="light-select">
            ${lights
              .map(
                (light) => `
              <option value="${
                light.entities.find((e) => e.entity_id.startsWith("light."))
                  .entity_id
              }">
                ${light.name}
              </option>
            `
              )
              .join("")}
          </select>
          <div class="form-field">
            <label>Brightness</label>
            <input type="range" id="brightness" min="0" max="100" value="100">
          </div>
          <div class="form-field">
            <label>Transition (seconds)</label>
            <input type="number" id="transition" min="0" max="300" value="30">
          </div>
        `;
        break;

      case "media_player":
        const players = devices.filter((device) =>
          device.entities.some((entity) =>
            entity.entity_id.startsWith("media_player.")
          )
        );
        html += `
          <label>Select Media Player</label>
          <select id="player-select">
            ${players
              .map(
                (player) => `
              <option value="${
                player.entities.find((e) =>
                  e.entity_id.startsWith("media_player.")
                ).entity_id
              }">
                ${player.name}
              </option>
            `
              )
              .join("")}
          </select>
          <div class="form-field">
            <label>Action</label>
            <select id="media-action">
              <option value="play">Play</option>
              <option value="volume_set">Set Volume</option>
            </select>
          </div>
        `;
        break;

      case "notify":
        html += `
          <label>Notification Text</label>
          <input type="text" id="notification-text" placeholder="Enter message">
        `;
        break;
    }

    html += "</div>";
    container.innerHTML = html;
  }

  async _createAutomation(entityId, dialogContent) {
    const name = dialogContent.querySelector("#automation-name").value;
    const type = dialogContent.querySelector("#action-type").value;

    let action;
    switch (type) {
      case "light":
        const light = dialogContent.querySelector("#light-select").value;
        const brightness = dialogContent.querySelector("#brightness").value;
        const transition = dialogContent.querySelector("#transition").value;
        action = {
          service: "light.turn_on",
          target: {
            entity_id: light,
          },
          data: {
            brightness_pct: parseInt(brightness),
            transition: parseInt(transition),
          },
        };
        break;

      case "media_player":
        const player = dialogContent.querySelector("#player-select").value;
        const mediaAction = dialogContent.querySelector("#media-action").value;
        action = {
          service: `media_player.${mediaAction}`,
          target: {
            entity_id: player,
          },
        };
        break;

      case "notify":
        const message = dialogContent.querySelector("#notification-text").value;
        action = {
          service: "notify.notify",
          data: {
            message: message,
          },
        };
        break;
    }

    const automation = {
      alias: name,
      description: `Automation for ${entityId}`,
      trigger: {
        platform: "state",
        entity_id: entityId,
        to: "triggered",
      },
      action: action,
    };

    await this._hass.callService("automation", "reload");
    await this._hass.callApi("POST", "config/automation/config", automation);
    this._renderAlarms();
  }

  _toggleAutomation(automationId) {
    this._hass.callService("automation", "toggle", {
      entity_id: automationId,
    });
  }

  async _editAutomation(automationId) {
    // Open the automation editor in Home Assistant
    this._hass.navigate(
      `/config/automation/edit/${automationId.split(".")[1]}`
    );
  }

  async _removeAutomation(automationId) {
    if (confirm("Are you sure you want to delete this automation?")) {
      await this._hass.callApi(
        "DELETE",
        `config/automation/config/${automationId.split(".")[1]}`
      );
      await this._hass.callService("automation", "reload");
      this._renderAlarms();
    }
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
