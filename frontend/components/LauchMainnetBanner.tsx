export const LaunchMainnetBanner = () => {
  return (
    <div className="bg-gradient-to-r from-[#558EB4] via-[#1388D5] to-[#8F564E] p-[1px] fixed z-20 left-0 right-0">
      <div className="bg-[#12121266] backdrop-blur-sm relative w-full">
        <div className="max-w-7xl mx-auto px-4 py-2 relative items-center text-center">
          <div className="flex items-center space-x-4 text-center justify-center text-sm">
            Launching on Mainnet Next Week
          </div>
        </div>

        <div className="flex w-full">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#558EB4] to-[#1388D5]"></div>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-[#1388D5] via-[#8F564E] to-transparent"></div>
        </div>
      </div>
    </div>
  )
}
