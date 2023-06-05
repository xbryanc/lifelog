export type ExtractStatics<C extends { prototype: any }> = Omit<C, "prototype">;

/*
Subscription structure: list of:
[
    {
        start: String,
        end: String,
        frequency: String,
        cost: Number,
        description: String,
        location: String,
        tags: [String],
        ---
        show: Boolean (always set to False),
        editing: Boolean,
        editCost: Number,
        editDescription: String,
        editLocation: String,
        ---
    }
]
*/

/*
Goals structure: record from "year-quarter" to:
[
    {
        name: String,
        description: String,
        status: String, // (failed, passed, in progress)
        ---
        show: Boolean (always set to False),
        editing: Boolean,
        editName: string,
        editDescription: string,
    }
]
*/

/*
Diary structure: object from date strings to:
{
    rating: Number
    description: String
}
*/

/*
Finance structure: object from date strings to:
[
    {
        cost: Number,
        description: String,
        location: String,
        tags: [String],
        ---
        show: Boolean (always set to False),
        editing: Boolean,
        editCost: Number,
        editDescription: String,
        editLocation: String,
        ---
    }
]
*/

export type FinanceLog = Record<string, Transaction[]>;

export interface Transaction {
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
  start: string;
  end: string;
  frequency: string;
  cost: number;
  description: string;
  location: string;
  tags: string[];
}

export type GoalsList = Record<string, Goal[]>; // key is "year-quarter(0-indexed)"

export interface Goal {
  name: string;
  description: string;
  status: GoalStatus;
}

export enum GoalStatus {
  FAILED = "failed",
  PASSED = "passed",
  IN_PROGRESS = "in progress",
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

export const KONAMI_CODE = [
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
];

export const EMPTY_TRANSACTION: Transaction = {
  cost: 0,
  description: "",
  location: "",
  tags: [],
};

export const EMPTY_SUBSCRIPTION: Subscription = {
  cost: 0,
  description: "",
  location: "",
  tags: [],
  start: "",
  end: "",
  frequency: "",
};
export const EMPTY_GOAL: Goal = {
  name: "",
  description: "",
  status: GoalStatus.IN_PROGRESS,
};

export const STAR_MAX = 10;
export const INF = 1e18; // large number
