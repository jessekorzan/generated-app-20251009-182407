import { create } from 'zustand';
import { DateRange } from 'react-day-picker';
import { InterviewOutcome, ModalConfig } from '@shared/types';
const initialModalConfig: ModalConfig = {
  isOpen: false,
  initialPromptId: undefined,
  initialOutcomeFilter: undefined,
};
const initialState = {
  dateRange: undefined,
  selectedCompetitors: [],
  selectedOutcomes: [],
  selectedProgramIds: [],
  showChatUI: false,
  modalConfig: initialModalConfig,
  chatInitialMessage: undefined,
};
interface GlobalFiltersState {
  dateRange: DateRange | undefined;
  selectedCompetitors: string[];
  selectedOutcomes: InterviewOutcome[];
  selectedProgramIds: string[];
  showChatUI: boolean;
  modalConfig: ModalConfig;
  chatInitialMessage: string | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  setSelectedCompetitors: (competitors: string[]) => void;
  setSelectedOutcomes: (outcomes: InterviewOutcome[]) => void;
  setSelectedProgramIds: (programIds: string[]) => void;
  setShowChatUI: (show: boolean) => void;
  clearAllFilters: () => void;
  openReportModal: (config?: Partial<Omit<ModalConfig, 'isOpen'>>) => void;
  closeReportModal: () => void;
  setChatInitialMessage: (message: string | undefined) => void;
}
export const useGlobalFiltersStore = create<GlobalFiltersState>((set) => ({
  ...initialState,
  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedCompetitors: (competitors) => set({ selectedCompetitors: competitors }),
  setSelectedOutcomes: (outcomes) => set({ selectedOutcomes: outcomes }),
  setSelectedProgramIds: (programIds) => set({ selectedProgramIds: programIds }),
  setShowChatUI: (show) => set({ showChatUI: show }),
  clearAllFilters: () => set({
    dateRange: undefined,
    selectedCompetitors: [],
    selectedOutcomes: [],
    selectedProgramIds: [],
  }),
  openReportModal: (config) => set({
    modalConfig: {
      ...initialModalConfig,
      ...config,
      isOpen: true,
    }
  }),
  closeReportModal: () => set({ modalConfig: initialModalConfig }),
  setChatInitialMessage: (message) => set({ chatInitialMessage: message }),
}));