const limitMap = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const userData = limitMap.get(ip);

  if (!userData) {
    limitMap.set(ip, { count: 1, lastReset: now });
    return { success: true };
  }

  if (now - userData.lastReset > windowMs) {
    // Reset window
    limitMap.set(ip, { count: 1, lastReset: now });
    return { success: true };
  }

  if (userData.count >= limit) {
    return { success: false };
  }

  userData.count += 1;
  return { success: true };
}

// Bersihkan memory yang usang secara berkala (memory leak protection)
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of limitMap.entries()) {
    if (now - data.lastReset > 60000) { // Hapus jika sudah lebih dari 1 menit
      limitMap.delete(ip);
    }
  }
}, 60000 * 5); // Clean up setiap 5 menit
