import { BrowserWindow } from 'electron'

export interface Styles {
  fontFamily: string,
  fontSize: number,
  fontColor: string,
  background: string,
  opacity: number,
  transDisplay: boolean,
  transFontFamily: string,
  transFontSize: number,
  transFontColor: string
}

export interface CaptionItem {
  index: number,
  time_s: string,
  time_t: string,
  text: string,
  translation: string
}

export let styles: Styles = {
  fontFamily: 'sans-serif',
  fontSize: 24,
  fontColor: '#000000',
  background: '#dbe2ef',
  opacity: 80,
  transDisplay: true,
  transFontFamily: 'sans-serif',
  transFontSize: 24,
  transFontColor: '#000000'
}

export function setStyles(args: any) {
  styles.fontFamily = args.fontFamily
  styles.fontSize = args.fontSize
  styles.fontColor = args.fontColor
  styles.background = args.background
  styles.opacity = args.opacity
  styles.transDisplay = args.transDisplay
  styles.transFontFamily = args.transFontFamily
  styles.transFontSize = args.transFontSize
  styles.transFontColor = args.transFontColor
}

export function sendStyles(window: BrowserWindow) {
  window.webContents.send('caption.style.set', styles)
  console.log('SNED caption.style.set')
}

export let captionLog: CaptionItem[] = [
  {index: 1, time_s: "00:00:00", time_t: "00:00:00", text: "Long time no see.", translation: "好久不见"},
  {index: 2, time_s: "00:00:00", time_t: "00:00:00", text: "How have you been?", translation: "你最近怎么样？"},
  {index: 3, time_s: "00:00:00", time_t: "00:00:00", text: "I've missed you a lot.", translation: "我非常想念你。"},
  {index: 4, time_s: "00:00:00", time_t: "00:00:00", text: "It's good to see you again.", translation: "很高兴再次见到你。"},
  {index: 5, time_s: "00:00:00", time_t: "00:00:00", text: "What have you been up to?", translation: "你最近在忙什么？"},
  {index: 6, time_s: "00:00:00", time_t: "00:00:00", text: "Let's catch up over coffee.", translation: "我们去喝杯咖啡聊聊天吧。"},
  {index: 7, time_s: "00:00:00", time_t: "00:00:00", text: "You look great!", translation: "你看起来很棒！"},
  {index: 8, time_s: "00:00:00", time_t: "00:00:00", text: "I can't believe it's been so long.", translation: "真不敢相信已经这么久了。"},
  {index: 9, time_s: "00:00:00", time_t: "00:00:00", text: "We should do this more often.", translation: "我们应该多聚聚。"},
  {index: 10, time_s: "00:00:00", time_t: "00:00:00", text: "Thanks for coming to see me.", translation: "谢谢你来看我。"},
  {index: 11, time_s: "00:00:00", time_t: "00:00:00", text: "We show case the utility of Macformer when combined with molecular docking simulations and wet lab based experimental validation, by applying it to the prospective design of macrocyclic JAK2 inhibitors.", translation: "我们通过将其应用于大环JAK2抑制剂的前瞻性设计，展示了Macformer与分子对接模拟和湿实验验证相结合的实用性。"},
  {index: 12, time_s: "00:00:00", time_t: "00:00:00", text: "Macrocycles, typically defined as cyclic small molecules or peptides with ring structures consisting of 12 or more atoms, has emerged as promising chemical scaffolds in the field of new drug discovery1,2. The distinct physicochemical properties, including high molecular weight and abundant hydrogen bond donors3, render this structural class occupy a chemical space beyond Lipinski's rule of five4.", translation: "大环分子通常定义为具有由 12 个或更多原子组成的环状结构的环状小分子或肽，已成为新药发现领域中具有前景的化学骨架 [1,2]。其独特的理化性质（包括高分子量和丰富的氢键供体）[3]，使这类结构占据了超越 Lipinski 五规则 [4] 的化学空间。"}
]

export function sendCaptionLog(window: BrowserWindow) {
  window.webContents.send('both.log.set', captionLog)
  console.log('SEND both.log.set')
}