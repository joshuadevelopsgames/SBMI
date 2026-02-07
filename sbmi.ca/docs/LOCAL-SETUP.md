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

3. **Migrations and seed**
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

4. **Run**
   ```bash
   npm run dev
   ```

With AWS hosting, you can skip this and run only on the deployed environment.
