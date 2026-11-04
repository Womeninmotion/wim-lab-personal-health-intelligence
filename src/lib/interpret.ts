import type { InterpretedField, LogCategory } from "@/lib/types";

export const categoryLabels: Record<LogCategory, string> = {
  food: "饮食",
  symptom: "症状",
  exercise: "运动",
  mood: "心情",
  cycle: "周期",
  social: "社交",
  other: "其他",
};

const keywordRules: { category: LogCategory; words: string[] }[] = [
  { category: "cycle", words: ["经期", "月经", "例假", "生理期"] },
  { category: "symptom", words: ["疼", "痛", "头痛", "头晕", "腹胀", "恶心", "失眠", "不舒服"] },
  { category: "mood", words: ["心情", "焦虑", "开心", "烦", "压力", "情绪", "低落", "精力", "累"] },
  { category: "social", words: ["朋友", "聚会", "应酬", "聚餐", "社交", "同事"] },
  { category: "exercise", words: ["跑步", "训练", "健身", "瑜伽", "走路", "散步", "步数", "力量", "课"] },
  { category: "food", words: ["吃", "午餐", "晚餐", "早餐", "外卖", "咖啡", "饭", "沙拉", "喝", "茶", "奶茶"] },
];

const relations: Record<LogCategory, string> = {
  food: "可与今日「下一餐」对照。这只是关键词提示，不是营养分析。",
  symptom: "可与睡眠、训练强度放在一起看。单条记录不能说明原因。",
  exercise: "步数和训练课需要分开看，避免把同一次活动算两遍。",
  mood: "主观精力会影响到今天训练要不要保持原计划。",
  cycle: "只作为背景记下。演示数据不会推断周期阶段。",
  social: "聚餐或应酬通常会改动吃饭时间和睡眠，先当作日程背景。",
  other: "先原样保存。规则没有足够线索做进一步整理。",
};

export function suggestCategory(text: string): LogCategory | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;
  const found = keywordRules.find((rule) =>
    rule.words.some((word) => normalized.includes(word.toLowerCase())),
  );
  return found?.category ?? null;
}

function detectWhen(text: string) {
  if (/凌晨|夜里|深夜/.test(text)) return "夜里";
  if (/早上|清晨|早餐|起床/.test(text)) return "早晨";
  if (/中午|午餐|午间/.test(text)) return "中午";
  if (/下午/.test(text)) return "下午";
  if (/晚上|晚餐|今晚|昨夜|昨天晚上/.test(text)) return "晚上";
  return "未写明时间";
}

export function interpretEntry(text: string, category: LogCategory): InterpretedField[] {
  const trimmed = text.trim();
  const summary = trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
  return [
    { id: "summary", label: "摘要", value: summary || "（空）" },
    { id: "when", label: "时间线索", value: detectWhen(trimmed) },
    {
      id: "detail",
      label: "整理",
      value: trimmed
        ? `按「${categoryLabels[category]}」保存原文要点。`
        : "没有可以整理的文字。",
    },
    { id: "relation", label: "可能相关", value: relations[category] },
    { id: "correction", label: "需要改写的地方", value: "" },
  ];
}

export function demoAnswer(question: string) {
  const suggested = suggestCategory(question);
  const topic = suggested ? categoryLabels[suggested] : "综合";
  return [
    "这是写好的演示回复，不是实时模型输出。ASK 没有连接 AI 服务，也读不到你的真实记录。",
    `你的问题被归到示例话题「${topic}」。在当前剧本里，昨天有一节力量训练，但居家白天步数仍然低；午餐缺失；睡眠偏短。今天的方向是补走动、把下一餐吃具体，训练先不加码。`,
    "如果这个问题超出上面的示例剧本，正式版本需要接上你自己的数据和可解释的模型。现在不会编造一个个性化结论。",
  ];
}
