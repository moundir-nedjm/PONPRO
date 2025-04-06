import { corsHeaders } from './utils';

// Verify JWT token middleware
export async function verifyJWT(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized - No valid token provided' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    // Basic validation
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) {
      throw new Error('Invalid token format');
    }
    
    // Decode payload
    const payload = JSON.parse(atob(encodedPayload));
    
    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    
    // Verify signature
    const isValid = await verifySignature(
      `${encodedHeader}.${encodedPayload}`,
      signature
    );
    
    if (!isValid) {
      throw new Error('Invalid signature');
    }
    
    return { isValid: true, payload };
  } catch (error) {
    return new Response(JSON.stringify({ error: `Authentication failed: ${error.message}` }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Role-based access control middleware
export async function requireRole(request, allowedRoles) {
  const authResult = await verifyJWT(request);
  
  if (authResult instanceof Response) {
    return authResult; // Return the error response from verifyJWT
  }
  
  const { payload } = authResult;
  
  if (!allowedRoles.includes(payload.role)) {
    return new Response(JSON.stringify({ 
      error: 'Forbidden - Insufficient permissions',
      requiredRoles: allowedRoles,
      userRole: payload.role 
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Authentication and authorization successful
  return { isAuthorized: true, user: payload };
}

// Convenience middlewares for specific roles
export async function requireAdmin(request) {
  return requireRole(request, ['admin']);
}

export async function requireManager(request) {
  return requireRole(request, ['admin', 'manager']);
}

export async function requireEmployee(request) {
  return requireRole(request, ['admin', 'manager', 'employee']);
}

// Create JWT token with proper expiration
export async function createJWT(payload, expiresInSeconds = 86400) {
  // Add standard JWT fields
  const enhancedPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    jti: crypto.randomUUID()
  };
  
  // Create JWT
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(enhancedPayload));
  
  const signature = await createSignature(`${encodedHeader}.${encodedPayload}`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Create signature for JWT
async function createSignature(data) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// Verify JWT signature
async function verifySignature(data, signature) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const signatureBytes = Uint8Array.from(
    atob(signature), 
    c => c.charCodeAt(0)
  );
  
  return crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    encoder.encode(data)
  );
}

// Token refresh handler
export async function refreshToken(request) {
  try {
    const authResult = await verifyJWT(request);
    
    if (authResult instanceof Response) {
      return authResult; // Return the error response
    }
    
    const { payload } = authResult;
    
    // Create a new token with the same user data but new expiration
    delete payload.exp;
    delete payload.iat;
    delete payload.jti;
    
    const newToken = await createJWT(payload);
    
    return new Response(JSON.stringify({ token: newToken }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
} 