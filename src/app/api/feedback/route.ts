import { NextRequest, NextResponse } from 'next/server';
import {
  getFeedbackList,
  addFeedbackItem,
  toggleFeedbackReviewed,
  deleteFeedbackItem,
  FeedbackCategory,
} from '@/lib/feedbackStorage';

// Admin key: from environment variable or secure default for development
const ADMIN_KEY = process.env.ADMIN_FEEDBACK_KEY || 'syndiq-admin-2026';

// In-memory rate limiting map (IP -> timestamps)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 6;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

function sanitizeText(str: string): string {
  return str
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .trim();
}

function verifyAdminKey(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const xAdminKey = req.headers.get('x-admin-key');
  const urlKey = req.nextUrl.searchParams.get('key');

  if (xAdminKey && xAdminKey === ADMIN_KEY) return true;
  if (urlKey && urlKey === ADMIN_KEY) return true;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token === ADMIN_KEY) return true;
  }

  return false;
}

// POST: Public submission endpoint for testers
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous-tester';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a few minutes before submitting another comment.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
    }

    const rawUsername = typeof body.username === 'string' ? body.username.trim() : '';
    const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';
    const rawCategory = typeof body.category === 'string' ? body.category.toLowerCase() : 'other';

    // Validation
    if (!rawUsername) {
      return NextResponse.json({ error: 'Username or nickname is required.' }, { status: 400 });
    }
    if (rawUsername.length > 50) {
      return NextResponse.json({ error: 'Username must be 50 characters or less.' }, { status: 400 });
    }

    if (!rawMessage) {
      return NextResponse.json({ error: 'Feedback message cannot be empty.' }, { status: 400 });
    }
    if (rawMessage.length < 5) {
      return NextResponse.json(
        { error: 'Feedback message must be at least 5 characters long.' },
        { status: 400 }
      );
    }
    if (rawMessage.length > 1200) {
      return NextResponse.json(
        { error: 'Feedback message must not exceed 1200 characters.' },
        { status: 400 }
      );
    }

    const validCategories: FeedbackCategory[] = ['suggestion', 'bug', 'experience', 'other'];
    const category: FeedbackCategory = validCategories.includes(rawCategory as FeedbackCategory)
      ? (rawCategory as FeedbackCategory)
      : 'other';

    const sanitizedUsername = sanitizeText(rawUsername);
    const sanitizedMessage = sanitizeText(rawMessage);

    const saved = await addFeedbackItem({
      username: sanitizedUsername,
      category,
      message: sanitizedMessage,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your feedback has been recorded.',
      item: {
        id: saved.id,
        createdAt: saved.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Error in POST /api/feedback:', err);
    return NextResponse.json({ error: 'Failed to save feedback. Please try again.' }, { status: 500 });
  }
}

// GET: Admin-only retrieval
export async function GET(req: NextRequest) {
  if (!verifyAdminKey(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Valid administrator key is required to review feedback.' },
      { status: 401 }
    );
  }

  try {
    const list = await getFeedbackList();
    return NextResponse.json({
      success: true,
      feedback: list,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to retrieve feedback list.' }, { status: 500 });
  }
}

// PATCH: Admin-only review toggle
export async function PATCH(req: NextRequest) {
  if (!verifyAdminKey(req)) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.id !== 'string' || typeof body.reviewed !== 'boolean') {
      return NextResponse.json({ error: 'Invalid update payload. "id" and "reviewed" are required.' }, { status: 400 });
    }

    const updated = await toggleFeedbackReviewed(body.id, body.reviewed);
    if (!updated) {
      return NextResponse.json({ error: 'Feedback entry not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update feedback status.' }, { status: 500 });
  }
}

// DELETE: Admin-only removal of spam/inappropriate entries
export async function DELETE(req: NextRequest) {
  if (!verifyAdminKey(req)) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const urlId = req.nextUrl.searchParams.get('id');
    const body = await req.json().catch(() => null);
    const targetId = urlId || body?.id;

    if (!targetId || typeof targetId !== 'string') {
      return NextResponse.json({ error: 'Target feedback ID is required.' }, { status: 400 });
    }

    const deleted = await deleteFeedbackItem(targetId);
    if (!deleted) {
      return NextResponse.json({ error: 'Feedback entry not found or already deleted.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Feedback deleted successfully.' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete feedback entry.' }, { status: 500 });
  }
}
