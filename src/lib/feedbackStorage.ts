import fs from 'fs';
import path from 'path';

export type FeedbackCategory = 'suggestion' | 'bug' | 'experience' | 'other';

export interface FeedbackItem {
  id: string;
  username: string;
  category: FeedbackCategory;
  message: string;
  createdAt: string;
  reviewed: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');

async function ensureFileExists(): Promise<void> {
  try {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.promises.access(FEEDBACK_FILE, fs.constants.F_OK);
    } catch {
      await fs.promises.writeFile(FEEDBACK_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error ensuring feedback file exists:', err);
  }
}

export async function getFeedbackList(): Promise<FeedbackItem[]> {
  await ensureFileExists();
  try {
    const raw = await fs.promises.readFile(FEEDBACK_FILE, 'utf-8');
    const list: FeedbackItem[] = JSON.parse(raw || '[]');
    // Return newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Failed to read feedback list:', err);
    return [];
  }
}

export async function addFeedbackItem(data: {
  username: string;
  category: FeedbackCategory;
  message: string;
}): Promise<FeedbackItem> {
  await ensureFileExists();
  const current = await getFeedbackList();

  const newItem: FeedbackItem = {
    id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    username: data.username.trim(),
    category: data.category,
    message: data.message.trim(),
    createdAt: new Date().toISOString(),
    reviewed: false,
  };

  const updated = [newItem, ...current];
  const tempPath = `${FEEDBACK_FILE}.tmp.${Date.now()}`;
  await fs.promises.writeFile(tempPath, JSON.stringify(updated, null, 2), 'utf-8');
  await fs.promises.rename(tempPath, FEEDBACK_FILE);

  return newItem;
}

export async function toggleFeedbackReviewed(id: string, reviewed: boolean): Promise<FeedbackItem | null> {
  await ensureFileExists();
  const current = await getFeedbackList();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return null;

  current[index].reviewed = reviewed;

  const tempPath = `${FEEDBACK_FILE}.tmp.${Date.now()}`;
  await fs.promises.writeFile(tempPath, JSON.stringify(current, null, 2), 'utf-8');
  await fs.promises.rename(tempPath, FEEDBACK_FILE);

  return current[index];
}

export async function deleteFeedbackItem(id: string): Promise<boolean> {
  await ensureFileExists();
  const current = await getFeedbackList();
  const filtered = current.filter((item) => item.id !== id);
  if (filtered.length === current.length) return false;

  const tempPath = `${FEEDBACK_FILE}.tmp.${Date.now()}`;
  await fs.promises.writeFile(tempPath, JSON.stringify(filtered, null, 2), 'utf-8');
  await fs.promises.rename(tempPath, FEEDBACK_FILE);

  return true;
}
