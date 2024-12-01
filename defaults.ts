import {v4 as uuidv4} from "uuid";

export type ExtractStatics<C extends { prototype: any }> = Omit<C, "prototype">;

export interface User {
  name: string;
  googleid: string;
  diary: Diary;
  finance: FinanceLog;
  tags: string[];
  subscriptions: Subscription[];
  goals: GoalsList;
  friends: Friend[];
}

export type FinanceLog = Record<string, Transaction[]>;

export interface Transaction {
  id?: string;
  cost: number;
  description: string;
  location: string;
  tags: string[];
}

export interface TransactionListItem {
  cost: number;
  location: string;
  date: string;
}

export interface TransactionSummary {
  total: number;
  itemized: Record<string, number>;
  transactionList: Record<string, TransactionListItem[]>;
}

export type Diary = Record<string, Log>;

export interface Log {
  rating: number;
  productivity: number;
  description: string;
  revised?: boolean;
}

export interface Subscription {
  _id?: string;
  start: string;
  end: string;
  frequency: SubscriptionFrequency;
  frequencyGap: number;
  cost: number;
  description: string;
  location: string;
  tags: string[];
}

export type GoalsList = Record<string, Goal[]>; // key is "year-quarter(0-indexed)"

export interface Goal {
  id?: string;
  name: string;
  description: string;
  status: GoalStatus;
}

export enum GoalStatus {
  FAILED = "failed",
  PASSED = "passed",
  IN_PROGRESS = "in progress",
}

export interface Friend {
  _id?: string;
  name: string;
  lastUpdated: string;
}

export enum SubscriptionFrequency {
  EMPTY = "",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export const FREQUENCY_TO_DISPLAY: Record<SubscriptionFrequency, string> = {
  [SubscriptionFrequency.EMPTY]: "",
  [SubscriptionFrequency.DAILY]: "day(s)",
  [SubscriptionFrequency.WEEKLY]: "week(s)",
  [SubscriptionFrequency.MONTHLY]: "month(s)",
  [SubscriptionFrequency.YEARLY]: "year(s)",
};

export enum Span {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export const MISC_TAG = "MISC";

export const EMPTY_TRANSACTION = (): Transaction => ({
  id: uuidv4(),
  cost: 0,
  description: "",
  location: "",
  tags: [],
});

export const EMPTY_SUBSCRIPTION = (): Subscription => ({
  cost: 0,
  description: "",
  location: "",
  tags: [],
  start: "",
  end: "",
  frequency: SubscriptionFrequency.EMPTY,
  frequencyGap: 1,
});

export const EMPTY_GOAL = (): Goal => ({
  name: "",
  description: "",
  status: GoalStatus.IN_PROGRESS,
});

export const EPOCH = new Date("1970-01-01");

export const NEW_FRIEND = (): Friend => ({
  name: "",
  lastUpdated: EPOCH.toLocaleDateString(),
})

export const STAR_MAX = 10;
export const INF = 1e18; // large number
