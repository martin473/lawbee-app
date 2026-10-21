# Vercel Build Error Monitoring

This project is set up to check Vercel build errors directly from Cursor.

## Quick Start

### First Time Setup

1. **Login to Vercel**:
   ```bash
   npx vercel login
   ```

2. **Link your project** (if not already linked):
   ```bash
   npx vercel link
   ```
   Follow the prompts to connect to your existing Vercel project.

### Check for Build Errors

Run this command in Cursor's terminal:

```bash
npm run check-vercel
```

This will:
- ✅ Show all failed builds
- ✅ Display error messages and timestamps
- ✅ Provide quick commands to view logs
- ✅ Exit with error code if failures found (useful for automation)

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run check-vercel` | Check for failed builds and show errors |
| `npm run vercel:builds` | List all recent deployments |
| `npm run vercel:logs [id]` | View logs for a specific deployment |

## Usage Examples

### Check if latest build failed:
```bash
npm run check-vercel
```

### View all deployments:
```bash
npm run vercel:builds
```

### View logs for a specific build:
```bash
npx vercel logs [deployment-id]
```

### Inspect a deployment:
```bash
npx vercel inspect [deployment-url]
```

## Integration with Cursor

The `check-vercel` script is designed to work seamlessly in Cursor:

1. **Run in Terminal**: Open Cursor's integrated terminal and run `npm run check-vercel`
2. **See Results**: Failed builds are displayed with error details
3. **Quick Actions**: Copy-paste the provided commands to investigate further

The script will:
- Automatically detect if your project is linked
- Show failed builds with error details
- Provide commands to view full logs
- Exit with code 1 if there are failures (useful for CI/CD)

## Troubleshooting

### "Project not linked" error
```bash
npx vercel link
```
Follow the prompts to connect to your Vercel project.

### Authentication errors
```bash
npx vercel login
```
Make sure you have access to the Vercel project.

### Can't fetch deployments
- Make sure you're logged in: `npx vercel login`
- Verify project is linked: Check for `.vercel` directory
- Try manual check: Visit https://vercel.com and check your project

## Manual Check

You can also check builds manually:
1. Go to [vercel.com](https://vercel.com)
2. Navigate to your project
3. Check the "Deployments" tab for build status
4. Click on a failed deployment to see error logs

## Automation

You can add this to your workflow:
- Run `npm run check-vercel` after pushing to main
- Set up a GitHub Action to check builds
- Use in CI/CD pipelines to fail on build errors
