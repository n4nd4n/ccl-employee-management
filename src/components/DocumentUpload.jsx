import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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

    if (!file || !category) {
      setError('Please select a file and category');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadProgress(0);

      const timestamp = new Date().getTime();
      const fileName = `${currentUser.uid}/${category}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `uploads/${fileName}`);

      const uploadTask = uploadBytes(storageRef, file);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const snapshot = await uploadTask;
      clearInterval(progressInterval);
      setUploadProgress(100);

      const downloadURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'documents'), {
        userId: currentUser.uid,
        fileName: file.name,
        fileURL: downloadURL,
        category: category,
        description: description,
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
        fileType: file.type
      });

      setSuccess(true);
      setFile(null);
      setCategory('');
      setDescription('');

      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';

      if (onUploadComplete) {
        onUploadComplete();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="shadow-xl rounded-xl border p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Upload className="h-5 w-5" /> Upload Document
        </CardTitle>
        <CardDescription>Upload your compliance documents</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              Document uploaded successfully!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Document Category</Label>
            <Select onValueChange={(val) => setCategory(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select document category" />
              </SelectTrigger>
              <SelectContent>
                {documentCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <Input id="file-upload" type="file" onChange={handleFileChange} />
            {file && (
              <p className="text-sm text-muted-foreground">Selected: {file.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="Brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={uploading || !file || !category}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
