
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type MainContentProps = {
  title: string;
  children: ReactNode;
};

const MainContent = ({ title, children }: MainContentProps) => {
  return (
    <main className="flex-1 p-4 md:p-8 overflow-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        exit={{ opacity: 0 }}
        className="h-full"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary-foreground bg-primary/90 backdrop-blur-sm py-3 px-4 rounded-lg shadow-sm inline-block">
          {title}
        </h1>
        <div className="mt-6">
          {children}
        </div>
      </motion.div>
    </main>
  );
};

export default MainContent;
