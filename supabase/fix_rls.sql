-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to items
DROP POLICY IF EXISTS "Public items are viewable by everyone" ON items;
CREATE POLICY "Public items are viewable by everyone"
ON items FOR SELECT
USING (true);

-- Allow authenticated users to insert items
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
CREATE POLICY "Users can insert their own items"
ON items FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Allow owners to update their own items
DROP POLICY IF EXISTS "Users can update their own items" ON items;
CREATE POLICY "Users can update their own items"
ON items FOR UPDATE
USING (auth.uid() = owner_id);

-- Allow public read access to sightings
DROP POLICY IF EXISTS "Public sightings are viewable by everyone" ON sightings;
CREATE POLICY "Public sightings are viewable by everyone"
ON sightings FOR SELECT
USING (true);

-- Allow authenticated users to insert sightings
DROP POLICY IF EXISTS "Users can insert sightings" ON sightings;
CREATE POLICY "Users can insert sightings"
ON sightings FOR INSERT
WITH CHECK (auth.uid() = reporter_id);
