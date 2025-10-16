
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO string
  description: string;
  accountId: string;
}

export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  currency: string;
}

export enum AppActionType {
    ADD_TRANSACTION = 'ADD_TRANSACTION',
    UPDATE_TRANSACTION = 'UPDATE_TRANSACTION',
    DELETE_TRANSACTION = 'DELETE_TRANSACTION',
    ADD_ACCOUNT = 'ADD_ACCOUNT',
    UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
    DELETE_ACCOUNT = 'DELETE_ACCOUNT',
}

export type AppAction =
  | { type: AppActionType.ADD_TRANSACTION; payload: Transaction }
  | { type: AppActionType.UPDATE_TRANSACTION; payload: Transaction }
  | { type: AppActionType.DELETE_TRANSACTION; payload: { id: string } }
  | { type: AppActionType.ADD_ACCOUNT; payload: Account }
  | { type: AppActionType.UPDATE_ACCOUNT; payload: Account }
  | { type: AppActionType.DELETE_ACCOUNT; payload: { id: string } };

export interface AppState {
    transactions: Transaction[];
    accounts: Account[];
}
