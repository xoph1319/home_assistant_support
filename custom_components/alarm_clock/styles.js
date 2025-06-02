const styles = `
  .card-content {
    padding: 16px;
  }

  .alarm-item {
    margin-bottom: 16px;
    padding: 16px;
    border-radius: 8px;
    background: var(--ha-card-background, var(--card-background-color, white));
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2));
  }

  .alarm-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .alarm-time input[type="time"] {
    font-size: 24px;
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
    gap: 4px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .days-selector mwc-button {
    --mdc-theme-primary: var(--primary-color);
    --mdc-theme-on-primary: var(--text-primary-color);
    min-width: 40px;
  }

  .days-selector mwc-button.selected {
    background-color: var(--primary-color);
    color: var(--text-primary-color);
    --mdc-theme-primary: var(--primary-color);
  }

  .repeat-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .add-alarm {
    margin-top: 16px;
    text-align: center;
  }

  ha-icon-button {
    color: var(--primary-text-color);
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
    font-size: 16px;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .automation-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .automation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    background: var(--secondary-background-color);
  }

  .automation-name {
    font-size: 14px;
    color: var(--primary-text-color);
  }

  .automation-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .no-automations {
    color: var(--secondary-text-color);
    font-style: italic;
    font-size: 14px;
    text-align: center;
    padding: 8px;
  }

  .automation-dialog {
    padding: 16px;
  }

  .form-field {
    margin-bottom: 16px;
  }

  .form-field label {
    display: block;
    margin-bottom: 4px;
    color: var(--primary-text-color);
    font-size: 14px;
  }

  .form-field input[type="text"],
  .form-field input[type="number"],
  .form-field select {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
  }

  .form-field input[type="range"] {
    width: 100%;
  }
`;

export default styles;
