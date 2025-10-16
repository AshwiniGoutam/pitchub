import { summarizeEmail } from '../../../lib/gemini';

export async function POST(request) {
  try {
    const { emailContent } = await request.json();

    if (!emailContent) {
      return Response.json({ error: 'Email content is required' }, { status: 400 });
    }

    const summary = await summarizeEmail(emailContent);
    
    return Response.json(summary);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ 
      error: 'Failed to process email',
      details: error.message 
    }, { status: 500 });
  }
}