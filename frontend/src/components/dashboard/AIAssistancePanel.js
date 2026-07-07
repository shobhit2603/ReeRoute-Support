"use client";

import React, { useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { Sparkle, ChatText, Warning, Copy, SealCheck, ArrowRight, ArrowCounterClockwise } from "@phosphor-icons/react";
import {
  useGenerateSummary,
  useCategorizeTicket,
  useCheckEscalation,
  useSimilarTickets,
} from "../../hooks/useTickets";

export default function AIAssistancePanel({ ticketId, ticket, onSelectTicket }) {
  const [activeAITab, setActiveAITab] = useState("summary"); // summary, escalation, similar

  // AI Mutations
  const summaryMutation = useGenerateSummary();
  const categorizeMutation = useCategorizeTicket();
  const escalationMutation = useCheckEscalation();

  // Similar tickets query (run when tab is active)
  const { data: similarData, isLoading: isLoadingSimilar, refetch: refetchSimilar } = useSimilarTickets(ticketId, {
    enabled: activeAITab === "similar",
  });

  const handleGenerateSummary = () => {
    summaryMutation.mutate(ticketId);
  };

  const handleCategorize = () => {
    categorizeMutation.mutate(ticketId);
  };

  const handleCheckEscalation = () => {
    escalationMutation.mutate(ticketId);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* AI Actions Row */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <Button
          variant={activeAITab === "summary" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setActiveAITab("summary")}
          className="text-xs"
        >
          <Sparkle size={14} weight="fill" />
          Summary
        </Button>
        <Button
          variant={activeAITab === "escalation" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setActiveAITab("escalation")}
          className="text-xs"
        >
          <Warning size={14} />
          Escalation Advisor
        </Button>
        <Button
          variant={activeAITab === "similar" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setActiveAITab("similar")}
          className="text-xs"
        >
          <ChatText size={14} />
          Similar Cases
        </Button>

        <div className="ml-auto flex items-center gap-2">
          {/* Quick Categorization Trigger */}
          {ticket?.aiConfidence !== undefined && ticket?.aiConfidence !== null && (
            <div className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
              AI Confidence: <span className="font-bold text-brand-black">{Math.round(ticket.aiConfidence * 100)}%</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCategorize}
            isLoading={categorizeMutation.isPending}
            className="text-xs py-1"
          >
            <Sparkle size={12} className="text-brand-violet" />
            Auto-Categorize
          </Button>
        </div>
      </div>

      {/* AI Content Display */}
      <div className="min-h-[140px] flex flex-col justify-between">
        {/* Tab 1: Summarization */}
        {activeAITab === "summary" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-black uppercase tracking-wide">AI Summary</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSummary}
                isLoading={summaryMutation.isPending}
                className="text-xs h-7 gap-1"
              >
                <ArrowCounterClockwise size={12} />
                {ticket?.summary ? "Regenerate" : "Generate Summary"}
              </Button>
            </div>
            {ticket?.summary ? (
              <Card className="bg-blue-50 border-blue-200 text-slate-700 text-xs leading-relaxed p-4 shadow-sm border relative">
                <div className="absolute top-2 right-2 p-1 text-brand-blue">
                  <Sparkle size={14} weight="fill" className="animate-pulse" />
                </div>
                <p className="pr-4">{ticket.summary}</p>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                <Sparkle size={24} className="text-brand-blue/50 mb-2 animate-pulse" />
                <p className="text-xs text-slate-500 text-center max-w-xs mb-3">
                  No summary generated yet. Ask AI to summarize the support thread conversation.
                </p>
                <Button
                  variant="ai"
                  size="sm"
                  onClick={handleGenerateSummary}
                  isLoading={summaryMutation.isPending}
                >
                  Create Conversation Summary
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Escalation Advisor */}
        {activeAITab === "escalation" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-black uppercase tracking-wide">Escalation Checker</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckEscalation}
                isLoading={escalationMutation.isPending}
                className="text-xs h-7 gap-1"
              >
                <Warning size={12} />
                Analyze Risk
              </Button>
            </div>

            {/* Display result of check or offer button */}
            {escalationMutation.data?.data ? (
              <Card className="bg-rose-50 border-rose-200 text-xs p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-brand-black">
                    <Warning size={14} className="text-rose-400" />
                    Should Escalate:
                    <Badge variant={escalationMutation.data.data.shouldEscalate ? "urgent" : "closed"} className="ml-1">
                      {escalationMutation.data.data.shouldEscalate ? "YES" : "NO"}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    Urgency: <span className="font-semibold text-orange-400">{escalationMutation.data.data.urgency}</span>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed italic bg-white p-2.5 rounded border border-slate-200">
                  &quot;{escalationMutation.data.data.reason}&quot;
                </p>
                {escalationMutation.data.data.shouldEscalate && escalationMutation.data.data.urgency === "high" && (
                  <p className="text-[10px] text-violet-400 font-semibold mt-1">
                    ℹ️ This ticket has been automatically escalated and priority upgraded to &quot;Urgent&quot;.
                  </p>
                )}
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                <Warning size={24} className="text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 text-center max-w-xs mb-3">
                  Check if this ticket shows critical customer frustration, security risks, or needs management support.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckEscalation}
                  isLoading={escalationMutation.isPending}
                >
                  Run Escalation Audit
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Similar Tickets */}
        {activeAITab === "similar" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-black uppercase tracking-wide">Similar Resolved Cases</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchSimilar()}
                isLoading={isLoadingSimilar}
                className="text-xs h-7 gap-1"
              >
                <ArrowCounterClockwise size={12} />
                Refresh
              </Button>
            </div>

            {isLoadingSimilar ? (
              <div className="flex flex-col gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse bg-slate-50 border border-slate-200 rounded-lg p-3 h-16" />
                ))}
              </div>
            ) : similarData?.data?.similarTickets && similarData.data.similarTickets.length > 0 ? (
              <div className="flex flex-col gap-2">
                {similarData.data.similarTickets.map((sim, i) => (
                  <div
                    key={i}
                    onClick={() => onSelectTicket(sim.ticketId)}
                    className="p-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg cursor-pointer flex items-center justify-between gap-3 text-xs transition-all duration-200 group"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-brand-black truncate group-hover:text-brand-blue transition-colors">
                          {sim.title}
                        </span>
                        <Badge variant={sim.status} className="text-[9px] px-1 py-0 select-none">
                          {sim.status}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-500 italic">
                        Match reason: {sim.similarity}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                <ChatText size={24} className="text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 text-center max-w-xs mb-3">
                  Find similar cases in our database. AI matches contexts, tags, and titles.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchSimilar()}
                  isLoading={isLoadingSimilar}
                >
                  Find Similar Tickets
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
