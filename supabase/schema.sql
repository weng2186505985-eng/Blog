-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (用户角色档案)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  title TEXT DEFAULT '学徒',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Posts (冒险日志)
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  read_time INTEGER DEFAULT 1,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Comments (留言板)
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Likes (魔力水晶)
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

-- 5. Quests (任务)
CREATE TABLE quests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('main', 'side')) DEFAULT 'side',
  status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5) DEFAULT 1,
  reward_exp INTEGER DEFAULT 50,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
);

-- 6. Skills (技能树)
CREATE TABLE skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('tech', 'creative')) NOT NULL,
  proficiency INTEGER CHECK (proficiency >= 0 AND proficiency <= 100) DEFAULT 0,
  parent_id UUID REFERENCES skills(id),
  unlocked_at TIMESTAMP WITH TIME ZONE
);

-- 7. Achievements (成就)
CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  rarity TEXT CHECK (rarity IN ('bronze', 'silver', 'gold', 'legend')) DEFAULT 'bronze',
  unlock_condition TEXT,
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE
);

-- Trigger for computing Level and Title on EXP update
CREATE OR REPLACE FUNCTION update_level_and_title()
RETURNS TRIGGER AS $$
DECLARE
  new_level INTEGER;
  new_title TEXT;
BEGIN
  -- level = floor(sqrt(total_exp / 100))
  -- Let's make level 1 when exp < 100 to avoid level 0
  new_level := GREATEST(1, FLOOR(SQRT(NEW.exp / 100.0)));
  
  -- Determine title based on level
  IF new_level >= 50 THEN
    new_title := '传说';
  ELSIF new_level >= 30 THEN
    new_title := '宗师';
  ELSIF new_level >= 20 THEN
    new_title := '大师';
  ELSIF new_level >= 10 THEN
    new_title := '术士';
  ELSE
    new_title := '学徒';
  END IF;

  NEW.level := new_level;
  NEW.title := new_title;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_exp_update
BEFORE UPDATE OF exp ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_level_and_title();

-- Trigger for creating profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', '冒险者_' || substr(new.id::text, 1, 6)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read, users can update their own
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: Anyone can read published posts. Admins can do all.
CREATE POLICY "Public posts are viewable by everyone." ON posts FOR SELECT USING (published = true OR (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)));
CREATE POLICY "Admins can insert posts" ON posts FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
CREATE POLICY "Admins can update posts" ON posts FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
CREATE POLICY "Admins can delete posts" ON posts FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Comments: Anyone can read. Authenticated users can insert. Users can edit/delete their own.
CREATE POLICY "Comments are viewable by everyone." ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments." ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments." ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments." ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes: Anyone can read. Authenticated users can insert/delete their own.
CREATE POLICY "Likes are viewable by everyone." ON likes FOR SELECT USING (true);
CREATE POLICY "Users can insert likes." ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete likes." ON likes FOR DELETE USING (auth.uid() = user_id);

-- Quests, Skills, Achievements: Anyone can read. Admins can manage.
CREATE POLICY "Quests viewable by everyone" ON quests FOR SELECT USING (true);
CREATE POLICY "Admins manage quests" ON quests FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Skills viewable by everyone" ON skills FOR SELECT USING (true);
CREATE POLICY "Admins manage skills" ON skills FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Achievements viewable by everyone" ON achievements FOR SELECT USING (true);
CREATE POLICY "Admins manage achievements" ON achievements FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
