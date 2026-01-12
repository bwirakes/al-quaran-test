import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// Database connection string from environment
const DATABASE_URL = process.env.DATABASE_URL;

// Lazy-initialize the SQL connection to avoid build errors when DATABASE_URL is not set
let _sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _sql = neon(DATABASE_URL);
  }
  return _sql;
}

// Wrapper function that lazily initializes the connection
const sql: NeonQueryFunction<false, false> = ((
  strings: TemplateStringsArray,
  ...values: unknown[]
) => {
  return getSql()(strings, ...values);
}) as NeonQueryFunction<false, false>;

// Type-safe query helper
// The neon sql function returns rows directly as an array
export async function query<T>(
  queryText: string,
  params?: unknown[]
): Promise<T[]> {
  try {
    // Build a tagged template call dynamically
    // neon's sql function expects template literals, but we can use it with strings
    // by constructing the query with parameter placeholders
    if (!params || params.length === 0) {
      const result = await sql([queryText] as unknown as TemplateStringsArray);
      return result as T[];
    }
    
    // For parameterized queries, we need to construct the template properly
    // Split the query by $1, $2, etc. and create template parts
    const parts = queryText.split(/\$\d+/);
    const templateStrings = Object.assign(parts, { raw: parts }) as TemplateStringsArray;
    const result = await sql(templateStrings, ...params);
    return result as T[];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Transaction helper for multiple queries
export async function transaction<T>(
  queries: Array<{ text: string; params?: unknown[] }>
): Promise<T[][]> {
  const results: T[][] = [];
  
  try {
    await sql`BEGIN`;
    
    for (const q of queries) {
      const result = await query<T>(q.text, q.params);
      results.push(result);
    }
    
    await sql`COMMIT`;
    return results;
  } catch (error) {
    await sql`ROLLBACK`;
    console.error("Transaction error:", error);
    throw error;
  }
}

// Export the raw sql function for complex queries
export { sql };

// =====================
// USER QUERIES
// =====================

export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: Date;
  last_login: Date;
  total_xp: number;
  level: number;
}

export async function getUserById(userId: string): Promise<DbUser | null> {
  const users = await query<DbUser>(
    "SELECT * FROM users WHERE id = $1",
    [userId]
  );
  return users[0] || null;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const users = await query<DbUser>(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return users[0] || null;
}

export async function createUser(
  email: string,
  name?: string
): Promise<DbUser> {
  const users = await query<DbUser>(
    `INSERT INTO users (email, name) 
     VALUES ($1, $2) 
     RETURNING *`,
    [email, name || null]
  );
  
  // Initialize inventory for new user
  await query(
    `INSERT INTO user_inventory (user_id) VALUES ($1)`,
    [users[0].id]
  );
  
  // Initialize streaks for new user
  await query(
    `INSERT INTO user_streaks (user_id) VALUES ($1)`,
    [users[0].id]
  );
  
  return users[0];
}

export async function updateUserLogin(userId: string): Promise<void> {
  await query(
    "UPDATE users SET last_login = NOW() WHERE id = $1",
    [userId]
  );
}

export async function updateUserXP(
  userId: string,
  xpToAdd: number
): Promise<{ total_xp: number; level: number }> {
  const result = await query<{ total_xp: number; level: number }>(
    `UPDATE users 
     SET total_xp = total_xp + $2,
         level = FLOOR(SQRT(total_xp + $2) / 10) + 1
     WHERE id = $1
     RETURNING total_xp, level`,
    [userId, xpToAdd]
  );
  return result[0];
}

// =====================
// INVENTORY QUERIES
// =====================

export interface DbInventory {
  user_id: string;
  seeds: number;
  water: number;
  sunlight: number;
  special_items: Record<string, unknown>;
  updated_at: Date;
}

export async function getInventory(userId: string): Promise<DbInventory | null> {
  const inventory = await query<DbInventory>(
    "SELECT * FROM user_inventory WHERE user_id = $1",
    [userId]
  );
  return inventory[0] || null;
}

export async function updateInventory(
  userId: string,
  changes: { seeds?: number; water?: number; sunlight?: number }
): Promise<DbInventory> {
  const setClauses: string[] = ["updated_at = NOW()"];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (changes.seeds !== undefined) {
    setClauses.push(`seeds = seeds + $${paramIndex++}`);
    values.push(changes.seeds);
  }
  if (changes.water !== undefined) {
    setClauses.push(`water = water + $${paramIndex++}`);
    values.push(changes.water);
  }
  if (changes.sunlight !== undefined) {
    setClauses.push(`sunlight = sunlight + $${paramIndex++}`);
    values.push(changes.sunlight);
  }

  values.push(userId);

  const result = await query<DbInventory>(
    `UPDATE user_inventory 
     SET ${setClauses.join(", ")}
     WHERE user_id = $${paramIndex}
     RETURNING *`,
    values
  );
  return result[0];
}

// =====================
// STREAK QUERIES
// =====================

export interface DbStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  prayer_log: Record<string, Record<string, boolean>>;
  weekly_checkins: number;
  total_checkins: number;
  updated_at: Date;
}

export async function getStreak(userId: string): Promise<DbStreak | null> {
  const streaks = await query<DbStreak>(
    "SELECT * FROM user_streaks WHERE user_id = $1",
    [userId]
  );
  return streaks[0] || null;
}

export async function updateStreak(
  userId: string,
  today: string // YYYY-MM-DD format
): Promise<DbStreak> {
  // Get current streak data
  const current = await getStreak(userId);
  
  if (!current) {
    throw new Error("User streaks not found");
  }

  const lastActive = current.last_active_date;
  let newStreak = current.current_streak;
  
  // Calculate streak
  if (lastActive) {
    const lastDate = new Date(lastActive);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays === 1) {
      // Consecutive day
      newStreak += 1;
    } else if (diffDays > 1) {
      // Streak broken
      newStreak = 1;
    }
    // If diffDays === 0, same day, don't change streak
  } else {
    // First check-in
    newStreak = 1;
  }

  const longestStreak = Math.max(newStreak, current.longest_streak);

  const result = await query<DbStreak>(
    `UPDATE user_streaks 
     SET current_streak = $2,
         longest_streak = $3,
         last_active_date = $4,
         total_checkins = total_checkins + 1,
         updated_at = NOW()
     WHERE user_id = $1
     RETURNING *`,
    [userId, newStreak, longestStreak, today]
  );
  
  return result[0];
}

