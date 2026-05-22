export interface Settlement {
  id: string;
  fromUser: string;
  toUser: string;
  amount: number;
  note?: string;
  date: Date;
}