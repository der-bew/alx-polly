# ALX Polly

A secure, user-friendly polling application built with Next.js and Supabase. Users can create polls, vote, and manage their polls and profiles.

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel or any Node-compatible platform

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/der-bew/alx-polly.git
   cd alx-polly
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Supabase Configuration**
   - Create a project at [Supabase.io](https://supabase.io).
   - Copy your project's `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
   - Set these in your local `.env` file:

     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

   - [Optional] Set up additional environment variables as needed (see `.env.example`).

4. **Database Tables**
   - Use Supabase SQL editor to create `polls`, `votes`, and users tables as per the schema in `/supabase/migrations`.

5. **Run the app locally**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Test the app locally**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Register/login and try creating, editing, and voting on polls.

## Usage Examples

- **Create a Poll**
  - Click "Create Poll" in the dashboard.
  - Enter a question and at least two options.
  - Submit to make the poll public.

- **Vote on a Poll**
  - Select a poll from the dashboard or shared link.
  - Choose an option and submit your vote.
  - Results are updated in real time.

- **Edit/Delete Polls**
  - Only the poll's creator can edit or delete.
  - Use the dashboard's "Edit" or "Delete" buttons.

## Development & Testing

- All authentication and poll actions are handled via Supabase.
- Use environment variables to point to your Supabase project in development.
- Run `npm run dev` for hot-reloading.
- See `/app/lib/actions/` for server actions, and `/app/(dashboard)/` for UI components.

---

## Security Notes

- Session and authorization checks are enforced server-side.
- All user input is validated and sanitized to prevent XSS and SQL injection.
- API rate limiting is implemented on sensitive endpoints.
- See "Security Audit" in this README for details.
