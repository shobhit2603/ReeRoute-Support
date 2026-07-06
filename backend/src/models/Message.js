import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    senderType: {
      type: String,
      enum: ['customer', 'agent', 'ai'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ ticketId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
