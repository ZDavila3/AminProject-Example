# Zanett Project
- Create, read, update, and delete data items
- Persistent storage with Redis backend
- Tailwind CSS
- Hosted backend on Railway

## Prerequisites
- Node.js
- npm
- A Railway backend instance (or local backend setup)

## Getting Started

### 1. Install Dependencies
```bash
cd project
```

```bash
npm install
```
### 3. Environment Configuration
Create a `.env` file in the /project directory:

```bash
# Connect railway backend
VITE_RAILWAY_API_URL=https://your-railway-app.up.railway.app
```
#### How to Change the Backend URL
1. **Find your Railway backend URL:**
   - Go to your Railway dashboard
   - Click on your backend node api project
   - Copy the domain URL (e.g., `https://node-api-amin.up.railway.app`)
2. **Update the .env file:**
   ```bash
   VITE_RAILWAY_API_URL=https://your-actual-railway-url.up.railway.app
   ```
3. **Restart the development server** after changing environment variables

### 4. Run the Application

#### Development Mode
```bash
npm run dev
```
The app will open at `http://localhost:5173`

#### Build for Production
```bash
npm run build
```
## Backend Setup

This frontend connects to a Node.js/Express backend with Redis storage. The backend should have these endpoints:
- `GET /api/data` - Fetch all items
- `GET /api/data/:id` - Fetch specific item
- `POST /api/data` - Create new item
- `PUT /api/data/:id` - Update item
- `DELETE /api/data/:id` - Delete item

### Expected Data Structure
```json
{
  "id": "unique-id",
  "data": {
    "name": "Item Name",
    "description": "Item Description",
    "price": "99.99",
    "message": "Custom message"
  }
}
```

## Troubleshooting

### Common Issues
1. **404 Errors when saving:**
   - Check that `VITE_RAILWAY_API_URL` is set correctly in `.env`
   - Verify your Railway backend is running
   - Ensure the backend URL is accessible
2. **Environment variables not working:**
   - Make sure the variable starts with `VITE_` (required by Vite)
   - Restart the development server after changing `.env`
   - Check browser console for the actual API URL being used

### Debug Mode
The app includes console logging to help debug API calls. Open browser dev tools (F12) and check the Console tab when saving items.

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js, Redis
- **Deployment:** Railway (backend), Vite build (frontend)
- **Styling:** Tailwind CSS

## Project Structure
```
project/
├── src/
│   ├── App.jsx          # Main application component
│   ├── index.css        # Global styles
│   └── main.jsx         # App entry point
├── public/              # Static assets
├── .env                 # Environment variables
└── package.json         # Dependencies and scripts
── README.md           # This file
```