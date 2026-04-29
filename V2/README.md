# SBMI.ca - Samuel Bete Mutual Iddir

This is the official web application for the Samuel Bete Mutual Iddir (SBMI), a community-based mutual assistance association. The application provides a public-facing information site, a secure portal for members to manage their accounts, and a comprehensive admin dashboard for managing the organization.

## Features

### Public Site

- **Welcome Page**: A single-page overview of the Iddir, its mission, benefits, and contact information.
- **Application Form**: A simple form for prospective members to apply for membership.

### Member Portal

- **Authentication**: Secure login with email/password and Two-Factor Authentication (2FA).
- **Dashboard**: A summary of membership status, payment dues, and quick links.
- **Family Management**: Members can add, edit, and remove family members covered under their plan.
- **Payments**: Integrated with Stripe for one-time and recurring monthly payments. Members can view their full payment history.
- **Profile Management**: Members can update their name, email address, and password.
- **Bylaws**: Easy access to download the official SBMI bylaws PDF.
- **Assistance Requests**: A form for members to submit bereavement assistance requests.

### Admin Portal

- **Secure Access**: Restricted to users with the `ADMIN` role.
- **Dashboard**: An at-a-glance overview of key metrics like active members, overdue payments, pending applications, and assistance requests.
- **Member Management**: View a full list of members, filter by status (e.g., overdue), and view detailed profiles for each member.
- **Application Review**: Approve or reject new membership applications, which automatically creates a member account and sends a welcome email.
- **Assistance Request Management**: View and manage all assistance requests submitted by members.
- **Configuration**: A settings page to manage key application variables like monthly contribution amount, penalty fees, and admin email.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: Custom implementation with session cookies, 2FA, and password reset flows.
- **Payments**: [Stripe](https://stripe.com/)
- **Styling**: Global CSS with CSS Variables (No UI library)
- **Deployment**: Vercel / Supabase (as per original spec)

## Getting Started

### 1. Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm
- A PostgreSQL database
- A Stripe account with API keys
- An email service provider (e.g., Resend, SendGrid) for transactional emails.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/joshuadevelopsgames/feature-dump.git
cd feature-dump/sbmi.ca
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root of the project and add the following environment variables. Replace the placeholder values with your actual credentials.

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# NextAuth / Session Management
# Generate a secret using: openssl rand -base64 32
SESSION_SECRET="YOUR_SESSION_SECRET"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (using Resend as an example)
RESEND_API_KEY="re_..."
EMAIL_FROM="SBMI Admin <no-reply@yourdomain.com>"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

Run the Prisma migrations to set up your database schema:

```bash
npx prisma migrate dev
```

(Optional) Seed the database with initial configuration and a test admin user:

```bash
npx prisma db seed
```

### 5. Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

- **Admin Login**: If you seeded the database, you can log in with `admin@sbmi.ca` / `password123`.

## License

This project is proprietary and confidential. All rights reserved.
