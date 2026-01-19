# 🔧 Dixa Tools Hub

> Central hub for internal tools, POCs, and MVPs at Dixa

## Overview

The Dixa Tools Hub is an internal platform that provides easy access to various tools and resources used by the Dixa team. It serves as a centralized directory where team members (SDRs, AEs, Solutions Consultants) can discover and access tools for their daily work.

## Features

- 🎯 **Centralized Tool Directory**: All internal tools in one place
- 🔐 **Secure Authentication**: Supabase Auth with user management
- 📊 **Usage Analytics**: Track tool views and popularity
- ➕ **Easy Tool Management**: Simple form to add new tools
- 🏷️ **Categories & Tags**: Organize tools for easy discovery
- 🔗 **Flexible Links**: Support for Claude Artifacts, repos, web apps, and external links

## Quick Start

### Prerequisites

- Node.js 18.17 or higher
- npm 9 or higher
- Supabase account

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd Dixa

# Install dependencies
npm install

# Set up environment variables
# Create .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run development server
npm run dev
```

Visit http://localhost:3000 to see the hub.

## Database Setup

Run the SQL schema in your Supabase project to create the necessary tables. See the database schema in `CLAUDE.md` for full setup instructions.

## Project Structure

```
├── app/                   # Next.js App Router
│   ├── page.tsx          # Main dashboard
│   ├── login/            # Authentication
│   └── admin/            # Admin pages
├── components/           # React components
├── lib/supabase/         # Supabase configuration
└── middleware.ts         # Auth middleware
```

## Usage

### Adding a New Tool

1. Navigate to the hub
2. Click "Add New Tool" button
3. Fill in the form with tool details
4. Submit and the tool appears on the dashboard

### Supported Tool Types

- **Claude Artifact**: Links to Claude.ai artifacts
- **Repository**: GitHub/GitLab repository links
- **Web App**: Hosted web applications
- **External Link**: Any other URL

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Hosting**: Vercel

## Color Palette

```
Background Light: #F8F7F3
Primary Dark:     #171512
Secondary Dark:   #39342D
Light Text:       #F0EFEB
Error Red:        #DC2626
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Manual Deployment

```bash
npm install -g vercel
vercel --prod
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## Documentation

- See `CLAUDE.md` for comprehensive development guide
- Check Supabase dashboard for database schema
- Review component files for implementation details

## Support

For issues or questions:
- Check the troubleshooting section in `CLAUDE.md`
- Contact the development team
- Review Supabase documentation

## License

Internal use only - Dixa

---

**Last Updated**: 2026-01-19
