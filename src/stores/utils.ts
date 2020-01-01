import { PartialState, State } from 'zustand';

export type NamedSetState<T extends State> = (partial: PartialState<T>, name?: any) => void;
