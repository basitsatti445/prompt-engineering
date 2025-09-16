import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import { pitchService } from '../../../../../lib/services';

// GET /api/pitches/filters
export async function GET(request) {
  try {
    await connectDB();

    const filters = await pitchService.getPitchFilters();

    return NextResponse.json({
      success: true,
      message: 'Filters retrieved successfully',
      data: filters
    }, { status: 200 });

  } catch (error) {
    console.error('Filters retrieval error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve filters',
      error: error.message
    }, { status: 500 });
  }
}
