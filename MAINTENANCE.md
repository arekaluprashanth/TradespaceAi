# Maintenance & Updates

Regular maintenance tasks to keep the site secure, performant and feature-rich:

- Weekly: Run `npm audit` in `server` and `client`, address critical/ high issues.
- Monthly: Review Dependabot PRs and update dependencies (run full test-suite after upgrades).
- Quarterly: Review authentication & security stack (JWT secret rotation, password policies).
- Ongoing: Fix bugs from user reports, add small UI improvements, and write regression tests.

Commands:

```bash
# run audits
npm --prefix server audit
npm --prefix client audit

# run local builds
npm --prefix client run build
npm --prefix server run start
```

Consider adding automated end-to-end tests (Playwright) to cover critical user journeys (login, trade flow, portfolio view).
