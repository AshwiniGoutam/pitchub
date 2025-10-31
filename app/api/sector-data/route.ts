import { NextResponse } from 'next/server';
import { fetchSectorData } from '@/app/dashboard/investor/actions';

export async function GET() {
  try {
    const sectorData = await fetchSectorData();
    return NextResponse.json(sectorData);
  } catch (error) {
    console.error('Error in sector-data API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sector data' },
      { status: 500 }
    );
  }
}