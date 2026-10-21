// User identity helpers for resolving user IDs to names in admin tables

const KNOWN_USER_FALLBACKS = {
  '6ad452abf063963033102fcc': {
    username: 'Arjun Mehta',
    email: 'arjun.mehta@tradex.com',
    usertype: 'trader',
  },
  '6ad455b64a385e254a7da6a0': {
    username: 'Priya Sharma',
    email: 'priya.sharma@tradex.com',
    usertype: 'trader',
  },
  '6ad458ef7aa800c0a9aa2e1b': {
    username: 'Vikram Malhotra',
    email: 'vikram.malhotra@tradex.com',
    usertype: 'trader',
  },
  '6ad4f997b036ead9abf1da38': {
    username: 'Demo Trader',
    email: 'demo@tradex.com',
    usertype: 'customer',
  },
  '6ad4f997b036ead9abf1da39': {
    username: 'Administrator',
    email: 'admin@tradex.com',
    usertype: 'admin',
  },
  '6ad50488b036ead9abf1da41': {
    username: 'rahu',
    email: 'abc@gmail.com',
    usertype: 'customer',
  },
  '6ad8c24cc6f461c0a7a1f849': {
    username: 'Trader',
    email: 'trader@tradex.com',
    usertype: 'customer',
  },
  'usr_cust_101': {
    username: 'Trader',
    email: 'trader@tradex.com',
    usertype: 'customer',
  },
  'usr_admin_001': {
    username: 'Administrator',
    email: 'admin@tradex.com',
    usertype: 'admin',
  },
};

let userCache = { ...KNOWN_USER_FALLBACKS };
let cachePromise = null;

// Fetch and populate user cache from /fetch-users
export const fetchUserRegistry = async (axiosInstance, forceReload = false) => {
  if (cachePromise && !forceReload) {
    return cachePromise;
  }

  cachePromise = (async () => {
    try {
      const res = await axiosInstance.get('/fetch-users');
      if (Array.isArray(res.data)) {
        res.data.forEach((u) => {
          const id = String(u._id || u.id);
          userCache[id] = {
            id,
            username: u.username || 'Trader',
            email: u.email || '',
            usertype: u.usertype || 'customer',
            balance: Number(u.balance || 0),
          };
        });
      }
    } catch (err) {
      console.warn('User registry fetch fallback to known dictionary:', err?.message);
    }
    return userCache;
  })();

  return cachePromise;
};

// Resolve user ID to display name and role
export const resolveUserIdentity = (userId, customMap = null) => {
  if (!userId) {
    return {
      id: '',
      username: 'Unassigned',
      email: '',
      initial: 'U',
      role: 'customer',
      isAdmin: false,
    };
  }

  const cleanId = String(userId).trim();
  const map = customMap || userCache;
  const match = map[cleanId] || KNOWN_USER_FALLBACKS[cleanId];

  if (match) {
    const username = match.username || 'Trader';
    const initial = username.charAt(0).toUpperCase();
    const role = (match.usertype || match.role || 'customer').toLowerCase();
    const isAdmin = role === 'admin';

    return {
      id: cleanId,
      username,
      email: match.email || '',
      initial: initial || 'T',
      role,
      isAdmin,
    };
  }

  // Fallback for untracked IDs: check if it's already an email or name
  if (cleanId.includes('@')) {
    const inferred = cleanId.split('@')[0];
    return {
      id: cleanId,
      username: inferred,
      email: cleanId,
      initial: inferred.charAt(0).toUpperCase(),
      role: 'customer',
      isAdmin: false,
    };
  }

  // Hex ObjectId fallback: shortened ID with clean formatting
  const shortId = cleanId.length > 8 ? `${cleanId.slice(0, 4)}...${cleanId.slice(-4)}` : cleanId;
  return {
    id: cleanId,
    username: `Trader (${shortId})`,
    email: '',
    initial: 'T',
    role: 'customer',
    isAdmin: false,
  };
};
