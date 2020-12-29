import { Subscribable } from './subscribable';
declare class OnlineManager extends Subscribable {
    private online?;
    private removeEventListener?;
    protected onSubscribe(): void;
    setEventListener(setup: (setOnline: () => void) => (online?: boolean) => void): void;
    setOnline(online?: boolean): void;
    onOnline(): void;
    isOnline(): boolean;
    private setDefaultEventListener;
}
export declare const onlineManager: OnlineManager;
export {};
