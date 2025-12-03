import { useEffect, useState } from "react";
import {
    ActionPanel,
    Action,
    List,
    Icon,
    closeMainWindow,
    open,
} from "@vicinae/api";

export default function () {
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (searchText && !/^\s*$/.test(searchText)) {
            setIsLoading(true);
            getSearchSuggestions(searchText)
                .then(setSuggestions)
                .finally(() => setIsLoading(false));
        } else {
            setSuggestions([]);
            setIsLoading(false);
        }

        return () => setSuggestions([]);
    }, [searchText]);

    return (
        <List
            isLoading={isLoading}
            onSearchTextChange={setSearchText}
            searchBarPlaceholder="Let's fetch..."
            throttle={true}
        >
            <SearchItem query={searchText} />
            {suggestions.map((query) => (
                <SearchItem query={query} />
            ))}
        </List>
    );
}

function SearchItem({ query }: { query: string }) {
    return (
        <List.Item
            id={query}
            key={query}
            title={query}
            icon={Icon.MagnifyingGlass}
            actions={
                <ActionPanel>
                    <Action
                        title="Open in Browser"
                        icon={Icon.Globe}
                        shortcut="open"
                        onAction={() => openSearch(query)}
                    />
                    <Action
                        title="Open in Kagi Assistant"
                        icon={Icon.ComputerChip}
                        onAction={() => openAssistant(query)}
                    />
                </ActionPanel>
            }
        />
    );
}

async function getSearchSuggestions(query: string): Promise<string[]> {
    const response = await fetch(
        `https://kagi.com/api/autosuggest?q=${encodeURIComponent(query)}`,
        {
            headers: {
                Accept: "application/json",
            },
        },
    );
    const data = await response.json();
    const suggestions = data[1] as string[];

    // Remove the original term from suggestions if present to avoid
    // duplication, since we always render the exact query separately as the
    // first item
    const originalTermIndex = suggestions.indexOf(query);
    if (originalTermIndex >= 0) {
        suggestions.splice(originalTermIndex, 1);
    }

    return suggestions;
}

async function openSearch(query: string) {
    await open(`https://kagi.com/search?q=${encodeURIComponent(query)}`);
    await closeMainWindow();
}

async function openAssistant(query: string) {
    await open(`https://kagi.com/assistant?q=${encodeURIComponent(query)}`);
    await closeMainWindow();
}
