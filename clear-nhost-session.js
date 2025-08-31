const { nhost } = require('./lib/nhost');

async function clearNhostSession() {
  try {
    console.log('🔄 Attempting to clear Nhost session...');

    // Check current authentication status
    const currentUser = nhost.auth.getUser();
    console.log('Current user:', currentUser ? currentUser.email : 'No user');

    // Sign out if there's an active session
    if (currentUser) {
      console.log('📤 Signing out current user...');
      await nhost.auth.signOut();
      console.log('✅ Successfully signed out');
    } else {
      console.log('ℹ️ No active session found');
    }

    // Verify session is cleared
    const userAfterSignOut = nhost.auth.getUser();
    console.log('User after sign out:', userAfterSignOut ? userAfterSignOut.email : 'No user');

    // Also clear any stored tokens
    if (typeof window !== 'undefined') {
      // Browser environment
      localStorage.removeItem('nhostRefreshToken');
      sessionStorage.clear();
    }

    console.log('🎉 Nhost session cleared successfully!');

  } catch (error) {
    console.error('❌ Error clearing Nhost session:', error.message);
    console.error('Full error:', error);
  }
}

clearNhostSession();
