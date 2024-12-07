import { motion, AnimatePresence } from "framer-motion";

type TypingIndicatorProps = {
  typingUsers: string[];
  isGroup: boolean;
};

export function TypingIndicator({ typingUsers, isGroup }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (!isGroup) return `${typingUsers[0]} is typing...`;

    switch (typingUsers.length) {
      case 1:
        return `${typingUsers[0]} is typing...`;
      case 2:
        return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
      case 3:
        return `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers[2]} are typing...`;
      default:
        return `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers.length - 2} others are typing...`;
    }
  };

  return (
    <AnimatePresence>
      {typingUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-20 left-4 text-sm text-gray-400"
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                className="w-1 h-1 bg-gray-400 rounded-full"
              />
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                className="w-1 h-1 bg-gray-400 rounded-full"
              />
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
                className="w-1 h-1 bg-gray-400 rounded-full"
              />
            </div>
            <span>{getTypingText()}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}