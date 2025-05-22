'use client'
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { AgentsList } from './AgentsList'
import { AgentDetails, useAgents } from '@/hooks/useAgents'
import { DOTS, usePagination } from '@/hooks/usePagination'

const PAGE_SIZE = 10
const SIBLING_COUNT = 1

type AgentListViewProps = {
  heading: string
  subheading: string
}

export const AgentListView = ({ heading, subheading }: AgentListViewProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  //TODO: show toast for failed to load agents
  const {
    agents: allAgents,
    loading: isFetchingAllAgents,
    totalAgents: totalAllAgents,
  } = useAgents({ page: currentPage, pageSize: PAGE_SIZE, active: null })

  const totalTabEntries = totalAllAgents

  const totalPages = Math.ceil(totalTabEntries / PAGE_SIZE)

  const paginationRange = usePagination({
    currentPage,
    totalCount: totalTabEntries,
    pageSize: PAGE_SIZE,
    siblingCount: SIBLING_COUNT,
  })

  const filterAgents = (agents: AgentDetails[], query: string) => {
    if (!query.trim()) return agents

    const lowercaseQuery = query.toLowerCase().trim()
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(lowercaseQuery) ||
        agent.address.toLowerCase().includes(lowercaseQuery)
    )
  }
  const filteredAgents = useMemo(
    () => filterAgents(allAgents, searchQuery),
    [allAgents, searchQuery]
  )

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className="px-2 md:px-8 py-12 md:py-20 max-w-[1560px] mx-auto md:pt-36">
      <div className="mb-20">
        <p
          className="text-4xl md:text-[48px] font-bold text-center uppercase"
          id="leaderboard"
        >
          {heading}
        </p>

        <div className="flex max-w-[800px] mx-auto my-3 md:my-6">
          <div className="white-gradient-border"></div>
          <div className="white-gradient-border rotate-180"></div>
        </div>
        <p className="text-[#B4B4B4] text-center max-w-[594px] mx-auto">{subheading}</p>
      </div>
      <div>
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h2>All Agents</h2>

          <div className="relative w-full md:w-auto mt-4 md:mt-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by agent"
              className="placeholder:text-[#6F6F6F] border border-[#6F6F6F] rounded-[28px] bg-transparent px-5 py-1 min-h-[2rem] text-sm outline-none focus:border-white w-full md:w-auto"
            />
            <Search
              className="text-[#6F6F6F] absolute top-1/2 -translate-y-1/2 right-5"
              width={14}
            />
          </div>
        </div>

        <AgentsList
          agents={filteredAgents}
          isFetchingAgents={isFetchingAllAgents}
          searchQuery={searchQuery}
          offset={currentPage * PAGE_SIZE}
        />
        <div className="flex gap-1 mx-auto text-[#B8B8B8] text-xs w-fit mt-6 items-center">
          <button
            onClick={handlePreviousPage}
            className={`hover:text-white ${
              currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
            disabled={currentPage === 0}
          >
            <ChevronLeft />
          </button>

          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === DOTS) {
              return (
                <span
                  key={index}
                  className="text-[#B8B8B8]"
                >
                  ...
                </span>
              )
            }
            return (
              <button
                onClick={() => setCurrentPage(+pageNumber)}
                key={index}
                className={`${pageNumber === currentPage ? 'text-white' : 'text-[#B8B8B8]'} p-2`}
              >
                {pageNumber}
              </button>
            )
          })}
          <button
            onClick={handleNextPage}
            className={`hover:text-white ${
              currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
            disabled={currentPage === totalPages}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}
