
### Environment Variables

Create a `.env` file in the project root with:

```env
VITE_API_URL=http://localhost:8000
```

Access it in your code using:
```typescript
import.meta.env.VITE_API_URL
```

**Note:** All Vite environment variables must be prefixed with `VITE_`. Restart the dev server after changing `.env` files.

---

## Using Container Classes

This project uses grid-based container classes for layout:

### Big Container
Use `big-container` class for full-width components:

```tsx
<div className="big-container">
  {/* Your content spans the full grid */}
</div>
```

### Small Container
Use `small-container` class for centered, narrower content:

```tsx
<div className="small-container">
  {/* Your content is centered with constrained width */}
</div>
```

### Example in Components

```tsx
export const MyComponent: React.FC = () => {
  return (
    <div className="login-container big-container">
      <form>
        {/* Form content */}
      </form>
    </div>
  );
};
```


The entire app has display grid you can use that in container placement with the
css propriety grid-column
---

## Protected Routes with Role-Based Access

### Step 1: Define User Interface

In `App.tsx`, define the user structure:

```typescript
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}
```

### Step 2: Initialize Authentication State

```typescript
function App() {
  // Initialize from localStorage to persist across refreshes
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("access_token");
  });
  
  const [role, setRole] = useState(() => {
    return localStorage.getItem("role");
  });

  // Role checking functions
  const isRoleAllowedPatient = () => {
    return role === "patient";
  };

  const isRoleAllowedPsychologist = () => {
    return role === "psychologist";
  };

  // ...
}
```

### Step 3: Using Protected Routes

Wrap protected components with the `ProtectedRoute` component:

```tsx
<Routes>
  {/* Public route */}
  <Route path="/login" element={<Auth />} />
  
  {/* Protected route - requires login */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute
        isLoggedIn={isLoggedIn}
        isRoleAllowed={() => true} // Any authenticated user
      >
        <Dashboard />
      </ProtectedRoute>
    }
  />
  
  {/* Protected route - requires patient role */}
  <Route
    path="/patient-page"
    element={
      <ProtectedRoute 
        isLoggedIn={isLoggedIn} 
        isRoleAllowed={isRoleAllowedPatient}
      >
        <PatientContent />
      </ProtectedRoute>
    }
  />
  
  {/* Protected route - requires psychologist role */}
  <Route
    path="/psychologist-page"
    element={
      <ProtectedRoute 
        isLoggedIn={isLoggedIn} 
        isRoleAllowed={isRoleAllowedPsychologist}
      >
        <PsychologistContent />
      </ProtectedRoute>
    }
  />
</Routes>
```

### Step 4: Storing User Data on Login

In your Auth component, after successful login:

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await axios.post(`${baseApiUrl}/login`, {
      email,
      password,
    });
    
    // Store authentication data in localStorage
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("role", response.data.user.role);
    localStorage.setItem("full_name", response.data.user.full_name);
    
    // Navigate to protected page
    navigate("/dashboard");
  } catch (err) {
    setError("Login failed");
  }
};
```

### Step 5: Accessing User Data from LocalStorage

In any component:

```typescript
const Dashboard: React.FC = () => {
  const fullName = localStorage.getItem("full_name");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("access_token");
  
  return (
    <div>
      <h1>Welcome, {fullName}!</h1>
      <p>Your role: {role}</p>
    </div>
  );
};
```

### Step 6: Making Authenticated API Calls

Include the token in request headers:

```typescript
const fetchData = async () => {
  const token = localStorage.getItem("access_token");
  
  try {
    const response = await axios.get(`${baseApiUrl}/protected-endpoint`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Handle response
  } catch (err) {
    console.error("API call failed", err);
  }
};