export async function updatePrayerLog(
  userId: string,
  date: string,
  prayer: string,
  completed: boolean
): Promise<DbStreak> {
  const result = await query<DbStreak>(
    `UPDATE user_streaks 
     SET prayer_log = jsonb_set(
       COALESCE(prayer_log, '{}'::jsonb),
       $2,
       $3::jsonb
     ),
     updated_at = NOW()
     WHERE user_id = $1
     RETURNING *`,
    [userId, `{${date},${prayer}}`, JSON.stringify(completed)]
  );
  return result[0];
}

// =====================
// ISLAND & NODE QUERIES
// =====================

export interface DbIsland {
  id: number;
  name_id: string;
  name_ar: string | null;
  name_en: string | null;
  description: string | null;
  theme: string;
  icon: string | null;
  order_index: number;
  color: string | null;
  unlock_requirement: Record<string, unknown> | null;
}

export interface DbNode {
  id: string;
  island_id: number;
  name: string;
  name_ar: string | null;
  type: string;
  content_refs: Record<string, unknown>;
  completion_criteria: Record<string, unknown>;
  description: string | null;
  xp_reward: number;
  seed_reward: number;
  order_index: number;
  estimated_minutes: number | null;
}

export async function getAllIslands(): Promise<DbIsland[]> {
  return query<DbIsland>(
    "SELECT * FROM islands ORDER BY order_index"
  );
}

export async function getIslandById(islandId: number): Promise<DbIsland | null> {
  const islands = await query<DbIsland>(
    "SELECT * FROM islands WHERE id = $1",
    [islandId]
  );
  return islands[0] || null;
}

export async function getNodesByIsland(islandId: number): Promise<DbNode[]> {
  return query<DbNode>(
    "SELECT * FROM nodes WHERE island_id = $1 ORDER BY order_index",
    [islandId]
  );
}

export async function getNodeById(nodeId: string): Promise<DbNode | null> {
  const nodes = await query<DbNode>(
    "SELECT * FROM nodes WHERE id = $1",
    [nodeId]
  );
  return nodes[0] || null;
}

