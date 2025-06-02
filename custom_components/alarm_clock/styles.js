import { css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

export default css`
  :host {
    display: block;
    padding: 16px;
  }

  ha-card {
    width: 100%;
  }

  .card-content {
    padding: 16px;
  }

  .alarm-item {
    margin-bottom: 16px;
    padding: 16px;
    border-radius: 8px;
    background: var(--card-background-color, #fff);
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px rgba(0, 0, 0, 0.14));
  }

  .alarm-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .alarm-time input[type="time"] {
    font-size: 1.5em;
    padding: 8px;
    border: none;
    background: transparent;
    color: var(--primary-text-color);
  }

  .alarm-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .days-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .days-selector mwc-button {
    --mdc-theme-primary: var(--primary-color);
    min-width: 40px;
  }

  .days-selector mwc-button.selected {
    background-color: var(--primary-color);
    color: var(--text-primary-color);
  }

  .repeat-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .automation-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color);
  }

  .automation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .automation-header h3 {
    margin: 0;
    font-size: 1.1em;
    font-weight: 500;
  }

  .automation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    margin: 4px 0;
    border-radius: 4px;
    background: var(--secondary-background-color);
  }

  .automation-name {
    flex-grow: 1;
    margin-right: 16px;
  }

  .automation-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .no-automations {
    color: var(--secondary-text-color);
    font-style: italic;
    padding: 8px;
  }

  .add-alarm {
    margin-top: 16px;
    text-align: center;
  }

  .add-alarm mwc-button {
    --mdc-theme-primary: var(--primary-color);
  }
`;
