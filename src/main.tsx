import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { App } from '@/App';
import { HomePage } from '@/pages/HomePage'
import { InterviewReportPage } from '@/pages/InterviewReportPage';
import { SharedReportPage } from '@/pages/SharedReportPage';
import { PromptLibraryPage } from '@/pages/PromptLibraryPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { ThemesPage } from '@/pages/ThemesPage';
import { ReportsListingPage } from '@/pages/ReportsListingPage';
import { AggregateReportPage } from '@/pages/AggregateReportPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { SettingsPage } from '@/pages/SettingsPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "interview/:id",
        element: <InterviewReportPage />,
      },
      {
        path: "prompts",
        element: <PromptLibraryPage />,
      },
      {
        path: "reports",
        element: <ReportsListingPage />,
      },
      {
        path: "reports/aggregate/:id",
        element: <AggregateReportPage />,
      },
      {
        path: "themes",
        element: <ThemesPage />,
      },
      {
        path: "users",
        element: <UserManagementPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "/share/:id",
    element: <SharedReportPage />,
    errorElement: <RouteErrorBoundary />,
  }
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)