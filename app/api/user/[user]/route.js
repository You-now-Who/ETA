import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    // Get user ID from params
    const { user } = params;
    
    if (!user) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get Management API credentials
    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_M2M_CLIENT_ID;
    const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

    console.log('Domain:', domain);
    console.log('Client ID exists:', !!clientId);
    console.log('Client Secret exists:', !!clientSecret);

    if (!domain || !clientId || !clientSecret) {
      console.error('Missing Auth0 Management API credentials');
      return NextResponse.json({ error: 'Management API credentials not configured' }, { status: 500 });
    }

    const requestBody = {
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: 'client_credentials',
      scope: 'read:users'
    };

    console.log('Token request body:', { ...requestBody, client_secret: '[REDACTED]' });

    // Get Management API access token
    const tokenResponse = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token response error:', errorData);
      throw new Error('Failed to get Management API token');
    }

    const tokenData = await tokenResponse.json();
    const managementToken = tokenData.access_token;

    // Fetch user with metadata
    const userResponse = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(user)}`, {
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('User fetch error:', errorData);
      throw new Error(`Failed to fetch user: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user metadata:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user metadata',
      details: error.message 
    }, { status: 500 });
  }
}
