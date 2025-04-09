import { useEffect, useState } from "react";

export function usePresistedState<T = undefined>(key: string, initialValue: T) {
    const [state, setState] = useState(() => {
        if (typeof window !== "undefined") {
            const savedValue = localStorage.getItem(key);
            if (savedValue) {
                return JSON.parse(savedValue);
            }
        }
        return initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}