export async function getNodePrerequisites(nodeId: string): Promise<string[]> {
  const prereqs = await query<{ prerequisite_id: string }>(
    "SELECT prerequisite_id FROM node_prerequisites WHERE node_id = $1",
    [nodeId]
  );
  return prereqs.map(p => p.prerequisite_id);
}

// =====================
// PROGRESS QUERIES
// =====================

export interface DbProgress {
  id: string;
  user_id: string;
  node_id: string;
  status: "locked" | "unlocked" | "in_progress" | "completed";
  progress_percent: number;
  verses_read: string[];
  started_at: Date | null;
  completed_at: Date | null;
  updated_at: Date;
}

export async function getUserProgress(
  userId: string,
  nodeId?: string
): Promise<DbProgress[]> {
  if (nodeId) {
    return query<DbProgress>(
      "SELECT * FROM user_progress WHERE user_id = $1 AND node_id = $2",
      [userId, nodeId]
    );
  }
  return query<DbProgress>(
    "SELECT * FROM user_progress WHERE user_id = $1",
    [userId]
  );
}

export async function upsertProgress(
  userId: string,
  nodeId: string,
  updates: Partial<Pick<DbProgress, "status" | "progress_percent" | "verses_read">>
): Promise<DbProgress> {
  const setClauses: string[] = ["updated_at = NOW()"];
  const insertCols = ["user_id", "node_id"];
  const insertVals = ["$1", "$2"];
  const values: unknown[] = [userId, nodeId];
  let paramIndex = 3;

  if (updates.status !== undefined) {
    insertCols.push("status");
    insertVals.push(`$${paramIndex}`);
    setClauses.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.progress_percent !== undefined) {
    insertCols.push("progress_percent");
    insertVals.push(`$${paramIndex}`);
    setClauses.push(`progress_percent = $${paramIndex++}`);
    values.push(updates.progress_percent);
  }
  if (updates.verses_read !== undefined) {
    insertCols.push("verses_read");
    insertVals.push(`$${paramIndex}`);
    setClauses.push(`verses_read = $${paramIndex++}`);
    values.push(JSON.stringify(updates.verses_read));
  }

  // Add timestamps for status changes
  if (updates.status === "in_progress") {
    setClauses.push("started_at = COALESCE(started_at, NOW())");
  }
  if (updates.status === "completed") {
    setClauses.push("completed_at = NOW()");
  }

  const result = await query<DbProgress>(
    `INSERT INTO user_progress (${insertCols.join(", ")})
     VALUES (${insertVals.join(", ")})
     ON CONFLICT (user_id, node_id)
     DO UPDATE SET ${setClauses.join(", ")}
     RETURNING *`,
    values
  );
  return result[0];
}

// =====================
// GARDEN QUERIES
// =====================

export interface DbPlantType {
  id: number;
  name: string;
  name_id: string;
  description: string | null;
  icon: string | null;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  seeds_required: number;
  water_to_sprout: number;
  water_to_bloom: number;
  sunlight_bonus: number;
  growth_time_hours: number;
  xp_on_harvest: number;
}

export interface DbGardenPlant {
  id: string;
  user_id: string;
  plant_type_id: number;
  grid_x: number;
  grid_y: number;
  state: "planted" | "sprouting" | "blooming" | "withered" | "harvested";
  water_received: number;
  sunlight_received: number;
  planted_at: Date;
  last_watered: Date;
  bloomed_at: Date | null;
  harvested_at: Date | null;
}

export async function getAllPlantTypes(): Promise<DbPlantType[]> {
  return query<DbPlantType>("SELECT * FROM plant_types ORDER BY seeds_required");
}

export async function getPlantTypeById(id: number): Promise<DbPlantType | null> {
  const types = await query<DbPlantType>(
    "SELECT * FROM plant_types WHERE id = $1",
    [id]
  );
  return types[0] || null;
}

export async function getUserGarden(userId: string): Promise<DbGardenPlant[]> {
  return query<DbGardenPlant>(
    "SELECT * FROM user_garden WHERE user_id = $1 ORDER BY grid_y, grid_x",
    [userId]
  );
}

