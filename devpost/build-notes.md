# Build notes: Blink Buddy

Decisions made while building (nobody was available for questions). Built 2026-11-10 from `devpost/design-brief.md`.

## Setup decisions
- **LEAF version:** Leaf v4.0.0 (latest) does not compile with this project's SIK 2.0.0 (it imports `InteractionKit.lspkg/...`, which does not exist here). Used **Leaf 2.0.2**. Installing it created `Leaf 2.lspkg` next to the old one; removed v4 and renamed the folder to `Leaf.lspkg` so the import paths resolve.
- **Preview environment:** Evening Room (Interactive preview, SPECS 27 device).
- **No `CaptureRuntimeViewTool`.** `PreviewInteractTool` also auto-installs packages (AiPreviewAgent*, Icons, Motion), so I removed those again and did not use it. Inputs are driven only by LEAF.
- **No UI Kit buttons.** Everything is built at runtime from a sphere/box mesh and one unlit material (`BB_Sphere`, `BB_Box`, `BB_Unlit`) with SIK `Interactable` + collider, to keep the build fast. SIK still gives mouse-click = pinch in Interactive Preview and works with LEAF.
- All content is created in `Assets/Scripts/BlinkBuddy.ts` (+ `BBVisuals.ts` helpers) when the Lens starts, in a root placed at the camera's start position and yaw.

## Layout (cm, relative to the head at start; -Z is forward)
The Interactive Preview only shows about +-16 degrees sideways (and about +-18 up/down), so the brief's wider layout fell partly outside the view. I pulled everything into that cone; the real-device layout from the brief is wider and could be restored.
- Stand-in monitor outline 26x16 at (-4,-8,-70) (brief: larger, eye level - 15 cm), labelled "stand-in monitor".
- Firefly home (14,-8,-70): about 11 degrees right of gaze and slightly low (brief: ~20 degrees), 6 cm, bobs. 12 cm pinch collider.
- Stand-in window 120x90 at (-100,10,-600), three dim hills, labelled "stand-in window". About 6 m ahead, 1 m left, so 608 cm straight-line (brief: front-left; I moved it from 2.5 m left to 1 m left so it is inside the preview view).
- Figure-eight: 40 cm wide, 20 cm tall, centred (0,0,-150), faint dots.
- Buttons below the monitor: `FocusToggle` (-8,-21,-70) and `SkipButton` "Demo: skip 20 min" (10,-21,-70).

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

## Tests (LEAF 2.0.2, run in the Interactive Preview, Evening Room)
- `Assets/Tests/Criterion1..6Scenario.ts` (one per done criterion) + `DemoAutoPlayScenario.ts` (extra), registered in `LeafIndex.ts` (scene object `LeafIndex`).
- `Assets/Tests/BBScenarioClient.ts` on scene object `LeafRunner` runs them one by one inside the preview and prints `[BBTEST] PASS/FAIL`. `LeafRunner` is **disabled** in the saved scene; enable it (and optionally set its `only` prefix, e.g. `c4`) to re-run.
- The LEAF panel MCP capabilities were not available in this session, so the scenarios were run through the in-Lens `ScenarioClient` (the scenario manager's own PASSED/FAILED lines are in the Lens Studio log).
- All scenarios call `freshStart()` first, which sets `demoAutoPlay = false`. Only the extra demo scenario turns it back on on purpose.
- Results (final code): c1 PASS, c2 PASS, c3 PASS, c4 PASS, c5 PASS, c6 PASS, x7 demo timeline PASS.
- Not tested: IK reachability (all controls were placed inside arm's reach, but no `createIKInteractor` scenario), the "window out of view" arrow, the "Never use while driving" note, the 10 s cue time-out, and any look-and-feel. Criterion 5 moves the head through `headPosOverride`, not through the real preview camera.
- Criterion 1's first run failed because my own bound (window < 650 cm) was too tight for a 650.2 cm straight-line distance. Fixed the test, not the Lens.

## Measured demo timeline (demoAutoPlay, seconds after Focus on)
blink cue 4.0 | pinch (simulated) 9.0 | break starts 18.0 | at window 20.1 | figure-eight 40.1 | return starts 55.1 | back at monitor, "Back to work, eyes refreshed" 57.2.

## Fix pass 2026-11-10 (layout, UIKit button, demo autoplay)
Observed problem: with Focus off only the toggle was visible, the toggle did not react to mouse clicks, and the layout was off-screen.
- **Root cause of the layout:** the Start camera is pitched 18.75 deg down (preview pose rotation x=341.25), but the content root only copied the camera yaw, so "straight ahead" was 18.75 deg above the real gaze. The root now copies the **full camera rotation** (pitch + yaw), so all offsets are relative to the Start gaze.
- **New layout (cm, relative to Start gaze, -Z forward; preview shows about +-18 deg):** monitor outline 24x14 at (-3,-2,-70); firefly home (15,-2,-70) at the monitor's right edge; Focus button 14x5 at (-3,-16,-70); skip button 12x4.5 at (12,-16,-70); window 120x90 at (-100,90,-600) = above-left of the monitor in the view, no overlap (a lower window overlapped the monitor on screen, so I put it up-left). Firefly flies to (-100,84,-560), so firefly and window are in the same view during the break; no steering arrow needed.
- **Focus control is now a real UIKit `Button`** (SnapOS3 Ghost, 14x5x1 cm, `onTriggerUp`), created at runtime in `BBVisuals.uiButton`, with a thin light outline and the label "Focus mode: ON/OFF". It keeps the scene-object name `FocusToggle`, so LEAF still finds its Interactable.
- **Focus OFF now shows the quiet monitor outline + Focus button** (+ "Preview: scripted demo" label); firefly, window, skip button, ring and card appear only with Focus ON. Decision: otherwise the first frames showed almost nothing. Criterion 6 test updated (monitor stays visible when off).
- **demoAutoPlay (editor only, saved TRUE):** Focus turns ON automatically 2 s after start, then the existing timeline runs. Label "Preview: scripted demo" under the monitor until "Back to work".
- **Firefly:** 6 cm warm-yellow body + two flat halos (9 and 13 cm), white eyes with pupils, and eyelid shapes (warm half-discs) that slide down/up during the cue. Criterion 2 now measures the lid height instead of the eye scale.
- **Window:** light blue outline, light green hills, label "your real window (stand-in)".
- Text sizes raised (world-space Text size is small at 70 cm; 20 is about right for a 14 cm button).

### Timing (preview, from lens start)
Focus ON at 2.0 s | blink cue 6.0 s | simulated pinch 11 s | break (fly out) 20 s | at window 22 s | figure-eight 42 s | return 57 s | **"Back to work" at 59.0 s total** (59.1/59.0 in two runs).
Screenshots: `devpost/shots/demo_01..05.png` at about 0.4 s, 6 s, 27 s, 46 s, 61 s after lens start (exact times are limited by tool latency; 25 s / 45 s / 60 s targets were met within about 2 s).

### LEAF after the fix (run in the Interactive Preview)
c1 PASS, c2 PASS (after the lid change in the test), c3 PASS, c4 PASS, c5 PASS, c6 PASS, x7 demo timeline PASS (58.7 s). `LeafRunner` disabled again in the saved scene.
- Not verified: a real mouse click on the new UIKit button (no PreviewInteractTool allowed). LEAF triggers its Interactable (UIKit `onTriggerUp` fires from `Interactable.onTriggerEnd`), which is the same path as a mouse click in the preview.
