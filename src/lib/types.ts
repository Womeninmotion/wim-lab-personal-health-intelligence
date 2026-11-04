export type LogCategory =
  | "food"
  | "symptom"
  | "exercise"
  | "mood"
  | "cycle"
  | "social"
  | "other";

export type TaskStatus = "done" | "skipped" | "unrealistic" | "remind";

export type TaskFeedback = {
  status: TaskStatus;
  reason?: string;
  updatedAt: string;
};

export type InterpretedField = {
  id: string;
  label: string;
  value: string;
};

export type SavedLog = {
  id: string;
  createdAt: string;
  updatedAt: string;
  rawText: string;
  category: LogCategory;
  fields: InterpretedField[];
  imageName: string | null;
  imageStatus: "none" | "attached-unprocessed";
};

export type LogPreset = {
  category?: LogCategory;
  prompt?: string;
  draft?: string;
  editId?: string;
  fields?: InterpretedField[];
  imageName?: string | null;
};

export type DrawerState =
  | { name: "closed" }
  | { name: "log"; preset: LogPreset; nonce: number }
  | { name: "ask"; question?: string }
  | { name: "evidence" }
  | { name: "guidance"; priorityId: string };

export type Goal = {
  id: string;
  title: string;
  now: string;
  target: string;
  deviation: string;
  progress: number;
  meterLabel: string;
};

export type YesterdayDimension = {
  id: string;
  title: string;
  data: string;
  meaning: string;
  relation: string;
};

export type Priority = {
  id: string;
  title: string;
  summary: string;
  why: string;
  steps: string[];
  avoid: string;
};

export type PlanTask = {
  id: string;
  time: string;
  title: string;
  detail: string;
};

export type AheadDay = {
  offset: number;
  title: string;
  activity: string;
  food: string;
  schedule: string;
  recovery: string;
};

export type EvidenceItem = {
  id: string;
  claim: string;
  kind: "事实" | "可能的关联" | "尚不能确定";
  source: string;
  note: string;
};

export type Provenance = {
  source: string;
  items: string;
  freshness: string;
};

export type MissingInput = {
  id: string;
  title: string;
  detail: string;
  category: LogCategory;
  prompt: string;
};

export type AskScript = {
  id: string;
  question: string;
  answer: string[];
};
