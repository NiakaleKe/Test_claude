Run a security audit and verify no side effects were introduced.

## Steps

1. Run `npm audit` and report the vulnerabilities found (count by severity: critical, high, moderate, low).

2. Run `npm audit fix` to automatically fix vulnerabilities. Note which packages were updated.

3. Run the full test suite with `npm test` to verify no side effects were introduced by the fixes.

4. Report the results:
   - How many vulnerabilities were fixed
   - Which packages changed (name + version before → after)
   - Whether all tests pass
   - If tests fail: identify which tests broke and which package update is likely responsible
   - If `npm audit fix` could not fix everything automatically (requires `--force`): list the remaining vulnerabilities and explain why manual intervention is needed
