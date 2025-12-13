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

        // 1. Clean up any leftover _api_mobile_ignored folder from failed builds
        if (fs.existsSync(TEMP_API_DIR)) {
            console.log('🧹 Mobile Build: Removing leftover temporary API folder...');
            await fs.remove(TEMP_API_DIR);
        }

        // 2. Temporarily rename 'api' folder to exclude from static export
        if (fs.existsSync(API_DIR)) {
            console.log('📦 Mobile Build: Hiding API routes...');
            await fs.move(API_DIR, TEMP_API_DIR);
            renamed = true;
        }

        // 3. Run Next.js Build
        console.log('🚀 Mobile Build: Starting Next.js build...');
        // Pass IS_MOBILE_BUILD=true to enable static export in next.config.ts
        execSync('next build --webpack', {
            stdio: 'inherit',
            env: { ...process.env, IS_MOBILE_BUILD: 'true' }
        });

        // 4. Run Sound Copy
        console.log('🔊 Mobile Build: Copying sounds...');
        require('./copy-sounds');

        // 5. Ensure Platforms Exist
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

        // 6. Capacitor Sync
        console.log('📱 Mobile Build: Syncing Capacitor...');
        // We need to run npx cap sync. 
        // If ios/android folders exist, it syncs.
        execSync('npx cap sync', { stdio: 'inherit' });

        console.log('✅ Mobile Build Success!');

    } catch (err) {
        console.error('❌ Mobile Build Failed:', err);
        process.exit(1);
    } finally {
        // 7. Restore API folder
        if (renamed && fs.existsSync(TEMP_API_DIR)) {
            console.log('📦 Mobile Build: Restoring API routes...');
            // Remove existing api folder if it exists (shouldn't happen, but just in case)
            if (fs.existsSync(API_DIR)) {
                await fs.remove(API_DIR);
            }
            await fs.move(TEMP_API_DIR, API_DIR);
        }
    }
}

build();
