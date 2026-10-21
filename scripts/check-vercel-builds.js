#!/usr/bin/env node

/**
 * Script to check Vercel build status and display errors
 * Usage: npm run check-vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if .vercel directory exists (project is linked)
const vercelDir = path.join(process.cwd(), '.vercel');
const projectLinked = fs.existsSync(vercelDir);

if (!projectLinked) {
  console.log('⚠️  Project not linked to Vercel.');
  console.log('\nTo link your project, run:');
  console.log('   npx vercel link');
  console.log('\nOr check builds manually:');
  console.log('   npm run vercel:builds');
  process.exit(1);
}

try {
  console.log('🔍 Checking latest Vercel builds...\n');

  // Get latest deployments using vercel ls
  let deployments = [];
  try {
    const deploymentsCmd = `npx vercel ls --json 2>/dev/null || npx vercel list --json 2>/dev/null || echo "[]"`;
    const deploymentsOutput = execSync(deploymentsCmd, { encoding: 'utf8', stdio: 'pipe' });
    const parsed = JSON.parse(deploymentsOutput.trim() || '[]');
    deployments = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // Try alternative command
    try {
      const altCmd = `npx vercel ls 2>&1`;
      const output = execSync(altCmd, { encoding: 'utf8', stdio: 'pipe' });
      console.log('📋 Recent deployments:');
      console.log(output);
      console.log('\n💡 For detailed error information, visit: https://vercel.com');
      process.exit(0);
    } catch (altErr) {
      console.log('⚠️  Could not fetch deployments automatically.');
      console.log('\n💡 Please check your builds manually:');
      console.log('   1. Visit https://vercel.com');
      console.log('   2. Go to your project');
      console.log('   3. Check the "Deployments" tab');
      console.log('\nOr run: npm run vercel:builds');
      process.exit(1);
    }
  }

  if (deployments.length === 0) {
    console.log('✅ No deployments found.');
    console.log('\n💡 Make sure you have deployed at least once.');
    process.exit(0);
  }

  // Filter for failed builds - check various error states
  const failedBuilds = deployments.filter((deployment) => {
    const state = deployment.state || deployment.readyState || '';
    return state === 'ERROR' || 
           state === 'BUILD_ERROR' || 
           state === 'CANCELED' ||
           (deployment.errorMessage && deployment.errorMessage.length > 0);
  });

  if (failedBuilds.length === 0) {
    console.log('✅ No failed builds found. All recent deployments are successful!');
    console.log(`\n📊 Total deployments checked: ${deployments.length}`);
    process.exit(0);
  }

  console.log(`❌ Found ${failedBuilds.length} failed build(s) out of ${deployments.length} total:\n`);

  // Display failed builds
  failedBuilds.slice(0, 5).forEach((deployment, index) => {
    const uid = deployment.uid || deployment.id || 'unknown';
    const shortUid = typeof uid === 'string' ? uid.substring(0, 7) : uid;
    
    console.log(`\n${index + 1}. Build #${shortUid}`);
    console.log(`   URL: ${deployment.url || deployment.target || 'N/A'}`);
    console.log(`   State: ${deployment.state || deployment.readyState || 'UNKNOWN'}`);
    
    if (deployment.createdAt) {
      const date = new Date(deployment.createdAt);
      console.log(`   Created: ${date.toLocaleString()}`);
    }
    
    if (deployment.errorMessage) {
      console.log(`   Error: ${deployment.errorMessage}`);
    }

    // Try to get build logs
    if (uid && uid !== 'unknown') {
      console.log(`\n   To view logs: npx vercel logs ${uid}`);
    }
  });

  console.log('\n\n💡 Quick commands:');
  if (failedBuilds[0] && failedBuilds[0].uid) {
    console.log(`   View logs:    npx vercel logs ${failedBuilds[0].uid}`);
    console.log(`   Inspect:      npx vercel inspect ${failedBuilds[0].url || failedBuilds[0].uid}`);
  }
  console.log(`   List all:     npm run vercel:builds`);
  console.log(`   Dashboard:    https://vercel.com`);

  process.exit(1);
} catch (error) {
  console.error('❌ Error checking Vercel builds:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   1. Make sure you are logged in: npx vercel login');
  console.log('   2. Link your project: npx vercel link');
  console.log('   3. Check manually: npm run vercel:builds');
  process.exit(1);
}
