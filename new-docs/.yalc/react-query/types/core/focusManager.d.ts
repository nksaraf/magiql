import { Subscribable } from './subscribable';
declare class FocusManager extends Subscribable {
    private focused?;
    private removeEventListener?;
    protected onSubscribe(): void;
    setEventListener(setup: (onFocus: () => void) => (focused?: boolean) => void): void;
    setFocused(focused?: boolean): void;
    onFocus(): void;
    isFocused(): boolean;
    private setDefaultEventListener;
}
export declare const focusManager: FocusManager;
export {};
