const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const runCommand = (command, cwd = process.cwd()) => {
  console.log(`\n\x1b[36m========== Running: ${command} ==========\x1b[0m`);
  try {
    execSync(command, { stdio: 'inherit', cwd });
  } catch (error) {
    console.error(`\n\x1b[31mFailed to execute: ${command}\x1b[0m`);
    process.exit(1);
  }
};

const copyEnvFile = (folderPath) => {
  const examplePath = path.join(__dirname, folderPath, '.env.example');
  const envPath = path.join(__dirname, folderPath, '.env');
  
  if (fs.existsSync(examplePath)) {
    if (!fs.existsSync(envPath)) {
      console.log(`\n\x1b[32mCopying .env.example to .env in ${folderPath}\x1b[0m`);
      fs.copyFileSync(examplePath, envPath);
    } else {
      console.log(`\n\x1b[33m.env already exists in ${folderPath}, skipping.\x1b[0m`);
    }
  } else {
    console.log(`\n\x1b[33mNo .env.example found in ${folderPath}, skipping.\x1b[0m`);
  }
};

const main = async () => {
  console.log('\n\x1b[35m🚀 Starting Developer Onboarding Setup...\x1b[0m');

  // Step 1: Install pnpm globally
  runCommand('npm install -g pnpm');

  // Step 2: Install monorepo dependencies
  runCommand('pnpm install');

  // Step 3: Copy .env.example to .env
  ['apps/api', 'apps/web', 'packages/database'].forEach(copyEnvFile);

  // Step 4: Start PostgreSQL database
  runCommand('docker-compose up -d');

  // Step 5: Pause for 3 seconds to let DB spin up
  console.log('\n\x1b[36m⏳ Waiting for 3 seconds to allow Docker container to initialize...\x1b[0m');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Run Prisma commands in the database package
  const dbPath = path.join(__dirname, 'packages/database');
  runCommand('npx prisma db push', dbPath);
  runCommand('npx prisma db seed', dbPath);

  console.log('\n\x1b[32m✅ Setup Complete! Developer environment is ready.\x1b[0m\n');
};

main();
