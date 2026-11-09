import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {findInteractableByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {bb, cardText, focusOnViaToggle, freshStart} from "./TestUtil"

/** Criterion 2: cue = three slow eye-closes + "blink with me"; pinching logs the round. */
@component
export class Criterion2Scenario extends Scenario {
  async run(): Promise<void> {
    await freshStart()
    await focusOnViaToggle()
    bb().startCue()
    await sleep(100)
    expect(bb().state).toBe("CUE")
    expect(cardText()).toBe("blink with me")
    const eye = findSceneObjectByName("EyeL").getTransform()
    let closes = 0
    let closed = false
    for (let i = 0; i < 60; i++) {
      await sleep(100) // 6 s covers the 4.5 s of blinking
      const open = eye.getLocalScale().y / 1.3
      if (!closed && open < 0.3) {
        closed = true
        closes++
      } else if (closed && open > 0.7) closed = false
    }
    expect(closes).toBe(3)
    expect(bb().state).toBe("CUE") // still waiting for the pinch (10 s timeout)
    const before = bb().blinkCount
    await new DefaultLeafInteractor().trigger(findInteractableByName("Firefly"))
    await sleep(300)
    expect(bb().blinkCount).toBe(before + 1)
    expect(cardText().includes("blink break")).toBe(true)
    expect(bb().state).toBe("IDLE")
  }
}
