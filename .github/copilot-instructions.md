# VisHeart Frontend - AI Coding Instructions

## Architecture Overview
This is a **Next.js 15 medical imaging frontend** using App Router that provides cardiac segmentation visualization and management. The system integrates with:
- **Backend API** (`Cardiac_Segmentation_FYP_Server`) - Session-based auth, project/file management, AI segmentation
- **Session-based authentication** via cookies (not JWT) - requires `withCredentials: true` on all API calls
- **Real-time segmentation tools** using Konva.js for manual cardiac image annotation
- **Role-based access control** - Guest < User < Admin hierarchy

## Core Technologies & Patterns

### UI/Styling Stack
- **Tailwind CSS v4** with custom CSS variables in `globals.css`
- **Shadcn/ui components** in `src/components/ui/` - pre-built, customizable components
- **Radix UI primitives** - accessible headless components
- **Theme system** with light/dark modes via `next-themes`
- **Framer Motion + GSAP** for complex animations (especially in hero sections)

### Authentication & State Management
- **Context-based auth** in `src/context/auth-context.tsx` - provides `{ user, loading, login, logout }`
- **Session cookies** - all API calls use `withCredentials: true` in axios config
- **Role-based components**: `ProtectedRoute`, `RoleGuard`, `AdminOnly` for access control
- **User roles**: `guest`, `user`, `admin` - affects navigation and feature access

### API Integration Patterns
- **Centralized API client** in `src/lib/api.ts` with axios instance
- **Environment config**: `NEXT_PUBLIC_API_URL` points to backend server (default port 5000)
- **Service modules**: `authApi`, `projectApi`, `adminApi` with consistent error handling
- **File uploads**: Use FormData with `multipart/form-data` headers

## Project Structure Conventions

### Route Organization
```
src/app/
├── (auth)/           # Auth-specific routes  
├── dashboard/        # User project management
├── admin/           # Admin-only features (user mgmt, system monitor)
├── cardiac-segmentation/  # Manual segmentation tools
├── about/, doc/     # Static content pages
└── layout.tsx       # Global layout with Header/Footer
```

### Component Architecture
- **Page components** in `src/app/*/page.tsx` - use `"use client"` for interactivity
- **Reusable components** in `src/components/` with clear naming (e.g., `segmentation-tool.tsx`)
- **UI primitives** in `src/components/ui/` - generated via shadcn/ui CLI
- **Layout components** in `src/ui/` (header, footer, theme toggle)

### Key Patterns
- **Dynamic imports** for heavy components (see segmentation page): `dynamic(() => import(), { ssr: false })`
- **Client components** marked with `"use client"` directive when using hooks/interactivity
- **CSS-in-JS alternative**: Use `cn()` utility from `src/lib/utils.ts` for conditional classes

## Development Commands
```bash
pnpm dev             # Development server on port 5001 with Turbopack
pnpm build           # Production build
pnpm start           # Production server
pnpm lint            # ESLint check
```

## Essential Dependencies
- **Canvas/Graphics**: `react-konva`, `konva` for segmentation tools
- **3D Visualization**: `three`, `@react-three/fiber`, `@react-three/drei` for heart models
- **Forms**: `react-hook-form` + `@hookform/resolvers` with Zod validation
- **Notifications**: `sonner` for toast messages
- **Icons**: `lucide-react` for consistent iconography

## Common Development Patterns

### API Error Handling
```typescript
// Always wrap API calls in try/catch with consistent error structure
try {
  const response = await projectApi.getProjects();
  // Handle response.data
} catch (error) {
  // Backend returns { success: false, message: string }
  console.error(error.response?.data?.message || 'Unknown error');
}
```

### Role-Based Rendering
```tsx
// Use role guards for conditional features
<AdminOnly fallback={<div>Access denied</div>}>
  <AdminPanel />
</AdminOnly>

// Or check user role directly
const { user } = useAuth();
if (user?.role === 'admin') {
  // Admin-specific logic
}
```

### Segmentation Tools Integration
- **Konva.js canvas** for manual annotation with brush/eraser tools
- **Undo/redo functionality** built into segmentation components
- **Image preprocessing** handled by backend, frontend receives processed URLs

## Environment Configuration
- **`NEXT_PUBLIC_API_URL`** - Backend API base URL (typically `http://localhost:5000`)
- **Development**: Backend runs on port 5000, frontend on 5001
- **Production**: Configure CORS and session domains between frontend/backend

## Common Gotchas
- **Authentication state**: Always check `loading` before rendering auth-dependent UI
- **Image paths**: Use `/public` directory, reference as `/filename.ext` in components
- **Konva SSR**: Disable SSR for canvas-heavy components with `dynamic(..., { ssr: false })`
- **Tailwind classes**: Use `cn()` utility for conditional styling instead of string concatenation
- **Admin routes**: Wrap in `<AdminOnly>` component, don't rely on client-side route protection alone
