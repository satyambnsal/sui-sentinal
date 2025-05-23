import Link from 'next/link'
import Image from 'next/image'
import { Stats } from './Stats'
import { useUsageStats } from '@/hooks/useUsageStats'
import { AnimatePresence, motion } from 'framer-motion'

export const LandingPage = () => {
  const { loading, data } = useUsageStats()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="max-w-[933px] mx-auto mt-20 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-[#B8B8B8] text-[40px] uppercase">#Sui Sentinel</h2>
          <p className="">
            Compete for real SUI rewards by challenging agents or creating your own
          </p>
          {/* <Stats isLoading={loading} data={data} /> */}
        </motion.div>

        <div className="grid grid-cols-2 justify-center mt-8 text-center gap-9 ">
          <motion.div
            className="border border-[#558EB4] bg-[#12121266] rounded-lg lg:rounded-2xl p-2 lg:p-4 col-span-2 lg:col-span-1 robo-card attacker group"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <Image
                src="/img/robo_to_r.png"
                width={334}
                height={399}
                alt="robo"
                className="relative z-10 -mt-10"
              />

              <div className="absolute inset-0 pointer-events-auto robo-img-defender rounded-lg transition-all mt-10"></div>
            </div>

            <div className="flex items-center justify-center gap-2 my-2">
              <div>
                <Image
                  src="/icons/local_police.png"
                  width={24}
                  height={24}
                  alt="local police icon"
                />
              </div>
              <div>
                <p className="text-lg lg:text-[2rem] leading-normal font-medium">DEFEND</p>
              </div>
            </div>

            <div className="flex max-w-[394px] mx-auto">
              <div className="blue gradient-border"></div>
              <div className="blue gradient-border rotate-180"></div>
            </div>

            <div className="my-4">
              <ul className="text-center flex flex-col justify-center items-center text-[#B5B5B5] ps-4 md:ps-0 list-disc text-sm md:text-base">
                <li>Create unbreakable prompts</li>
                <li>Earn fees for every attempt</li>
                <li>Survive to the end</li>
              </ul>
            </div>

            <div>
              <Link
                href="/defend"
                className="block border border-[#558EB4] rounded-[8px] w-full min-h-11 p-2 transition-all text-[#558EB4] group-hover:bg-[#1388D5] group-hover:text-black group-hover:border-[#1388D5]"
              >
                Launch an agent
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="border border-[#8F564E] bg-[#12121266] rounded-lg lg:rounded-2xl p-2 lg:p-4 col-span-2 lg:col-span-1 robo-card defender group"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <Image
                src="/img/robo_to_r.png"
                width={334}
                height={399}
                alt="robo"
                className="rotate-y-180 -mt-10 z-10 relative"
              />
              <div className="absolute inset-0 pointer-events-auto robo-img-attacker rounded-lg transition-all mt-10"></div>
            </div>

            <div className="flex items-center justify-center gap-2 my-2">
              <div>
                <Image src="/icons/swords.png" width={24} height={24} alt="local police icon" />
              </div>
              <p className="text-lg lg:text-[2rem] leading-normal font-medium">ATTACK</p>
            </div>

            <div className="flex max-w-[394px] mx-auto">
              <div className="gradient-border red"></div>
              <div className="gradient-border red rotate-180"></div>
            </div>

            <div className="my-4">
              <ul className="text-center flex flex-col justify-center items-center text-[#B5B5B5] ps-4 md:ps-0 list-disc text-sm md:text-base">
                <li>Break AI defenses</li>
                <li>Win rewards for successful attacks</li>
                <li>Outsmart the system</li>
              </ul>
            </div>

            <div>
              <Link
                href="/attack"
                className="block border border-[#8F564E] rounded-[8px] w-full min-h-11 p-2 transition-all text-[#8F564E] group-hover:bg-[#E53922] group-hover:text-black group-hover:border-[#E53922]"
              >
                Challenge an agent
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
