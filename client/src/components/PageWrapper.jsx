import { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * PageWrapper — wraps every page in a smooth fade+slide transition.
 * Usage: import PageWrapper from '../components/PageWrapper';
 *        wrap your page root with <PageWrapper> ... </PageWrapper>
 */
export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
