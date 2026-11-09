// Blink Buddy: a firefly that cues slow blinks and leads a 20-20-20 eye break.
// Time-based only (SPECS has no eye sensor). Not a medical device. Never use while driving.
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"
import {Builder, HILL, OUTLINE, SOFT, WARM, WHITE} from "./BBVisuals"

export type BBState = "OFF" | "IDLE" | "CUE" | "FLY_OUT" | "LOOK" | "EIGHT" | "RETURN"

const HOME = new vec3(14, -8, -70) // ~20 deg right of gaze, slightly low, beside the monitor
const WINDOW_POS = new vec3(-100, 10, -600) // 6 m away, front-left
const WINDOW_STOP = new vec3(-100, 10, -560)
const EIGHT_CENTER = new vec3(0, 0, -150)
const CUE_BLINKS = 3
const CUE_TIMEOUT = 10
const FLY_TIME = 2
const LOOK_TIME = 20
const EIGHT_TIME = 15
const WALK_DIST = 30 // cm within WALK_WINDOW seconds
const WALK_WINDOW = 2
const RESUME_DELAY = 3
const RING_DOTS = 20

@component
export class BlinkBuddy extends BaseScriptComponent {
  static instance: BlinkBuddy

  @input sphereMesh: RenderMesh
  @input boxMesh: RenderMesh
  @input baseMat: Material
  @input("bool") demoAutoPlay: boolean = true
  @input blinkIntervalSec: number = 240
  @input breakIntervalSec: number = 1200

  // ---- public state (read by LEAF tests) ----
  state: BBState = "OFF"
  focusOn = false
  blinkCount = 0
  walking = false
  visibility = 0
  headPosOverride: vec3 | null = null
  cardText = ""
  ringRemaining = 0
  log: string[] = []

  private root: SceneObject
  private content: SceneObject
  private worldGroup: SceneObject
  private skipBtn: SceneObject
  private fireflyGroup: SceneObject
  private fireflyBody: SceneObject
  private eyeL: SceneObject
  private eyeR: SceneObject
  private ringGroup: SceneObject
  private ringDots: SceneObject[] = []
  private pathGroup: SceneObject
  private windowObj: SceneObject
  private monitorObj: SceneObject
  private toggleObj: SceneObject
  private card: Text
  private toggleLabel: Text
  private ready = false

  private stateT = 0
  private cueClock = 0
  private blinkTimer = 0
  private breakTimer = 0
  private msgT = 0
  private demoT = -1
  private demoLogged = false
  private fireflyScale = 1
  private bobT = 0
  private flyFrom = HOME
  private samples: {t: number; p: vec3}[] = []
  private still = 3
  private clock = 0
  private t0 = 0

  onAwake() {
    BlinkBuddy.instance = this
    this.createEvent("OnStartEvent").bind(() => this.build())
    this.createEvent("UpdateEvent").bind(() => this.update(getDeltaTime()))
  }

  // ------------------------------------------------------------ build
  private head(): vec3 {
    return this.headPosOverride ?? WorldCameraFinderProvider.getInstance().getWorldPosition()
  }

  private build() {
    const cam = WorldCameraFinderProvider.getInstance().getTransform()
    const yaw = cam.getWorldRotation().toEulerAngles().y
    const b = new Builder(this.sphereMesh, this.boxMesh, this.baseMat)
    this.root = global.scene.createSceneObject("BlinkBuddyRoot")
    this.root.getTransform().setWorldPosition(cam.getWorldPosition())
    this.root.getTransform().setWorldRotation(quat.fromEulerVec(new vec3(0, yaw, 0)))
    this.content = b.obj("BB_Content", this.root)
    this.worldGroup = b.obj("BB_World", this.content)

    // Stand-in virtual monitor (faint outline), 70 cm ahead, eye level - 15 cm.
    const mon = (this.monitorObj = b.outline("StandInMonitor", this.worldGroup, new vec3(-4, -8, -70), 26, 16, 0.5, SOFT))
    b.text("MonitorLabel", mon, new vec3(0, 10, 0), "stand-in monitor", 12, SOFT, 30, 4)

    // Stand-in window, 6 m away, 120 x 90 cm, faint blue outline + hills.
    this.windowObj = b.outline("StandInWindow", this.worldGroup, WINDOW_POS, 120, 90, 3, OUTLINE)
    b.ball("Hill1", this.windowObj, new vec3(-30, -38, 0), 60, HILL).getTransform().setLocalScale(new vec3(70, 25, 2))
    b.ball("Hill2", this.windowObj, new vec3(25, -36, 0), 60, HILL).getTransform().setLocalScale(new vec3(80, 35, 2))
    b.ball("Hill3", this.windowObj, new vec3(0, -30, 0), 60, HILL).getTransform().setLocalScale(new vec3(50, 20, 2))
    b.text("WindowLabel", this.windowObj, new vec3(0, 55, 0), "stand-in window", 80, OUTLINE, 150, 15)

    // Figure-eight path (faint dots), hidden until needed.
    this.pathGroup = b.obj("EightPath", this.worldGroup)
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2
      b.ball("p" + i, this.pathGroup, this.eightPos(a), 0.8, new vec4(0.5, 0.65, 0.8, 1))
    }
    this.pathGroup.enabled = false

