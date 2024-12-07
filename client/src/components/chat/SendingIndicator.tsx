import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type SendingIndicatorProps = {
  isSending: boolean;
};

export function SendingIndicator({ isSending }: SendingIndicatorProps) {
  if (!isSending) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute bottom-20 right-4 text-sm text-gray-400"
    >
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Sending...</span>
      </div>
    </motion.div>
  );
}