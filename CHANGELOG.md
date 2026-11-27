# Sizzle & Serve — Changelog

## 2026-11-27 — Off-screen culling
- Order cards, grill slots, plate items and ingredient bins are now checked against the canvas before drawing, so nothing is ever painted outside the frame.
- The kitchen is one fixed 1280x720 screen, so in practice everything was already on screen — this is a guard for the lists that grow and shrink, not a visible change.
