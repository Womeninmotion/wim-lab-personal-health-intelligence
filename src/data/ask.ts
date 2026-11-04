import type { AskScript } from "@/lib/types";

export const askScripts: AskScript[] = [
  {
    id: "steps-vs-training",
    question: "为什么昨天有训练，今天还建议补步数？",
    answer: [
      "演示回复：因为步数和训练课在这个剧本里是两件不同的事。昨天 19:10 有一节 42 分钟力量课，全日却只有 4,280 步。",
      "课前后的走动已经算进步数，没有再被记成第二次运动。缺口来自居家白天几乎没离开椅子。",
      "所以今晚的课保留，另外找两段 12 到 15 分钟的走动。这不是要求把步数练出来。",
    ],
  },
  {
    id: "intensity",
    question: "今晚的训练要减量吗？",
    answer: [
      "演示回复：按原计划上，先不减课，也不要加码。",
      "依据只到这里：睡眠大约 6 小时 20 分，晨起心率比示例基线高大约 6 次。主观精力还没记，所以不能判断必须停练。",
      "如果前两组就明显发沉，把后面的重量或次数降一点，并记一句话。那是当天调整，不是新的训练计划。",
    ],
  },
  {
    id: "delivery",
    question: "下一餐外卖怎么点？",
    answer: [
      "演示回复：点一份能同时看到蛋白质、蔬菜和主食的餐。鸡胸、牛肉、鱼、豆腐都可以，米饭或面留着。",
      "酱和汤底少一点。麻辣香锅可以继续吃，但不要只有锅底和主食，也不要用奶茶代替这一餐。",
      "这是给经常点外卖的居家工作日用的，不是一份营养处方。",
    ],
  },
  {
    id: "hong-kong",
    question: "香港展览那几天还要不要训练？",
    answer: [
      "演示回复：展览那几天把展馆里的走路当作活动量，不再另加训练。",
      "这是虚构行程，用来演示「提前准备」，不是从日历读到的安排。剧本里步行可能超过平时的 8,000 步，同时吃饭和睡眠会被打散。",
      "出发前如果要练，用熟悉重量。返程当天不补课。",
    ],
  },
  {
    id: "heart-rate",
    question: "静息心率高一点需要担心吗？",
    answer: [
      "演示回复：在这套数据里，68 对 62 只够当成一天的恢复信号，不够得出担心或放心的结论。",
      "同一天还有短睡眠和前一晚训练。咖啡、压力和测量时间都没有记录。",
      "今天的用法是：训练不加码，并把精力和咖啡记下来。它不是诊断。",
    ],
  },
  {
    id: "lunch-order",
    question: "一个人工作日午餐，外卖怎样算够用？",
    answer: [
      "演示回复：够用的标准很具体：有蛋白质，有蔬菜，有一份主食，酱不要把味道全部包掉。",
      "时间放在 12:30 左右，避免拖到下午只喝咖啡。吃完用一句话记下，比估算卡路里更有用。",
    ],
  },
  {
    id: "late-dinner",
    question: "训练后的那一餐拖到很晚会怎样？",
    answer: [
      "演示回复：剧本里晚餐大约 21:05，入睡 23:40，中间偏短。可能影响的是入睡，不是一个可以计算的伤害。",
      "今天把训练后进食尽量放在 21:30 前。如果已经晚了，就少一点重油重辣，不要干脆不吃。",
    ],
  },
  {
    id: "fallback-meal",
    question: "如果只有炸鸡和奶茶，怎么补救？",
    answer: [
      "演示回复：先吃，再补一个能加的东西：一份蔬菜、一个鸡蛋、无糖豆浆或稍后的正常晚餐。",
      "不建议把这一餐作废然后饿到晚上。记下实际吃了什么，解读才不会假装知道全天摄入。",
    ],
  },
  {
    id: "how-to-log",
    question: "怎样记一餐才够用？",
    answer: [
      "演示回复：一句话就够：几点、吃了什么、是不是外卖、有没有喝甜饮或咖啡。",
      "现在的整理用关键词规则，不会识别照片，也不是 AI。确认前可以改写它的理解。",
    ],
  },
  {
    id: "photo",
    question: "图片上传后会发生什么？",
    answer: [
      "演示回复：现在什么都不会发生。你可以选一张图，界面只保留文件名，并标明尚未识别。",
      "图片不会上传，也不会被解读成食物或症状。正式的图像能力还没接。",
    ],
  },
  {
    id: "baseline",
    question: "个人基线是什么意思？",
    answer: [
      "演示回复：基线是这个人自己近一段时间的常见水平，不是人群平均值。",
      "剧本里的静息心率基线大约是 62 次/分，深睡占比大约是 18%。它们都是虚构数字，用来说明「和自己比」。",
    ],
  },
];

const routeOrder: Record<string, string[]> = {
  "/": ["steps-vs-training", "delivery", "intensity", "hong-kong", "heart-rate"],
  "/food": ["lunch-order", "delivery", "late-dinner", "fallback-meal"],
  "/log": ["how-to-log", "photo", "lunch-order"],
  "/trends": ["steps-vs-training", "heart-rate", "baseline"],
  "/timeline": ["hong-kong", "steps-vs-training", "baseline"],
  "/me": ["baseline", "heart-rate", "intensity"],
};

export function scriptsForPath(pathname: string) {
  const order = routeOrder[pathname] ?? routeOrder["/"];
  return order
    .map((id) => askScripts.find((script) => script.id === id))
    .filter((script): script is AskScript => Boolean(script));
}
