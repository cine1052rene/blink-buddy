# Build notes: Blink Buddy

Decisions made while building (nobody was available for questions). Built 2026-11-10 from `devpost/design-brief.md`.

## Setup decisions
- **LEAF version:** Leaf v4.0.0 (latest) does not compile with this project's SIK 2.0.0 (it imports `InteractionKit.lspkg/...`, which does not exist here). Used **Leaf 2.0.2**. Installing it created `Leaf 2.lspkg` next to the old one; removed v4 and renamed the folder to `Leaf.lspkg` so the import paths resolve.
- **Preview environment:** Evening Room (Interactive preview, SPECS 27 device).
- **No `CaptureRuntimeViewTool`.** `PreviewInteractTool` also auto-installs packages (AiPreviewAgent*, Icons, Motion), so I removed those again and did not use it. Inputs are driven only by LEAF.
- **No UI Kit buttons.** Everything is built at runtime from a sphere/box mesh and one unlit material (`BB_Sphere`, `BB_Box`, `BB_Unlit`) with SIK `Interactable` + collider, to keep the build fast. SIK still gives mouse-click = pinch in Interactive Preview and works with LEAF.
- All content is created in `Assets/Scripts/BlinkBuddy.ts` (+ `BBVisuals.ts` helpers) when the Lens starts, in a root placed at the camera's start position and yaw.

## Layout (cm, relative to the head at start; -Z is forward)
- Stand-in monitor outline 50x30 at (0,-15,-70), labelled "stand-in monitor".
- Firefly home (25,-22,-70): about 20 degrees right of gaze, slightly low, 6 cm, bobs. 12 cm pinch collider.
- Stand-in window 120x90 at (-250,10,-600) with three hills, labelled "stand-in window". Straight-line distance is 650 cm (6 m ahead, 2.5 m left).
- Figure-eight: 40 cm wide, 20 cm tall, centred (0,0,-150), faint dots.
- Buttons below the monitor: `FocusToggle` (0,-40,-70) and `SkipButton` "Demo: skip 20 min" (22,-40,-70).

## Behaviour decisions
- **Focus off hides everything except the Focus toggle**, otherwise there would be no way to turn it back on.
- **Break is automatic** after "skip" (the brief says both "pinch to continue" and an automatic flow; the automatic one is what the timings describe). The firefly pinch is only used for logging a blink round.
- **Display nearly empty during the 20 s look-away:** during LOOK the monitor outline, skip button and Focus toggle are hidden. Left: the firefly, the ring timer, the card, and the distant window. During the figure-eight the monitor and skip button are hidden.
- **Firefly scales up while at the window** (x4, then x1.5 on the 1.5 m figure-eight) so a 6 cm firefly is still readable at 5.6 m; the ring and card scale with it.
- **Walking** = head moved more than 30 cm within 2 s. Content shrinks toward the user (display is additive, so no alpha fade) and all timers/animations freeze. It returns after the head has been still for 3 s. For tests the head position can be overridden (`BlinkBuddy.headPosOverride`) instead of moving the preview camera.
- **Window out of view:** the card gets a `<<` or `>>` prefix (fonts may lack arrows).
- **"Never use while driving."** shown for 6 s at start.
- **Soft chime: not built** (no time; no audio asset). The count text is shown ("3 blink breaks today").
- Blink cue: 3 x (close 0.6 s, hold 0.3 s, open 0.6 s) = 4.5 s, ends quietly at 10 s if not pinched. Demo cue interval 240 s, break interval 1200 s.

## demoAutoPlay (preview only)
- Input `demoAutoPlay`, default **true** in the saved scene; only acts when `global.deviceInfoSystem.isEditor()` is true.
- It starts when Focus is turned on: blink cue at 4 s, a simulated pinch at 9 s so the count shows (my addition, to show the logging step), then at 18 s the break as if "skip 20 min" was pressed. No walk-away simulation.
- Timeline from Focus on: 18 s + 2 s fly + 20 s look + 15 s figure-eight + 2 s return = **57 s** until the firefly is back at the monitor and shows "Back to work, eyes refreshed" (the card stays 5 s).
- LEAF scenarios set `demoAutoPlay = false` first.

## Tests
- `Assets/Tests/Criterion1..6Scenario.ts`, registered in `LeafIndex.ts` (scene object `LeafIndex`).
- `Assets/Tests/BBScenarioClient.ts` on scene object `LeafRunner` runs them one by one inside the preview and prints `[BBTEST] PASS/FAIL`. `LeafRunner` is **disabled** in the saved scene; enable it to re-run.
- The LEAF panel MCP capabilities were not available in this session, so the scenarios were run through the in-Lens `ScenarioClient` (the scenario manager's own PASSED/FAILED lines are in the log).
- No IK reachability scenario (all UI is at arm's reach by design but this was not tested).
- Criterion 1's first run failed because my own bound (window < 650 cm) was too tight for the 650.2 cm straight-line distance. Fixed the test, not the Lens.
