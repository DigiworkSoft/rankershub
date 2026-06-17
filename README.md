# RankersHub — Best Commerce Classes in Pune 🎓

A full-stack Next.js web application for RankersHub, a leading Commerce coaching institute in Pune, Maharashtra.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (local via `pg`) |
| Auth | JWT + bcryptjs |
| Animations | Framer Motion |
| Icons | Lucide React |

## 📁 Project Structure

```
b:\rankershub 2
├── app/
│   ├── _components/        # Shared UI components (Navbar, Footer, etc.)
│   ├── api/                # API Route Handlers
│   │   ├── admin/          # Protected admin endpoints (JWT-guarded)
│   │   ├── blogs/          # Blog CRUD
│   │   ├── courses/        # Course listings
│   │   ├── enquiry/        # Enrollment enquiry handler
│   │   ├── faqs/           # FAQ endpoints
│   │   └── videos/         # YouTube video management
│   ├── about/              # About Us page
│   ├── admin/              # Admin Dashboard (protected)
│   ├── batches/
│   │   ├── page.tsx        # Server Component (async DB queries)
│   │   └── BatchesClient.tsx # Client Component (UI interactivity)
│   ├── blogs/
│   │   ├── page.tsx        # Server Component (async DB queries)
│   │   ├── BlogsClient.tsx # Client Component (search, filter)
│   │   └── [id]/           # Individual blog article
│   ├── contact/            # Contact page
│   └── admission/          # Admission enquiry page
├── lib/
│   ├── db.ts               # PostgreSQL connection pool
│   ├── auth.ts             # JWT helpers
│   └── utils.ts            # Central image URL utility
├── public/
│   ├── assets/             # Static images and branding
│   └── uploads/            # Uploaded images (excluded from Git)
├── scripts/                # DB setup and migration scripts
│   ├── db-schema.sql       # Full database schema
│   ├── apply-schema.mjs    # Apply schema to DB
│   └── *.mjs               # Other utility scripts
├── .env.local.example      # Environment variable reference (safe to commit)
└── .gitignore
```

## ⚙️ Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/rankershub.git
cd rankershub
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Copy the example env file and fill in your values:
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/rankershub
JWT_SECRET=your_super_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

### 4. Set up the Database
Make sure PostgreSQL is running, then apply the schema:
```bash
node scripts/apply-schema.mjs
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Admin Panel
Visit `/admin` and log in with your admin credentials set in `.env.local`.

From the admin panel you can:
- Manage Courses & Batches
- Publish and delete Blog articles
- Add YouTube demo lecture videos
- Manage FAQs displayed on the Batches page
- View Enrollment Enquiries

## 📦 Build for Production
```bash
npm run build
npm start
```

## 📄 License
Private project. All rights reserved © RankersHub Pune.
