import ticketService from '../services/ticketService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const generateSummary = asyncHandler(async (req, res) => {
  const summary = await ticketService.generateAiSummary(req.params.id);
  res.status(200).json({ success: true, data: summary });
});

export const generateSuggestedReply = asyncHandler(async (req, res) => {
  const reply = await ticketService.generateAiSuggestedReply(req.params.id);
  res.status(200).json({ success: true, data: reply });
});

export const categorizeTicket = asyncHandler(async (req, res) => {
  const result = await ticketService.categorizeTicket(req.params.id);
  res.status(200).json({ success: true, data: result });
});

export const findSimilarTickets = asyncHandler(async (req, res) => {
  const result = await ticketService.findSimilarTickets(req.params.id);
  res.status(200).json({ success: true, data: result });
});

export const checkEscalation = asyncHandler(async (req, res) => {
  const result = await ticketService.checkEscalation(req.params.id);
  res.status(200).json({ success: true, data: result });
});
