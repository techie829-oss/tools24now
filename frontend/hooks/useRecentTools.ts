import { useState, useEffect } from 'react';

const MAX_RECENTS = 5;
const STORAGE_KEY = 'tools24now_recent_tools';

export const useRecentTools = () => {
    const [recentTools, setRecentTools] = useState<string[]>([]);

    useEffect(() => {
        // Load from storage on mount
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setRecentTools(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse recent tools", e);
            }
        }
    }, []);

    const addRecentTool = (href: string) => {
        setRecentTools((prev) => {
            // Remove existing if present to move it to top
            const filtered = prev.filter((t) => t !== href);
            // Add to front
            const updated = [href, ...filtered].slice(0, MAX_RECENTS);

            // Persist
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    return { recentTools, addRecentTool };
};
