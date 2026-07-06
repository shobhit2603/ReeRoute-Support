import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'ticket_created',
        'status_changed',
        'priority_changed',
        'note_added',
        'message_sent',
        'ai_summary_generated',
        'ai_reply_suggested',
        'ai_categorized',
        'ai_escalation_checked',
        'sentiment_updated',
        'escalated',
      ],
    },
    details: {
      type: String,
      default: '',
    },
    performedBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: ['billing', 'technical', 'account', 'shipping', 'general', 'other'],
      default: 'general',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    internalNotes: [
      {
        content: String,
        createdBy: {
          type: String,
          default: 'agent',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', null],
      default: null,
    },
    summary: {
      type: String,
      default: null,
    },
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    assignedAgent: {
      type: String,
      default: null,
    },
    escalated: {
      type: Boolean,
      default: false,
    },
    escalationReason: {
      type: String,
      default: null,
    },
    activityLog: [activityLogSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster search and filtering
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ escalated: 1 });
ticketSchema.index({ 'customer.email': 1 });
ticketSchema.index({ 'customer.name': 'text', title: 'text', tags: 'text' });
ticketSchema.index({ createdAt: -1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
