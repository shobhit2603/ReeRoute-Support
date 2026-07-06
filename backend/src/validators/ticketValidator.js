import { z  } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
    customer: z.object({
      name: z.string().min(1, 'Customer name is required'),
      email: z.string().email('Invalid email address'),
    }),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    category: z.enum(['billing', 'technical', 'account', 'shipping', 'general', 'other']).optional(),
    tags: z.array(z.string()).optional(),
    assignedAgent: z.string().optional(),
  }),
});

const updateTicketSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid ticket ID'),
  }),
  body: z
    .object({
      status: z.enum(['open', 'in-progress', 'resolved', 'closed']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      category: z.enum(['billing', 'technical', 'account', 'shipping', 'general', 'other']).optional(),
      assignedAgent: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

const addNoteSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid ticket ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Note content is required').max(2000, 'Note is too long'),
  }),
});

const addMessageSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid ticket ID'),
  }),
  body: z.object({
    senderType: z.enum(['customer', 'agent']),
    content: z.string().min(1, 'Message content is required').max(5000, 'Message is too long'),
  }),
});

const ticketIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid ticket ID'),
  }),
});

export { createTicketSchema,
  updateTicketSchema,
  addNoteSchema,
  addMessageSchema,
  ticketIdParamSchema,
 };
