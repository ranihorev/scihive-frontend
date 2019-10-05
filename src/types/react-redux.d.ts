import 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { Component } from 'react';
import { RootState as RootStateOriginal } from '../models';

declare module 'react-redux' {
  // Add removed inferrable type to support connect as decorator
  // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/16652
  export type InferableComponentDecorator<TOwnProps> = <T extends Component<TOwnProps>>(component: T) => T;
}

declare global {
  type RootState = RootStateOriginal;
  type GetState = () => RootState;
  type RTDispatch = ThunkDispatch<RootState, null, Action<any>>;
  type RTAction = (...args: any[]) => (dispatch: RTDispatch, getState: GetState) => void;
}
