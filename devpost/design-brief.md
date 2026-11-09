---
status: approved
---

# Design brief: Blink Buddy

<!-- Written from the learner's decisions in a plan-lens-guided planning conversation. Values marked (default) were not chosen by the learner. Self-hackathon: the idea came up at 04:38 KST on Nov 10 while submitting another project. -->

## The one spatial moment
You are deep in focus at your desk and haven't blinked properly for minutes. At the edge of your view, beside your monitor, a small glowing firefly slowly closes and opens its eyes, and you blink with it. Every 20 minutes it drifts to your real window and says "look out there for 20 seconds", then leads a slow figure-eight for your eyes.

## Why it belongs on glasses
- Uses: shares your view, draws in the world, leaves your body free.
- Why it's better than the phone or laptop version: phone and laptop reminders interrupt focus and pull your eyes to another near screen. The glasses give a quiet cue in the corner of the view you already have, and point you at a real distant place. A virtual "distant mountain" doesn't help: the display focus is fixed at about 1 m, so the eye's focusing muscle only relaxes when you look at something real and far.

## Product or overlay
- Type: product (an eye-break helper), not a medical device.
- What the real version would sense: whether the wearer is still (not walking or driving), where the real window is, and ideally real blinks. SPECS has no eye-facing sensor, so blinks are never detected: the cue is time-based, and the user pinches to say "done".
- Stand-in for the preview: a virtual window on the wall about 6 m away is the "real window". Stillness uses the device position: moving more than about 30 cm in 2 s counts as walking (default). A "Skip timer" debug button speeds up the 20-minute cycle for the demo, clearly labelled.

## Where things live
- Where the user is looking during the main task: a virtual monitor about 70 cm ahead on a desk, at eye level minus 15 cm. It's a stand-in for the real screen, shown as a faint outline.
- Firefly: about 6 cm, a soft glowing warm-yellow orb with two simple eyes. It floats near the right edge of the monitor, about 20 degrees right of the gaze and slightly low (default). It bobs gently. Additive display, so it's bright and light-coloured.
- Window (stand-in): on the wall about 6 m away, to the front-left, 120 x 90 cm, faint blue outline with a few light distant hills drawn inside.
- Break card: a small text line under the firefly.
- Figure-eight path: about 40 cm wide, drawn faintly where the firefly travels, about 1.5 m ahead.

## Hands and input
- Done blinking: pinch the firefly (a big target, about 12 cm collider).
- Start break / done break: the firefly itself, pinch to continue.
- Focus mode on/off: a small toggle button below the monitor.
- Skip timer: a small demo button labelled "Demo: skip 20 min".
- Voice: none.

## When things show
- Focus mode on: the firefly sits quietly by the monitor. A blink cue every 4 minutes (default for the demo; real default 20 s of slow-blink every few minutes): the firefly slowly closes its eyes over 0.6 s, holds 0.3 s, opens over 0.6 s, three times, with "blink with me" text. Pinch the firefly to log a blink round, then a soft chime and a count ("3 blink breaks today").
- If the user doesn't respond, the cue ends after 10 s quietly, with no nagging.
- Every 20 minutes (demo: on Skip), the 20-20-20 break: the firefly flies to the window (2 s), and the card says "Look at the real window for 20 seconds. Let your focus relax." A 20 s ring timer shows around the firefly. The display stays almost empty during the 20 s. After that, a 15 s figure-eight: the firefly slowly traces a horizontal 8, "follow me with your eyes, not your head". Then it returns to the monitor with "Back to work, eyes refreshed".
- Moving: if walking is detected, the firefly fades out and the timer pauses. It returns 3 s after the user stands still. On-screen note at first launch: "Never use while driving."
- If the window is out of view at break time: a small arrow on the card points to it.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. Turning Focus mode on shows the firefly beside the monitor, and the stand-in window is present about 6 m away.
2. A blink cue plays three slow eye-closes with "blink with me", and pinching the firefly logs the round and increases the count.
3. "Demo: skip 20 min" starts the break: the firefly flies to the window, a 20 s timer runs, and the display is otherwise nearly empty.
4. After the 20 s, the figure-eight runs for about 15 s, and the firefly returns to the monitor with "Back to work, eyes refreshed".
5. Walking (moving the camera more than 30 cm within 2 s) fades the firefly out and pauses timers. Standing still brings it back.
6. Focus mode off hides everything.

## Out of scope
- Detecting real blinks, pupil size, or focus (SPECS has no eye sensor).
- Recognizing a real window, and measuring real distance.
- Medical claims: this is a habit helper, not a treatment for dry eye.
- Driving use: not allowed.

## Risks and open questions
- Comfort of wearing glasses for long work sessions, and battery life: unproven.
- Whether time-based blink cues help without detection is uncertain. Evidence on 20-20-20 reminders shows symptom relief while reminders run (Talens-Estarelles et al. 2022, small study).

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.** Does it use what I'm looking at? Does it put something in my space, where it belongs? Does it free my hands or let me keep my eyes up? Would it be just as good on a phone?
4. **Check comfort.** Everything I need is in view. Controls are within reach. Text reads easily. Things show when needed and get out of the way.
5. **Label what you know.** "logic proven" vs "feel unproven".
6. **Fix with design notes, not code.**
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder.
