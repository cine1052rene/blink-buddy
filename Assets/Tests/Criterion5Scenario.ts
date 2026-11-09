import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {bb, focusOnViaToggle, freshStart} from "./TestUtil"

/** Criterion 5: moving the head >30 cm within 2 s fades the firefly out and pauses timers; standing still brings it back. */
@component
export class Criterion5Scenario extends Scenario {
  async run(): Promise<void> {
    await freshStart()
    await focusOnViaToggle()
    bb().skipTimer() // be mid-break so the pause is visible in the ring timer
    await sleep(4500) // 2 s fly + 2.5 s into the look-away
    expect(bb().state).toBe("LOOK")
    const base = WorldCameraFinderProvider.getInstance().getWorldPosition()
    // "walk": head position jumps 100 cm sideways (the override stands in for moving the camera)
    bb().headPosOverride = base.add(new vec3(100, 0, 0))
    await sleep(700)
    expect(bb().walking).toBe(true)
    const frozen = bb().ringRemaining
    await sleep(1500)
    expect(bb().visibility < 0.05).toBe(true)
    expect(findSceneObjectByName("Firefly").isEnabledInHierarchy).toBe(false)
    expect(Math.abs(bb().ringRemaining - frozen) < 0.2).toBe(true) // timer paused
    // stand still at the new spot: it returns once the head has been still for 3 s
    await sleep(8000)
    expect(bb().walking).toBe(false)
    expect(bb().visibility > 0.95).toBe(true)
    expect(findSceneObjectByName("Firefly").isEnabledInHierarchy).toBe(true)
    expect(bb().ringRemaining < frozen).toBe(true) // timer resumed
    bb().headPosOverride = null
    await sleep(8000) // let the jump back settle
  }
}
