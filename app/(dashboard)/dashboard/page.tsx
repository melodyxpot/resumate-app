import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { Project, SavedResume } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, FolderOpen, Sparkles, ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const db = await getDatabase();

  const projectsCount = await db
    .collection<Project>('projects')
    .countDocuments({ userId: user!._id!.toString() });

  const resumesCount = await db
    .collection<SavedResume>('resumes')
    .countDocuments({ userId: user!._id!.toString() });

  const recentProjects = await db
    .collection<Project>('projects')
    .find({ userId: user!._id!.toString() })
    .sort({ updatedAt: -1 })
    .limit(3)
    .toArray();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user!.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create job-specific resumes powered by AI
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectsCount}</div>
            <p className="text-xs text-muted-foreground">Profile datasets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Saved Resumes</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumesCount}</div>
            <p className="text-xs text-muted-foreground">Generated resumes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">AI Powered</CardTitle>
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GPT-5</div>
            <p className="text-xs text-muted-foreground">Latest AI model</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="justify-between w-full">
              <Link href="/projects/new">
                <span>Create New Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between w-full">
              <Link href="/generate">
                <span>Generate Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest profile datasets</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No projects yet. Create your first project to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project._id!.toString()}
                    href={`/projects/${project._id!.toString()}`}
                    className="flex justify-between items-center p-3 rounded-lg transition-colors hover:bg-accent"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {project.projectName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {project.header.role}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
