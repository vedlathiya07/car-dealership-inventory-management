# Car Dealership Inventory Management System

A full-stack inventory management web application for car dealerships, built using the MERN stack with complete test-driven development (TDD) coverage.

## 🚀 Features
- **User Authentication:** Sign up, log in, secure token storage, and Route Guarding (React Context + Session Storage).
- **Role-Based Access Control:** Separate layouts and access permissions for `USER` and `ADMIN` roles.
- **Inventory View:** Grid visualization of car listings, showing make, model, category, price, and real-time stock levels.
- **Advanced Search & Filtering:** Filter vehicles by make, model, category, and price ranges.
- **Purchase System:** Live vehicle purchasing with automatic stock decrementing and disabled state for out-of-stock vehicles.
- **Admin CRUD Panel:** Restrictive forms enabling admins to add new vehicles to the inventory.

---

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Vitest + React Testing Library (JSDOM)
- **Backend:** Node.js, Express, MongoDB (Mongoose), Supertest, Mocha, Chai

---

## 📋 Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a running local MongoDB instance

---

## ⚙️ Environment Configuration

### Backend Setup
Create a `.env` file inside the `backend/` directory:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key_here
```

---

## 🚀 Getting Started

### 1. Install Dependencies
Run the following in the root directory:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Running the Development Servers
Open two terminals to run the backend and frontend simultaneously:

**Terminal 1 (Backend API Server):**
```bash
cd backend
npm run dev
```
*(Running on http://localhost:4000)*

**Terminal 2 (Frontend Vite Server):**
```bash
cd frontend
npm run dev
```
*(Running on http://localhost:5173)*

---

## 🧪 Running Tests

Both the frontend and backend are developed using TDD with comprehensive integration and component test coverage.

### Backend Integration Tests (Mocha/Chai/Supertest)
Run the following in the `backend/` directory:
```bash
npm test
```
*Total: 30 test cases testing Auth routes, vehicle routes, and middleware behavior.*

### Frontend Component Tests (Vitest/JSDOM)
Run the following in the `frontend/` directory:
```bash
npm test
```
*Total: 19 test cases testing form validations, login/logout context, routing guards, and UI rendering.*