import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import { leaderboardService } from '../../../../../lib/services';

// GET /api/leaderboard/stats
export async function GET(request) {
  try {
    await connectDB();

    const stats = await leaderboardService.getLeaderboardStats();

    return NextResponse.json({
      success: true,
      message: 'Leaderboard statistics retrieved successfully',
      data: stats
    }, { status: 200 });

  } catch (error) {
    console.error('Leaderboard stats error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve leaderboard statistics',
      error: error.message
    }, { status: 500 });
  }
}
