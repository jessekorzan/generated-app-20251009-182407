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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { Prompt } from '@shared/types';
import { toast } from 'sonner';
import { OutletContextType } from '@/types/header';
export function PromptLibraryPage() {
  const { setHeaderConfig } = useOutletContext<OutletContextType>();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<Partial<Prompt> | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const openNewPromptDialog = useCallback(() => {
    setCurrentPrompt({});
    setIsFormDialogOpen(true);
  }, []);
  const headerConfig = useMemo(() => ({
    title: "Prompt Library",
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Prompt Library' }],
    primaryAction: { label: 'New Prompt', icon: PlusCircle, onClick: openNewPromptDialog },
    showFilters: false,
  }), [openNewPromptDialog]);
  useEffect(() => {
    setHeaderConfig(headerConfig);
  }, [setHeaderConfig, headerConfig]);
  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const data = await api<Prompt[]>('/api/prompts');
      setPrompts(data);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
      toast.error('Failed to load prompts.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPrompts();
  }, []);
  const handleSave = async () => {
    if (!currentPrompt || !currentPrompt.name || !currentPrompt.promptText) {
      toast.warning('Please fill out all fields.');
      return;
    }
    const isEditing = !!currentPrompt.id;
    const endpoint = isEditing ? `/api/prompts/${currentPrompt.id}` : '/api/prompts';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      await api(endpoint, {
        method,
        body: JSON.stringify(currentPrompt),
      });
      toast.success(`Prompt ${isEditing ? 'updated' : 'created'} successfully!`);
      setIsFormDialogOpen(false);
      setCurrentPrompt(null);
      fetchPrompts(); // Refresh list
    } catch (error) {
      console.error('Failed to save prompt:', error);
      toast.error('Failed to save prompt.');
    }
  };
  const handleDelete = async () => {
    if (!promptToDelete) return;
    try {
      await api(`/api/prompts/${promptToDelete.id}`, { method: 'DELETE' });
      toast.success(`Prompt "${promptToDelete.name}" deleted successfully.`);
      setIsDeleteDialogOpen(false);
      setPromptToDelete(null);
      fetchPrompts(); // Refresh list
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      toast.error('Failed to delete prompt.');
    }
  };
  const openEditPromptDialog = (prompt: Prompt) => {
    setCurrentPrompt(prompt);
    setIsFormDialogOpen(true);
  };
  const openDeleteDialog = (prompt: Prompt) => {
    setPromptToDelete(prompt);
    setIsDeleteDialogOpen(true);
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Prompts</CardTitle>
          <CardDescription>
            Create, edit, and manage prompts used for generating reports and insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : prompts.length > 0 ? (
                prompts.map((prompt) => (
                  <TableRow key={prompt.id}>
                    <TableCell className="font-medium">{prompt.name}</TableCell>
                    <TableCell className="text-muted-foreground">{prompt.description}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditPromptDialog(prompt)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog(prompt)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No prompts found. Create one to get started!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentPrompt?.id ? 'Edit Prompt' : 'Create New Prompt'}</DialogTitle>
            <DialogDescription>
              {currentPrompt?.id ? 'Update the details of your prompt.' : 'Add a new prompt to the library.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={currentPrompt?.name || ''}
                onChange={(e) => setCurrentPrompt({ ...currentPrompt, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                value={currentPrompt?.description || ''}
                onChange={(e) => setCurrentPrompt({ ...currentPrompt, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="promptText" className="text-right pt-2">Prompt Text</Label>
              <Textarea
                id="promptText"
                value={currentPrompt?.promptText || ''}
                onChange={(e) => setCurrentPrompt({ ...currentPrompt, promptText: e.target.value })}
                className="col-span-3"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Prompt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the prompt "{promptToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}