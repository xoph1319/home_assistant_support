"""The Alarm Clock integration."""
from __future__ import annotations

import logging
from datetime import datetime, time, timedelta
import voluptuous as vol

from homeassistant.const import (
    ATTR_NAME,
    CONF_NAME,
    CONF_TIME,
    Platform,
    ATTR_ENTITY_ID,
)
from homeassistant.core import HomeAssistant, callback, ServiceCall
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.entity_component import EntityComponent
from homeassistant.helpers.event import async_track_time_change
from homeassistant.helpers.typing import ConfigType
from homeassistant.helpers.entity import Entity
from homeassistant.components.homekit.const import (
    CONF_FEATURE_LIST,
    FEATURE_ON_OFF,
    FEATURE_PLAY_PAUSE,
    TYPE_SWITCH,
)
from homeassistant.components.switch import SwitchEntity
from homeassistant.components.homekit import TYPES
from homeassistant.components.homekit.accessories import HomeAccessory
from homeassistant.components.homekit.const import PROP_CELSIUS
from homeassistant.components.homekit.type_triggers import StateTrigger

_LOGGER = logging.getLogger(__name__)
DOMAIN = "alarm_clock"

CONF_ENABLED = "enabled"
CONF_REPEAT = "repeat"
CONF_DAYS = "days"
CONF_SKIP_NEXT = "skip_next"

# Service constants
SERVICE_ADD_ALARM = "add_alarm"
SERVICE_REMOVE_ALARM = "remove_alarm"
SERVICE_TOGGLE_ALARM = "toggle_alarm"
SERVICE_SET_TIME = "set_time"
SERVICE_SET_DAYS = "set_days"
SERVICE_SET_REPEAT = "set_repeat"
SERVICE_SKIP_NEXT = "skip_next"

ATTR_TIME = "time"
ATTR_DAYS = "days"
ATTR_REPEAT = "repeat"
ATTR_ENABLED = "enabled"
ATTR_SKIP_NEXT = "skip_next"

ALARM_SCHEMA = vol.Schema({
    vol.Required(CONF_NAME): cv.string,
    vol.Required(CONF_TIME): cv.time,
    vol.Optional(CONF_ENABLED, default=True): cv.boolean,
    vol.Optional(CONF_REPEAT, default=False): cv.boolean,
    vol.Optional(CONF_DAYS, default=[]): vol.All(
        cv.ensure_list, [vol.In(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])]
    ),
    vol.Optional(CONF_SKIP_NEXT, default=False): cv.boolean,
})

CONFIG_SCHEMA = vol.Schema({
    DOMAIN: vol.Schema({
        vol.Optional(CONF_NAME): cv.string,
        vol.Optional("alarms", default=[]): vol.All(cv.ensure_list, [ALARM_SCHEMA]),
    })
}, extra=vol.ALLOW_EXTRA)

# Service schemas
ALARM_SERVICE_SCHEMA = vol.Schema({
    vol.Optional(ATTR_ENTITY_ID): cv.entity_ids,
})

ADD_ALARM_SCHEMA = ALARM_SCHEMA

SET_TIME_SCHEMA = ALARM_SERVICE_SCHEMA.extend({
    vol.Required(ATTR_TIME): cv.time,
})

SET_DAYS_SCHEMA = ALARM_SERVICE_SCHEMA.extend({
    vol.Required(ATTR_DAYS): vol.All(
        cv.ensure_list, [vol.In(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])]
    ),
})

