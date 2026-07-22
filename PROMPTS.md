## Task: Auth register endpoint — failing test
**Prompt:** "provide the failing test code using supertest and mongodb-memory-server for POST /api/auth/register"
**Outcome:** Created test file in `backend/src/__tests__/auth.test.js`, ran `npm test` and confirmed RED (404 error).

## Task: Auth register endpoint — implementation
**Prompt:** "Write the minimum implementation for POST /api/auth/register"
**Outcome:** Created `authController.js` and `authRoutes.js`, mounted route in `app.js`. `npm test` is GREEN.

## Task: Auth register endpoint — edge cases failing tests
**Prompt:** "provide failing tests for duplicate email and weak/missing password validation on POST /api/auth/register"
**Outcome:** Added edge case tests to `auth.test.js`, ran `npm test` and confirmed RED.

## Task: Auth register endpoint — edge cases implementation
**Prompt:** "Implement validation for duplicate email and password strength in authController.js"
**Outcome:** Added input validation and duplicate check in `authController.js`. `npm test` is GREEN (3/3 tests passed).

## Task: Auth login endpoint — failing tests
**Prompt:** "provide failing tests for POST /api/auth/login (200 + token on success, 401 on failure)"
**Outcome:** Added login test suite to `auth.test.js`, ran `npm test` and confirmed RED (404 error).

## Task: Auth login endpoint — implementation
**Prompt:** "Implement login function with bcrypt password comparison and JWT token generation in authController.js"
**Outcome:** Created login controller and added route. `npm test` is GREEN (5/5 tests passed).

## Task: Auth & Admin middleware — failing tests
**Prompt:** "provide failing tests for requireAuth (401 on missing/invalid token) and requireAdmin (403 on non-admin role) middleware"
**Outcome:** Created `backend/src/__tests__/middleware.test.js`, ran `npm test` and confirmed RED.

## Task: Auth & Admin middleware — implementation
**Prompt:** "Implement requireAuth and requireAdmin middleware in authMiddleware.js"
**Outcome:** Created `authMiddleware.js`. `npm test` is GREEN (10/10 tests passed).

## Task: Vehicle create & list endpoints — failing tests
**Prompt:** "provide failing tests for POST /api/vehicles (201 create, 401 unauth, 400 missing fields) and GET /api/vehicles (200 list)"
**Outcome:** Created `vehicle.test.js`, ran `npm test` and confirmed RED (404 error).

## Task: Vehicle create & list endpoints — implementation
**Prompt:** "Implement createVehicle and getVehicles in vehicleController.js and mount /api/vehicles routes"
**Outcome:** Created `vehicleController.js` and `vehicleRoutes.js`, mounted in `app.js`. `npm test` is GREEN (14/14 tests passed).

## Task: Vehicle search endpoint — failing tests
**Prompt:** "provide failing tests for GET /api/vehicles/search with make, model, category, price range, and combined filters"
**Outcome:** Added search tests to `vehicle.test.js`, ran `npm test` and confirmed RED (404 error).

## Task: Vehicle search endpoint — implementation
**Prompt:** "Implement searchVehicles in vehicleController.js with dynamic regex and price filter object"
**Outcome:** Added `searchVehicles` and `/search` route. `npm test` is GREEN (19/19 tests passed).

## Task: Vehicle update & delete endpoints — failing tests
**Prompt:** "provide failing tests for PUT /api/vehicles/:id (200 update, 404 unknown id) and DELETE /api/vehicles/:id (200 admin, 403 non-admin)"
**Outcome:** Added update and delete tests to `vehicle.test.js`, ran `npm test` and confirmed RED.

## Task: Vehicle update & delete endpoints — implementation
**Prompt:** "Implement updateVehicle and deleteVehicle in vehicleController.js with 404 and 403 handling"
**Outcome:** Added `updateVehicle` and `deleteVehicle` routes. `npm test` is GREEN (25/25 tests passed).

## Task: Vehicle purchase & restock endpoints — failing tests
**Prompt:** "provide failing tests for POST /api/vehicles/:id/purchase (200 decrement, 400 when quantity=0, 404 unknown id) and POST /api/vehicles/:id/restock (200 admin increment, 403 non-admin)"
**Outcome:** Added purchase and restock tests to `vehicle.test.js`, ran `npm test` and confirmed RED.

## Task: Vehicle purchase & restock endpoints — implementation
**Prompt:** "Implement purchaseVehicle and restockVehicle in vehicleController.js with stock checks and ADMIN restriction"
**Outcome:** Added purchase and restock handlers and routes. `npm test` is GREEN (30/30 tests passed).

## Task: Scaffold frontend
**Prompt:** "Scaffold Vite + React JS app, configure Tailwind CSS and Vitest with jsdom"
**Outcome:** Created frontend app in `frontend/`, configured Tailwind and Vitest.

