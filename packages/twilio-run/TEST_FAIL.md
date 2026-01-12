# Test Failures - Pre-existing Issues

**Status**: FAILING on main branch (verified on commit `bf537eb`)
**Impact**: All CI builds fail (ubuntu, macos, windows on Node lts/* and lts/-1)

## Root Cause
TypeScript compilation errors - missing type declarations prevent tests from running.

## Errors

### 1. Missing @types/yargs
```
TS7016: Could not find a declaration file for module 'yargs'.
'/Users/dhartman/Development/01_Twilio/serverless-toolkit/packages/twilio-run/node_modules/.pnpm/yargs@17.7.2/node_modules/yargs/index.cjs'
implicitly has an 'any' type.
```

**Location**: `src/config/start.ts:5`
**Note**: `yargs` package is in dependencies, but `@types/yargs` may need updating or reinstalling

### 2. Missing jest-mock module
```
TS2307: Cannot find module 'jest-mock' or its corresponding type declarations.
```

**Affected files**:
- `__tests__/checks/check-runtime-handler.test.ts:1`
- `__tests__/templating/filesystem.test.ts:12`
- `__tests__/checks/legacy-config.test.ts:2`

**Solution**: Modern Jest includes `mocked` in the main package. Replace:
```typescript
import { mocked } from 'jest-mock';
```
With:
```typescript
import { mocked } from 'jest';
```

### 3. Missing @types/body-parser
```
TS2307: Cannot find module 'body-parser' or its corresponding type declarations.
```

**Location**: Multiple test files
**Solution**: Add `@types/body-parser` to devDependencies:
```json
"@types/body-parser": "^1.19.0"
```

## Recommendation
These issues should be addressed in a separate PR focused on:
1. Updating/fixing type declarations
2. Testing the entire test suite
3. Not mixing with feature PRs

## Verification
To verify these are pre-existing:
```bash
git checkout bf537eb  # Commit before PR #546
npm run jest -- packages/twilio-run/__tests__/config/start.test.ts
# Result: Same TypeScript errors appear
```

## Impact on PR #546
PR #546 (ngrok migration) is **not responsible** for these failures. However, they do block CI validation of the PR changes.

**Status**: Awaiting team guidance on fix approach.
