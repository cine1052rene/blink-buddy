import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {bb, cardText, focusOnViaToggle, freshStart} from "./TestUtil"

/** Criterion 4: after 20 s the ~15 s figure-eight runs, then the firefly returns: "Back to work, eyes refreshed". */
@component
export class Criterion4Scenario extends Scenario {
  async run(): Promise<void> {
    await freshStart()
    await focusOnViaToggle()
    bb().skipTimer()
    const t0 = getTime()
    let eightStart = -1
    let eightEnd = -1
    let minX = 1e9
    let maxX = -1e9
    const ff = findSceneObjectByName("Firefly").getTransform()
    const root = findSceneObjectByName("BlinkBuddyRoot").getTransform()
    for (let i = 0; i < 480 && eightEnd < 0; i++) {
      await sleep(100)
      if (bb().state === "EIGHT") {
        if (eightStart < 0) eightStart = getTime()
        const x = root.getInvertedWorldTransform().multiplyPoint(ff.getWorldPosition()).x
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
      } else if (eightStart >= 0) eightEnd = getTime()
    }
    expect(eightStart > 0).toBe(true)
    expect(eightStart - t0 > 21 && eightStart - t0 < 24).toBe(true) // 2 s fly + 20 s look
    const dur = eightEnd - eightStart
    expect(dur > 14 && dur < 16.5).toBe(true)
    expect(maxX - minX > 30).toBe(true) // traces a ~40 cm wide path
    await sleep(2600) // RETURN takes 2 s
    expect(bb().state).toBe("IDLE")
    expect(cardText()).toBe("Back to work, eyes refreshed")
    const home = root.getInvertedWorldTransform().multiplyPoint(ff.getWorldPosition())
    expect(Math.abs(home.x - 25) < 3 && Math.abs(home.z + 70) < 3).toBe(true)
  }
}
