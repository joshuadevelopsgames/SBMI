# Optional: local development

Only needed if you run the app on your machine instead of AWS.

1. **Postgres**  
   Use an existing dev database, or start one with Docker:
   ```bash
   docker run -d --name sbmi-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sbmi -p 5432:5432 postgres:16-alpine
   ```

2. **`.env`**  
   Set at least:
   - `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sbmi"` (adjust if different)
   - `SESSION_SECRET` (any string for dev)
   - Optionally `NEXT_PUBLIC_APP_URL="http://localhost:3000"` for reset/2FA links
   - For payment summary and Make Payment: `MONTHLY_CONTRIBUTION_CENTS` and `PENALTY_AMOUNT_CENTS` (e.g. 2000 and 500). If unset, dashboard shows “configuration required”.

3. **Migrations and seed**
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

4. **Run**
   ```bash
   npm run dev
   ```

5. **Bylaws PDF**  
   Place the current bylaws file at `public/bylaws.pdf` so the dashboard “Bylaws (PDF)” link works. Replace the file when SBMI approves updates.

With AWS hosting, you can skip this and run only on the deployed environment.
