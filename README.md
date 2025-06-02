# Home Assistant Alarm Clock Component

A custom component for Home Assistant that provides alarm clock functionality with a beautiful Lovelace UI card for easy management.

## Features

- Set multiple alarms with custom names
- Enable/disable alarms
- Set repeating alarms
- Configure alarms for specific days of the week
- Automatic state management
- Beautiful Lovelace UI card for easy management
- Dynamic alarm creation and modification through the UI

## Installation

1. Copy the `custom_components/alarm_clock` directory to your Home Assistant's `custom_components` directory
2. Restart Home Assistant
3. Add the configuration to your `configuration.yaml` (optional if using UI-only)
4. Add the custom card to your Lovelace dashboard

### YAML Configuration (Optional)

If you want to configure some default alarms through YAML, add the following to your `configuration.yaml`:

```yaml
alarm_clock:
  alarms:
    - name: "Wake Up"
      time: "07:00"
      enabled: true
      repeat: true
      days:
        - mon
        - tue
        - wed
        - thu
        - fri

    - name: "Weekend Alarm"
      time: "09:00"
      enabled: true
      repeat: true
      days:
        - sat
        - sun
```

### Lovelace Card Configuration

Add the custom card to your Lovelace dashboard:

1. Go to your dashboard
2. Click the three dots menu (⋮) in the top right
3. Click "Edit Dashboard"
4. Click the "+" button to add a new card
5. Scroll to the bottom and click "Custom: Alarm Clock Card"
6. Click "Save"

The card will automatically display all your configured alarms and allow you to:

- Add new alarms
- Delete existing alarms
- Toggle alarms on/off
- Set alarm time
- Configure repeat settings
- Select days for the alarm

### Configuration Options

| Option    | Description                                | Required | Default       |
| --------- | ------------------------------------------ | -------- | ------------- |
| `name`    | Name of the alarm                          | Yes      | -             |
| `time`    | Time for the alarm (24-hour format)        | Yes      | -             |
| `enabled` | Whether the alarm is enabled               | No       | true          |
| `repeat`  | Whether the alarm should repeat            | No       | false         |
| `days`    | List of days when the alarm should trigger | No       | [] (all days) |

## States

The alarm entity can have the following states:

- `idle`: Normal state
- `triggered`: When the alarm is actively going off

## Attributes

Each alarm entity will have the following attributes:

- `time`: The configured alarm time
- `enabled`: Whether the alarm is enabled
- `repeat`: Whether the alarm repeats
- `days`: List of days when the alarm is active

## Services

The following services are available for automation:

| Service                    | Description              | Fields                                      |
| -------------------------- | ------------------------ | ------------------------------------------- |
| `alarm_clock.add_alarm`    | Create a new alarm       | `name`, `time`, `enabled`, `repeat`, `days` |
| `alarm_clock.remove_alarm` | Remove an existing alarm | `entity_id`                                 |
| `alarm_clock.toggle_alarm` | Toggle an alarm on/off   | `entity_id`                                 |
| `alarm_clock.set_time`     | Change alarm time        | `entity_id`, `time`                         |
| `alarm_clock.set_days`     | Set alarm days           | `entity_id`, `days`                         |
| `alarm_clock.set_repeat`   | Set alarm repeat         | `entity_id`, `repeat`                       |

## Example Automations

You can create automations to perform actions when an alarm is triggered. Here's an example:

```yaml
automation:
  - alias: "Wake Up Light Sequence"
    trigger:
      - platform: state
        entity_id: alarm_clock.wake_up
        to: "triggered"
    action:
      - service: light.turn_on
        target:
          entity_id: light.bedroom
        data:
          brightness_pct: 100
          transition: 300 # 5 minutes
```

## Contributing

Feel free to submit issues and pull requests for additional features or bug fixes.
