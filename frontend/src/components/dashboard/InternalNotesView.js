"use client";

import React, { useState } from "react";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import Card from "../ui/Card";
import { Note, CalendarBlank, Plus } from "@phosphor-icons/react";
import { useAddNote } from "../../hooks/useTickets";

export default function InternalNotesView({ ticketId, notes = [] }) {
  const [noteContent, setNoteContent] = useState("");
  const addNoteMutation = useAddNote();

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    addNoteMutation.mutate(
      {
        id: ticketId,
        content: noteContent.trim(),
      },
      {
        onSuccess: () => {
          setNoteContent("");
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-[500px] border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm p-4 gap-4">
      {/* Note Composition Box */}
      <form onSubmit={handleAddNote} className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <span className="text-[10px] uppercase font-bold text-brand-violet flex items-center gap-1.5 select-none">
          <Note size={14} weight="fill" />
          Add Private Agent Note
        </span>
        <div className="flex items-start gap-2">
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Add an internal note visible only to support agents..."
            className="min-h-[50px] text-xs"
          />
          <Button
            type="submit"
            variant="success"
            size="sm"
            disabled={!noteContent.trim()}
            isLoading={addNoteMutation.isPending}
            className="h-10 self-end px-3"
          >
            <Plus size={14} weight="bold" />
            <span>Add</span>
          </Button>
        </div>
      </form>

      {/* Scrollable Note List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 min-h-0">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Note size={24} className="text-slate-600 mb-2" />
            <span className="text-xs text-slate-500">No internal notes logged on this ticket.</span>
          </div>
        ) : (
          [...notes].reverse().map((note, i) => (
            <Card
              key={note._id || i}
              className="bg-violet-50 border-violet-200 p-3.5 rounded-lg flex flex-col gap-2 border shadow-sm"
            >
              {/* Note Header */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 select-none">
                <span className="font-semibold text-brand-violet">By {note.createdBy}</span>
                <span className="flex items-center gap-1">
                  <CalendarBlank size={10} />
                  {new Date(note.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              
              {/* Note Content */}
              <p className="text-xs text-brand-black leading-relaxed wrap-break-word whitespace-pre-wrap">
                {note.content}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
