import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/use-theme';
import { useGlobalFiltersStore } from '@/stores/useGlobalFiltersStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { OutletContextType } from '@/types/header';
const CURRENT_USER_ID = 'user-1';
export function SettingsPage() {
  const { setHeaderConfig } = useOutletContext<OutletContextType>();
  const { isDark, toggleTheme } = useTheme();
  const { showChatUI, setShowChatUI } = useGlobalFiltersStore();
  const [user, setUser] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  useEffect(() => {
    setHeaderConfig({
      title: "Settings",
      breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Settings' }],
      showFilters: false,
    });
  }, [setHeaderConfig]);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await api<User>(`/api/users/${CURRENT_USER_ID}`);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast.error('Could not load your profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUser(prev => ({ ...prev, [id]: value }));
  };
  const handleSave = async () => {
    if (!user.name || !user.email) {
      toast.warning('Name and email are required.');
      return;
    }
    setIsSaving(true);
    try {
      const updatedUser = await api<User>(`/api/users/${CURRENT_USER_ID}`, {
        method: 'PUT',
        body: JSON.stringify({ name: user.name, email: user.email }),
      });
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api(`/api/users/${CURRENT_USER_ID}`, { method: 'DELETE' });
      toast.success('Account deleted successfully.');
      setIsDeleteDialogOpen(false);
      setUser({});
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={user.name || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user.email || ''} onChange={handleInputChange} />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving || loading}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode" className="text-base">
                    Dark Mode
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Enable to switch to a darker, eye-friendly theme.
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="chat-ui" className="text-base">
                    Chat UI
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Enable a conversational interface for insights. (Beta)
                  </div>
                </div>
                <Switch
                  id="chat-ui"
                  checked={showChatUI}
                  onCheckedChange={setShowChatUI}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={loading}>
                Delete Account
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Yes, delete account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}