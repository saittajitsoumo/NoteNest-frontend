import { motion } from "framer-motion"
import { Button } from "./Button"

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 glass rounded-2xl flex flex-col items-center max-w-md w-full mx-auto shadow-sm border-white/40"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
        {Icon && <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action.label && action.onClick ? (
            <Button onClick={action.onClick}>{action.label}</Button>
          ) : (
            action
          )}
        </div>
      )}
    </motion.div>
  )
}

export default EmptyState;

