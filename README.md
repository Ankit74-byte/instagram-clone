# Instagram Clone

A beginner-friendly full-stack Instagram-inspired social media app built with React, Express, and MongoDB.

## Features

- User signup and login with JWT
- Responsive Instagram-inspired feed
- Create posts with image upload and captions
- Like and unlike posts
- Comment on posts
- User profile page with stats and grid layout
- Search users by username
- Responsive sidebar and mobile navigation
- Demo seeded users and sample posts

## Tech Stack

- Frontend: React + Vite + CSS
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT
- Uploads: Multer

## Repository Structure

```
instagram-clone/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
├── .gitignore
├── README.md
└── package.json
```

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string
- npm

## Backend Setup

1. Change into the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MongoDB URI and JWT secret.

5. Start MongoDB locally if needed.

6. Seed sample users/posts:
   ```bash
   npm run seed
   ```

7. Start the backend server:
   ```bash
   npm start
   ```

The backend should run at:
```text
http://localhost:5000
```

## Frontend Setup

1. Change into the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

4. Start the frontend dev server:
   ```bash
   npm run dev
   ```

The app should run at:
```text
http://localhost:5173
```

## Demo Login

After seeding, use one of the demo accounts:

- `mila@example.com` / `password123`
- `liam@example.com` / `password123`
- `zoe@example.com` / `password123`

## Environment Variables

Backend `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/instagram-clone
JWT_SECRET=supersecretjwtkey
```

Frontend `.env.example`:
```env
VITE_API_URL=http://localhost:5000
```

## Run Both Together

Open two terminals and run:

```bash
cd backend && npm install && npm run seed && npm start
```

```bash
cd frontend && npm install && npm run dev
```

## Notes

- Uploaded post images are saved inside `backend/uploads`.
- The UI is responsive and optimized for desktop and mobile screens.
- The app uses demo data for easy local testing.

## Troubleshooting

- If the app cannot connect to MongoDB, confirm `MONGODB_URI` is correct.
- If images do not load, ensure the backend is running and the uploads folder exists.
- If CORS errors appear, verify the frontend is using the correct `VITE_API_URL`.

## Next Ideas

- Follow/unfollow functionality
- Story reels and stories UI
- Notifications
- Direct messages
- Editing and deleting posts
