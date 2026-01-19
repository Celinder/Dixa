# CLAUDE.md - AI Assistant Guide

> **Purpose**: This document serves as a comprehensive guide for AI assistants (like Claude) working with this codebase. It provides essential context about the project structure, development workflows, conventions, and best practices.

## Repository Status

✅ **Active Development**: This repository is the Dixa Tools Hub - a central platform for internal tools, POCs, and MVPs.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Structure](#codebase-structure)
3. [Development Workflow](#development-workflow)
4. [Coding Conventions](#coding-conventions)
5. [Testing Strategy](#testing-strategy)
6. [Build & Deployment](#build--deployment)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)
9. [External Dependencies](#external-dependencies)

---

## Project Overview

### Description

The **Dixa Tools Hub** is an internal platform that provides easy access to various tools, proof-of-concepts (POCs), and MVPs used by the Dixa team. It serves as a centralized directory where team members (SDRs, AEs, Solutions Consultants) can discover and access tools for:

- Generating battle cards for competitive analysis
- Creating demo content for Dixa instances
- Accessing competitor insights
- Looking up customer integrations and implementations

**Status**: MVP Phase - Active Development

### Key Technologies

- **Language**: TypeScript
- **Framework**: Next.js 16 (React 19, App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS 4
- **Hosting**: Vercel (recommended)
- **Runtime**: Node.js

### Project Goals

1. **Centralized Access**: Provide a single hub for all internal tools and resources
2. **Easy Discovery**: Make it simple to find and launch the right tool for the job
3. **Flexible Integration**: Support multiple tool types (Claude Artifacts, repos, web apps, external links)
4. **User-Friendly**: Enable non-technical users to add and manage tools
5. **Scalable**: Build a foundation that can grow with the team's needs

---

## Codebase Structure

### Directory Layout

```
.
├── app/                        # Next.js App Router
│   ├── page.tsx               # Main dashboard (tool grid)
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles with Tailwind
│   ├── login/                 # Authentication pages
│   │   └── page.tsx           # Login page
│   └── admin/                 # Admin pages
│       └── add-tool/          # Add new tool form
│           └── page.tsx
├── components/                # React components
│   ├── Header.tsx             # Navigation header
│   └── ToolCard.tsx           # Tool card component
├── lib/                       # Utilities and configurations
│   └── supabase/              # Supabase client setup
│       ├── client.ts          # Browser client
│       └── server.ts          # Server client
├── middleware.ts              # Auth middleware
├── .env.local                 # Environment variables (not in git)
├── .gitignore                 # Git ignore rules
├── CLAUDE.md                  # This file
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies and scripts
├── postcss.config.mjs         # PostCSS configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

### Key Directories

- **`/app`**: Next.js App Router pages and routes
  - Uses Server Components by default
  - `page.tsx` files define routes
  - `layout.tsx` defines shared layouts

- **`/components`**: Reusable React components
  - `ToolCard.tsx`: Individual tool display card
  - `Header.tsx`: Navigation and sign-out

- **`/lib`**: Utilities and helper functions
  - `supabase/`: Supabase client configuration for browser and server

### Entry Points

- **`/`** (app/page.tsx): Main dashboard showing all tools organized by category
- **`/login`** (app/login/page.tsx): Authentication page
- **`/admin/add-tool`** (app/admin/add-tool/page.tsx): Form to add new tools

---

## Development Workflow

### Initial Setup

```bash
# Clone the repository
git clone [repository-url]
cd Dixa

# Install dependencies
npm install

# Set up environment variables
# Create .env.local file with the following:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run the development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Database Setup

The project uses Supabase for database and authentication. The schema includes:

- **categories**: Tool categories (Sales Tools, Content Generation, etc.)
- **tools**: Individual tool records with metadata
- **tool_views**: Analytics for tool usage
- **profiles**: Extended user information

See the SQL schema in the project planning documentation for full setup.

### Git Workflow

- **Main Branch**: `main`
- **Branch Naming Convention**:
  - Feature branches: `feature/description` or `feat/description`
  - Bug fixes: `fix/description` or `bugfix/description`
  - Claude AI branches: `claude/[unique-session-id]`

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code (if configured)
# npm run format
```

---

## Coding Conventions

### General Principles

1. **Code Style**: TypeScript with strict mode enabled
2. **Formatting**: Follows Next.js and React best practices
3. **Linting**: Next.js built-in ESLint configuration

### File Naming

- **React Components**: PascalCase (e.g., `ToolCard.tsx`, `Header.tsx`)
- **Pages**: lowercase with kebab-case for routes (e.g., `page.tsx`, `add-tool/page.tsx`)
- **Utilities**: camelCase (e.g., `client.ts`, `server.ts`)
- **Configuration**: kebab-case (e.g., `next.config.js`, `tailwind.config.ts`)

### Code Organization

#### Functions/Methods
- Keep functions small and focused (single responsibility)
- Use descriptive names that indicate purpose
- Document complex logic with comments

#### Variables
- Use meaningful, descriptive names
- Follow language-specific naming conventions (camelCase, snake_case, etc.)
- Avoid single-letter variables except in loops or math operations

#### Comments
- Write self-documenting code when possible
- Add comments for "why" not "what"
- Document public APIs, complex algorithms, and non-obvious decisions

### Import/Module Organization

Organize imports in the following order:
1. React and Next.js imports
2. Third-party libraries
3. Local imports (using `@/` alias)
4. Types and interfaces

```typescript
// Example
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Tool } from '@/types'
```

### Component Patterns

- **Server Components**: Use by default for static content and data fetching
- **Client Components**: Mark with `'use client'` directive when using hooks or browser APIs
- **Data Fetching**: Prefer Server Components with async/await for database queries

---

## Testing Strategy

### Test Structure
<!-- Document test organization and location -->

### Testing Levels
- **Unit Tests**: [Location and conventions]
- **Integration Tests**: [Location and conventions]
- **End-to-End Tests**: [Location and conventions]

### Running Tests

```bash
# Run all tests
# [command]

# Run specific test file
# [command]

# Run tests with coverage
# [command]

# Run tests in watch mode
# [command]
```

### Testing Best Practices
1. Write tests for new features
2. Update tests when modifying existing code
3. Aim for meaningful test coverage, not just high percentages
4. Use descriptive test names that explain the scenario
5. Follow AAA pattern: Arrange, Act, Assert

---

## Build & Deployment

### Build Process

```bash
# Development build
npm run dev

# Production build
npm run build

# Start production server locally
npm start
```

### Deployment

#### Environment Variables

Required environment variables for deployment:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://sjtdymxvoqyzbeytvwzz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Security Notes**:
- Never commit `.env.local` to git
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Service role key should only be used server-side

#### Deployment Steps (Vercel - Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

**Manual Deployment**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### CI/CD

- **Platform**: Vercel (automatic deployments)
- **Trigger**: Push to main branch or pull request
- **Pipeline stages**:
  1. Install dependencies
  2. Build Next.js application
  3. Deploy to preview/production
- **Environment**: Vercel automatically handles Node.js environment

---

## Common Tasks

### Adding a New Feature

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Implement the feature with tests
3. Ensure all tests pass
4. Update documentation if needed
5. Create a pull request
6. Address review comments
7. Merge after approval

### Fixing a Bug

1. Create a fix branch: `git checkout -b fix/bug-description`
2. Write a failing test that reproduces the bug
3. Fix the bug
4. Ensure the test passes
5. Run full test suite
6. Create a pull request

### Refactoring

1. Ensure current tests pass
2. Make refactoring changes
3. Ensure tests still pass
4. Update documentation if public APIs changed
5. Create pull request with clear explanation

### Adding a New Tool to the Hub

1. Navigate to the hub: http://localhost:3000
2. Click "Add New Tool" button
3. Fill in the form:
   - **Name**: Tool title
   - **Description**: Brief description of what it does
   - **URL**: Link to the tool (Claude Artifact, GitHub repo, web app, etc.)
   - **Type**: artifact, repo, webapp, or external
   - **Category**: Select appropriate category
   - **Icon**: Choose an emoji icon
   - **Tags**: Comma-separated tags for search/filtering
4. Submit the form
5. Tool appears on the dashboard immediately

### Adding a New Category

Execute SQL in Supabase:

```sql
INSERT INTO categories (name, description, slug, icon, display_order)
VALUES ('Category Name', 'Description', 'slug', '📁', 10);
```

### Adding Dependencies

```bash
# Add a new package
npm install package-name

# Add a dev dependency
npm install --save-dev package-name

# Update dependencies
npm update
```

---

## Troubleshooting

### Common Issues

#### Issue: "Module not found" errors after cloning
**Solution**: Run `npm install` to install all dependencies

#### Issue: Supabase connection errors
**Solution**:
- Check that `.env.local` exists and has correct Supabase credentials
- Verify that the Supabase project is active
- Ensure environment variables don't have quotes or extra spaces

#### Issue: Authentication redirects to login repeatedly
**Solution**:
- Clear browser cookies
- Check that middleware.ts is correctly configured
- Verify Supabase Auth is enabled in Supabase dashboard

#### Issue: Tools not appearing on dashboard
**Solution**:
- Check that database tables are created (run SQL schema)
- Verify that tools have `status = 'active'`
- Check browser console for errors
- Ensure Row Level Security policies are correctly set up

#### Issue: Build fails with TypeScript errors
**Solution**:
- Run `npm run build` to see full error messages
- Check that all types are correctly imported
- Verify TypeScript version compatibility

### Debug Mode

```bash
# Next.js debug mode
NODE_OPTIONS='--inspect' npm run dev

# View build output
npm run build

# Check Supabase connection
# Add console.log in lib/supabase/client.ts
```

### Getting Help

- Check existing documentation
- Search closed issues
- Review pull request discussions
- Consult team members or maintainers

---

## External Dependencies

### Core Dependencies

- **next** (^16.1.3): React framework for production
- **react** (^19.2.3): UI library
- **react-dom** (^19.2.3): React DOM rendering
- **@supabase/supabase-js** (^2.90.1): Supabase JavaScript client
- **@supabase/ssr** (^0.8.0): Supabase SSR helpers for Next.js
- **tailwindcss** (^4.1.18): Utility-first CSS framework
- **typescript** (^5.9.3): TypeScript language

### Development Dependencies

- **@types/node**: Node.js type definitions
- **@types/react**: React type definitions
- **@types/react-dom**: React DOM type definitions
- **autoprefixer**: PostCSS plugin for vendor prefixes
- **postcss**: CSS transformer

### System Requirements

- **Node.js**: v18.17 or higher recommended
- **npm**: v9 or higher
- **Database**: Supabase (PostgreSQL 15)
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Operating System**: macOS, Linux, Windows (with WSL2 recommended)

---

## AI Assistant Guidelines

### When Working With This Codebase

1. **Always Read First**: Before modifying files, read them completely to understand context
2. **Respect Conventions**: Follow the established patterns in the codebase
3. **Test Your Changes**: Run tests after making modifications
4. **Be Conservative**: Don't over-engineer or add unnecessary features
5. **Security First**: Be vigilant about security vulnerabilities (XSS, SQL injection, etc.)
6. **Ask Questions**: Use the AskUserQuestion tool when requirements are unclear
7. **Track Progress**: Use TodoWrite to plan and track multi-step tasks

### Before Making Changes

- [ ] Read relevant files
- [ ] Understand the existing patterns
- [ ] Plan the changes (use TodoWrite for complex tasks)
- [ ] Consider security implications
- [ ] Think about edge cases

### After Making Changes

- [ ] Run tests
- [ ] Check for linting errors
- [ ] Verify functionality
- [ ] Update documentation if needed
- [ ] Review changes before committing

### Commit Guidelines

- Write clear, descriptive commit messages
- Use conventional commit format (if adopted):
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

---

## Updating This Document

This document should be updated as the project evolves:

1. **When adding new features**: Document new patterns or conventions
2. **When changing workflows**: Update relevant sections
3. **When discovering common issues**: Add to troubleshooting
4. **When establishing conventions**: Document decisions made

Keep this document current to maintain its value for AI assistants and human developers alike.

---

**Last Updated**: 2026-01-19
**Document Version**: 2.0.0 (Full Documentation - MVP Phase)
