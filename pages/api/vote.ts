import type { NextApiRequest, NextApiResponse } from 'next';
import type { VoteApiResponse, VoteType } from '@/types';
import { supabaseHelpers } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse<VoteApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed', new_vote_count: { good: 0, bad: 0 } });
  }

  try {
    const { tradeup_id, vote_type, user_id } = req.body;

    if (!tradeup_id || !vote_type) {
      return res.status(400).json({ success: false, error: 'Missing required fields: tradeup_id and vote_type', new_vote_count: { good: 0, bad: 0 } });
    }
    if (vote_type !== 'good' && vote_type !== 'bad') {
      return res.status(400).json({ success: false, error: 'vote_type must be "good" or "bad"', new_vote_count: { good: 0, bad: 0 } });
    }

    const effectiveUserId = user_id || generateUserIdFromIp(req);
    const vote = await supabaseHelpers.createVote({ tradeup_id, user_id: effectiveUserId, vote_type: vote_type as VoteType });
    const voteCounts = await supabaseHelpers.getVoteCounts(tradeup_id);

    res.status(200).json({ success: true, data: vote, new_vote_count: voteCounts, message: 'Vote recorded successfully' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    const isDupe = msg.includes('duplicate') || msg.includes('unique');
    res.status(isDupe ? 409 : 500).json({ success: false, error: isDupe ? 'Already voted on this trade-up' : 'Internal server error', message: msg, new_vote_count: { good: 0, bad: 0 } });
  }
}

function generateUserIdFromIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress || 'unknown';
  let hash = 0;
  for (let i = 0; i < ip.length; i++) { hash = ((hash << 5) - hash) + ip.charCodeAt(i); hash = hash & hash; }
  return `anon_${Math.abs(hash)}`;
}
