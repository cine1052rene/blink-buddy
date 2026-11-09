import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {findInteractableByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {bb, focusOnViaToggle, freshStart} from "./TestUtil"

/** Criterion 6: Focus off hides everything (only the Focus toggle itself stays, so you can turn it back on). */
@component
export class Criterion6Scenario extends Scenario {
  async run(): Promise<void> {
    await freshStart()
    await focusOnViaToggle()
    expect(findSceneObjectByName("Firefly").isEnabledInHierarchy).toBe(true)
    await new DefaultLeafInteractor().trigger(findInteractableByName("FocusToggle"))
    await sleep(500)
    expect(bb().focusOn).toBe(false)
    for (const n of ["Firefly", "StandInMonitor", "StandInWindow", "SkipButton", "Ring", "EightPath"]) {
      expect(findSceneObjectByName(n).isEnabledInHierarchy).toBe(false)
    }
    expect(findSceneObjectByName("FocusToggle").isEnabledInHierarchy).toBe(true)
  }
}
