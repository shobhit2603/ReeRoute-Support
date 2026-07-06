import Ticket from '../models/Ticket.js';

class TicketDao {
  /**
   * Create a new ticket with an initial activity log entry.
   */
  async createTicket(ticketData) {
    const ticket = new Ticket({
      ...ticketData,
      activityLog: [
        {
          action: 'ticket_created',
          details: `Ticket created with priority: ${ticketData.priority || 'medium'}`,
          performedBy: 'system',
        },
      ],
    });
    return await ticket.save();
  }

  /**
   * Find a ticket by its MongoDB ObjectId.
   */
  async getTicketById(ticketId) {
    return await Ticket.findById(ticketId);
  }

  /**
   * Query tickets with filtering, search, sorting, and pagination.
   * Returns { tickets, total, page, limit, totalPages }.
   */
  async getTickets(filter = {}) {
    const {
      status,
      priority,
      category,
      escalated,
      sentiment,
      search,
      sortBy,
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = filter;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (sentiment) query.sentiment = sentiment;
    if (escalated !== undefined && escalated !== '') {
      query.escalated = escalated === 'true' || escalated === true;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select('-activityLog')
        .lean(),
      Ticket.countDocuments(query),
    ]);

    return {
      tickets,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Update a ticket by ID and return the updated document.
   */
  async updateTicketById(ticketId, updateData) {
    return await Ticket.findByIdAndUpdate(ticketId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Push an internal note into the ticket's internalNotes array.
   */
  async addInternalNote(ticketId, noteContent) {
    return await Ticket.findByIdAndUpdate(
      ticketId,
      {
        $push: {
          internalNotes: { content: noteContent },
          activityLog: {
            action: 'note_added',
            details: 'Internal note added',
            performedBy: 'agent',
          },
        },
      },
      { new: true }
    );
  }

  /**
   * Push an entry into the ticket's activityLog array.
   */
  async addActivityLog(ticketId, logEntry) {
    return await Ticket.findByIdAndUpdate(
      ticketId,
      { $push: { activityLog: logEntry } },
      { new: true }
    );
  }

  /**
   * Fetch recent tickets (excluding the given one) for similar ticket discovery.
   * Returns lightweight ticket objects (id, title, tags, category, status).
   */
  async getRecentTickets(excludeId, limit = 50) {
    const query = {};
    if (excludeId) query._id = { $ne: excludeId };

    return await Ticket.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title tags category status priority customer.name summary')
      .lean();
  }

  /**
   * Get dashboard statistics for quick overview.
   */
  async getTicketStats() {
    const [statusCounts, priorityCounts, sentimentCounts, totalEscalated] =
      await Promise.all([
        Ticket.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Ticket.aggregate([
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
        Ticket.aggregate([
          { $match: { sentiment: { $ne: null } } },
          { $group: { _id: '$sentiment', count: { $sum: 1 } } },
        ]),
        Ticket.countDocuments({ escalated: true }),
      ]);

    return {
      byStatus: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      byPriority: priorityCounts.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {}),
      bySentiment: sentimentCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      totalEscalated,
    };
  }
}

export default new TicketDao();
