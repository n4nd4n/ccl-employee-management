import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import DocumentList from './DocumentList';
import Chatbot from './Chatbot';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { 
  LogOut, 
  Users, 
  FileText, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building2,
  Search,
  TrendingUp,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';

export default function HRDashboard() {
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDocuments: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0
  });
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch documents
    const documentsQuery = query(collection(db, 'documents'));
    const unsubscribeDocuments = onSnapshot(documentsQuery, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setDocuments(docs);
      
      // Calculate stats
      const totalDocuments = docs.length;
      const pendingDocuments = docs.filter(doc => doc.status === 'pending').length;
      const approvedDocuments = docs.filter(doc => doc.status === 'approved').length;
      const rejectedDocuments = docs.filter(doc => doc.status === 'rejected').length;
      
      setStats(prev => ({
        ...prev,
        totalDocuments,
        pendingDocuments,
        approvedDocuments,
        rejectedDocuments
      }));
    });

    // Fetch users
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = [];
        usersSnapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersData);
        setStats(prev => ({ ...prev, totalEmployees: usersData.length }));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();

    return () => {
      unsubscribeDocuments();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmployeeComplianceStatus = (userId) => {
    const userDocs = documents.filter(doc => doc.userId === userId);
    const categories = ['idProof', 'medicalCertificate', 'trainingCertificate', 'safetyTraining'];
    
    let approved = 0;
    categories.forEach(category => {
      const categoryDoc = userDocs.find(doc => doc.category === category && doc.status === 'approved');
      if (categoryDoc) approved++;
    });
    
    return {
      total: categories.length,
      approved,
      percentage: Math.round((approved / categories.length) * 100)
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="sticky-header">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                <Shield className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">CCL Mining</h1>
                <p className="text-xs md:text-sm text-gray-600">HR Admin Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs md:text-sm font-medium text-gray-900">
                  {currentUser?.displayName || 'HR Admin'}
                </p>
                <p className="text-xs text-gray-600">{currentUser?.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-main">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Welcome Section */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              HR Dashboard
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Manage employee compliance documents and track organizational compliance status.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                  </div>
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Total Documents</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
                  </div>
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-lg md:text-2xl font-bold text-yellow-600">{stats.pendingDocuments}</p>
                  </div>
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-lg md:text-2xl font-bold text-green-600">{stats.approvedDocuments}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-lg md:text-2xl font-bold text-red-600">{stats.rejectedDocuments}</p>
                  </div>
                  <XCircle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="documents" className="space-y-4 md:space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documents" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <FileText className="h-3 w-3 md:h-4 md:w-4" />
                Document Review
              </TabsTrigger>
              <TabsTrigger value="employees" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                Employee Compliance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <DocumentList isHRView={true} />
            </TabsContent>

            <TabsContent value="employees">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                    Employee Compliance Overview
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Monitor compliance status across all employees
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-4">
                    <Search className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm text-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm md:text-base text-muted-foreground">No employees found</p>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {filteredUsers.map((user) => {
                        const compliance = getEmployeeComplianceStatus(user.id);
                        const isCompliant = compliance.percentage === 100;
                        const hasIssues = compliance.percentage < 50;
                        
                        return (
                          <div 
                            key={user.id} 
                            className="border rounded-lg p-3 md:p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 md:gap-3 mb-2">
                                  <div>
                                    <h3 className="text-sm md:text-base font-medium">{user.name}</h3>
                                    <p className="text-xs md:text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                  {isCompliant && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Compliant
                                    </Badge>
                                  )}
                                  {hasIssues && (
                                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Issues
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                                  <div>
                                    <span className="font-medium">Role:</span> {user.role}
                                  </div>
                                  <div>
                                    <span className="font-medium">Joined:</span> {formatDate(user.createdAt)}
                                  </div>
                                  <div>
                                    <span className="font-medium">Compliance:</span> {compliance.approved}/{compliance.total} documents
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 md:gap-4 ml-2 md:ml-4">
                                <div className="text-center">
                                  <div className="text-lg md:text-2xl font-bold text-gray-900">
                                    {compliance.percentage}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Complete
                                  </div>
                                </div>
                                
                                <div className="w-12 h-12 md:w-16 md:h-16">
                                  <svg className="w-12 h-12 md:w-16 md:h-16 transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                      className="text-gray-200"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      fill="none"
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                      className={isCompliant ? "text-green-500" : hasIssues ? "text-red-500" : "text-yellow-500"}
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      fill="none"
                                      strokeDasharray={`${compliance.percentage}, 100`}
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating Chatbot Button */}
      <Button
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
        onClick={() => setChatbotOpen(true)}
      >
        <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
      </Button>

      {/* Chatbot */}
      <Chatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </div>
  );
}

