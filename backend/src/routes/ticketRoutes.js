import { Router } from 'express';
const router = Router();
import * as ticketController from '../controllers/ticketController.js';
import * as aiController from '../controllers/aiController.js';
import validateRequest from '../middlewares/validateRequest.js';
import { createTicketSchema,
  updateTicketSchema,
  addNoteSchema,
  addMessageSchema,
  ticketIdParamSchema,
 } from '../validators/ticketValidator.js';

// ─── Ticket CRUD ────────────────────────────────────────────────
router.post('/', validateRequest(createTicketSchema), ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.get('/stats', ticketController.getStats);
router.get('/:id', validateRequest(ticketIdParamSchema), ticketController.getTicket);
router.patch('/:id', validateRequest(updateTicketSchema), ticketController.updateTicket);

// ─── Sub-resources ──────────────────────────────────────────────
router.post('/:id/notes', validateRequest(addNoteSchema), ticketController.addInternalNote);
router.post('/:id/messages', validateRequest(addMessageSchema), ticketController.addMessage);

// ─── AI Features ────────────────────────────────────────────────
router.post('/:id/ai/summary', validateRequest(ticketIdParamSchema), aiController.generateSummary);
router.post('/:id/ai/reply', validateRequest(ticketIdParamSchema), aiController.generateSuggestedReply);
router.post('/:id/ai/categorize', validateRequest(ticketIdParamSchema), aiController.categorizeTicket);
router.post('/:id/ai/similar', validateRequest(ticketIdParamSchema), aiController.findSimilarTickets);
router.post('/:id/ai/escalation', validateRequest(ticketIdParamSchema), aiController.checkEscalation);

export default router;
