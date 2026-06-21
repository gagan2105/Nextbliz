const INTENT_KEYWORDS = {
  schedule_meeting: ['meeting', 'schedule', 'call', 'demo', 'appointment', 'calendar'],
  invoice_request: ['invoice', 'billing', 'payment', 'bill', 'receipt', 'charge'],
  support_request: ['help', 'issue', 'problem', 'broken', 'error', 'support', 'urgent fix'],
  sales_opportunity: ['pricing', 'quote', 'proposal', 'purchase', 'buy', 'interested', 'upgrade'],
};

const POSITIVE = ['thank', 'great', 'excellent', 'happy', 'pleased', 'appreciate', 'love'];
const NEGATIVE = ['angry', 'frustrated', 'disappointed', 'terrible', 'unacceptable', 'complaint', 'refund'];

export function analyzeEmail({ subject, body }) {
  const text = `${subject} ${body}`.toLowerCase();

  let intent = 'general_inquiry';
  let maxScore = 0;
  for (const [category, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const score = keywords.filter((k) => text.includes(k)).length;
    if (score > maxScore) {
      maxScore = score;
      intent = category;
    }
  }

  let sentiment = 'neutral';
  const posCount = POSITIVE.filter((w) => text.includes(w)).length;
  const negCount = NEGATIVE.filter((w) => text.includes(w)).length;
  if (posCount > negCount) sentiment = 'positive';
  else if (negCount > posCount) sentiment = 'negative';

  let urgency = 'low';
  if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) urgency = 'high';
  else if (text.includes('soon') || text.includes('priority') || intent === 'support_request') urgency = 'medium';

  const confidence = maxScore > 0 ? Math.min(0.95, 0.5 + maxScore * 0.15) : 0.4;

  const recommendations = buildRecommendations(intent, sentiment, urgency);
  const autoResponse = buildAutoResponse(intent, subject);

  return { sentiment, intent, urgency, confidence, autoResponse, recommendations };
}

function buildRecommendations(intent, sentiment, urgency) {
  const recs = [];
  if (urgency === 'high') recs.push('Respond within 1 hour');
  if (sentiment === 'negative') recs.push('Escalate to manager for relationship recovery');
  const intentRecs = {
    schedule_meeting: ['Propose 2-3 meeting slots', 'Send calendar invite'],
    invoice_request: ['Verify billing details', 'Generate draft invoice'],
    support_request: ['Create support ticket', 'Assign to technical team'],
    sales_opportunity: ['Prepare pricing proposal', 'Schedule discovery call'],
    general_inquiry: ['Provide FAQ resources', 'Follow up within 24 hours'],
  };
  recs.push(...(intentRecs[intent] || []));
  return recs;
}

function buildAutoResponse(intent, subject) {
  const responses = {
    schedule_meeting: `Thank you for reaching out regarding "${subject}". We'd be happy to schedule a meeting. Our team will send available time slots shortly.`,
    invoice_request: `Thank you for your invoice inquiry about "${subject}". We are preparing the billing details and will send the invoice shortly.`,
    support_request: `We received your support request regarding "${subject}". Our team is investigating and will update you promptly.`,
    sales_opportunity: `Thank you for your interest in "${subject}". A member of our sales team will follow up with pricing and next steps.`,
    general_inquiry: `Thank you for contacting us about "${subject}". We have received your message and will respond shortly.`,
  };
  return responses[intent] || responses.general_inquiry;
}
