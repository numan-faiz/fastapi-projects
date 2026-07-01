import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
const BACKEND_DIR = path.join(process.cwd(), 'mini-services', 'backend');

let lastStartAttempt = 0;

async function ensureBackend(maxWait = 20000): Promise<boolean> {
  // Check if backend is already responding
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${BACKEND_URL}/docs`, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) return true;
  } catch {
    // not healthy
  }

  // Don't spam restarts
  const now = Date.now();
  if (now - lastStartAttempt < 10000) {
    // Just wait for the existing startup
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000));
      try {
        const res = await fetch(`${BACKEND_URL}/docs`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) return true;
      } catch { /* still not ready */ }
    }
    return false;
  }
  lastStartAttempt = now;

  // Start the backend in the project backend folder.
  try {
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    const child = spawn(
      pythonCommand,
      ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'],
      {
        cwd: BACKEND_DIR,
        detached: true,
        stdio: 'ignore',
        env: { ...process.env, PYTHONPATH: BACKEND_DIR },
      }
    );
    child.unref();
  } catch { /* ignore */ }

  // Wait for backend to come up
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await new Promise(r => setTimeout(r, 800));
    try {
      const res = await fetch(`${BACKEND_URL}/docs`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return true;
    } catch { /* not ready yet */ }
  }

  return false;
}

async function proxyHandler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const healthy = await ensureBackend();
  if (!healthy) {
    return NextResponse.json(
      { detail: 'Backend server is starting up. Please try again in a moment.' },
      { status: 502 }
    );
  }

  const { path } = await context.params;
  const backendPath = path.join('/');
  const searchParams = req.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_URL}/${backendPath}${searchParams ? '?' + searchParams : ''}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await req.text();
    }
  }

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const contentType = res.headers.get('content-type') || '';

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const responseText = await res.text();

    return new NextResponse(responseText, {
      status: res.status,
      headers: {
        'Content-Type': contentType || 'application/json',
      },
    });
  } catch (error) {
    console.error(`Proxy error for ${targetUrl}:`, error);
    // Force a fresh start attempt on next request
    lastStartAttempt = 0;
    return NextResponse.json(
      { detail: 'Backend connection lost. Please try again.' },
      { status: 502 }
    );
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;
