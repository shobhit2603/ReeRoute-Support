import ticketService from '../services/ticketService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.createTicket(req.body);
  res.status(201).json({ success: true, data: ticket });
});

export const getTickets = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    priority: req.query.priority,
    category: req.query.category,
    escalated: req.query.escalated,
    sentiment: req.query.sentiment,
    search: req.query.q,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
    page: req.query.page,
    limit: req.query.limit,
  };
  const result = await ticketService.getTickets(filters);
  res.status(200).json({ success: true, ...result });
});

export const getTicket = asyncHandler(async (req, res) => {
  const data = await ticketService.getTicketById(req.params.id);
  res.status(200).json({ success: true, data });
});

export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.updateTicket(req.params.id, req.body);
  res.status(200).json({ success: true, data: ticket });
});

export const addInternalNote = asyncHandler(async (req, res) => {
  const ticket = await ticketService.addInternalNote(req.params.id, req.body.content);
  res.status(200).json({ success: true, data: ticket });
});

export const addMessage = asyncHandler(async (req, res) => {
  const message = await ticketService.addMessage(req.params.id, req.body);
  res.status(201).json({ success: true, data: message });
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await ticketService.getStats();
  res.status(200).json({ success: true, data: stats });
});
