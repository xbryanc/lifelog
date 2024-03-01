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

export type Diary = Record<string, Log>;

export interface Log {
  rating: number;
  description: string;
}

export interface Subscription {
  _id?: string;
  start: string;
  end: string;
  frequency: SubscriptionFrequency;
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

export enum Span {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export const NAVBAR_HAMBURGER_WIDTH_THRESHOLD = 991;

export const KONAMI_CODE = Object.freeze([
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
]);

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
