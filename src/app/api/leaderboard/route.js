import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import { leaderboardService } from '../../../../lib/services';

// GET /api/leaderboard
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const category = searchParams.get('category') || '';
    const stage = searchParams.get('stage') || '';
    const timeRange = searchParams.get('timeRange') || 'all';

    const options = {
      page,
      limit,
      category,
      stage,
      timeRange
    };

    const result = await leaderboardService.getLeaderboard(options);

    return NextResponse.json({
      success: true,
      message: 'Leaderboard retrieved successfully',
      data: result.leaderboard,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        pages: result.pagination.pages,
        hasNext: result.pagination.page < result.pagination.pages,
        hasPrev: result.pagination.page > 1
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Leaderboard retrieval error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve leaderboard',
      error: error.message
    }, { status: 500 });
  }
}
