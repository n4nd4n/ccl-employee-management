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
    <Card className="shadow-2xl rounded-2xl border-0 p-6 bg-gradient-to-br from-white/95 to-blue-50/30 backdrop-blur-lg transform hover:scale-105 transition-all duration-300">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-gray-800">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Upload className="h-6 w-6 text-white" />
          </div>
          Upload Document
        </CardTitle>
        <CardDescription className="text-gray-600 text-base mt-2">
          Upload your compliance documents securely
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50/80 backdrop-blur-sm rounded-xl animate-shake">
            <AlertDescription className="text-red-800 font-medium flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50/80 backdrop-blur-sm rounded-xl animate-pulse">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              Document uploaded successfully!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-3 transform hover:scale-105 transition-transform duration-200">
            <Label htmlFor="category" className="text-gray-700 font-semibold text-base">Document Category</Label>
            <Select value={category} onValueChange={(val) => setCategory(val)}>
              <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 py-3">
                <SelectValue placeholder="Select document category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 shadow-2xl bg-white/95 backdrop-blur-lg">
                {documentCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="rounded-lg hover:bg-blue-50 transition-colors duration-200 py-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{cat.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 transform hover:scale-105 transition-transform duration-200">
            <Label htmlFor="file-upload" className="text-gray-700 font-semibold text-base">Select File</Label>
            <div className="relative">
              <Input 
                id="file-upload" 
                type="file" 
                onChange={handleFileChange}
                className="border-2 border-dashed border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {file && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50/80 rounded-xl backdrop-blur-sm animate-fadeInUp">
                <FileText className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-800">Selected: {file.name}</p>
                <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          <div className="space-y-3 transform hover:scale-105 transition-transform duration-200">
            <Label htmlFor="description" className="text-gray-700 font-semibold text-base">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="Brief description of the document"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm py-3"
            />
          </div>

          {uploading && (
            <div className="space-y-3 p-4 bg-blue-50/80 rounded-xl backdrop-blur-sm animate-fadeInUp">
              <div className="flex items-center justify-between text-sm font-medium text-blue-800">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2 bg-blue-100" />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
            disabled={uploading || !file || !category}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-center space-x-2">
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Upload Document</span>
                </>
              )}
            </div>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
