# Setup Instructions for Images and Prompts Project

## Environment Setup

1. Copy the environment template:
```bash
cp apps/web/.env.example apps/web/.env.local
```

2. Fill in your actual values in `apps/web/.env.local`

## Supabase Storage Setup

The application requires a Supabase storage bucket named "uploads". Here's how to create it:

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Storage → Create Bucket
3. Name: `uploads`
4. Set to public if you want public access, or private for user-only access
5. Create the bucket

### Option 2: Using SQL (run in Supabase SQL editor)
```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true);

-- Set up proper RLS policies if needed
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'uploads' AND owner = auth.uid());

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'uploads' AND owner = auth.uid());
```

## Database Schema

The database schema is already defined in `infra/supabase-schema.sql`. Run this SQL in your Supabase SQL editor to set up the tables.

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## Troubleshooting

If you still get "Bucket not found" errors:
- Make sure the bucket name is exactly "uploads" (case-sensitive)
- Verify your Supabase project has storage enabled
- Check that your environment variables are correctly set

The application will now gracefully handle missing storage buckets and continue processing prompts without image uploads.