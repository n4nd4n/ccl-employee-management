import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye
} from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle
};

const categoryLabels = {
  idProof: 'ID Proof',
  medicalCertificate: 'Medical Certificate',
  trainingCertificate: 'Training Certificate',
  safetyTraining: 'Safety Training Certificate',
  other: 'Other'
};

export default function DocumentList({ isHRView = false, userId = null }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    let q;
    
    if (isHRView) {
      // HR can see all documents
      q = query(
        collection(db, 'documents'),
        orderBy('uploadedAt', 'desc')
      );
    } else {
      // Employees can only see their own documents
      const targetUserId = userId || currentUser?.uid;
      q = query(
        collection(db, 'documents'),
        where('userId', '==', targetUserId),
        orderBy('uploadedAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setDocuments(docs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching documents:', error);
        setError('Failed to load documents');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isHRView, userId, currentUser]);

  const handleStatusUpdate = async (documentId, newStatus) => {
    try {
      await updateDoc(doc(db, 'documents', documentId), {
        status: newStatus,
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentUser.uid
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      setError('Failed to update document status');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {isHRView ? 'All Documents' : 'My Documents'}
        </CardTitle>
        <CardDescription>
          {isHRView 
            ? 'Review and manage employee documents' 
            : 'View your uploaded documents and their status'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isHRView ? 'No documents found' : 'No documents uploaded yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => {
              const StatusIcon = statusIcons[document.status];
              
              return (
                <div 
                  key={document.id} 
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{document.fileName}</h3>
                        <Badge className={statusColors[document.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Category:</span>
                          {categoryLabels[document.category] || document.category}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(document.uploadedAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Size:</span>
                          {formatFileSize(document.fileSize)}
                        </div>
                        {isHRView && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            User ID: {document.userId.substring(0, 8)}...
                          </div>
                        )}
                      </div>

                      {document.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {document.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(document.fileURL, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = document.fileURL;
                          link.download = document.fileName;
                          link.click();
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>

                      {isHRView && userRole === 'hr' && document.status === 'pending' && (
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(document.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(document.id, 'rejected')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

