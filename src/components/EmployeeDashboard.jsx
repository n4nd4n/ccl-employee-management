import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import Chatbot from './Chatbot';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  LogOut, 
  User, 
  FileText, 
  Upload, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building2,
  MessageCircle
} from 'lucide-react';

const complianceItems = [
  { key: 'idProof', label: 'ID Proof', required: true },
  { key: 'medicalCertificate', label: 'Medical Certificate', required: true },
  { key: 'trainingCertificate', label: 'Training Certificate', required: true },
  { key: 'safetyTraining', label: 'Safety Training Certificate', required: true }
];

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

export default function EmployeeDashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleUploadComplete = () => {
    setRefreshDocuments(prev => prev + 1);
  };

  const getComplianceStatus = () => {
    if (!userProfile?.complianceStatus) return { total: 0, approved: 0, pending: 0, rejected: 0 };
    
    const statuses = userProfile.complianceStatus;
    const total = complianceItems.length;
    let approved = 0, pending = 0, rejected = 0;

    complianceItems.forEach(item => {
      const status = statuses[item.key];
      if (status === 'approved') approved++;
      else if (status === 'rejected') rejected++;
      else pending++;
    });

    return { total, approved, pending, rejected };
  };

  const complianceStatus = getComplianceStatus();
  const compliancePercentage = Math.round((complianceStatus.approved / complianceStatus.total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CCL Mining</h1>
                <p className="text-sm text-gray-600">Employee Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.name || currentUser?.displayName || 'Employee'}
                </p>
                <p className="text-xs text-gray-600">{currentUser?.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile?.name || currentUser?.displayName || 'Employee'}!
          </h2>
          <p className="text-gray-600">
            Manage your compliance documents and track your submission status.
          </p>
        </div>

        {/* Compliance Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Compliance</p>
                  <p className="text-2xl font-bold text-gray-900">{compliancePercentage}%</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{complianceStatus.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{complianceStatus.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{complianceStatus.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Status Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Status
            </CardTitle>
            <CardDescription>
              Track the status of your required compliance documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complianceItems.map((item) => {
                const status = userProfile?.complianceStatus?.[item.key] || 'pending';
                const StatusIcon = statusIcons[status];
                
                return (
                  <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                      {item.required && (
                        <span className="text-xs text-red-600">*Required</span>
                      )}
                    </div>
                    <Badge className={statusColors[status]}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Documents
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <DocumentUpload onUploadComplete={handleUploadComplete} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentList key={refreshDocuments} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Chatbot Button */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
        onClick={() => setChatbotOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chatbot */}
      <Chatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </div>
  );
}

