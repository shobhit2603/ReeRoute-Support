"use client";

import React, { useState } from "react";
import StatsOverview from "../components/dashboard/StatsOverview";
import TicketList from "../components/dashboard/TicketList";
import TicketDetail from "../components/dashboard/TicketDetail";
import { useTickets, useTicketStats } from "../hooks/useTickets";
import { Sparkle, ShieldCheck } from "@phosphor-icons/react";

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

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleSelectTicket = (id) => {
    setActiveTicketId(id);
  };

  const tickets = ticketsData?.tickets || [];
  const total = ticketsData?.total || 0;
  const page = ticketsData?.page || 1;
  const limit = ticketsData?.limit || 20;
  const totalPages = ticketsData?.totalPages || 1;

  return (
    <div className="flex flex-col min-h-screen bg-[#07090e] text-slate-100 font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-6 relative z-10 flex-1">
        {/* Dashboard Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck size={26} weight="duotone" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-100 flex items-center gap-1.5 leading-none">
                ReeRoute
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  AI CoPilot
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">Founding engineer customer support portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-900">
            <Sparkle size={14} className="text-indigo-400 animate-pulse" />
            <span>Agent Dashboard Connected</span>
          </div>
        </header>

        {/* Real-time KPI Cards */}
        <StatsOverview
          stats={statsData?.data}
          isLoading={isLoadingStats}
        />

        {/* Dashboard Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel: Master List */}
          <div className="col-span-1 lg:col-span-4 h-[calc(100vh-270px)] min-h-[500px]">
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
            />
          </div>

          {/* Right panel: Detail View */}
          <div className="col-span-1 lg:col-span-8 h-[calc(100vh-270px)] min-h-[500px] overflow-y-auto pr-1">
            <TicketDetail
              ticketId={activeTicketId}
              onSelectTicket={handleSelectTicket}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