SET_REPEAT_SCHEMA = ALARM_SERVICE_SCHEMA.extend({
    vol.Required(ATTR_REPEAT): cv.boolean,
})

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Alarm Clock component."""
    component = EntityComponent(_LOGGER, DOMAIN, hass)
    
    if DOMAIN not in config:
        config[DOMAIN] = {"alarms": []}

    # Store component for service handlers
    hass.data[DOMAIN] = {"component": component, "entities": {}}

    # Create alarm entities from configuration
    entities = []
    for alarm_config in config[DOMAIN].get("alarms", []):
        entity = AlarmEntity(alarm_config)
        entities.append(entity)
        # Create HomeKit entities for this alarm
        homekit_entity = AlarmHomeKitDevice(entity)
        entities.append(homekit_entity)
        hass.data[DOMAIN]["entities"][entity.entity_id] = entity

    await component.async_add_entities(entities)

    # Register services
    async def add_alarm(call: ServiceCall) -> None:
        """Handle add alarm service call."""
        entity = AlarmEntity(call.data)
        await component.async_add_entities([entity])
        hass.data[DOMAIN]["entities"][entity.entity_id] = entity

    async def remove_alarm(call: ServiceCall) -> None:
        """Handle remove alarm service call."""
        entity_ids = call.data.get(ATTR_ENTITY_ID)
        if entity_ids:
            entities = [entity for entity_id, entity in hass.data[DOMAIN]["entities"].items()
                       if entity_id in entity_ids]
            for entity in entities:
                await entity.async_remove()
                del hass.data[DOMAIN]["entities"][entity.entity_id]

    async def toggle_alarm(call: ServiceCall) -> None:
        """Handle toggle alarm service call."""
        entity_ids = call.data.get(ATTR_ENTITY_ID)
        if entity_ids:
            entities = [entity for entity_id, entity in hass.data[DOMAIN]["entities"].items()
                       if entity_id in entity_ids]
            for entity in entities:
                entity.toggle()

    async def set_time(call: ServiceCall) -> None:
        """Handle set time service call."""
        entity_ids = call.data.get(ATTR_ENTITY_ID)
        if entity_ids:
            entities = [entity for entity_id, entity in hass.data[DOMAIN]["entities"].items()
                       if entity_id in entity_ids]
            for entity in entities:
                await entity.async_set_time(call.data[ATTR_TIME])

    async def set_days(call: ServiceCall) -> None:
        """Handle set days service call."""
        entity_ids = call.data.get(ATTR_ENTITY_ID)
        if entity_ids:
            entities = [entity for entity_id, entity in hass.data[DOMAIN]["entities"].items()
                       if entity_id in entity_ids]
            for entity in entities:
                entity.set_days(call.data[ATTR_DAYS])

    async def set_repeat(call: ServiceCall) -> None:
        """Handle set repeat service call."""
        entity_ids = call.data.get(ATTR_ENTITY_ID)
        if entity_ids:
            entities = [entity for entity_id, entity in hass.data[DOMAIN]["entities"].items()
                       if entity_id in entity_ids]
            for entity in entities:
                entity.set_repeat(call.data[ATTR_REPEAT])

    async def skip_next(call: ServiceCall) -> None:
        """Handle skip next alarm service call."""
        entity_ids = call.data.get(ATTR_ENTITY_ID)
        if entity_ids:
            entities = [entity for entity_id, entity in hass.data[DOMAIN]["entities"].items()
                       if entity_id in entity_ids]
            for entity in entities:
                entity.skip_next = True
                entity.async_write_ha_state()

    hass.services.async_register(
        DOMAIN, SERVICE_ADD_ALARM, add_alarm, schema=ADD_ALARM_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_REMOVE_ALARM, remove_alarm, schema=ALARM_SERVICE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_TOGGLE_ALARM, toggle_alarm, schema=ALARM_SERVICE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SET_TIME, set_time, schema=SET_TIME_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SET_DAYS, set_days, schema=SET_DAYS_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SET_REPEAT, set_repeat, schema=SET_REPEAT_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SKIP_NEXT, skip_next, schema=vol.Schema({
            vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        })
    )

    return True

class AlarmEntity(Entity):
    """Representation of an Alarm Clock entity."""

    def __init__(self, config):
        """Initialize the alarm."""
        self._name = config[CONF_NAME]
        self._time = config[CONF_TIME]
        self._enabled = config[CONF_ENABLED]
        self._repeat = config[CONF_REPEAT]
        self._days = config[CONF_DAYS]
        self._state = "idle"
        self._remove_listener = None
        self._unique_id = f"alarm_clock_{self._name.lower().replace(' ', '_')}"
        self._skip_next = config.get(CONF_SKIP_NEXT, False)

    @property
    def name(self):
        """Return the name of the alarm."""
        return self._name

    @property
    def unique_id(self):
        """Return unique ID for the entity."""
        return self._unique_id

    @property
    def state(self):
        """Return the state of the alarm."""
        return self._state

    @property
    def skip_next(self):
        """Return whether to skip the next alarm."""
        return self._skip_next

    @skip_next.setter
    def skip_next(self, value):
        """Set whether to skip the next alarm."""
        self._skip_next = value

    @property
    def extra_state_attributes(self):
        """Return the state attributes."""
        return {
            "time": str(self._time),
            "enabled": self._enabled,
            "repeat": self._repeat,
            "days": self._days,
            "skip_next": self._skip_next,
        }

    async def async_added_to_hass(self):
        """Run when entity about to be added to hass."""
        await self._update_listener()

    async def async_will_remove_from_hass(self):
        """Run when entity will be removed from hass."""
        if self._remove_listener:
            self._remove_listener()

    async def _update_listener(self):
        """Update the time listener."""
        if self._remove_listener:
            self._remove_listener()
        
        self._remove_listener = async_track_time_change(
            self.hass, self._check_alarm, hour=self._time.hour, minute=self._time.minute, second=0
        )

    @callback
    def _check_alarm(self, now):
        """Check if alarm should trigger."""
        if not self._enabled:
            return

        if self._skip_next:
            self._skip_next = False
            self.async_write_ha_state()
            return

        today = now.strftime("%a").lower()
        if self._days and today not in self._days:
            return

        self._state = "triggered"
        self.async_write_ha_state()

        # Reset state after 1 minute
        async_track_time_change(
            self.hass,
            self._reset_state,
            minute=now.minute + 1 if now.minute < 59 else 0,
            second=0
        )

    @callback
    def _reset_state(self, now):
        """Reset the alarm state."""
        self._state = "idle"
        if not self._repeat:
            self._enabled = False
        self.async_write_ha_state()

    def toggle(self):
        """Toggle the alarm."""
        self._enabled = not self._enabled
        self.async_write_ha_state()

    async def async_set_time(self, alarm_time: time):
        """Set the alarm time."""
        self._time = alarm_time
        await self._update_listener()
        self.async_write_ha_state()

    def set_days(self, days):
        """Set the alarm days."""
        self._days = days
        self.async_write_ha_state()

    def set_repeat(self, repeat):
        """Set the alarm repeat."""
        self._repeat = repeat
        self.async_write_ha_state()

class AlarmHomeKitDevice(HomeAccessory, SwitchEntity):
    """HomeKit representation of an alarm clock."""

    def __init__(self, alarm_entity):
        """Initialize the alarm accessory."""
        self._alarm = alarm_entity
        self.category = 8  # Category 8 is SWITCH
        super().__init__(
            alarm_entity,
            name=f"{alarm_entity.name} Alarm",
            model="Alarm Clock",
            manufacturer="Home Assistant",
            serial_number=f"ALARM_{alarm_entity.unique_id}"
        )

        # Create the primary service (Switch for skip next)
        self.switch_service = self.add_preload_service('Switch')
        self.skip_next = self.switch_service.get_characteristic('On')
        
        # Add a custom characteristic for the alarm time
        ALARM_TIME_CHAR = {
            "Format": "string",
            "Permissions": ["pr", "pw", "ev"],
            "UUID": "6C65736C-6965-4D61-7274-696E000000FF",  # Custom UUID
            "Description": "Alarm Time"
        }
        
        # Add the time characteristic to the switch service
        self.time_char = self.switch_service.add_characteristic(ALARM_TIME_CHAR)
        self.time_char.set_value(str(self._alarm._time))
        
        # Set up callbacks
        self.skip_next.setter_callback = self._set_skip_next
        self.time_char.setter_callback = self._set_alarm_time

    def _set_skip_next(self, value):
        """Handle requests to change the skip next state."""
        self._alarm.skip_next = not value
        self._alarm.async_write_ha_state()

    def _set_alarm_time(self, value):
        """Handle requests to change the alarm time."""
        try:
            # Parse the time string (expected format HH:MM)
            hour, minute = map(int, value.split(':'))
            new_time = time(hour, minute)
            
            # Update the alarm time
            self.hass.async_create_task(
                self._alarm.async_set_time(new_time)
            )
        except (ValueError, TypeError):
            _LOGGER.error("Invalid time format received from HomeKit: %s", value)

    @property
    def is_on(self):
        """Return true if the alarm is not set to skip next."""
        return not self._alarm.skip_next

    async def async_turn_on(self, **kwargs):
        """Turn on the switch (disable skip next)."""
        self._alarm.skip_next = False
        self._alarm.async_write_ha_state()
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs):
        """Turn off the switch (enable skip next)."""
        self._alarm.skip_next = True
        self._alarm.async_write_ha_state()
        self.async_write_ha_state()

    @callback
    def async_update_state(self, new_state):
        """Update accessory after state change."""
        # Update skip next state
        self.skip_next.set_value(not self._alarm.skip_next)
        
        # Update time characteristic
        self.time_char.set_value(str(self._alarm._time))
        
        self.async_write_ha_state()

# Register the HomeKit type
TYPES.append(
    {
        "domain": DOMAIN,
        "name": "Alarm Clock",
        "type": "AlarmHomeKitDevice",
        "accessory": AlarmHomeKitDevice,
    }
) 