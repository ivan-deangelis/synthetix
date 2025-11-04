"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

type HeaderTitleContextValue = {
    titleOverride: string | null;
    setTitleOverride: (title: string | null) => void;
};

const HeaderTitleContext = createContext<HeaderTitleContextValue | undefined>(
    undefined
);

export function HeaderTitleProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [titleOverride, setTitleOverrideState] = useState<string | null>(
        null
    );

    const setTitleOverride = useCallback((title: string | null) => {
        setTitleOverrideState(title);
    }, []);

    const value = useMemo(
        () => ({ titleOverride, setTitleOverride }),
        [titleOverride, setTitleOverride]
    );

    return (
        <HeaderTitleContext.Provider value={value}>
            {children}
        </HeaderTitleContext.Provider>
    );
}

export function useHeaderTitle() {
    const ctx = useContext(HeaderTitleContext);
    if (!ctx) {
        throw new Error(
            "useHeaderTitle must be used within HeaderTitleProvider"
        );
    }
    return ctx;
}
