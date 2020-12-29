import React from 'react';
export declare const Entry: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const Label: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const Value: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const SubEntries: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const Info: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const Expander: ({ expanded, style, ...rest }: {
    [x: string]: any;
    expanded: any;
    style?: {} | undefined;
}) => JSX.Element;
export default function Explorer({ value, defaultExpanded, renderer, pageSize, depth, ...rest }: {
    [x: string]: any;
    value: any;
    defaultExpanded: any;
    renderer?: (({ handleEntry, label, value, subEntries, subEntryPages, type, expanded, toggle, pageSize, }: {
        handleEntry: any;
        label: any;
        value: any;
        subEntries: any;
        subEntryPages: any;
        type: any;
        expanded: any;
        toggle: any;
        pageSize: any;
    }) => JSX.Element) | undefined;
    pageSize?: number | undefined;
    depth?: number | undefined;
}): JSX.Element;
