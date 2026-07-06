import Message from '../models/Message.js';

class MessageDao {
  /**
   * Create and persist a new message.
   */
  async createMessage(messageData) {
    const message = new Message(messageData);
    return await message.save();
  }

  /**
   * Fetch all messages for a ticket, ordered chronologically.
   */
  async getMessagesByTicketId(ticketId) {
    return await Message.find({ ticketId }).sort({ createdAt: 1 }).lean();
  }

  /**
   * Count messages for a specific ticket.
   */
  async countMessagesByTicketId(ticketId) {
    return await Message.countDocuments({ ticketId });
  }
}

export default new MessageDao();