    // Firefly (pinch target), card, ring timer.
    this.fireflyGroup = b.obj("Firefly", this.worldGroup, HOME)
    this.fireflyBody = b.ball("FireflyBody", this.fireflyGroup, vec3.zero(), 6, WARM)
    this.eyeL = b.ball("EyeL", this.fireflyGroup, new vec3(-1.2, 0.6, 2.7), 1.3, WHITE)
    this.eyeR = b.ball("EyeR", this.fireflyGroup, new vec3(1.2, 0.6, 2.7), 1.3, WHITE)
    b.pinchable(this.fireflyGroup, 6, () => this.onFireflyPinch())
    this.card = b.text("Card", this.fireflyGroup, new vec3(0, -10, 3.5), "", 40, WHITE, 40, 8)
    this.ringGroup = b.obj("Ring", this.fireflyGroup)
    for (let i = 0; i < RING_DOTS; i++) {
      const a = (i / RING_DOTS) * Math.PI * 2
      this.ringDots.push(b.ball("r" + i, this.ringGroup, new vec3(Math.sin(a) * 8, Math.cos(a) * 8, 0), 1.2, WARM))
    }
    this.ringGroup.enabled = false

    // Buttons below the monitor.
    // Buttons below the monitor: an unscaled group (collider + Interactable) holding a scaled slab and its label.
    const tgl = (this.toggleObj = b.obj("FocusToggle", this.content, new vec3(-8, -21, -70)))
    b.slab("FocusToggleSlab", tgl, vec3.zero(), new vec3(14, 5, 1), new vec4(0.2, 0.45, 0.5, 1))
    this.toggleLabel = b.text("FocusLabel", tgl, new vec3(0, 0, 0.7), "Focus: OFF", 20, WHITE, 14, 5)
    b.pinchableBox(tgl, new vec3(14, 5, 2), () => this.setFocus(!this.focusOn))
    this.skipBtn = b.obj("SkipButton", this.worldGroup, new vec3(10, -21, -70))
    b.slab("SkipSlab", this.skipBtn, vec3.zero(), new vec3(16, 5, 1), new vec4(0.5, 0.35, 0.15, 1))
    b.text("SkipLabel", this.skipBtn, new vec3(0, 0, 0.7), "Demo: skip 20 min", 11, WHITE, 16, 5)
    b.pinchableBox(this.skipBtn, new vec3(16, 5, 2), () => this.skipTimer())

