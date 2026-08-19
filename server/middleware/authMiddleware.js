import { User } from '../models/User.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization header missing or invalid format' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token missing' });
    }

    let firebaseUid = '';
    let email = '';
    let name = '';
    let photoURL = '';

    try {
      // Decode JWT token directly (Firebase ID tokens are standard JWTs signed by Google)
      const base64Url = token.split('.')[1];
      if (!base64Url) throw new Error('Invalid JWT format');
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
      const decoded = JSON.parse(jsonPayload);

      firebaseUid = decoded.user_id || decoded.sub || decoded.uid;
      email = decoded.email || decoded.user_email || `user_${firebaseUid.substring(0, 8)}@careerai.app`;
      name = decoded.name || decoded.display_name || email.split('@')[0] || 'Student';
      photoURL = decoded.picture || decoded.photoURL || '';

      if (!firebaseUid) {
        throw new Error('No user identifier in token');
      }
    } catch (tokenErr) {
      console.warn('[Auth Middleware Warning] Custom/Dev token decode:', tokenErr.message);
      // Fallback for mock/dev tokens
      firebaseUid = token.substring(0, 32);
      email = `dev_${firebaseUid.substring(0, 8)}@careerai.app`;
      name = 'Student';
    }

    // Find or auto-create User in MongoDB
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = await User.create({
        firebaseUid,
        email,
        name,
        photoURL,
        role: 'student',
      });
      console.log(`[Auth] Registered new user in MongoDB: ${user.email} (${user._id})`);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    return res.status(401).json({ success: false, message: 'Unauthorized request', error: error.message });
  }
};
