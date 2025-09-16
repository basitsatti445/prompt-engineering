import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import { authService } from '../../../../lib/services';
import { signinSchema } from '../../../../lib/dto/auth';

// POST /api/auth/signin
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate request body
    const { error, value } = signinSchema.validate(body);
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      }, { status: 400 });
    }

    // Authenticate user
    const result = await authService.signin(value);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: result
    }, { status: 200 });

  } catch (error) {
    console.error('Signin error:', error);
    
    if (error.message.includes('Invalid email or password')) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      message: 'Login failed',
      error: error.message
    }, { status: 500 });
  }
}
