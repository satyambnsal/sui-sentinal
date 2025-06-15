import { motion, AnimatePresence } from 'framer-motion'

export const LaunchMainnetBanner = () => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        // exit={{ opacity: 0, y: -50 }}
        // transition={{ duration: 0.4 }}
      >
        <div className="bg-gradient-to-r from-[#558EB4] via-[#1388D5] to-[#8F564E] p-[1px]">
          <div className="bg-[#12121266] backdrop-blur-sm relative">
            <div className="max-w-7xl mx-auto px-4 py-3 relative items-center text-center">
              <div className="flex items-center space-x-4 text-center justify-center">
                Launching on Mainnet Next Week
              </div>
            </div>

            <div className="flex w-full">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#558EB4] to-[#1388D5]"></div>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-[#1388D5] via-[#8F564E] to-transparent"></div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
