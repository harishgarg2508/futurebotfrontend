import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const LoginButton = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={signInWithGoogle}
      className="flex items-center space-x-3 px-6 py-3 bg-white text-gray-800 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
      <span>Continue with Google</span>
    </motion.button>
  );
};

export default LoginButton;
