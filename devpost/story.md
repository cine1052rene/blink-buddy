## Self-hackathon note
**Blink Buddy is a self-hackathon.** The idea came up at **04:38 KST on Nov 10, 2026**, while I was submitting my other project (Exit Thread) and my eyes were burning. Everything here, from the plan to the build, video and submission, was made after that moment, with the same tools (Devpost skill pack, CLAD, Lens Studio MCP, LEAF). The timestamps are in the repo history.

## Inspiration
When I focus, I barely blink, and my dry eye keeps getting worse. Doctors say to look at something far away, but I never stop to look at a mountain. Phone reminders don't help either: they pull my eyes to another near screen and break my focus.

## What it does
Blink Buddy is a SPECS Lens that sits quietly beside your screen while you work.
- **A small firefly** floats at the edge of your view, never in the middle of your task.
- **Blink with me:** every few minutes it slowly closes its eyes three times, and you blink with it. Pinch it to log the round.
- **20-20-20 break:** every 20 minutes it flies to your real window. "Look far away for 20 seconds", then a slow figure-eight for your eyes.
- **Moving? It hides.** If you get up and walk, it fades away and pauses. It must never be used while driving.

## Why glasses
A phone notification pulls your eyes to another near screen. Glasses can give a quiet cue in the corner of the view you already have, and point you at something real and far. A virtual mountain wouldn't help: the display focus is fixed at about 1 m, so your focusing muscles only relax when you look at something real and far away.

## What's simulated (honest list)
- **SPECS has no eye-facing sensor.** Blinks, pupil size and focus are never measured. The blink cue is time-based, and you pinch to say "done". This is a reminder, not a sensor.
- **The window is a stand-in** in the preview, and the 20-minute timer is sped up for the demo.
- **The demo plays a scripted sequence** in the preview only, and that's labelled on screen.
- **Comfort over long sessions and battery** are unproven.

This is a habit helper, not a medical device. Evidence on 20-20-20 reminders comes from a small study (Talens-Estarelles et al., 2022): symptoms improved while reminders ran, and came back after they stopped. That's why the Lens stays on in the background.

## How I built it
I planned it with the Devpost Learn skill pack's design-brief template (`devpost/design-brief.md`). CLAD built it in Lens Studio through the Lens Studio MCP with Claude Code, and LEAF scenarios cover the done criteria.

## What I learned
On glasses, the best cue can be the quietest one, in the corner of the view, timed to get out of the way. The most surprising thing was the optics: an AR "look at the distant mountain" break doesn't actually rest your eyes. So the Lens's job is to send you to the real world, not replace it.

## What's next
Real window detection, real blink sensing on glasses with eye tracking, and personalized break timing.
