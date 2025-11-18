import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, FolderOpen, Calendar, User } from 'lucide-react';

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  const db = await getDatabase();

  const projects = await db
    .collection<Project>('projects')
    .find({ userId: user!._id!.toString() })
    .sort({ updatedAt: -1 })
    .toArray();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your profile datasets for resume generation
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 w-4 h-4" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <FolderOpen className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription>
              Create your first project to start generating job-specific resumes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 w-4 h-4" />
                Create Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project._id!.toString()}
              href={`/projects/${project._id!.toString()}`}
            >
              <Card className="h-full transition-shadow cursor-pointer hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-primary/10">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.projectName}</CardTitle>
                      <CardDescription className="mt-1">
                        {project.header.role}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Updated{' '}
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="pt-2 text-foreground">
                      <p className="text-xs text-muted-foreground">
                        {project.experiences.length} experiences •{' '}
                        {project.educations.length} education •{' '}
                        {project.skills.length} skills
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
