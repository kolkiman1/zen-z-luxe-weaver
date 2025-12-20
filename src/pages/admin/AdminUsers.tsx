import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Shield, Trash2, Loader2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserWithRole {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<{ user_id: string; email: string; full_name: string | null } | null>(null);
  const [searching, setSearching] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchAdmins = async () => {
    try {
      // Get all admin user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) {
        setUsers([]);
        return;
      }

      // Get profiles for these users
      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const usersWithRoles = roles.map(role => {
        const profile = profiles?.find(p => p.user_id === role.user_id);
        return {
          user_id: role.user_id,
          email: profile?.email || 'Unknown',
          full_name: profile?.full_name || null,
          role: role.role,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admin users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setSearching(true);
    setSearchResult(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .eq('email', searchEmail.trim().toLowerCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('No user found with this email');
        return;
      }

      // Check if already admin
      const existingAdmin = users.find(u => u.user_id === data.user_id);
      if (existingAdmin) {
        toast.info('This user is already an admin');
        return;
      }

      setSearchResult(data);
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('Failed to search user');
    } finally {
      setSearching(false);
    }
  };

  const addAdmin = async () => {
    if (!searchResult) return;

    setAddingAdmin(true);

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: searchResult.user_id,
          role: 'admin',
        });

      if (error) throw error;

      toast.success('Admin role added successfully');
      setSearchResult(null);
      setSearchEmail('');
      setDialogOpen(false);
      fetchAdmins();
    } catch (error: any) {
      console.error('Error adding admin:', error);
      if (error.code === '23505') {
        toast.error('User already has this role');
      } else {
        toast.error('Failed to add admin role');
      }
    } finally {
      setAddingAdmin(false);
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;

      toast.success('Admin role removed');
      fetchAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Failed to remove admin role');
    }
  };

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Manage admin users and their roles
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter user email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                  />
                  <Button onClick={searchUser} disabled={searching}>
                    {searching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {searchResult && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{searchResult.full_name || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">{searchResult.email}</p>
                        </div>
                        <Button onClick={addAdmin} disabled={addingAdmin}>
                          {addingAdmin ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Shield className="w-4 h-4 mr-2" />
                          )}
                          Make Admin
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No admin users found
              </p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="default">Admin</Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Admin Role?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove admin privileges from {user.email}. They will no longer be able to access the admin panel.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeAdmin(user.user_id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
