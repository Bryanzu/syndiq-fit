import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const filePath = path.resolve('public', 'videos', 'syndiq-fit-demo.webm');
  if (!fs.existsSync(filePath)) {
    return new NextResponse('Video not found', { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'video/webm',
      'Content-Length': stat.size.toString(),
      'Content-Disposition': 'inline; filename="syndiq-fit-demo.webm"',
      'Accept-Ranges': 'bytes',
    },
  });
}
