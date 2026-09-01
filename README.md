# TVET Living Labs 6.0 — Electronic Systems CyberTwin Laboratory

A browser-based Industry 5.0 learning prototype for electrical measurement, traffic-light control, functional safety, CyberTwin evidence and human-led fault diagnosis.

## Features

- Virtual voltmeter, ammeter, multimeter and clamp-meter selection
- Function, range, probe-port and series/parallel connection decisions
- Animated four-way traffic intersection
- Nine instructor-selectable or randomly hidden faults
- All-red functional safety state
- Three sequential workplace agents
- Learner diagnosis, immediate action and justification
- CyberTwin identity/event record and JSON evidence export
- Responsive, API-free and GitHub Pages compatible

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Safety

This is an educational simulation. A future physical prototype should start with protected 5–24 V DC equipment. It must not directly control a public traffic intersection or exposed mains-voltage equipment.
