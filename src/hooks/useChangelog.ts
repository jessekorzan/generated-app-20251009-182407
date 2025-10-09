import { useState, useEffect, useMemo } from 'react';
const CHANGELOG_KEY = 'buyerslens-changelog-version';
export interface ChangelogItem {
  version: string;
  date: string;
  changes: {
    type: 'New' | 'Improved' | 'Fixed';
    text: string;
  }[];
}
const changelogItems: ChangelogItem[] = [
  {
    version: '1.2.0',
    date: 'October 3, 2025',
    changes: [
      { type: 'New', text: 'Added a "What\'s New" changelog to keep you updated!' },
      { type: 'New', text: 'Integrated Chat UI as a permanent right-hand sidebar for a seamless conversational experience.' },
      { type: 'Improved', text: 'The main content area and chat sidebar now scroll independently for better usability.' },
    ],
  },
  {
    version: '1.1.0',
    date: 'September 28, 2025',
    changes: [
      { type: 'New', text: 'Implemented "Blind Spot Interviews" to give you insights from deals you weren\'t even in.' },
      { type: 'Improved', text: 'Enhanced the dashboard chart with a toggle to view "Buyer Decision Drivers".' },
      { type: 'Improved', text: 'Replaced "Recent Interviews" with a "Key Soundbites" widget to highlight impactful quotes.' },
    ],
  },
  {
    version: '1.0.0',
    date: 'September 20, 2025',
    changes: [
      { type: 'New', text: 'Initial release of BuyersLens! Welcome to the new era of win-loss analysis.' },
      { type: 'New', text: 'Dashboard with aggregate stats and visualizations.' },
      { type: 'New', text: 'Generate, view, and share detailed interview reports.' },
      { type: 'New', text: 'Global filters for date, competitor, outcome, and program.' },
    ],
  },
];
export function useChangelog() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSeenVersion, setLastSeenVersion] = useState<string | null>(null);
  useEffect(() => {
    const storedVersion = localStorage.getItem(CHANGELOG_KEY);
    setLastSeenVersion(storedVersion);
  }, []);
  const latestVersion = useMemo(() => changelogItems[0].version, []);
  const hasUnread = useMemo(() => {
    if (!lastSeenVersion) return true; // If they've never seen it, it's unread
    return latestVersion > lastSeenVersion;
  }, [latestVersion, lastSeenVersion]);
  const markAsRead = () => {
    localStorage.setItem(CHANGELOG_KEY, latestVersion);
    setLastSeenVersion(latestVersion);
  };
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    markAsRead();
  };
  return {
    isModalOpen,
    openModal,
    closeModal,
    hasUnread,
    changelogItems,
  };
}