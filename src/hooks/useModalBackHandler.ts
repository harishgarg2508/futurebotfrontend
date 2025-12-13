import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to handle back button for modals.
 * - Native: Intercepts 'backButton' event.
 * - Web: Pushes a history state when opened, pops it when closed. Handles 'Back' press to close modal.
 */
export const useModalBackHandler = (isOpen: boolean, onClose: () => void) => {
    // Track if the closure was initiated by the Back Button
    const isBackNav = useRef(false);

    useEffect(() => {
        if (!isOpen) return;

        isBackNav.current = false; // Reset

        // --- ANDROID / NATIVE HANDLING ---
        let backListener: any;
        const setupNative = async () => {
            if (Capacitor.isNativePlatform()) {
                backListener = await App.addListener('backButton', () => {
                    // Hardware back button pressed
                    onClose();
                });
            }
        };
        setupNative();

        // --- WEB HANDLING ---
        // 1. Push a temporary state to the history stack
        if (Capacitor.getPlatform() === 'web') {
            window.history.pushState({ modal: true }, '', window.location.href);
        }

        // 2. Listen for when user presses Back (popstate)
        const handlePopState = (event: PopStateEvent) => {
            // The user pressed Back, so the browser already popped the state.
            // We just need to close the UI.
            isBackNav.current = true; // Mark that we are closing due to back nav
            onClose();
        };

        window.addEventListener('popstate', handlePopState);

        // CLEANUP
        return () => {
            if (backListener) backListener.remove();
            window.removeEventListener('popstate', handlePopState);

            // If closing via "X" button (programmatically), we need to revert the history push
            // If closing via "Back" button, the history is already popped.
            if (Capacitor.getPlatform() === 'web' && !isBackNav.current) {
                // We manually go back to remove the dummy state we pushed
                window.history.back();
            }
        };
    }, [isOpen]); // Only re-run when isOpen changes
};
