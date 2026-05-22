export interface UserBalance {
  user: string;
  /** positive = they owe you, negative = you owe them */
  amount: number;
}

export interface BalanceSummary {
  youOwe: number;
  youAreOwed: number;
  net: number;
  perUser: UserBalance[];
}