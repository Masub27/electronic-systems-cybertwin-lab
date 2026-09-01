# TVET Living Labs 6.0 — Electronic Systems CyberTwin Laboratory

A browser-based Industry 5.0 learning prototype for electrical measurement, traffic-light control, functional safety, CyberTwin evidence and human-led fault diagnosis.

## Features

- Virtual voltmeter, ammeter, multimeter and clamp-meter selection
- Four separately selectable SELV supply lines: 24 V DC, 12 V AC, 5 V PWM and 0–10 V analogue
- Separate 6 V AC, 1.50 A, 50 Hz current-measurement loop
- Interactive oscilloscope with DC, sine-wave, PWM and analogue waveforms
- Oscilloscope frequency, RMS/peak voltage, duty cycle, time/div and volts/div readouts
- Function, range, probe-port and series/parallel connection decisions
- Animated four-way traffic intersection
- Nine instructor-selectable or randomly hidden faults
- All-red functional safety state
- Three sequential workplace agents
- Learner diagnosis, immediate action and justification
- CyberTwin identity/event record and JSON evidence export
- Live Magdeburg temperature, precipitation, visibility, wind and daylight context
- Weather-derived traffic-risk advice with 15-minute refresh and cached fallback
- Responsive, API-free and GitHub Pages compatible

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Safety

This is an educational simulation. A future physical prototype should start with protected 5–24 V DC equipment. It must not directly control a public traffic intersection or exposed mains-voltage equipment.

Public weather is genuine regional data from Open-Meteo. Voltmeter, ammeter and traffic-controller values remain virtual until physical sensors are connected.
