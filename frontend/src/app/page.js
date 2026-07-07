"use client";

import React, { useState, useCallback } from "react";
import StatsOverview from "../components/dashboard/StatsOverview";
import TicketList from "../components/dashboard/TicketList";
import TicketDetail from "../components/dashboard/TicketDetail";
import Sidebar from "../components/layout/Sidebar";
import { useTickets, useTicketStats } from "../hooks/useTickets";
import { Bell } from "@phosphor-icons/react";

export default function Home() {
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    sentiment: "",
    escalated: "",
    q: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 20,
  });

  const [activeTicketId, setActiveTicketId] = useState(null);

  // Queries
  const { data: ticketsData, isLoading: isLoadingTickets } = useTickets(filters);
  const { data: statsData, isLoading: isLoadingStats } = useTicketStats();

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const handleSelectTicket = (id) => {
    // Toggle off if already selected
    setActiveTicketId(prev => prev === id ? null : id);
  };

  const tickets = ticketsData?.tickets || [];
  const total = ticketsData?.total || 0;
  const page = ticketsData?.page || 1;
  const limit = ticketsData?.limit || 20;
  const totalPages = ticketsData?.totalPages || 1;

  return (
    <div className="flex w-full min-h-screen bg-slate-50 text-brand-black font-sans">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
          <h2 className="text-lg font-medium text-brand-black">AI-Powered Customer Support Dashboard</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
              <span className="text-xs font-bold text-slate-500">RR</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          {/* Real-time KPI Cards */}
          <StatsOverview
            stats={statsData?.data}
            isLoading={isLoadingStats}
          />

          {/* Dashboard Split/Full Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Master List: Full width if no ticket selected, 4 columns if selected */}
            <div className={`col-span-1 transition-all duration-300 ease-in-out ${activeTicketId ? "lg:col-span-4" : "lg:col-span-12"} h-[calc(100vh-270px)] min-h-[500px]`}>
              <TicketList
                tickets={tickets}
                total={total}
                page={page}
                limit={limit}
                totalPages={totalPages}
                filters={filters}
                onFilterChange={handleFilterChange}
                activeTicketId={activeTicketId}
                onSelectTicket={handleSelectTicket}
                isLoading={isLoadingTickets}
                isExpanded={!activeTicketId}
              />
            </div>

            {/* Detail View: Hidden if no ticket selected */}
            {activeTicketId && (
              <div className="col-span-1 lg:col-span-8 h-[calc(100vh-270px)] min-h-[500px] overflow-y-auto pr-1 animate-in slide-in-from-right-4 duration-300">
                <TicketDetail
                  ticketId={activeTicketId}
                  onSelectTicket={handleSelectTicket}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