export async function getGardenPlant(
  userId: string,
  gridX: number,
  gridY: number
): Promise<DbGardenPlant | null> {
  const plants = await query<DbGardenPlant>(
    "SELECT * FROM user_garden WHERE user_id = $1 AND grid_x = $2 AND grid_y = $3",
    [userId, gridX, gridY]
  );
  return plants[0] || null;
}

export async function plantInGarden(
  userId: string,
  plantTypeId: number,
  gridX: number,
  gridY: number
): Promise<DbGardenPlant> {
  const result = await query<DbGardenPlant>(
    `INSERT INTO user_garden (user_id, plant_type_id, grid_x, grid_y)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, plantTypeId, gridX, gridY]
  );
  return result[0];
}

export async function updateGardenPlant(
  plantId: string,
  updates: Partial<Pick<DbGardenPlant, "state" | "water_received" | "sunlight_received">>
): Promise<DbGardenPlant> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.state !== undefined) {
    setClauses.push(`state = $${paramIndex++}`);
    values.push(updates.state);
    
    if (updates.state === "blooming") {
      setClauses.push("bloomed_at = NOW()");
    }
  }
  if (updates.water_received !== undefined) {
    setClauses.push(`water_received = $${paramIndex++}`);
    values.push(updates.water_received);
    setClauses.push("last_watered = NOW()");
  }
  if (updates.sunlight_received !== undefined) {
    setClauses.push(`sunlight_received = $${paramIndex++}`);
    values.push(updates.sunlight_received);
  }

  values.push(plantId);

  const result = await query<DbGardenPlant>(
    `UPDATE user_garden 
     SET ${setClauses.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );
  return result[0];
}

export async function waterGardenPlant(plantId: string): Promise<DbGardenPlant> {
  const result = await query<DbGardenPlant>(
    `UPDATE user_garden 
     SET water_received = water_received + 1,
         last_watered = NOW()
     WHERE id = $1
     RETURNING *`,
    [plantId]
  );
  return result[0];
}

export async function harvestPlant(plantId: string): Promise<DbGardenPlant> {
  const result = await query<DbGardenPlant>(
    `UPDATE user_garden 
     SET state = 'harvested',
         harvested_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [plantId]
  );
  return result[0];
}

export async function getWitheredPlants(): Promise<DbGardenPlant[]> {
  return query<DbGardenPlant>(
    `SELECT * FROM user_garden 
     WHERE state IN ('planted', 'sprouting')
     AND last_watered < NOW() - INTERVAL '48 hours'`
  );
}

export async function witherPlants(): Promise<number> {
  const result = await query<{ count: number }>(
    `WITH updated AS (
       UPDATE user_garden
       SET state = 'withered'
       WHERE state IN ('planted', 'sprouting')
       AND last_watered < NOW() - INTERVAL '48 hours'
       RETURNING 1
     )
     SELECT COUNT(*)::int as count FROM updated`
  );
  return result[0]?.count || 0;
}

// =====================
// READING SESSION QUERIES
// =====================

export interface DbReadingSession {
  id: string;
  user_id: string;
  surah_id: number;
  start_verse: number;
  end_verse: number;
  duration_seconds: number | null;
  scroll_depth_percent: number | null;
  started_at: Date;
  ended_at: Date | null;
}

export async function startReadingSession(
  userId: string,
  surahId: number,
  startVerse: number
): Promise<DbReadingSession> {
  const result = await query<DbReadingSession>(
    `INSERT INTO reading_sessions (user_id, surah_id, start_verse, end_verse)
     VALUES ($1, $2, $3, $3)
     RETURNING *`,
    [userId, surahId, startVerse]
  );
  return result[0];
}

export async function endReadingSession(
  sessionId: string,
  endVerse: number,
  durationSeconds: number,
  scrollDepthPercent: number
): Promise<DbReadingSession> {
  const result = await query<DbReadingSession>(
    `UPDATE reading_sessions
     SET end_verse = $2,
         duration_seconds = $3,
         scroll_depth_percent = $4,
         ended_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [sessionId, endVerse, durationSeconds, scrollDepthPercent]
  );
  return result[0];
}

export async function getUserReadingSessions(
  userId: string,
  limit: number = 10
): Promise<DbReadingSession[]> {
  return query<DbReadingSession>(
    `SELECT * FROM reading_sessions 
     WHERE user_id = $1 
     ORDER BY started_at DESC 
     LIMIT $2`,
    [userId, limit]
  );
}
