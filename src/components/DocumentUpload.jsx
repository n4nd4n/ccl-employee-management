import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from './ui/card';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';

const documentCategories = [
  { value: 'idProof', label: 'ID Proof' },
  { value: 'medicalCertificate', label: 'Medical Certificate' },
  { value: 'trainingCertificate', label: 'Training Certificate' },
  { value: 'safetyTraining', label: 'Safety Training Certificate' },
  { value: 'other', label: 'Other' }
];

export default function DocumentUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF, JPEG, and PNG files are allowed');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);

    if (!currentUser) {
      setError('You must be logged in to upload a document.');
      return;
    }
    if (!file || !category) {
      setError('Please select a file and category');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const timestamp = new Date().getTime();
      const fileName = `${currentUser.uid}/${category}_${timestamp}_${file.name}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await supabase.storage.from('uploads').upload(fileName, file, {
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          }
        });
      if (uploadError) throw uploadError;
      console.log('Uploaded to storage:', uploadData);

      // Get public URL safely
      const { data: publicUrlData, error: publicUrlError } =
        supabase.storage.from('uploads').getPublicUrl(fileName);
      if (publicUrlError) throw publicUrlError;
      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error('Failed to get public URL');
      console.log('Public URL:', publicUrl);

      // Insert metadata into DB
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: currentUser.uid,
          file_name: file.name,
          file_url: publicUrl,
          category,
          description,
          status: 'pending',
          uploaded_at: new Date().toISOString(),
          file_size: file.size,
          file_type: file.type
        });
      if (dbError) {
        console.error('DB insert failed:', dbError);
        throw dbError;
      }
      console.log('Metadata saved to DB');

      // Cleanup and success
      setSuccess(true);
      setFile(null);
      setCategory('');
      setDescription('');
      document.getElementById('file-upload').value = '';
      if (onUploadComplete) onUploadComplete();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="...your styling...">
      <CardHeader>...</CardHeader>
      <CardContent>
        {error && <Alert>...{error}...</Alert>}
        {success && <Alert>...Document uploaded successfully!</Alert>}
        <form onSubmit={handleUpload} className="space-y-6">
          {/* category + description + file + progress + button */}
          <Button
            type="submit"
            disabled={uploading || !file || !category}
            className="your button styling"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="" />
                Upload Document
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
