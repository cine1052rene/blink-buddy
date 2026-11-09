import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {findInteractableByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {bb, distFromRoot, focusOnViaToggle, freshStart} from "./TestUtil"

/** Criterion 3: "Demo: skip 20 min" flies the firefly to the window, 20 s timer, display nearly empty. */
@component
export class Criterion3Scenario extends Scenario {
  async run(): Promise<void> {
    await freshStart()
    await focusOnViaToggle()
    await new DefaultLeafInteractor().trigger(findInteractableByName("SkipButton"))
    await sleep(300)
    expect(bb().state).toBe("FLY_OUT")
    await sleep(2200)
    expect(bb().state).toBe("LOOK")
    expect(distFromRoot("Firefly") > 500).toBe(true) // at the window, ~5.6 m
    const r1 = bb().ringRemaining
    expect(r1 > 17 && r1 <= 20).toBe(true)
    // display nearly empty: chrome hidden, only firefly, ring and card remain
    expect(findSceneObjectByName("StandInMonitor").enabled).toBe(false)
    expect(findSceneObjectByName("SkipButton").enabled).toBe(false)
    expect(findSceneObjectByName("FocusToggle").enabled).toBe(false)
    expect(findSceneObjectByName("EightPath").enabled).toBe(false)
    await sleep(5000)
    expect(bb().state).toBe("LOOK")
    const r2 = bb().ringRemaining
    expect(r1 - r2 > 4 && r1 - r2 < 6).toBe(true) // the 20 s timer is counting down in real time
  }
}
