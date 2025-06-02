# Home Assistant Alarm Clock Component

A custom component for Home Assistant that provides alarm clock functionality with a beautiful Lovelace UI card for easy management and HomeKit integration.

## Features

- Set multiple alarms with custom names
- Enable/disable alarms
- Set repeating alarms
- Configure alarms for specific days of the week
- Automatic state management
- Beautiful Lovelace UI card for easy management
- Dynamic alarm creation and modification through the UI
- HomeKit integration for controlling alarms through Apple devices
- Skip next alarm functionality accessible through HomeKit

## Installation

1. Copy the `custom_components/alarm_clock` directory to your Home Assistant's `custom_components` directory
2. Restart Home Assistant
3. Add the configuration to your `configuration.yaml` (optional if using UI-only)
4. Add the custom card to your Lovelace dashboard
5. Enable HomeKit integration in Home Assistant if you want to use HomeKit features

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
      skip_next: false

    - name: "Weekend Alarm"
      time: "09:00"
      enabled: true
      repeat: true
      days:
        - sat
        - sun
      skip_next: false
```

### HomeKit Integration

Each alarm will be exposed to HomeKit as a custom accessory that provides:

1. A switch to control whether to skip the next occurrence:
   - Turn OFF to skip the next alarm
   - Turn ON to enable the next alarm
2. Time control to set the alarm time directly from HomeKit:
   - Use the Home app or Siri to check the current alarm time
   - Change the alarm time using the Home app or Siri commands
   - Supports voice commands like "Set the bedroom alarm to 7 AM"

The switch will automatically reset to ON after the skipped alarm time has passed.

To use the HomeKit integration:

1. Make sure you have the HomeKit integration enabled in Home Assistant
2. Add the following to your HomeKit configuration in `configuration.yaml`:

```yaml
homekit:
  filter:
    include_entities:
      - alarm_clock.wake_up # Replace with your alarm entity IDs
```

3. Restart Home Assistant
4. Add the accessory to your Apple Home app
5. Use the accessory to:
   - View the current alarm time
   - Modify the alarm time
   - Control whether the next alarm should be skipped

#### HomeKit Voice Commands

You can use Siri to control your alarms with commands like:

- "What time is the bedroom alarm set for?"
- "Set the bedroom alarm to 7:30 AM"
- "Skip the next bedroom alarm"
- "Enable the next bedroom alarm"

### Lovelace Card Configuration

There are several ways to add the custom card to your Lovelace dashboard:

#### Method 1: Using the UI

1. Go to your dashboard
2. Click the three dots menu (⋮) in the top right
3. Click "Edit Dashboard"
4. Click the "+" button to add a new card
5. Scroll to the bottom and click "Custom: Alarm Clock Card"
6. (Optional) Configure the card title
7. Click "Save"

#### Method 2: Using YAML Configuration

If you prefer to configure your Lovelace dashboard using YAML, add the following to your `ui-lovelace.yaml` file or your dashboard's YAML configuration:

```yaml
views:
  - title: My View
    cards:
      - type: custom:alarm-card
        title: My Alarms # Optional
```

#### Method 3: Using the Raw Configuration Editor

1. Go to your dashboard
2. Click the three dots menu (⋮) in the top right
3. Click "Edit Dashboard"
4. Click the three dots menu again
5. Click "Raw configuration editor"
6. Add the card configuration:
   ```yaml
   type: custom:alarm-card
   title: My Alarms # Optional
   ```
7. Click "Save"

#### Installing the Card Files

Before you can use the card, you need to make sure the card files are properly installed:

1. Copy the following files to your Home Assistant configuration directory:

   ```
   custom_components/
   └── alarm_clock/
       ├── alarm-card.js
       ├── alarm-card-editor.js
       └── styles.js
   ```

2. Add the card to your Lovelace resources. You can do this in two ways:

   **Method 1: Using the UI**

   1. Go to Configuration -> Lovelace Dashboards
   2. Click the "Resources" tab
   3. Click the "+" button
   4. Add the following resource:
      - URL: `/local/custom_components/alarm_clock/alarm-card.js`
      - Resource type: "JavaScript Module"
   5. Click "Create"

   **Method 2: Using YAML**
   Add the following to your `configuration.yaml`:

   ```yaml
   lovelace:
     resources:
       - url: /local/custom_components/alarm_clock/alarm-card.js
         type: module
   ```

#### Card Features

Once added to your dashboard, the card provides:

1. Alarm Management:

   - View all configured alarms
   - Add new alarms with the "+" button
   - Delete existing alarms
   - Toggle alarms on/off
   - Set alarm times using a time picker
   - Configure repeat settings
   - Select specific days for each alarm

2. Automation Management:

   - View automations associated with each alarm
   - Create new automations directly from the card
   - Edit existing automations
   - Enable/disable automations
   - Delete automations

3. Visual Feedback:
   - Clear status indicators for each alarm
   - Visual distinction between active and inactive alarms
   - Day selection buttons with active state indication
   - Intuitive controls for all functions

#### Troubleshooting

If the card doesn't appear:

1. Check that the files are in the correct location:

   ```
   /config/custom_components/alarm_clock/alarm-card.js
   /config/custom_components/alarm_clock/alarm-card-editor.js
   /config/custom_components/alarm_clock/styles.js
   ```

2. Verify the resource is properly loaded:

   - Check the browser's developer console for any errors
   - Make sure the resource URL matches your file location
   - Try clearing your browser cache

3. Common Issues:
   - If the card shows as "Custom card not found", check your resource configuration
   - If the card appears but doesn't load, check the browser console for JavaScript errors
   - If the card loads but shows no alarms, verify your alarm configurations

### Configuration Options

| Option      | Description                                | Required | Default       |
| ----------- | ------------------------------------------ | -------- | ------------- |
| `name`      | Name of the alarm                          | Yes      | -             |
| `time`      | Time for the alarm (24-hour format)        | Yes      | -             |
| `enabled`   | Whether the alarm is enabled               | No       | true          |
| `repeat`    | Whether the alarm should repeat            | No       | false         |
| `days`      | List of days when the alarm should trigger | No       | [] (all days) |
| `skip_next` | Whether to skip the next occurrence        | No       | false         |

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
- `skip_next`: Whether the next occurrence will be skipped

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
| `alarm_clock.skip_next`    | Skip next occurrence     | `entity_id`                                 |

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
