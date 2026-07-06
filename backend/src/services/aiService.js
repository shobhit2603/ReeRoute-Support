import mistralClient from '../config/ai.js';

/**
 * AI Service — Wraps Mistral AI client for all AI-powered features.
 * Each method formats conversation context into a structured prompt,
 * sends it to Mistral, and parses the response.
 */
class AiService {
  /**
   * Helper to call Mistral chat completion with consistent config.
   * @param {string} prompt - The user prompt to send
   * @param {number} maxTokens - Maximum tokens for the response
   * @returns {string} The AI response content
   */
  async _callMistral(prompt, maxTokens = 300) {
    const response = await mistralClient.chat.complete({
      model: 'mistral-medium-latest',
      messages: [{ role: 'user', content: prompt }],
      maxTokens,
      temperature: 0.3,
    });
    return response.choices[0].message.content.trim();
  }

  /**
   * Generate a concise 2-3 sentence summary of the ticket conversation.
   * @param {Array} messages - Array of message objects with senderType and content
   * @returns {string} Summary text
   */
  async summarizeTicket(messages) {
    if (!messages || messages.length === 0) {
      return 'No conversation history to summarize.';
    }

    const formattedMessages = messages
      .map((m) => `${m.senderType.toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `You are a customer support analyst. Summarize the following support ticket conversation in 2-3 concise sentences. Focus on the core issue, what has been done so far, and the current status.\n\nConversation:\n${formattedMessages}`;

    try {
      return await this._callMistral(prompt, 200);
    } catch (error) {
      console.error('AI Summarize Error:', error.message);
      throw new Error('Failed to generate summary from AI.');
    }
  }

  /**
   * Draft a suggested reply for the support agent based on conversation context.
   * @param {Array} messages - Array of message objects
   * @returns {string} Suggested reply text
   */
  async suggestReply(messages) {
    if (!messages || messages.length === 0) {
      return 'Hello! Thank you for reaching out. How can I assist you today?';
    }

    const formattedMessages = messages
      .map((m) => `${m.senderType.toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `You are a helpful, professional, and empathetic customer support agent. Based on the following conversation history, draft a polite reply to the customer. The reply should:
- Acknowledge the customer's concern
- Provide a clear next step or solution
- Be concise (2-4 sentences max)

Conversation:
${formattedMessages}

Suggested Agent Reply:`;

    try {
      return await this._callMistral(prompt, 250);
    } catch (error) {
      console.error('AI Suggest Reply Error:', error.message);
      throw new Error('Failed to generate suggested reply from AI.');
    }
  }

  /**
   * Analyze customer sentiment from recent customer messages.
   * Only looks at the last 3 customer messages for current mood.
   * @param {Array} messages - Array of message objects
   * @returns {string} 'positive', 'neutral', or 'negative'
   */
  async analyzeSentiment(messages) {
    if (!messages || messages.length === 0) {
      return 'neutral';
    }

    const customerMessages = messages
      .filter((m) => m.senderType === 'customer')
      .slice(-3);

    if (customerMessages.length === 0) return 'neutral';

    const formattedMessages = customerMessages.map((m) => m.content).join('\n');

    const prompt = `Analyze the sentiment of the following customer support messages. Classify the overall sentiment as exactly one of: positive, neutral, negative.\n\nRespond with ONLY one word.\n\nMessages:\n${formattedMessages}`;

    try {
      const sentiment = (await this._callMistral(prompt, 10)).toLowerCase();
      if (['positive', 'neutral', 'negative'].includes(sentiment)) {
        return sentiment;
      }
      // Fallback: try to extract from response if AI adds extra text
      if (sentiment.includes('negative')) return 'negative';
      if (sentiment.includes('positive')) return 'positive';
      return 'neutral';
    } catch (error) {
      console.error('AI Sentiment Analysis Error:', error.message);
      return 'neutral'; // Graceful degradation — don't fail the request
    }
  }

  /**
   * Categorize a ticket into a support category based on conversation content.
   * Returns { category, confidence } where confidence is 0-1.
   * @param {Array} messages - Array of message objects
   * @param {string} title - Ticket title
   * @returns {{ category: string, confidence: number }}
   */
  async categorizeTicket(messages, title = '') {
    const context = title ? `Ticket Title: ${title}\n` : '';
    const conversation = messages.length > 0
      ? messages.map((m) => `${m.senderType.toUpperCase()}: ${m.content}`).join('\n')
      : 'No messages yet.';

    const prompt = `You are a support ticket classifier. Classify the following support ticket into exactly ONE of these categories: billing, technical, account, shipping, general, other.

Also provide a confidence score from 0.0 to 1.0 indicating how certain you are.

Respond in EXACTLY this format (nothing else):
CATEGORY: <category>
CONFIDENCE: <score>

${context}Conversation:
${conversation}`;

    try {
      const result = await this._callMistral(prompt, 50);
      const categoryMatch = result.match(/CATEGORY:\s*(\w+)/i);
      const confidenceMatch = result.match(/CONFIDENCE:\s*([\d.]+)/i);

      const validCategories = ['billing', 'technical', 'account', 'shipping', 'general', 'other'];
      const category = categoryMatch && validCategories.includes(categoryMatch[1].toLowerCase())
        ? categoryMatch[1].toLowerCase()
        : 'general';

      const confidence = confidenceMatch
        ? Math.min(1, Math.max(0, parseFloat(confidenceMatch[1])))
        : 0.5;

      return { category, confidence };
    } catch (error) {
      console.error('AI Categorization Error:', error.message);
      return { category: 'general', confidence: 0 };
    }
  }

  /**
   * Find tickets similar to the current one by comparing titles and context.
   * Uses AI to rank similarity from a pool of recent tickets.
   * @param {object} currentTicket - The ticket to find similar ones for
   * @param {Array} recentTickets - Pool of recent tickets to compare against
   * @returns {Array<{ ticketId: string, title: string, similarity: string }>}
   */
  async findSimilarTickets(currentTicket, recentTickets) {
    if (!recentTickets || recentTickets.length === 0) {
      return [];
    }

    const ticketList = recentTickets
      .slice(0, 20) // Limit context window
      .map((t, i) => `${i + 1}. [ID: ${t._id}] "${t.title}" (Category: ${t.category}, Status: ${t.status})`)
      .join('\n');

    const prompt = `You are a support ticket analyst. Given the current ticket and a list of other tickets, identify up to 3 tickets from the list that are most similar in terms of the issue described.

Current Ticket: "${currentTicket.title}" (Category: ${currentTicket.category})

Other Tickets:
${ticketList}

Respond in EXACTLY this format for each similar ticket (one per line, max 3):
SIMILAR: <number from list> | <reason in 10 words or less>

If no tickets are similar, respond with: NONE`;

    try {
      const result = await this._callMistral(prompt, 200);

      if (result.includes('NONE')) return [];

      const matches = result.matchAll(/SIMILAR:\s*(\d+)\s*\|\s*(.+)/gi);
      const similar = [];

      for (const match of matches) {
        const idx = parseInt(match[1], 10) - 1;
        if (idx >= 0 && idx < recentTickets.length) {
          similar.push({
            ticketId: recentTickets[idx]._id,
            title: recentTickets[idx].title,
            status: recentTickets[idx].status,
            similarity: match[2].trim(),
          });
        }
      }

      return similar.slice(0, 3);
    } catch (error) {
      console.error('AI Similar Tickets Error:', error.message);
      return [];
    }
  }

  /**
   * Analyze whether a ticket should be escalated based on sentiment,
   * priority, message count, and conversation content.
   * @param {object} ticket - The ticket object
   * @param {Array} messages - Array of message objects
   * @returns {{ shouldEscalate: boolean, reason: string, urgency: string }}
   */
  async recommendEscalation(ticket, messages) {
    const formattedMessages = messages
      .slice(-5) // Only last 5 messages for recency
      .map((m) => `${m.senderType.toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `You are a customer support escalation advisor. Analyze the following ticket and decide if it should be escalated to a senior agent or manager.

Ticket Title: "${ticket.title}"
Current Status: ${ticket.status}
Priority: ${ticket.priority}
Sentiment: ${ticket.sentiment || 'unknown'}
Message Count: ${messages.length}
Category: ${ticket.category || 'general'}

Recent Conversation:
${formattedMessages}

Consider escalation if:
- Customer is frustrated or angry
- Issue has been unresolved for many messages
- Issue involves financial loss, security, or data concerns
- Priority is high/urgent with negative sentiment

Respond in EXACTLY this format:
ESCALATE: YES or NO
URGENCY: low, medium, or high
REASON: <one sentence explanation>`;

    try {
      const result = await this._callMistral(prompt, 100);

      const escalateMatch = result.match(/ESCALATE:\s*(YES|NO)/i);
      const urgencyMatch = result.match(/URGENCY:\s*(low|medium|high)/i);
      const reasonMatch = result.match(/REASON:\s*(.+)/i);

      return {
        shouldEscalate: escalateMatch ? escalateMatch[1].toUpperCase() === 'YES' : false,
        urgency: urgencyMatch ? urgencyMatch[1].toLowerCase() : 'low',
        reason: reasonMatch ? reasonMatch[1].trim() : 'Unable to determine escalation need.',
      };
    } catch (error) {
      console.error('AI Escalation Error:', error.message);
      return {
        shouldEscalate: false,
        urgency: 'low',
        reason: 'AI analysis unavailable. Manual review recommended.',
      };
    }
  }
}

export default new AiService();
