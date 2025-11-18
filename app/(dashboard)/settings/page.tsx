'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { Project, User } from '@/types';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [defaultProjectId, setDefaultProjectId] = useState<string>('none');
  const [saveResumeByDefault, setSaveResumeByDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [userRes, projectsRes] = await Promise.all([
      fetch('/api/user/settings'),
      fetch('/api/projects'),
    ]);

    const { user } = await userRes.json();
    const { projects } = await projectsRes.json();

    setUser(user);
    setProjects(projects);
    setDefaultProjectId(user.defaultProjectId || 'none');
    setSaveResumeByDefault(user.saveResumeByDefault || false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultProjectId: defaultProjectId === 'none' ? undefined : defaultProjectId,
          saveResumeByDefault,
        }),
      });

      alert('Settings saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account preferences
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <p className="text-foreground">{user.name}</p>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-foreground">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume Generation Preferences</CardTitle>
            <CardDescription>Configure default settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultProject">Default Project</Label>
              <Select value={defaultProjectId} onValueChange={setDefaultProjectId}>
                <SelectTrigger id="defaultProject">
                  <SelectValue placeholder="No default project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No default project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project._id!.toString()} value={project._id!.toString()}>
                      {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This project will be pre-selected when generating resumes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="saveByDefault"
                checked={saveResumeByDefault}
                onCheckedChange={(checked) => setSaveResumeByDefault(checked as boolean)}
              />
              <Label htmlFor="saveByDefault" className="cursor-pointer">
                Save generated resumes by default
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
