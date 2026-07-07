"use client";

import React, { useState, useEffect, useCallback } from "react";
import TicketCard from "./TicketCard";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { MagnifyingGlass, Funnel, SortAscending, SortDescending, CaretLeft, CaretRight } from "@phosphor-icons/react";

export default function TicketList({
  tickets = [],
  total = 0,
  page = 1,
  limit = 20,
  totalPages = 1,
  filters,
  onFilterChange,
  activeTicketId,
  onSelectTicket,
  isLoading,
}) {
  // Debounced search
  const [searchText, setSearchText] = useState(filters.q || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== (filters.q || "")) {
        onFilterChange({ q: searchText, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onFilterChange({ page: newPage });
    }
  };

  const toggleSortOrder = () => {
    const nextOrder = filters.sortOrder === "asc" ? "desc" : "asc";
    onFilterChange({ sortOrder: nextOrder });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/20 border border-slate-900 rounded-xl overflow-hidden shadow-xl">
      {/* Search & Header */}
      <div className="p-4 border-b border-slate-900 bg-slate-950/45 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Funnel size={18} className="text-indigo-400" />
            Inbox
            <span className="text-xs font-normal text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
              {total} Total
            </span>
          </h2>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search title, customer, tags..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Filters & Sorting Panel */}
      <div className="p-4 border-b border-slate-900 bg-slate-950/20 grid grid-cols-2 gap-2 text-xs">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">Status</label>
          <Select
            value={filters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="text-xs py-1"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </Select>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">Priority</label>
          <Select
            value={filters.priority || ""}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            className="text-xs py-1"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">Category</label>
          <Select
            value={filters.category || ""}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="text-xs py-1"
          >
            <option value="">All Categories</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
            <option value="shipping">Shipping</option>
            <option value="general">General</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">Sentiment</label>
          <Select
            value={filters.sentiment || ""}
            onChange={(e) => handleFilterChange("sentiment", e.target.value)}
            className="text-xs py-1"
          >
            <option value="">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </Select>
        </div>

        <div className="col-span-2 grid grid-cols-5 gap-2 pt-1 border-t border-slate-900/60 mt-1">
          <div className="col-span-3">
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">Sort By</label>
            <Select
              value={filters.sortBy || "createdAt"}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="text-xs py-1"
            >
              <option value="createdAt">Created Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </Select>
          </div>
          <div className="col-span-2 flex flex-col justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="h-8 flex items-center justify-center gap-1.5"
            >
              {filters.sortOrder === "asc" ? (
                <>
                  <SortAscending size={14} />
                  <span>Asc</span>
                </>
              ) : (
                <>
                  <SortDescending size={14} />
                  <span>Desc</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="col-span-2 pt-1 flex items-center justify-between border-t border-slate-900/60 mt-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Escalated Only</span>
          <input
            type="checkbox"
            checked={filters.escalated === "true"}
            onChange={(e) => handleFilterChange("escalated", e.target.checked ? "true" : "")}
            className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
          />
        </div>
      </div>

      {/* Ticket List Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 bg-slate-950/10">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-900 bg-slate-900/10 p-4 h-28" />
          ))
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-slate-500 text-sm">No tickets found matching filters.</span>
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              isActive={ticket._id === activeTicketId}
              onClick={() => onSelectTicket(ticket._id)}
            />
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/45 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Select
            value={limit}
            onChange={(e) => onFilterChange({ limit: parseInt(e.target.value, 10), page: 1 })}
            className="text-[11px] py-1 px-2 w-20 h-7"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
          <span className="text-[10px] text-slate-500">per page</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="h-7 w-7 p-0 flex items-center justify-center border border-slate-800"
          >
            <CaretLeft size={16} />
          </Button>
          <span className="text-xs text-slate-400 font-medium">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="h-7 w-7 p-0 flex items-center justify-center border border-slate-800"
          >
            <CaretRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
