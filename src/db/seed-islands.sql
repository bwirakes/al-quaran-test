-- Seed data for Islands and Plant Types
-- This provides the initial thematic structure

-- =====================
-- SEED ISLANDS (10 Thematic Groups)
-- =====================
INSERT INTO islands (name_id, name_ar, name_en, description, theme, icon, order_index, color) VALUES
(
    'Fondasi Iman',
    'أساس الإيمان',
    'Foundations of Faith',
    'Mulai perjalananmu dengan Al-Fatihah dan surah-surah pendek yang mengajarkan dasar-dasar keimanan.',
    'foundations',
    'compass',
    1,
    '#3B82F6'
),
(
    'Kisah Para Nabi',
    'قصص الأنبياء',
    'Prophetic Narratives',
    'Jelajahi kisah-kisah inspiratif para Nabi dan Rasul Allah.',
    'prophets',
    'book-open',
    2,
    '#8B5CF6'
),
(
    'Hukum & Syariat',
    'الأحكام والشريعة',
    'Laws & Governance',
    'Pelajari hukum-hukum Islam dalam kehidupan bermasyarakat.',
    'laws',
    'scale',
    3,
    '#059669'
),
(
    'Hari Akhir',
    'اليوم الآخر',
    'The Afterlife',
    'Renungkan tentang hari kiamat, surga, dan neraka.',
    'afterlife',
    'sunrise',
    4,
    '#DC2626'
),
(
    'Ibadah & Ketaatan',
    'العبادة والطاعة',
    'Worship & Devotion',
    'Dalami ayat-ayat tentang shalat, puasa, zakat, dan haji.',
    'worship',
    'heart',
    5,
    '#EA580C'
),
(
    'Keluarga & Masyarakat',
    'الأسرة والمجتمع',
    'Family & Society',
    'Panduan tentang pernikahan, warisan, dan hubungan sosial.',
    'family',
    'users',
    6,
    '#0891B2'
),
(
    'Kesabaran & Ujian',
    'الصبر والابتلاء',
    'Patience & Trials',
    'Ayat-ayat tentang kesabaran, jihad, dan menghadapi cobaan.',
    'trials',
    'shield',
    7,
    '#7C3AED'
),
(
    'Tanda-tanda Alam',
    'آيات الكون',
    'Signs in Nature',
    'Kagumi kebesaran Allah melalui penciptaan alam semesta.',
    'nature',
    'globe',
    8,
    '#16A34A'
),
(
    'Dialog & Dakwah',
    'الحوار والدعوة',
    'Dialogue & Dawah',
    'Pelajari cara berdialog dan berdakwah dengan hikmah.',
    'dialogue',
    'message-circle',
    9,
    '#CA8A04'
),
(
    'Juz Amma',
    'جزء عمّ',
    'Juz Amma',
    'Kumpulan surah-surah pendek yang sering dibaca dalam shalat.',
    'short_surahs',
    'star',
    10,
    '#F59E0B'
);

-- =====================
-- SEED PLANT TYPES
-- =====================
INSERT INTO plant_types (name, name_id, description, icon, rarity, seeds_required, water_to_sprout, water_to_bloom, sunlight_bonus, growth_time_hours, xp_on_harvest) VALUES
-- Common Plants
('Date Palm Seedling', 'Bibit Kurma', 'Pohon kurma kecil yang mudah ditanam. Cocok untuk pemula.', 'palm', 'common', 10, 3, 8, 2, 24, 50),
('Jasmine', 'Melati', 'Bunga melati yang harum dan indah.', 'flower', 'common', 15, 4, 10, 3, 36, 75),
('Olive Sapling', 'Bibit Zaitun', 'Pohon zaitun yang diberkahi.', 'leaf', 'common', 20, 5, 12, 3, 48, 100),

-- Uncommon Plants
('Rose of Jannah', 'Mawar Jannah', 'Mawar merah yang melambangkan cinta kepada Allah.', 'rose', 'uncommon', 35, 6, 15, 4, 72, 150),
('Pomegranate Tree', 'Pohon Delima', 'Buah yang disebutkan dalam Al-Quran.', 'fruit', 'uncommon', 40, 7, 18, 5, 96, 200),
('Fig Tree', 'Pohon Tin', 'At-Tin, pohon yang Allah bersumpah dengannya.', 'tree', 'uncommon', 45, 8, 20, 5, 96, 225),

-- Rare Plants
('Sidrah Tree', 'Pohon Sidrah', 'Pohon batas di langit ketujuh.', 'tree-pine', 'rare', 80, 10, 25, 8, 168, 400),
('Kawthar Lily', 'Lili Kautsar', 'Bunga dari telaga Kautsar.', 'sparkles', 'rare', 100, 12, 30, 10, 168, 500),

-- Legendary Plants
('Tuba Tree', 'Pohon Tuba', 'Pohon surgawi yang disebutkan dalam hadits.', 'crown', 'legendary', 200, 20, 50, 15, 336, 1000),
('Garden of Firdaus', 'Taman Firdaus', 'Miniatur taman tertinggi di surga.', 'castle', 'legendary', 500, 30, 80, 25, 672, 2500);

-- =====================
-- SEED ACHIEVEMENTS
-- =====================
INSERT INTO achievements (code, name, name_id, description, icon, xp_reward, seed_reward, criteria) VALUES
-- Streak Achievements
('streak_7', '7 Day Warrior', 'Pejuang 7 Hari', 'Baca Al-Quran selama 7 hari berturut-turut.', 'flame', 100, 20, '{"type": "streak", "value": 7}'),
('streak_30', 'Monthly Champion', 'Juara Bulanan', 'Baca Al-Quran selama 30 hari berturut-turut.', 'trophy', 500, 100, '{"type": "streak", "value": 30}'),
('streak_100', 'Centurion', 'Sang Centurion', 'Baca Al-Quran selama 100 hari berturut-turut.', 'medal', 2000, 500, '{"type": "streak", "value": 100}'),

-- Reading Achievements
('first_surah', 'First Step', 'Langkah Pertama', 'Selesaikan membaca surah pertamamu.', 'footprints', 50, 10, '{"type": "surahs_completed", "value": 1}'),
('ten_surahs', 'Dedicated Reader', 'Pembaca Setia', 'Selesaikan 10 surah.', 'book', 200, 50, '{"type": "surahs_completed", "value": 10}'),
('juz_amma', 'Juz Amma Master', 'Penguasa Juz Amma', 'Selesaikan semua surah di Juz Amma.', 'star', 1000, 200, '{"type": "island_completed", "value": 10}'),

-- Garden Achievements
('first_plant', 'Gardener', 'Tukang Kebun', 'Tanam tanaman pertamamu.', 'seedling', 50, 10, '{"type": "plants_planted", "value": 1}'),
('first_bloom', 'First Bloom', 'Mekar Pertama', 'Kembangkan tanaman pertamamu hingga mekar.', 'flower', 100, 25, '{"type": "plants_bloomed", "value": 1}'),
('garden_master', 'Garden Master', 'Master Kebun', 'Miliki 10 tanaman yang mekar.', 'garden', 500, 100, '{"type": "plants_bloomed", "value": 10}'),

-- Prayer Achievements
('prayer_warrior', 'Prayer Warrior', 'Pejuang Shalat', 'Konfirmasi 5 waktu shalat dalam sehari.', 'moon', 100, 30, '{"type": "daily_prayers", "value": 5}'),
('prayer_week', 'Weekly Devotion', 'Ibadah Mingguan', 'Konfirmasi semua shalat selama 7 hari.', 'sun', 500, 100, '{"type": "prayer_streak", "value": 7}');
