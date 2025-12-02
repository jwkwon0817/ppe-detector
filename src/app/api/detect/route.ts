import { spawn } from 'child_process';
import { unlink, writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { tmpdir } from 'os';
import { join } from 'path';

// 동시 요청 제한을 위한 큐 관리
const requestQueue: Array<() => void> = [];
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 2; // 최대 동시 요청 수

async function processRequest(
  pythonCmd: string,
  pythonScript: string,
  modelPath: string,
  tempFilePath: string
): Promise<NextResponse> {
  return new Promise((resolve) => {
    const python = spawn(pythonCmd, [
      pythonScript,
      '--model', modelPath,
      '--image', tempFilePath,
    ]);

    let result = '';
    let error = '';

    python.stdout.on('data', (data) => {
      result += data.toString();
    });

    python.stderr.on('data', (data) => {
      error += data.toString();
    });

    python.on('close', async (code) => {
      activeRequests--;
      
      try {
        await unlink(tempFilePath);
      } catch {
        // 파일 삭제 실패는 무시
      }

      // 큐에 대기 중인 요청 처리
      if (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
        const nextRequest = requestQueue.shift();
        if (nextRequest) {
          activeRequests++;
          nextRequest();
        }
      }

      if (code !== 0) {
        console.error('[API] Python script failed with code:', code);
        console.error('[API] Error output:', error);
        resolve(
          NextResponse.json(
            { error: `Detection failed`, details: error },
            { status: 500 }
          )
        );
        return;
      }

      try {
        const detectionResult = JSON.parse(result);
        resolve(NextResponse.json(detectionResult));
      } catch {
        resolve(
          NextResponse.json(
            { error: `Failed to parse result: ${result}` },
            { status: 500 }
          )
        );
      }
    });

    python.on('error', async (err) => {
      activeRequests--;
      
      console.error('[API] Failed to spawn Python process:', err);
      
      try {
        await unlink(tempFilePath);
      } catch {
        // 파일 삭제 실패는 무시
      }

      // 큐에 대기 중인 요청 처리
      if (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
        const nextRequest = requestQueue.shift();
        if (nextRequest) {
          activeRequests++;
          nextRequest();
        }
      }

      resolve(
        NextResponse.json(
          { error: `Failed to start detection process: ${err.message}` },
          { status: 500 }
        )
      );
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempFilePath = join(tmpdir(), `detect-${Date.now()}.jpg`);
    
    await writeFile(tempFilePath, buffer);

    const pythonScript = join(process.cwd(), 'scripts', 'detect.py');
    const modelPath = join(process.cwd(), 'public', 'last.pt');
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

    // 동시 요청 수 제한
    if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
      return new Promise((resolve) => {
        requestQueue.push(() => {
          processRequest(pythonCmd, pythonScript, modelPath, tempFilePath)
            .then(resolve);
        });
      });
    }

    activeRequests++;
    return processRequest(pythonCmd, pythonScript, modelPath, tempFilePath);
  } catch (error) {
    console.error('[API] Server error:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

