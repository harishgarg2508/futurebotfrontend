const fs = require('fs-extra');
const path = require('path');

// Defined paths
const SOURCE = 'public/sounds';
const ANDROID_DEST = 'android/app/src/main/res/raw';
const IOS_DEST = 'ios/App/App/public/sounds';

async function copySounds() {
    try {
        // Ensure the source exists
        if (!fs.existsSync(SOURCE)) {
            console.warn('⚠️ Source folder public/sounds does not exist. Skipping sound copy.');
            return;
        }

        // 1. Android Copy
        // fs-extra's ensureDir creates the directory if it doesn't exist
        await fs.ensureDir(ANDROID_DEST);

        // Empty the destination first to avoid stale files? 
        // The user didn't ask for generic sync, just copy. 
        // We'll just copy allowing overwrite.
        await fs.copy(SOURCE, ANDROID_DEST);
        console.log('✅ Sounds copied to Android Native Folder (res/raw)');

        // 2. iOS Copy
        // iOS might need the folder directly in the bundle or referenced.
        // The user instruction said: "ios/App/App/public/sounds"
        await fs.ensureDir(IOS_DEST);
        await fs.copy(SOURCE, IOS_DEST);
        console.log('✅ Sounds copied to iOS Native Folder');

    } catch (err) {
        console.error('❌ Error copying sounds:', err);
        // Don't fail the build, just log error? 
        // User script didn't have try/catch, but good practice.
        process.exit(1);
    }
}

copySounds();
