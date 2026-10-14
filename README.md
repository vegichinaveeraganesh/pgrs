# RDO Bhimunipatnam - PGRS (Public Grievance Redressal System)

A full-stack grievance tracking portal for the Revenue Divisional Office, Bhimunipatnam.

## Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Frontend   | Angular 21 + TypeScript           |
| Backend    | Node.js + Express.js              |
| Database   | MongoDB (Mongoose ODM)            |
| Auth       | JWT (Access + Refresh tokens)     |

## Project Structure

```
pgrs/
├── frontend/          # Angular application
│   ├── src/
│   ├── angular.json
│   └── package.json
│
├── backend/           # Node.js + Express API
│   ├── src/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Local Development

### Backend

```bash
cd backend
cp .env.example .env    # Configure your environment variables
npm install
npm run dev             # Starts on http://localhost:5001
```

### Frontend

```bash
cd frontend
npm install
ng serve                # Starts on http://localhost:4200
```

## Deployment

| Service   | Platform | Root Directory |
| --------- | -------- | -------------- |
| Frontend  | Vercel   | `frontend`     |
| Backend   | Render   | `backend`      |

### Vercel (Frontend)

1. Import GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** → `frontend`
3. Build Command → `ng build`
4. Output Directory → `dist/frontend/browser`

### Render (Backend)

1. Create a **Web Service** on [render.com](https://render.com)
2. Set **Root Directory** → `backend`
3. Build Command → `npm install`
4. Start Command → `npm start`
5. Add environment variables from `.env.example`

## Environment Variables

See [`backend/.env.example`](backend/.env.example) for required configuration.

## License

Private — RDO Bhimunipatnam
