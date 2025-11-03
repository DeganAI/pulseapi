# Contributing to PulseAPI

Thank you for your interest in contributing to PulseAPI! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Adding New Features](#adding-new-features)
8. [Bug Reports](#bug-reports)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) runtime (v1.0+)
- Git
- A GitHub account
- Basic knowledge of TypeScript and x402 protocol

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pulseapi.git
   cd pulseapi
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/pulseapi.git
   ```
4. Install dependencies:
   ```bash
   bun install
   ```

### Running Locally

```bash
# Start development server
bun run dev

# Run tests
bun test

# Run type checking
bun run type-check
```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/amazing-feature

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, readable code
- Follow TypeScript best practices
- Add types for everything
- Include JSDoc comments for public APIs
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
bun test

# Run specific test
bun test crypto-price.test.ts

# Check types
bun run type-check
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add new data source for crypto prices"
```

**Commit Message Format:**
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add WebSocket support for real-time data
fix: resolve rate limiting issue with CoinGecko API
docs: update API documentation for multi-data endpoint
test: add integration tests for weather entrypoint
```

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/amazing-feature

# Create PR on GitHub
```

## Coding Standards

### TypeScript

- **Strict Mode**: Always use strict TypeScript settings
- **Types**: Never use `any` unless absolutely necessary
- **Interfaces**: Prefer `type` over `interface` for consistency
- **Naming**: Use camelCase for variables/functions, PascalCase for types

```typescript
// Good
type UserData = {
  id: string;
  name: string;
};

const getUserData = async (userId: string): Promise<UserData> => {
  // ...
};

// Bad
const get_user_data = (userId: any) => {
  // ...
};
```

### Zod Schemas

All entrypoint inputs/outputs must use Zod schemas:

```typescript
import { z } from "zod";

const InputSchema = z.object({
  symbols: z.array(z.string()).describe("Crypto symbols"),
  limit: z.number().max(100).optional(),
});

const OutputSchema = z.object({
  data: z.array(z.any()),
  timestamp: z.string(),
});
```

### File Organization

```
src/
├── entrypoints/          # Entrypoint handlers
│   └── crypto-price.ts
├── lib/                  # Shared utilities
│   ├── data-sources.ts   # External API integrations
│   └── utils.ts          # Helper functions
└── index.ts              # Main entry point
```

### Error Handling

Always handle errors gracefully:

```typescript
// Good
try {
  const data = await fetchExternalAPI();
  return data;
} catch (error) {
  console.error("Failed to fetch data:", error);
  // Provide fallback or throw meaningful error
  throw new Error("Data source unavailable");
}

// Bad
const data = await fetchExternalAPI(); // Unhandled promise rejection
```

### Comments and Documentation

- Add JSDoc comments for public functions
- Explain complex logic with inline comments
- Update README.md when adding features

```typescript
/**
 * Fetches cryptocurrency prices from multiple sources
 * @param symbols - Array of cryptocurrency symbols
 * @param vsCurrency - Quote currency (default: "usd")
 * @returns Price data with market cap and 24h change
 */
export async function getCryptoPrices(input: {
  symbols: string[];
  vsCurrency?: string;
}) {
  // Implementation
}
```

## Testing Guidelines

### Test Structure

Tests should be in the `tests/` directory:

```
tests/
├── entrypoints/
│   ├── crypto-price.test.ts
│   └── news.test.ts
└── lib/
    └── data-sources.test.ts
```

### Writing Tests

Use Bun's built-in test runner:

```typescript
import { describe, test, expect } from "bun:test";
import { getCryptoPrices } from "../src/lib/data-sources";

describe("getCryptoPrices", () => {
  test("should fetch Bitcoin price", async () => {
    const result = await getCryptoPrices({
      symbols: ["bitcoin"],
      vsCurrency: "usd",
    });

    expect(result.prices).toBeDefined();
    expect(result.prices.length).toBe(1);
    expect(result.prices[0].symbol).toBe("BTC");
    expect(typeof result.prices[0].price).toBe("number");
  });

  test("should handle multiple symbols", async () => {
    const result = await getCryptoPrices({
      symbols: ["bitcoin", "ethereum"],
    });

    expect(result.prices.length).toBe(2);
  });

  test("should handle invalid symbols gracefully", async () => {
    const result = await getCryptoPrices({
      symbols: ["invalid-coin-xyz"],
    });

    // Should not throw, but may return empty array
    expect(result.prices).toBeDefined();
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Test happy paths and error cases
- Test edge cases and boundary conditions
- Mock external API calls when appropriate

## Pull Request Process

### Before Submitting

- [ ] All tests pass: `bun test`
- [ ] Type checking passes: `bun run type-check`
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Follows coding standards
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and type checking
2. **Code Review**: At least one maintainer reviews
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves PR
5. **Merge**: Maintainer merges to main

## Adding New Features

### Adding a New Entrypoint

1. **Create entrypoint file**
   ```typescript
   // src/entrypoints/my-feature.ts
   import { z } from "zod";
   import type { EntrypointDef } from "@lucid-dreams/agent-kit/types";

   const InputSchema = z.object({
     // Define input schema
   });

   const OutputSchema = z.object({
     // Define output schema
   });

   export function registerMyFeatureEntrypoint(
     addEntrypoint: (def: EntrypointDef) => void
   ) {
     addEntrypoint({
       key: "my-feature",
       description: "Clear description of what this does",
       input: InputSchema,
       output: OutputSchema,
       price: "10000", // 0.01 USDC
       async handler({ input }) {
         // Implementation
         return {
           output: { /* response data */ },
           usage: { total_tokens: 10 },
         };
       },
     });
   }
   ```

2. **Register in index.ts**
   ```typescript
   import { registerMyFeatureEntrypoint } from "./entrypoints/my-feature";

   registerMyFeatureEntrypoint(addEntrypoint);
   ```

3. **Add tests**
   ```typescript
   // tests/entrypoints/my-feature.test.ts
   import { describe, test, expect } from "bun:test";
   // ... tests
   ```

4. **Update documentation**
   - Add to README.md entrypoints table
   - Add full documentation to API_DOCS.md

### Adding a New Data Source

1. **Add to data-sources.ts**
   ```typescript
   export async function getMyData(input: MyInput) {
     try {
       const response = await fetch(API_URL);
       const data = await response.json();
       return processData(data);
     } catch (error) {
       console.error("Error:", error);
       // Implement fallback or throw
     }
   }
   ```

2. **Add tests**
3. **Document the data source in README.md**

## Bug Reports

### Before Reporting

- Check if the bug is already reported
- Verify it's a bug (not expected behavior)
- Test on latest version

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Bun version:
- OS:
- PulseAPI version:

## Additional Context
Any other relevant information
```

## Questions?

- Open a [GitHub Discussion](https://github.com/OWNER/pulseapi/discussions)
- Join the x402 Discord server
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to PulseAPI! 🚀
