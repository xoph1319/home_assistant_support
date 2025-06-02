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
`;

export default styles;
