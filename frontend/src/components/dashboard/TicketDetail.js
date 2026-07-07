"use client";

import React, { useState } from "react";
import Badge from "../ui/Badge";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Card from "../ui/Card";
import AIAssistancePanel from "./AIAssistancePanel";
import ConversationView from "./ConversationView";
import InternalNotesView from "./InternalNotesView";
import ActivityLogView from "./ActivityLogView";
import { useTicket, useUpdateTicket } from "../../hooks/useTickets";
import { User, Envelope, CalendarBlank, Warning, ChatCircleText, Note, Clock, Sparkle } from "@phosphor-icons/react";

export default function TicketDetail({ ticketId, onSelectTicket }) {
  const [activeTab, setActiveTab] = useState("chat"); // chat, notes, log

  // Queries & Mutations
  const { data: ticketData, isLoading, error } = useTicket(ticketId);
  const updateMutation = useUpdateTicket();

    if (!ticketId) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-slate-200 bg-white rounded-xl min-h-[500px]">
          <Sparkle size={48} className="text-brand-blue/30 mb-4 animate-pulse" weight="fill" />
          <h3 className="text-lg font-bold text-brand-black mb-2">No Ticket Selected</h3>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            Select a support conversation from the inbox panel to view customer history, update details, and utilize AI workflows.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col gap-6 p-6 border border-slate-200 bg-white rounded-xl animate-pulse min-h-[500px]">
          <div className="h-10 bg-slate-100 rounded-md w-1/3" />
          <div className="h-24 bg-slate-50 rounded-md w-full" />
          <div className="h-12 bg-slate-100 rounded-md w-full" />
          <div className="h-[300px] bg-slate-50 rounded-md w-full" />
        </div>
      );
    }

    if (error || !ticketData?.success) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-slate-200 bg-white rounded-xl min-h-[500px]">
          <Warning size={48} className="text-rose-500/30 mb-4" />
          <h3 className="text-lg font-bold text-brand-black mb-2">Error Loading Ticket</h3>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            {error?.message || "Could not retrieve ticket details from server."}
          </p>
        </div>
      );
    }

  const { ticket, messages } = ticketData.data;

  const handleStatusChange = (e) => {
    updateMutation.mutate({
      id: ticketId,
      data: { status: e.target.value },
    });
  };

  const handlePriorityChange = (e) => {
    updateMutation.mutate({
      id: ticketId,
      data: { priority: e.target.value },
    });
  };

  const handleEscalationToggle = () => {
    updateMutation.mutate({
      id: ticketId,
      data: {
        escalated: !ticket.escalated,
        escalationReason: !ticket.escalated ? "Manually escalated by agent" : null,
      },
    });
  };

  return (
    <div className="flex flex-col gap-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[500px]">
      {/* Detail Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-brand-violet uppercase tracking-wider">
              ID: {ticket._id}
            </span>
            <Badge variant={ticket.category}>{ticket.category}</Badge>
            {ticket.escalated && (
              <Badge variant="escalated" className="flex items-center gap-1">
                <Warning size={10} weight="fill" />
                Escalated
              </Badge>
            )}
          </div>
          
          <h2 className="text-2xl font-semibold text-brand-black line-clamp-2">
            {ticket.title}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <User size={14} className="text-slate-400" />
              <span className="font-semibold text-brand-black">{ticket.customer?.name}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Envelope size={14} className="text-slate-400" />
              <span>{ticket.customer?.email}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarBlank size={14} className="text-slate-400" />
              <span>
                {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </span>
          </div>
        </div>

        {/* Status, Priority Controls */}
        <div className="flex flex-wrap items-center sm:flex-col sm:items-end gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Status</span>
              <Select
                value={ticket.status}
                onChange={handleStatusChange}
                disabled={updateMutation.isPending}
                className="h-8 py-1 text-xs w-28 border-slate-300"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Priority</span>
              <Select
                value={ticket.priority}
                onChange={handlePriorityChange}
                disabled={updateMutation.isPending}
                className="h-8 py-1 text-xs w-28 border-slate-300"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
          </div>

          <Button
            variant={ticket.escalated ? "danger" : "outline"}
            size="sm"
            onClick={handleEscalationToggle}
            isLoading={updateMutation.isPending}
            className="h-8 text-xs px-3 border-slate-300 w-full sm:w-auto"
          >
            <Warning size={12} weight={ticket.escalated ? "fill" : "regular"} />
            <span>{ticket.escalated ? "De-escalate Case" : "Escalate Case"}</span>
          </Button>
        </div>
      </div>

      {/* AI Assistance Copilot Section */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-inner">
        <AIAssistancePanel
          ticketId={ticketId}
          ticket={ticket}
          onSelectTicket={onSelectTicket}
        />
      </div>

      {/* Details sub-tabs Area */}
      <div className="flex flex-col gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "chat"
                ? "text-brand-blue border-brand-blue"
                : "text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            <ChatCircleText size={14} />
            Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "notes"
                ? "text-brand-violet border-brand-violet"
                : "text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            <Note size={14} />
            Internal Notes ({ticket.internalNotes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("log")}
            className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "log"
                ? "text-slate-700 border-slate-700"
                : "text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            <Clock size={14} />
            Activity Log ({ticket.activityLog?.length || 0})
          </button>
        </div>

        {/* Tab Body */}
        <div>
          {activeTab === "chat" && (
            <ConversationView
              ticketId={ticketId}
              messages={messages}
              ticket={ticket}
            />
          )}

          {activeTab === "notes" && (
            <InternalNotesView
              ticketId={ticketId}
              notes={ticket.internalNotes}
            />
          )}

          {activeTab === "log" && (
            <ActivityLogView
              activityLog={ticket.activityLog}
            />
          )}
        </div>
      </div>
    </div>
  );
}
