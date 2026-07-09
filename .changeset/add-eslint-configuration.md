---
---

Add ESLint configuration for code quality and consistency

Adds repository-wide ESLint configuration to catch common code quality issues. This is a development-only change that adds linting tooling without affecting any package functionality or APIs.

**Configuration includes:**
- TypeScript-specific rules for type safety and promise handling
- Basic JavaScript rules for code consistency
- Lenient rules for test files
- Integration with lint-staged for pre-commit linting
