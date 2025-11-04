import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {

    return NextResponse.json({
        message: 'Hello from API v1!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        status: 'success'
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        return NextResponse.json({
            message: 'Data received successfully',
            receivedData: body,
            timestamp: new Date().toISOString(),
            status: 'success'
        });
    } catch (error) {
        return NextResponse.json(
            { 
                error: 'Invalid JSON data',
                status: 'error'
            },
            { status: 400 }
        );
    }
}
