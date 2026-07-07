"use client";

import React, { useState, useRef, useEffect } from "react";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import { Sparkle, PaperPlaneRight, User, Smiley, SmileyMeh, SmileySad, Robot, ArrowLeft } from "@phosphor-icons/react";
import { useAddMessage, useGenerateReply } from "../../hooks/useTickets";

export default function ConversationView({ ticketId, messages = [], ticket }) {
  const [inputText, setInputText] = useState("");
  const [senderType, setSenderType] = useState("agent"); // agent or customer (for testing/simulation)
  const messagesEndRef = useRef(null);

  const addMessageMutation = useAddMessage();
  const draftReplyMutation = useGenerateReply();

  // Scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    addMessageMutation.mutate(
      {
        id: ticketId,
        messageData: {
          senderType,
          content: inputText.trim(),
        },
      },
      {
        onSuccess: () => {
          setInputText("");
        },
      }
    );
  };

  const handleGenerateReply = () => {
    draftReplyMutation.mutate(ticketId);
  };

  const handleApplyDraft = () => {
    if (draftReplyMutation.data?.data?.suggestedReply) {
      setInputText(draftReplyMutation.data.data.suggestedReply);
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return <Smiley size={14} className="text-emerald-400" weight="fill" />;
      case "negative":
        return <SmileySad size={14} className="text-rose-400" weight="fill" />;
      case "neutral":
        return <SmileyMeh size={14} className="text-slate-400" weight="fill" />;
      default:
        return null;
    }
  };

  const getSentimentClass = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "border-l-2 border-l-emerald-500/60";
      case "negative":
        return "border-l-2 border-l-rose-500/60";
      case "neutral":
        return "border-l-2 border-l-slate-700";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-slate-900 rounded-xl bg-slate-950/20 overflow-hidden shadow-inner">
      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0 bg-slate-950/15">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <span className="text-xs text-slate-500">No message history available. Start the conversation below.</span>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isAgent = msg.senderType === "agent";
            const isAI = msg.senderType === "ai";
            const customerSentiment = !isAgent && !isAI && ticket?.sentiment;

            return (
              <div
                key={msg._id || i}
                className={`flex flex-col max-w-[80%] ${
                  isAgent ? "self-end items-end" : "self-start items-start"
                }`}
              >
                {/* Bubble Meta */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1 mb-0.5 select-none">
                  {isAgent ? (
                    <>
                      <span>Agent</span>
                      <User size={10} />
                    </>
                  ) : isAI ? (
                    <>
                      <Robot size={10} className="text-indigo-400" />
                      <span className="text-indigo-400 font-medium">AI Copilot</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-slate-400">{ticket?.customer?.name || "Customer"}</span>
                      {customerSentiment && i === messages.length - 1 && (
                        <div className="flex items-center gap-0.5 ml-1 bg-slate-900/60 px-1 py-0.2 rounded border border-slate-800">
                          {getSentimentIcon(customerSentiment)}
                          <span className="text-[8px] uppercase font-bold text-slate-400">{customerSentiment}</span>
                        </div>
                      )}
                    </>
                  )}
                  <span className="text-[9px] text-slate-600">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Bubble Body */}
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed break-words border ${
                    isAgent
                      ? "bg-indigo-600 text-white border-indigo-700/50 rounded-tr-none shadow-md shadow-indigo-600/5"
                      : isAI
                      ? "bg-violet-950/20 text-violet-200 border-violet-800/40 rounded-tl-none"
                      : `bg-slate-900 text-slate-200 border-slate-800/80 rounded-tl-none ${getSentimentClass(
                          customerSentiment && i === messages.length - 1 ? customerSentiment : ""
                        )}`
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Draft Response Drawer */}
      {draftReplyMutation.isPending && (
        <div className="px-4 py-2 border-t border-slate-900/60 bg-indigo-950/10 flex items-center justify-between text-xs animate-pulse">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sparkle size={14} className="text-indigo-400 animate-spin" />
            AI drafting suggested reply...
          </span>
        </div>
      )}

      {draftReplyMutation.data?.data?.suggestedReply && !draftReplyMutation.isPending && (
        <div className="p-3 border-t border-slate-900 bg-indigo-950/15 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
              <Sparkle size={12} weight="fill" />
              AI Suggested Response
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyDraft}
              className="text-[10px] h-6 py-0.5 border-indigo-500/20 hover:bg-indigo-950/40"
            >
              <ArrowLeft size={10} />
              Apply Draft
            </Button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-h-24 overflow-y-auto bg-slate-950/50 p-2.5 rounded border border-slate-900/60 select-all">
            {draftReplyMutation.data.data.suggestedReply}
          </p>
        </div>
      )}

      {/* Message Compose Form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-900 bg-slate-950/45 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* Sender Toggle (for simulation/testing) */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Send As:</span>
            <Select
              value={senderType}
              onChange={(e) => setSenderType(e.target.value)}
              className="text-[10px] h-6 py-0.5 px-1.5 w-20 border-slate-800"
            >
              <option value="agent">Agent</option>
              <option value="customer">Customer</option>
            </Select>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateReply}
            isLoading={draftReplyMutation.isPending}
            className="text-[10px] h-6 py-0.5 ml-auto border-indigo-500/20 hover:bg-indigo-950/40 text-indigo-400"
          >
            <Sparkle size={10} weight="fill" />
            AI Draft Reply
          </Button>
        </div>

        <div className="flex items-end gap-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Reply to customer as ${senderType === "agent" ? "Agent" : "Customer (Simulated)"}...`}
            className="min-h-[44px] h-[44px] py-2.5 max-h-12"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!inputText.trim()}
            isLoading={addMessageMutation.isPending}
            className="h-10 w-10 flex items-center justify-center p-0 rounded-lg"
          >
            <PaperPlaneRight size={16} weight="fill" />
          </Button>
        </div>
      </form>
    </div>
  );
}
