import { NextResponse } from 'next/server';

const liveVideoUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

const programNames = {
  MUSIC_ONLY: 'Ambient Sessions',
  PROGRAM_LIVE: 'Cinematic Live',
  COMMERCIAL_BREAK: 'Intermission Sequence'
} as const;

type Mode = keyof typeof programNames;

export async function GET() {
  const now = new Date();
  const cycle = now.getMinutes() % 12;
  let mode: Mode;

  if (cycle < 6) {
    mode = 'MUSIC_ONLY';
  } else if (cycle < 10) {
    mode = 'PROGRAM_LIVE';
  } else {
    mode = 'COMMERCIAL_BREAK';
  }

  const segmentStart = new Date(now);
  const segmentOffset = mode === 'MUSIC_ONLY' ? cycle : mode === 'PROGRAM_LIVE' ? cycle - 6 : cycle - 10;
  segmentStart.setMinutes(now.getMinutes() - segmentOffset);
  segmentStart.setSeconds(0, 0);

  return NextResponse.json({
    mode,
    video_url: mode === 'PROGRAM_LIVE' ? liveVideoUrl : undefined,
    program_name: programNames[mode],
    started_at: segmentStart.toISOString()
  });
}
