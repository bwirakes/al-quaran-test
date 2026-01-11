-- Gamification Schema for Quran App
-- Journey (Safar) & Garden (Kebun) System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1
);

CREATE INDEX idx_users_email ON users(email);

-- =====================
-- ISLANDS (Thematic Groups)
-- =====================
CREATE TABLE IF NOT EXISTS islands (
    id SERIAL PRIMARY KEY,
    name_id VARCHAR(100) NOT NULL,        -- Indonesian name
    name_ar VARCHAR(100),                  -- Arabic name
    name_en VARCHAR(100),                  -- English name
    description TEXT,
    theme VARCHAR(50) NOT NULL,            -- Theme category
    icon VARCHAR(50),                      -- Icon identifier
    order_index INTEGER NOT NULL,          -- Display order
    color VARCHAR(20),                     -- Theme color hex
    unlock_requirement JSONB,              -- Requirements to unlock this island
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_islands_order ON islands(order_index);

-- =====================
-- NODES (Journey Points)
-- =====================
CREATE TABLE IF NOT EXISTS nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    island_id INTEGER REFERENCES islands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    type VARCHAR(50) NOT NULL,             -- 'surah', 'verse_group', 'theme', 'quiz'
    content_refs JSONB NOT NULL,           -- {"surah_id": 1} or {"surah_id": 2, "verses": [1,5]} or {"surahs": [1,2,3]}
    completion_criteria JSONB NOT NULL,    -- {"type": "read_percent", "value": 100} or {"type": "quiz_score", "value": 80}
    description TEXT,
    xp_reward INTEGER DEFAULT 10,
    seed_reward INTEGER DEFAULT 5,
    order_index INTEGER DEFAULT 0,
    estimated_minutes INTEGER,             -- Estimated completion time
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nodes_island ON nodes(island_id);
CREATE INDEX idx_nodes_type ON nodes(type);

-- =====================
-- NODE PREREQUISITES (Directed Graph Edges)
-- =====================
CREATE TABLE IF NOT EXISTS node_prerequisites (
    node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    prerequisite_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    PRIMARY KEY (node_id, prerequisite_id)
);

CREATE INDEX idx_prerequisites_node ON node_prerequisites(node_id);
CREATE INDEX idx_prerequisites_prereq ON node_prerequisites(prerequisite_id);

-- =====================
-- USER PROGRESS (Journey Tracking)
-- =====================
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'locked',   -- 'locked', 'unlocked', 'in_progress', 'completed'
    progress_percent INTEGER DEFAULT 0,     -- 0-100
    verses_read JSONB DEFAULT '[]',         -- Array of verse keys read
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, node_id)
);

CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_node ON user_progress(node_id);
CREATE INDEX idx_progress_status ON user_progress(status);

-- =====================
-- USER INVENTORY (Resources)
-- =====================
CREATE TABLE IF NOT EXISTS user_inventory (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    seeds INTEGER DEFAULT 0,
    water INTEGER DEFAULT 0,
    sunlight INTEGER DEFAULT 0,
    special_items JSONB DEFAULT '{}',      -- For future special items
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- PLANT TYPES
-- =====================
CREATE TABLE IF NOT EXISTS plant_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_id VARCHAR(100) NOT NULL,         -- Indonesian name
    description TEXT,
    icon VARCHAR(50),
    rarity VARCHAR(20) DEFAULT 'common',   -- 'common', 'uncommon', 'rare', 'legendary'
    seeds_required INTEGER NOT NULL,        -- Cost to plant
    water_to_sprout INTEGER NOT NULL,       -- Water needed to reach sprouting
    water_to_bloom INTEGER NOT NULL,        -- Total water needed to bloom
    sunlight_bonus INTEGER DEFAULT 0,       -- Sunlight reduces water requirement
    growth_time_hours INTEGER DEFAULT 24,   -- Base time to grow
    xp_on_harvest INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- USER GARDEN (Plant Instances)
-- =====================
CREATE TABLE IF NOT EXISTS user_garden (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plant_type_id INTEGER REFERENCES plant_types(id) ON DELETE CASCADE,
    grid_x INTEGER NOT NULL,
    grid_y INTEGER NOT NULL,
    state VARCHAR(20) DEFAULT 'planted',   -- 'planted', 'sprouting', 'blooming', 'withered', 'harvested'
    water_received INTEGER DEFAULT 0,
    sunlight_received INTEGER DEFAULT 0,
    planted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_watered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bloomed_at TIMESTAMP WITH TIME ZONE,
    harvested_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, grid_x, grid_y)
);

CREATE INDEX idx_garden_user ON user_garden(user_id);
CREATE INDEX idx_garden_state ON user_garden(state);

-- =====================
-- USER STREAKS
-- =====================
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    prayer_log JSONB DEFAULT '{}',          -- {"2024-01-15": {"fajr": true, "dhuhr": true, ...}}
    weekly_checkins INTEGER DEFAULT 0,
    total_checkins INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- READING SESSIONS (For detailed tracking)
-- =====================
CREATE TABLE IF NOT EXISTS reading_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    surah_id INTEGER NOT NULL,
    start_verse INTEGER NOT NULL,
    end_verse INTEGER NOT NULL,
    duration_seconds INTEGER,
    scroll_depth_percent INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sessions_user ON reading_sessions(user_id);
CREATE INDEX idx_sessions_surah ON reading_sessions(surah_id);
CREATE INDEX idx_sessions_started ON reading_sessions(started_at);

-- =====================
-- ACHIEVEMENTS
-- =====================
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_id VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    xp_reward INTEGER DEFAULT 100,
    seed_reward INTEGER DEFAULT 20,
    criteria JSONB NOT NULL,               -- {"type": "streak", "value": 7} or {"type": "surahs_completed", "value": 10}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- USER ACHIEVEMENTS
-- =====================
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- =====================
-- HELPER FUNCTIONS
-- =====================

-- Function to check if a node is unlocked for a user
CREATE OR REPLACE FUNCTION is_node_unlocked(p_user_id UUID, p_node_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    prereq_count INTEGER;
    completed_count INTEGER;
BEGIN
    -- Count prerequisites
    SELECT COUNT(*) INTO prereq_count
    FROM node_prerequisites
    WHERE node_id = p_node_id;
    
    -- If no prerequisites, node is unlocked
    IF prereq_count = 0 THEN
        RETURN TRUE;
    END IF;
    
    -- Count completed prerequisites
    SELECT COUNT(*) INTO completed_count
    FROM node_prerequisites np
    JOIN user_progress up ON np.prerequisite_id = up.node_id
    WHERE np.node_id = p_node_id
    AND up.user_id = p_user_id
    AND up.status = 'completed';
    
    RETURN completed_count >= prereq_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update garden state (for withering check)
CREATE OR REPLACE FUNCTION update_garden_states()
RETURNS void AS $$
BEGIN
    -- Wither plants that haven't been watered in 48 hours
    UPDATE user_garden
    SET state = 'withered'
    WHERE state IN ('planted', 'sprouting')
    AND last_watered < NOW() - INTERVAL '48 hours';
END;
$$ LANGUAGE plpgsql;
