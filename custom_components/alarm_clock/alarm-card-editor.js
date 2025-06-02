import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/@ha/frontend@20240319.1/lit.js";

if (!customElements.get("ha-textfield")) {
  customElements.define("ha-textfield", class extends HTMLElement {});
}

class AlarmCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
    };
  }

  setConfig(config) {
    this._config = config;
  }

  get _title() {
    return this._config.title || "";
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="option">
          <ha-textfield
            label="Card Title (Optional)"
            .value="${this._title}"
            .configValue=${"title"}
            @input="${this._valueChanged}"
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target;
    if (target.configValue) {
      if (target.value === "") {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.value,
        };
      }
    }
    this._fireConfigChanged(this._config);
  }

  _fireConfigChanged(config) {
    const event = new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  static get styles() {
    return css`
      .option {
        padding: 4px 0px;
        display: flex;
        flex-direction: column;
      }
      .option ha-textfield {
        width: 100%;
      }
    `;
  }
}

customElements.define("alarm-card-editor", AlarmCardEditor);
