
import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { AppState, AppAction, AppActionType, Transaction, Account } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const initialState: AppState = {
  transactions: [],
  accounts: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case AppActionType.ADD_TRANSACTION:
      return { ...state, transactions: [...state.transactions, action.payload] };
    case AppActionType.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case AppActionType.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload.id),
      };
    case AppActionType.ADD_ACCOUNT:
        return { ...state, accounts: [...state.accounts, action.payload] };
    case AppActionType.UPDATE_ACCOUNT:
        return {
            ...state,
            accounts: state.accounts.map((a) =>
            a.id === action.payload.id ? action.payload : a
            ),
        };
    case AppActionType.DELETE_ACCOUNT:
        // Also delete associated transactions
        return {
            ...state,
            accounts: state.accounts.filter((a) => a.id !== action.payload.id),
            transactions: state.transactions.filter((t) => t.accountId !== action.payload.id),
        };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
    const [savedState, setSavedState] = useLocalStorage<AppState>('finance-tracker-state', initialState);

    const reducerWithLocalStorage = (state: AppState, action: AppAction) => {
        const newState = appReducer(state, action);
        setSavedState(newState);
        return newState;
    };

    const [state, dispatch] = useReducer(reducerWithLocalStorage, savedState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
