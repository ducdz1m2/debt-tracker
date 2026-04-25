-- Create storage policies for products bucket
-- Allow public access (using custom auth)

-- Allow public read access
CREATE POLICY "Public read access for products"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow public upload access
CREATE POLICY "Public upload access for products"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'products');

-- Allow public delete access
CREATE POLICY "Public delete access for products"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'products');