## Task: Frontend RegisterForm component — failing tests
**Prompt:** "provide failing tests for RegisterForm component checking inputs, empty submission error, and form submit handler"
**Outcome:** Created `frontend/src/__tests__/RegisterForm.test.jsx`, ran `npm test` and confirmed RED.

## Task: Frontend RegisterForm component — implementation
**Prompt:** "Implement RegisterForm component with state management and validation"
**Outcome:** Created `RegisterForm.jsx`. `npm test` is GREEN (3/3 tests passed).

## Task: Frontend LoginForm component — failing tests
**Prompt:** "provide failing tests for LoginForm component checking inputs, empty submission error, and form submit handler"
**Outcome:** Created `frontend/src/__tests__/LoginForm.test.jsx`, ran `npm test` and confirmed RED.

## Task: Frontend LoginForm component — implementation
**Prompt:** "Implement LoginForm component with state management and validation"
**Outcome:** Created `LoginForm.jsx`. `npm test` is GREEN (6/6 tests passed).

## Task: Frontend AuthContext & ProtectedRoute — failing tests
**Prompt:** "provide failing tests for AuthProvider providing state, and ProtectedRoute redirecting unauthenticated users"
**Outcome:** Created `frontend/src/__tests__/Auth.test.jsx`, ran `npm test` and confirmed RED.

## Task: Frontend AuthContext & ProtectedRoute — implementation
**Prompt:** "Implement AuthContext and ProtectedRoute with sessionStorage token persistence"
**Outcome:** Created `AuthContext.jsx` and `ProtectedRoute.jsx`. `npm test` is GREEN (9/9 tests passed).

## Task: Frontend Dashboard component — failing tests
**Prompt:** "provide failing tests for Dashboard component verifying vehicle list rendering and empty states with mocked API fetch"
**Outcome:** Created `frontend/src/__tests__/Dashboard.test.jsx`, ran `npm test` and confirmed RED.

## Task: Frontend Dashboard component — implementation
**Prompt:** "Implement Dashboard component with fetch calls to /api/vehicles and grid rendering of items"
**Outcome:** Created `Dashboard.jsx`. `npm test` is GREEN (11/11 tests passed).

## Task: Frontend SearchBar component — failing tests
**Prompt:** "provide failing tests for SearchBar component checking fields (make, model, category, price range), search click, and reset"
**Outcome:** Created `frontend/src/__tests__/SearchBar.test.jsx`, ran `npm test` and confirmed RED.

## Task: Frontend SearchBar component — implementation
**Prompt:** "Implement SearchBar component with input change and reset handler props"
**Outcome:** Created `SearchBar.jsx`. `npm test` is GREEN (14/14 tests passed).

## Task: Frontend Dashboard purchase button — failing tests
**Prompt:** "provide failing tests for vehicle purchase action on Dashboard (disabled if quantity=0, decrements quantity on click)"
**Outcome:** Added purchase test cases to `Dashboard.test.jsx`, ran `npm test` and confirmed RED.

## Task: Frontend Dashboard purchase button — implementation
**Prompt:** "Implement purchase button click handler on Dashboard to post to /api/vehicles/:id/purchase and update state"
**Outcome:** Added purchase functionality to `Dashboard.jsx`. `npm test` is GREEN (16/16 tests passed).

## Task: Frontend AdminControls component — failing tests
**Prompt:** "provide failing tests for AdminControls component checking role restrictions, input fields rendering, and POST add vehicle submit handler"
**Outcome:** Created `frontend/src/__tests__/AdminControls.test.jsx`, ran `npm test` and confirmed RED.

## Task: Frontend AdminControls component — implementation
**Prompt:** "Implement AdminControls component with role check (only show if ADMIN) and POST form submission"
**Outcome:** Created `AdminControls.jsx`. `npm test` is GREEN (19/19 tests passed).

## Task: Assemble frontend application
**Prompt:** "Assemble components, routing, navigation, and API connections in App.jsx"
**Outcome:** Completed `App.jsx` assembly with login/register redirection and full dashboard functionality.

## Task: Frontend Dashboard edit and delete CRUD controls — implementation
**Prompt:** "Implement Edit and Delete buttons on Dashboard vehicle card for ADMIN with inline edit inputs and PUT/DELETE API fetch triggers"
**Outcome:** Added inline edit and delete to `Dashboard.jsx`. `npm test` is GREEN (22/22 tests passed).

## Task: Frontend Dashboard restock control — implementation
**Prompt:** "Implement quick restock controls (input + button) on Dashboard vehicle card for ADMIN posting to /api/vehicles/:id/restock"
**Outcome:** Added restock input and button to `Dashboard.jsx`. `npm test` is GREEN (23/23 tests passed).


