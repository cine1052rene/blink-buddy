// Runs the LEAF scenarios one after another inside the preview and prints one result line each.
// The "LeafRunner" scene object is DISABLED in the saved scene; enable it to run the tests.
import {DefaultScenarioManager} from "Leaf.lspkg/Scenarios/scenario/manager/DefaultLeafScenarioManager"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"

@component
export class BBScenarioClient extends BaseScriptComponent {
  @input("string") only: string = ""

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.runAll().catch((e) => print(`[BBTEST] runner error: ${e}`))
    })
  }

  private async runAll(): Promise<void> {
    const mgr = DefaultScenarioManager.getInstance()
    await sleep(2000)
    const ids = mgr.listScenarioIds().filter((id) => this.only === "" || id.indexOf(this.only) === 0)
    print(`[BBTEST] running ${ids.length} scenarios`)
    for (const id of ids) {
      const t0 = getTime()
      try {
        await mgr.startScenario(id)
        print(`[BBTEST] PASS ${id} (${(getTime() - t0).toFixed(1)}s)`)
      } catch (e) {
        print(`[BBTEST] FAIL ${id} (${(getTime() - t0).toFixed(1)}s): ${e}`)
      }
      await sleep(1000)
    }
    print("[BBTEST] done")
  }
}
