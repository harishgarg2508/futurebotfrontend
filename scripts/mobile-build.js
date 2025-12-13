const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const API_DIR = path.join(process.cwd(), 'src/app/api');
const TEMP_API_DIR = path.join(process.cwd(), 'src/app/_api_mobile_ignored');

async function build() {
    let apiMoved = false;
    
    try {
        // 0. Clean .next cache to prevent type errors
        const NEXT_DIR = path.join(process.cwd(), '.next');
        if (fs.existsSync(NEXT_DIR)) {
            console.log('🧹 Mobile Build: Cleaning .next cache...');
            await fs.remove(NEXT_DIR);
        }

        // 1. Clean up any leftover _api_mobile_ignored folder from failed builds
        if (fs.existsSync(TEMP_API_DIR)) {
            console.log('🧹 Mobile Build: Cleaning leftover temp folder...');
            await fs.remove(TEMP_API_DIR);
        }

        // 2. Temporarily move API folder (static export can't handle API routes)
        if (fs.existsSync(API_DIR)) {
            console.log('📦 Mobile Build: Temporarily moving API routes...');
            await fs.copy(API_DIR, TEMP_API_DIR);
            await fs.remove(API_DIR);
            apiMoved = true;
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
        // Always restore API folder
        if (apiMoved && fs.existsSync(TEMP_API_DIR)) {
            console.log('📦 Mobile Build: Restoring API routes...');
            await fs.copy(TEMP_API_DIR, API_DIR);
            await fs.remove(TEMP_API_DIR);
        }
    }
}

build();
