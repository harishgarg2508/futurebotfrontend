const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const API_DIR = path.join(process.cwd(), 'src/app/api');
const TEMP_API_DIR = path.join(process.cwd(), 'src/app/_api_mobile_ignored');

async function build() {
    let renamed = false;
    try {
        // 0. Clean .next cache to prevent type errors with missing API routes
        const NEXT_DIR = path.join(process.cwd(), '.next');
        if (fs.existsSync(NEXT_DIR)) {
            console.log('🧹 Mobile Build: Cleaning .next cache...');
            await fs.remove(NEXT_DIR);
        }

        // 1. Temporarily rename 'api' folder to exclude from static export
        if (fs.existsSync(API_DIR)) {
            console.log('📦 Mobile Build: Hiding API routes...');
            await fs.move(API_DIR, TEMP_API_DIR);
            renamed = true;
        }

        // 2. Run Next.js Build
        console.log('🚀 Mobile Build: Starting Next.js build...');
        // Pass IS_MOBILE_BUILD=true to enable static export in next.config.ts
        execSync('next build --webpack', {
            stdio: 'inherit',
            env: { ...process.env, IS_MOBILE_BUILD: 'true' }
        });

        // 3. Run Sound Copy
        console.log('🔊 Mobile Build: Copying sounds...');
        require('./copy-sounds');

        // 3b. Ensure Platforms Exist
        const ANDROID_DIR = path.join(process.cwd(), 'android');
        const IOS_DIR = path.join(process.cwd(), 'ios');

        if (!fs.existsSync(ANDROID_DIR)) {
            console.log('🤖 Mobile Build: Adding Android platform...');
            execSync('npx cap add android', { stdio: 'inherit' });
        }

        if (!fs.existsSync(IOS_DIR)) {
            console.log('🍏 Mobile Build: Adding iOS platform...');
            execSync('npx cap add ios', { stdio: 'inherit' });
        }

        // 4. Capacitor Sync
        console.log('📱 Mobile Build: Syncing Capacitor...');
        // We need to run npx cap sync. 
        // If ios/android folders exist, it syncs.
        execSync('npx cap sync', { stdio: 'inherit' });

        console.log('✅ Mobile Build Success!');

    } catch (err) {
        console.error('❌ Mobile Build Failed:', err);
        process.exit(1);
    } finally {
        // 5. Restore API folder
        if (renamed && fs.existsSync(TEMP_API_DIR)) {
            console.log('📦 Mobile Build: Restoring API routes...');
            await fs.move(TEMP_API_DIR, API_DIR);
        }
    }
}

build();
