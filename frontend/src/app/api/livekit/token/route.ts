import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const room = searchParams.get('room') || 'knowtrace-tutor';
    const username = searchParams.get('username') || `student_${Math.floor(Math.random() * 1000)}`;

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    // If livekit cloud credentials are not supplied, return simulation flag
    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({
        simulated: true,
        serverUrl: 'wss://demo.livekit.cloud',
        token: 'simulated_dev_token',
        message: 'LiveKit server credentials not configured. Running in client simulation & local speech mode.',
      });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      name: username,
    });

    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      simulated: false,
      serverUrl: wsUrl,
      token,
      room,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to mint LiveKit token', details: errMessage },
      { status: 500 }
    );
  }
}
