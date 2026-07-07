"use client";

import React from "react";
import Badge from "../ui/Badge";
import { Warning, Smiley, SmileyMeh, SmileySad } from "@phosphor-icons/react";

export default function TicketCard({ ticket, isActive, isExpanded, onClick }) {
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return <Smiley size={16} className="text-emerald-400" weight="duotone" />;
      case "negative":
        return <SmileySad size={16} className="text-rose-400" weight="duotone" />;
      case "neutral":
        return <SmileyMeh size={16} className="text-slate-400" weight="duotone" />;
      default:
        return null;
    }
  };

  const formattedDate = new Date(ticket.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isExpanded) {
    return (
      <div
        onClick={onClick}
        className={`group relative grid grid-cols-12 gap-4 px-3 py-3 items-center rounded-lg border transition-all duration-200 cursor-pointer ${
          isActive
            ? "bg-slate-50 border-brand-violet shadow-sm"
            : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
        }`}
      >
        {ticket.escalated && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-500 rounded-l-lg" />
        )}

        <div className="col-span-3 flex flex-col gap-0.5 min-w-0 pl-1">
          <h3 className="text-sm font-semibold text-brand-black group-hover:text-brand-blue line-clamp-1 transition-colors">
            {ticket.title}
          </h3>
          <span className="text-[10px] text-slate-400">{formattedDate}</span>
        </div>

        <div className="col-span-2 flex items-center gap-1.5 min-w-0">
          <span className="text-xs truncate font-medium text-slate-700">{ticket.customer?.name}</span>
          {ticket.sentiment && (
            <div title={ticket.sentiment}>
              {getSentimentIcon(ticket.sentiment)}
            </div>
          )}
        </div>

        <div className="col-span-2 flex min-w-0">
          <span className="text-[10px] font-semibold text-brand-violet tracking-wide uppercase px-2 py-0.5 bg-violet-50 border border-violet-100 rounded">
            {ticket.category || "General"}
          </span>
        </div>

        <div className="col-span-1 flex min-w-0">
          <Badge variant={ticket.status}>{ticket.status}</Badge>
        </div>

        <div className="col-span-1 flex min-w-0">
          <Badge variant={ticket.priority}>{ticket.priority}</Badge>
        </div>

        <div className="col-span-3 flex justify-end gap-1.5">
          {ticket.escalated && (
            <Badge variant="escalated" className="flex items-center gap-1">
              <Warning size={10} weight="fill" />
              Escalated
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-slate-50 border-brand-violet shadow-md"
          : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
      }`}
    >
      {/* Escalated Glow Line */}
      {ticket.escalated && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-500 rounded-l-xl" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-brand-violet tracking-wide uppercase">
          {ticket.category || "General"}
        </span>
        <span className="text-xs text-slate-400">{formattedDate}</span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-brand-black group-hover:text-brand-blue line-clamp-1 transition-colors">
        {ticket.title}
      </h3>

      {/* Customer and Sentiment */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="truncate font-medium">{ticket.customer?.name}</span>
        {ticket.sentiment && (
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {getSentimentIcon(ticket.sentiment)}
            <span className="capitalize text-[10px] tracking-wide">{ticket.sentiment}</span>
          </div>
        )}
      </div>

      {/* Badges Footer */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <Badge variant={ticket.status}>{ticket.status}</Badge>
        <Badge variant={ticket.priority}>{ticket.priority}</Badge>
        {ticket.escalated && (
          <Badge variant="escalated" className="flex items-center gap-1">
            <Warning size={10} weight="fill" />
            Escalated
          </Badge>
        )}
      </div>
    </div>
  );
}
