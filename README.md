# BuyersLens
A sophisticated win-loss analysis platform that transforms customer interview data into polished, shareable reports for executives and sales teams.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jessekorzan/BuyersLens)
BuyersLens is a sophisticated, internal B2B SaaS platform designed for Product Marketing Managers and program owners to streamline win-loss analysis. The application transforms raw customer interview transcripts and data into visually stunning, actionable, and shareable reports. Key features include a main dashboard for aggregated insights, detailed single-interview summaries, a flexible reporting engine powered by a prompt library, and seamless sharing capabilities for stakeholders like executives and sales teams. The platform aims to reduce manual effort, increase the perceived value of win-loss programs, and embed critical competitive insights directly into the GTM workflow.
## Key Features
*   **Polished Single Interview Summaries**: Generate beautiful, readable, and self-contained reports for individual interviews.
*   **Aggregate Reporting**: Create consolidated insights and executive summaries across multiple interviews.
*   **Shareable Insights**: Easily share read-only reports with sellers, executives, and other stakeholders via secure links.
*   **Flexible Insight Generation**: A prompt library powers a scalable architecture for creating various report types, from case studies to trend alerts.
*   **Modern, Data-Centric UI**: A clean, professional, and responsive interface built for an exceptional user experience.
## Technology Stack
*   **Frontend**: React, React Router, Vite
*   **Backend**: Hono on Cloudflare Workers
*   **Storage**: Cloudflare Durable Objects
*   **UI**: Tailwind CSS, Shadcn/UI, Framer Motion
*   **Data Visualization**: Recharts, Tremor
*   **State Management**: Zustand
*   **Language**: TypeScript
## Getting Started
Follow these instructions to get the project up and running on your local machine for development and testing purposes.
### Prerequisites
*   [Bun](https://bun.sh/) installed on your machine.
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for interacting with the Cloudflare platform.
### Installation
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd buyerslens
    ```
2.  **Install dependencies:**
    ```bash
    bun install
    ```
### Running Locally
To start the development server, which includes both the Vite frontend and the Hono backend worker, run:
```bash
bun run dev
```
The application will be available at `http://localhost:3000`.
## Project Structure
*   `src/`: Contains the React frontend application code, including pages, components, and hooks.
*   `worker/`: Contains the Cloudflare Worker backend code, built with Hono. API routes are defined here.
*   `shared/`: Contains TypeScript types and mock data shared between the frontend and backend to ensure type safety.
## Development
*   **Frontend**: The frontend is a standard React application built with Vite. Modify components in `src/components` and pages in `src/pages`.
*   **Backend**: The API is built with Hono. Add or modify API endpoints in `worker/user-routes.ts`. Business logic is encapsulated in entities within `worker/entities.ts`.
*   **Shared Types**: To maintain type safety between the client and server, define all data structures in `shared/types.ts`.
## Deployment
This project is designed for seamless deployment to Cloudflare Pages and Workers.
1.  **Build the project:**
    ```bash
    bun run build
    ```
2.  **Deploy to Cloudflare:**
    Make sure you are logged in to your Cloudflare account via the Wrangler CLI.
    ```bash
    wrangler login
    ```
    Then, deploy the application:
    ```bash
    bun run deploy
    ```
    This command will build the application and deploy it to your Cloudflare account.
Alternatively, you can deploy directly from your GitHub repository.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jessekorzan/BuyersLens)