# Images & Prompts

Welcome to **Images & Prompts**, a full-stack application designed to reverse-engineer AI-generated images to reveal the prompts used to create them. The project features a Next.js frontend that calls a local AI model via an API route, and uses Supabase for the database, authentication, and storage.

## Tech Stack

- **Monorepo:** Managed with npm workspaces.
- **Frontend (`apps/web`):**
  - Framework: **Next.js** (Pages Router)
  - Authentication: **@supabase/ssr** for server-side and client-side auth.
  - Styling: **Tailwind CSS**
  - Theming: **next-themes** for light/dark mode support.
- **Backend & AI:**
  - **API:** Next.js API Routes (`apps/web/pages/api`).
  - **AI Model (`packages/prompt-model`):** A local **Salesforce BLIP** model wrapped in a Python script, executed from the Next.js API.
  - **Database & Auth:** **Supabase** (PostgreSQL, Authentication, Storage).
- **Scraper (`apps/scraper`):**
  - A standalone **Python** application for scraping public prompt libraries.
- **Deployment:** Configured for **Vercel** (`vercel.json`) and **GitHub Actions** for CI/CD.

---

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Python (v3.11 or later)
- `npm` for Node.js package management
- `pip` and `venv` for Python package management

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd IandP
    ```

2.  **Set up Environment Variables:**

    - In the `apps/web` directory, copy `.env.example` to a new file named `.env.local`.

    ```bash
    cp apps/web/.env.example apps/web/.env.local
    ```

    - Fill in your Supabase URL and Anon Key in `apps/web/.env.local`.

3.  **Install Frontend Dependencies:**
    From the project root, run:

    ```bash
    npm install
    ```

4.  **Install AI Model & Scraper Dependencies:**

    - Create and activate a Python virtual environment:
      ```bash
      python -m venv .venv
      source .venv/bin/activate  # On Windows, use: .\\.venv\\Scripts\\activate
      ```
    - Install the required packages for the scraper:
      ```bash
      pip install -r apps/scraper/requirements.txt
      ```

5.  **Set up Supabase:**
    - In your Supabase project, create a storage bucket named `uploads`.
    - Run the SQL code from `infra/supabase-schema.sql` in the Supabase SQL Editor to create all necessary tables, functions, and policies.

### Running the Application

1.  **Start the Web Application:**
    From the project root:
    ```bash
    npm run dev
    ```
    The web application will be available at `http://localhost:3000`.

---

## Project Structure

- **`apps/web`**: The main Next.js frontend application, including all pages, API routes, and components.
- **`apps/scraper`**: A standalone Python application responsible for scraping public prompt data. All scraper source scripts are located in `apps/scraper/sources/`.
- **`packages/ui`**: A shared library of reusable React UI components (e.g., `Card`, `GradientButton`) to ensure a consistent design system.
- **`packages/prompt-model`**: The core AI logic. Contains a Python script for image-to-text generation and a JavaScript wrapper to call it from the Next.js backend.
- **`packages/context`**: Contains the `AuthContext` for managing user authentication state across the web app.
- **`infra/`**: Contains all infrastructure-as-code. `supabase-schema.sql` is the single source of truth for the database, and `vercel.json` configures deployment.
- **`docs/`**: Project planning and architecture documents, including the `roadmap.md`.