    this.worldGroup.enabled = false
    this.ready = true
    this.t0 = getTime()
    print("[BlinkBuddy] built. Never use while driving. demoAutoPlay=" + this.demoAutoPlay)
    this.say("Never use while driving.", 6)
  }

  private eightPos(a: number): vec3 {
    return new vec3(EIGHT_CENTER.x + 20 * Math.sin(a), EIGHT_CENTER.y + 10 * Math.sin(2 * a), EIGHT_CENTER.z)
  }

  // ------------------------------------------------------------ public API
  setFocus(on: boolean) {
    if (!this.ready || on === this.focusOn) return
    this.focusOn = on
    this.toggleLabel.text = on ? "Focus: ON" : "Focus: OFF"
    this.worldGroup.enabled = on
    this.resetFirefly()
    this.blinkTimer = this.blinkIntervalSec
    this.breakTimer = this.breakIntervalSec
    this.demoT = -1
    this.demoLogged = false
    if (on) {
      this.setState("IDLE")
      this.visibility = 1
      if (this.demoAutoPlay && global.deviceInfoSystem.isEditor()) this.demoT = 0
    } else {
      this.setState("OFF")
      this.card.text = ""
      this.cardText = ""
    }
  }

  skipTimer() {
    if (!this.ready || !this.focusOn) return
    if (this.state === "IDLE" || this.state === "CUE") this.startBreak()
  }

  startCue() {
    if (this.state !== "IDLE") return
    this.cueClock = 0
    this.setState("CUE")
    this.say("blink with me", 0)
  }

  // ------------------------------------------------------------ state machine
  private setState(s: BBState) {
    this.state = s
    this.stateT = 0
    // keep the display nearly empty during the look-away and the eye exercise
    const quiet = s === "LOOK" || s === "EIGHT"
    this.monitorObj.enabled = !quiet
    this.skipBtn.enabled = !quiet
    this.toggleObj.enabled = s !== "LOOK"
    this.log.push(`${(getTime() - this.t0).toFixed(1)} ${s}`)
    print("[BlinkBuddy] state " + s)
  }

  private say(txt: string, secs: number) {
    this.card.text = txt
    this.cardText = txt
    this.msgT = secs
  }

  private resetFirefly() {
    this.fireflyScale = 1
    this.fireflyGroup.getTransform().setLocalPosition(HOME)
    this.fireflyGroup.getTransform().setLocalScale(vec3.one())
    this.ringGroup.enabled = false
    this.pathGroup.enabled = false
    this.setEyes(1)
  }

  private setEyes(open: number) {
    const s = new vec3(1.3, 1.3 * Math.max(0.08, open), 1.3)
    this.eyeL.getTransform().setLocalScale(s)
    this.eyeR.getTransform().setLocalScale(s)
  }

  private onFireflyPinch() {
    if (this.state === "CUE") {
      this.blinkCount++
      this.say(`${this.blinkCount} blink break${this.blinkCount === 1 ? "" : "s"} today`, 3)
      this.setState("IDLE")
      this.setEyes(1)
    }
  }

  private startBreak() {
    this.setEyes(1)
    this.flyFrom = this.fireflyGroup.getTransform().getLocalPosition()
    this.setState("FLY_OUT")
    this.say("Take a short break.", 0)
  }

  private windowHint(): string {
    const cam = WorldCameraFinderProvider.getInstance().getTransform()
    // window position in the camera's own space (camera looks down -Z)
    const p = cam.getInvertedWorldTransform().multiplyPoint(this.windowObj.getTransform().getWorldPosition())
    const angle = Math.atan2(Math.sqrt(p.x * p.x + p.y * p.y), -p.z)
    if (angle < (28 * Math.PI) / 180) return ""
    return p.x < 0 ? "<< " : ">> "
  }

  private update(dt: number) {
    if (!this.ready) return
    this.clock += dt
    this.updateWalking(dt)
    this.applyVisibility(dt)
    if (!this.focusOn) return
    if (this.walking || this.still < RESUME_DELAY) return // timers + animation paused

    this.bobT += dt
    this.stateT += dt
    if (this.msgT > 0) {
      this.msgT -= dt
      if (this.msgT <= 0 && this.state !== "CUE") this.card.text = this.cardText = ""
    }
    const ft = this.fireflyGroup.getTransform()
    const bob = Math.sin(this.bobT * 1.6) * 0.8

    // scripted demo (preview only)
    if (this.demoT >= 0) {
      this.demoT += dt
      if (this.demoT >= 4 && this.state === "IDLE" && !this.demoLogged && this.demoT < 5) this.startCue()
      if (this.demoT >= 9 && this.state === "CUE") {
        this.demoLogged = true
        this.onFireflyPinch() // the demo "pinches" for you so the count shows
      }
      if (this.demoT >= 18) {
        this.demoT = -1
        this.skipTimer()
      }
    }

    switch (this.state) {
      case "IDLE": {
        ft.setLocalPosition(new vec3(HOME.x, HOME.y + bob, HOME.z))
        this.blinkTimer -= dt
        this.breakTimer -= dt
        if (this.breakTimer <= 0) this.startBreak()
        else if (this.blinkTimer <= 0) {
          this.blinkTimer = this.blinkIntervalSec
          this.startCue()
        }
        break
      }
      case "CUE": {
        ft.setLocalPosition(new vec3(HOME.x, HOME.y + bob, HOME.z))
        this.cueClock += dt
        if (this.cueClock < CUE_BLINKS * 1.5) {
          const p = this.cueClock % 1.5
          this.setEyes(p < 0.6 ? 1 - p / 0.6 : p < 0.9 ? 0 : (p - 0.9) / 0.6)
        } else this.setEyes(1)
        if (this.cueClock >= CUE_TIMEOUT) {
          this.card.text = this.cardText = ""
          this.setEyes(1)
          this.setState("IDLE") // quiet end, no nagging
        }
        break
      }
      case "FLY_OUT": {
        const k = Math.min(1, this.stateT / FLY_TIME)
        const e = k * k * (3 - 2 * k)
        ft.setLocalPosition(vec3.lerp(this.flyFrom, WINDOW_STOP, e))
        this.setFireflyScale(1 + 3 * e)
        if (k >= 1) {
          this.ringRemaining = LOOK_TIME
          this.ringGroup.enabled = true
          this.setState("LOOK")
        }
        break
      }
      case "LOOK": {
        ft.setLocalPosition(new vec3(WINDOW_STOP.x, WINDOW_STOP.y + bob * 4, WINDOW_STOP.z))
        this.ringRemaining = Math.max(0, LOOK_TIME - this.stateT)
        this.say(this.windowHint() + "Look at the real window\nfor 20 seconds.\nLet your focus relax.", 0)
        const on = Math.ceil(this.ringRemaining)
        for (let i = 0; i < RING_DOTS; i++) this.ringDots[i].enabled = i < on
        if (this.stateT >= LOOK_TIME) {
          this.ringGroup.enabled = false
          this.pathGroup.enabled = true
          this.flyFrom = ft.getLocalPosition()
          this.setState("EIGHT")
          this.say("follow me with your eyes,\nnot your head", 0)
        }
        break
      }
      case "EIGHT": {
        const lead = Math.min(1, this.stateT / 1.5) // glide to the path start first
        const a = (this.stateT / (EIGHT_TIME / 2)) * Math.PI * 2
        ft.setLocalPosition(vec3.lerp(this.flyFrom, this.eightPos(a), lead * lead * (3 - 2 * lead)))
        this.setFireflyScale(4 - 2.5 * lead)
        if (this.stateT >= EIGHT_TIME) {
          this.pathGroup.enabled = false
          this.flyFrom = ft.getLocalPosition()
          this.setState("RETURN")
        }
        break
      }
      case "RETURN": {
        const k = Math.min(1, this.stateT / FLY_TIME)
        const e = k * k * (3 - 2 * k)
        ft.setLocalPosition(vec3.lerp(this.flyFrom, HOME, e))
        this.setFireflyScale(1.5 - 0.5 * e)
        if (k >= 1) {
          this.say("Back to work, eyes refreshed", 5)
          this.blinkTimer = this.blinkIntervalSec
          this.breakTimer = this.breakIntervalSec
          this.setState("IDLE")
        }
        break
      }
    }
  }

  private setFireflyScale(s: number) {
    this.fireflyScale = s
    this.fireflyGroup.getTransform().setLocalScale(new vec3(s, s, s))
  }

  // ------------------------------------------------------------ walking
  private updateWalking(dt: number) {
    const p = this.head()
    this.samples.push({t: this.clock, p})
    while (this.samples.length > 1 && this.clock - this.samples[0].t > WALK_WINDOW) this.samples.shift()
    let far = 0
    for (const s of this.samples) far = Math.max(far, s.p.distance(p))
    if (far > WALK_DIST) {
      if (!this.walking) this.log.push(`${(getTime() - this.t0).toFixed(1)} WALKING`)
      this.walking = true
      this.still = 0
    } else {
      this.walking = false
      this.still += dt
    }
  }

  private applyVisibility(dt: number) {
    const hidden = !this.focusOn || this.walking || this.still < RESUME_DELAY
    const target = hidden ? 0 : 1
    this.visibility += Math.sign(target - this.visibility) * Math.min(Math.abs(target - this.visibility), dt * 2.5)
    const wasOn = this.worldGroup.enabled
    const on = this.focusOn && this.visibility > 0.02
    if (on !== wasOn) this.worldGroup.enabled = on
    // shrink toward the user while fading (the display is additive, so no alpha needed)
    const s = Math.max(0.001, this.visibility)
    this.worldGroup.getTransform().setLocalScale(new vec3(s, s, s))
  }
}
