import ticketDao from '../dao/ticketDao.js';
import messageDao from '../dao/messageDao.js';
import aiService from './aiService.js';
import ApiError from '../utils/apiError.js';

class TicketService {
  /**
   * Create a new support ticket. Auto-categorizes via AI if messages exist.
   */
  async createTicket(ticketData) {
    return await ticketDao.createTicket(ticketData);
  }

  /**
   * Get paginated, filtered, sorted tickets.
   */
  async getTickets(filter) {
    return await ticketDao.getTickets(filter);
  }

  /**
   * Get a single ticket with its full conversation history.
   */
  async getTicketById(ticketId) {
    const ticket = await ticketDao.getTicketById(ticketId);
    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }
    const messages = await messageDao.getMessagesByTicketId(ticketId);
    return { ticket, messages };
  }

  /**
   * Update ticket fields (status, priority, etc.) with activity logging.
   */
  async updateTicket(ticketId, updateData) {
    const existing = await ticketDao.getTicketById(ticketId);
    if (!existing) {
      throw new ApiError(404, 'Ticket not found');
    }

    // Log status changes
    if (updateData.status && updateData.status !== existing.status) {
      await ticketDao.addActivityLog(ticketId, {
        action: 'status_changed',
        details: `Status changed from "${existing.status}" to "${updateData.status}"`,
        performedBy: 'agent',
      });
    }

    // Log priority changes
    if (updateData.priority && updateData.priority !== existing.priority) {
      await ticketDao.addActivityLog(ticketId, {
        action: 'priority_changed',
        details: `Priority changed from "${existing.priority}" to "${updateData.priority}"`,
        performedBy: 'agent',
      });
    }

    const ticket = await ticketDao.updateTicketById(ticketId, updateData);
    return ticket;
  }

  /**
   * Add an internal note to a ticket.
   */
  async addInternalNote(ticketId, content) {
    const ticket = await ticketDao.addInternalNote(ticketId, content);
    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }
    return ticket;
  }

  /**
   * Add a message to a ticket conversation.
   * Automatically triggers sentiment analysis for customer messages.
   */
  async addMessage(ticketId, messageData) {
    const ticket = await ticketDao.getTicketById(ticketId);
    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }

    const message = await messageDao.createMessage({
      ticketId,
      ...messageData,
    });

    // Log activity
    await ticketDao.addActivityLog(ticketId, {
      action: 'message_sent',
      details: `Message sent by ${messageData.senderType}`,
      performedBy: messageData.senderType,
    });

    // Auto-analyze sentiment on customer messages (non-blocking)
    if (messageData.senderType === 'customer') {
      this._autoAnalyzeSentiment(ticketId).catch((err) =>
        console.error('Background sentiment analysis failed:', err.message)
      );
    }

    return message;
  }

  /**
   * Background job: analyze sentiment and update ticket.
   * @private
   */
  async _autoAnalyzeSentiment(ticketId) {
    const messages = await messageDao.getMessagesByTicketId(ticketId);
    const sentiment = await aiService.analyzeSentiment(messages);
    await ticketDao.updateTicketById(ticketId, { sentiment });
    await ticketDao.addActivityLog(ticketId, {
      action: 'sentiment_updated',
      details: `Sentiment auto-updated to "${sentiment}"`,
      performedBy: 'system',
    });
  }

  // ─── AI Feature Methods ──────────────────────────────────────────

  /**
   * Generate an AI summary for a ticket and persist it.
   */
  async generateAiSummary(ticketId) {
    const ticket = await ticketDao.getTicketById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    const messages = await messageDao.getMessagesByTicketId(ticketId);
    const summary = await aiService.summarizeTicket(messages);

    await ticketDao.updateTicketById(ticketId, { summary });
    await ticketDao.addActivityLog(ticketId, {
      action: 'ai_summary_generated',
      details: 'AI-generated summary created',
      performedBy: 'system',
    });

    return { summary };
  }

  /**
   * Generate an AI-suggested reply for the agent.
   */
  async generateAiSuggestedReply(ticketId) {
    const ticket = await ticketDao.getTicketById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    const messages = await messageDao.getMessagesByTicketId(ticketId);
    const suggestedReply = await aiService.suggestReply(messages);

    await ticketDao.addActivityLog(ticketId, {
      action: 'ai_reply_suggested',
      details: 'AI-suggested reply generated',
      performedBy: 'system',
    });

    return { suggestedReply };
  }

  /**
   * AI-categorize a ticket and store the result with confidence.
   */
  async categorizeTicket(ticketId) {
    const ticket = await ticketDao.getTicketById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    const messages = await messageDao.getMessagesByTicketId(ticketId);
    const { category, confidence } = await aiService.categorizeTicket(messages, ticket.title);

    await ticketDao.updateTicketById(ticketId, {
      category,
      aiConfidence: confidence,
    });

    await ticketDao.addActivityLog(ticketId, {
      action: 'ai_categorized',
      details: `Categorized as "${category}" with ${(confidence * 100).toFixed(0)}% confidence`,
      performedBy: 'system',
    });

    return { category, confidence };
  }

  /**
   * Find tickets similar to the given one using AI analysis.
   */
  async findSimilarTickets(ticketId) {
    const ticket = await ticketDao.getTicketById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    const recentTickets = await ticketDao.getRecentTickets(ticketId, 50);
    const similarTickets = await aiService.findSimilarTickets(ticket, recentTickets);

    return { similarTickets };
  }

  /**
   * Get AI escalation recommendation for a ticket.
   * Optionally auto-escalates if AI recommends it.
   */
  async checkEscalation(ticketId) {
    const ticket = await ticketDao.getTicketById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    const messages = await messageDao.getMessagesByTicketId(ticketId);
    const recommendation = await aiService.recommendEscalation(ticket, messages);

    await ticketDao.addActivityLog(ticketId, {
      action: 'ai_escalation_checked',
      details: `Escalation ${recommendation.shouldEscalate ? 'recommended' : 'not needed'}: ${recommendation.reason}`,
      performedBy: 'system',
    });

    // Auto-escalate if AI recommends with high urgency
    if (recommendation.shouldEscalate && recommendation.urgency === 'high') {
      await ticketDao.updateTicketById(ticketId, {
        escalated: true,
        escalationReason: recommendation.reason,
        priority: 'urgent',
      });

      await ticketDao.addActivityLog(ticketId, {
        action: 'escalated',
        details: `Auto-escalated: ${recommendation.reason}`,
        performedBy: 'system',
      });
    }

    return recommendation;
  }

  /**
   * Get dashboard statistics (ticket counts by status, priority, etc.)
   */
  async getStats() {
    return await ticketDao.getTicketStats();
  }
}

export default new TicketService();
