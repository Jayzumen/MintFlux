# Personal Finance Tracker "MintFlux"

A modern, full-featured personal finance tracker built with Next.js 15, React, TypeScript, Tailwind CSS, and Firebase. Track your income, expenses, budgets, and visualize your financial data with beautiful charts.

---

## 🚀 Features

- User authentication (register, login, protected routes)
- Dashboard overview with key stats
- Transaction management (add, edit, delete)
- Budget goals and alerts
- Interactive charts (pie, bar, line)
- Responsive sidebar navigation
- Light/dark mode support
- Smooth page transitions (Next.js View Transitions API)
- Firebase backend (Firestore, Auth)

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Language:** TypeScript
- **UI:** Shadcn, Tailwind CSS
- **Charts:** Recharts
- **Auth & Data:** Firebase (Firestore, Auth)
- **Linting/Formatting:** ESLint, Prettier

---

## 📦 Folder Structure

```
finance-tracker/
├── src/
│   ├── app/                # Next.js app directory (routing, pages, layouts)
│   ├── components/         # Reusable React components (Sidebar, AuthGuard, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility and API functions (Firebase, budgets, auth, etc.)
│   ├── types/              # TypeScript type definitions
│   └── ...
├── public/                 # Static assets
├── styles/                 # Global styles (if any)
├── package.json            # Project metadata and scripts
├── tailwind.config.ts      # Tailwind CSS config
├── next.config.ts          # Next.js config
└── ...
```

---

## ⚡ Getting Started

### 1. **Clone the repository**

```bash
git clone https://github.com/your-username/finance-tracker.git
cd finance-tracker
```

### 2. **Install dependencies**

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. **Set up environment variables**

Create a `.env` file in the root with your Firebase config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. **Run the development server**

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🧩 Customization

- **Theme:** Edit `src/components/ThemeProvider.tsx` and Tailwind config for custom colors.
- **Sidebar:** Update `src/components/Sidebar.tsx` for navigation links.
- **Charts:** Modify `src/components/ChartWrapper.tsx` for chart types and styles.
- **Loading UI:** Edit `src/components/LoadingSkeleton.tsx` for custom loading states.

---

## 📝 Scripts

- `dev` - Start development server
- `build` - Build for production
- `start` - Start production server
- `lint` - Run ESLint
- `format` - Run Prettier

---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit and push (`git commit -m 'Add feature' && git push`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
