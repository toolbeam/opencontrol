# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands
- `bun dev` - Start development environment
- `bun build` - Build the project
- `bun format` - Format code with Prettier and Sherif
- Web app: `bun --cwd app/web dev` - Run web dev server
- Database: `sst shell drizzle-kit` - Run Drizzle ORM commands

## Code Style Guidelines
- **TypeScript**: Use explicit typing, avoid `any`
- **Formatting**: No semicolons, 2-space indentation
- **Imports**: Use named imports, ES modules
- **Naming**: PascalCase for components/types, camelCase for variables/functions
- **Components**: SolidJS functional components
- **State Management**: Uses @rocicorp/zero and context
- **Database**: Drizzle ORM with PostgreSQL

## Project Structure
- `/app` - Core application (core, function, web, zero)
- `/infra` - Infrastructure as code (SST)
- `/www` - Documentation website

## Environment Requirements
- Bun >=1.0.0
- Node.js >=18.0.0