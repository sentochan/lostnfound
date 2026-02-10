-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (links to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  gender TEXT,
  location TEXT,
  avatar_url TEXT,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stats_posts INTEGER DEFAULT 0,
  stats_found INTEGER DEFAULT 0,
  stats_clues INTEGER DEFAULT 0
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create items table
CREATE TABLE items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Pet', 'Electronics', 'Wallet', 'Documents', 'People', 'Other')),
  pet_type TEXT CHECK (pet_type IN ('Dog', 'Cat', 'Bird', 'Other')),
  description TEXT,
  reward INTEGER DEFAULT 0,
  reward_history JSONB DEFAULT '[]'::jsonb,
  last_seen_location TEXT,
  last_seen_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  main_image_url TEXT,
  secondary_image_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Lost' CHECK (status IN ('Lost', 'Found', 'Recovered', 'Closed')),
  owner_name TEXT, -- cache for display
  distance TEXT, -- placeholder for demo
  fake_reports INTEGER DEFAULT 0,
  storage_location TEXT,
  owner_voice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for items
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Items are viewable by everyone" ON items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create items" ON items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own items" ON items FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own items" ON items FOR DELETE USING (auth.uid() = owner_id);

-- Create sightings table
CREATE TABLE sightings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_name TEXT,
  reporter_avatar TEXT,
  description TEXT,
  location_name TEXT,
  image_url TEXT,
  map_preview_url TEXT,
  reliability TEXT CHECK (reliability IN ('High', 'Medium', 'Low')),
  distance TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for sightings
ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sightings are viewable by everyone" ON sightings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create sightings" ON sightings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create conversations table
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  participant1_id UUID REFERENCES auth.users(id), -- e.g., owner
  participant2_id UUID REFERENCES auth.users(id), -- e.g., finder
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT 
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  text TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM conversations c 
  WHERE c.id = messages.conversation_id 
  AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
));
CREATE POLICY "Users can send messages in their conversations" ON messages FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM conversations c 
  WHERE c.id = messages.conversation_id 
  AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
));

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  related_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true); -- Ideally restricted to service_role, but for client-side trigger demo we might need this or function

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
