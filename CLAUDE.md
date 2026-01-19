# CLAUDE.md - AI Assistant Guide

> **Purpose**: This document serves as a comprehensive guide for AI assistants (like Claude) working with this codebase. It provides essential context about the project structure, development workflows, conventions, and best practices.

## Repository Status

⚠️ **Note**: This repository is currently empty or in early initialization phase. This document serves as a template to be filled in as the project develops.

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
<!-- Provide a brief description of what this project does -->

**Status**: Repository initialized

### Key Technologies
<!-- List the main technologies, frameworks, and languages used -->
- **Language**: [To be determined]
- **Framework**: [To be determined]
- **Runtime**: [To be determined]

### Project Goals
<!-- Describe the main objectives and use cases -->

---

## Codebase Structure

### Directory Layout

```
.
├── [To be created as project develops]
└── CLAUDE.md (this file)
```

### Key Directories

When the project structure is established, document:
- **`/src`**: Source code location and organization
- **`/tests`**: Test files and test utilities
- **`/docs`**: Additional documentation
- **`/config`**: Configuration files
- **`/scripts`**: Build and utility scripts
- **`/public` or `/static`**: Static assets (if applicable)

### Entry Points
<!-- Document the main entry points of the application -->

---

## Development Workflow

### Initial Setup

```bash
# Clone the repository
git clone [repository-url]
cd Dixa

# Install dependencies (once package manager is set up)
# npm install / yarn install / pip install -r requirements.txt / etc.

# Set up environment variables
# cp .env.example .env
```

### Git Workflow

- **Main Branch**: [To be determined - typically `main` or `master`]
- **Branch Naming Convention**:
  - Feature branches: `feature/description` or `feat/description`
  - Bug fixes: `fix/description` or `bugfix/description`
  - Claude AI branches: `claude/claude-md-[session-id]`

### Development Commands

```bash
# Start development server (when applicable)
# [command to be added]

# Run tests
# [command to be added]

# Build project
# [command to be added]

# Lint code
# [command to be added]

# Format code
# [command to be added]
```

---

## Coding Conventions

### General Principles

1. **Code Style**: [To be defined - e.g., PEP 8, Airbnb JavaScript Style Guide, etc.]
2. **Formatting**: [Tool to be used - e.g., Prettier, Black, gofmt]
3. **Linting**: [Tool to be used - e.g., ESLint, pylint, golangci-lint]

### File Naming
<!-- Document file naming conventions -->
- Source files: [convention]
- Test files: [convention]
- Configuration files: [convention]

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
<!-- Document how imports should be organized -->

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
# [command]

# Production build
# [command]
```

### Deployment

#### Environment Variables
<!-- Document required environment variables -->

#### Deployment Steps
<!-- Document deployment process -->

### CI/CD

<!-- Document CI/CD pipeline if exists -->
- **Platform**: [GitHub Actions / GitLab CI / CircleCI / Jenkins / etc.]
- **Configuration**: [File location]
- **Pipeline stages**: [Build / Test / Deploy / etc.]

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

### Adding Dependencies

<!-- Document process for adding new dependencies -->

```bash
# Example: npm install package-name
# or: pip install package-name
```

---

## Troubleshooting

### Common Issues

#### Issue: [Common problem]
**Solution**: [How to resolve]

#### Issue: [Another common problem]
**Solution**: [How to resolve]

### Debug Mode

```bash
# Enable debug logging (when applicable)
# [command or environment variable]
```

### Getting Help

- Check existing documentation
- Search closed issues
- Review pull request discussions
- Consult team members or maintainers

---

## External Dependencies

### Core Dependencies
<!-- List main dependencies once established -->

### Development Dependencies
<!-- List dev dependencies once established -->

### System Requirements
- **Node.js**: [version] (if applicable)
- **Python**: [version] (if applicable)
- **Go**: [version] (if applicable)
- **Database**: [type and version] (if applicable)
- **Other**: [any other system requirements]

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
**Document Version**: 1.0.0 (Initial Template)
