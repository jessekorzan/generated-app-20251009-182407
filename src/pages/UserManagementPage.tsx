import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { User, UserRole } from '@shared/types';
import { toast } from 'sonner';
import { useSort } from '@/hooks/useSort';
import { OutletContextType } from '@/types/header';
const ROLES: UserRole[] = ['Admin', 'Editor', 'Viewer'];
export function UserManagementPage() {
  const { setHeaderConfig } = useOutletContext<OutletContextType>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'Viewer' });
  const [isSaving, setIsSaving] = useState(false);
  const { items: sortedUsers, requestSort, sortConfig } = useSort(users, { key: 'name', direction: 'asc' });
  const openAddUserDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);
  const headerConfig = useMemo(() => ({
    title: "User Management",
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Users' }],
    primaryAction: { label: 'Add User', icon: PlusCircle, onClick: openAddUserDialog },
    showFilters: false,
  }), [openAddUserDialog]);
  useEffect(() => {
    setHeaderConfig(headerConfig);
  }, [setHeaderConfig, headerConfig]);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api<User[]>('/api/users');
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.warning('Please fill out all fields.');
      return;
    }
    setIsSaving(true);
    try {
      await api('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      toast.success(`User "${newUser.name}" has been invited.`);
      setIsDialogOpen(false);
      setNewUser({ role: 'Viewer' });
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Failed to add user:', error);
      toast.error('Failed to add user.');
    } finally {
      setIsSaving(false);
    }
  };
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'default';
      case 'Editor': return 'secondary';
      case 'Viewer': return 'outline';
      default: return 'outline';
    }
  };
  const SortableHeader = ({ sortKey, children, className }: { sortKey: keyof User, children: React.ReactNode, className?: string }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
      <TableHead className={className}>
        <Button variant="ghost" onClick={() => requestSort(sortKey)} className="px-2 py-1 h-auto -ml-2">
          {children}
          {isSorted && (
            sortConfig?.direction === 'asc'
              ? <ArrowUp className="ml-2 h-4 w-4" />
              : <ArrowDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </TableHead>
    );
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage your team members and their roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader sortKey="name">User</SortableHeader>
                <SortableHeader sortKey="role" className="hidden sm:table-cell">Role</SortableHeader>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : sortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Invite a new user to collaborate on InsightLens.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newUser.name || ''}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email || ''}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="jane.doe@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={isSaving}>
              {isSaving ? 'Sending Invite...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}