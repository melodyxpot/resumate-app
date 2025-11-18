import { getDatabase } from '@/lib/mongodb';
import { Project } from '@/types';
import { ObjectId } from 'mongodb';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar, 
  Building,
  GraduationCap,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const db = await getDatabase();
  const project = await db
    .collection<Project>('projects')
    .findOne({ _id: new ObjectId(id) });

  if (!project) {
    notFound();
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Navigation and Title */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button variant="ghost" asChild className="pl-0 mb-2 hover:bg-transparent hover:text-primary">
            <Link href="/projects">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Projects
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{project.projectName}</h1>
          <p className="text-muted-foreground">
            Created on {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
             {/* Note: edit page probably doesn't exist yet, but linking for future */}
            <Link href={`/projects/${id}/edit`}>
              <Pencil className="mr-2 w-4 h-4" />
              Edit Project
            </Link>
          </Button>
          {/* Delete functionality would likely be a client component or server action, skipping for this read-only view */}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Personal Info & Skills */}
        <div className="space-y-6 lg:col-span-1">
          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold">{project.header.name}</span>
                <span className="text-sm text-muted-foreground">{project.header.role}</span>
              </div>
              
              <Separator />
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${project.header.email}`} className="hover:underline">{project.header.email}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{project.header.phoneNumber}</span>
                </div>
                {project.header.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{project.header.location}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                {project.header.portfolioWebsite && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={project.header.portfolioWebsite} target="_blank" rel="noreferrer" className="hover:underline">Portfolio</a>
                  </div>
                )}
                {project.header.github && (
                  <div className="flex items-center gap-3">
                    <Github className="w-4 h-4 text-muted-foreground" />
                    <a href={project.header.github} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
                  </div>
                )}
                {project.header.linkedin && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-4 h-4 text-muted-foreground" />
                    <a href={project.header.linkedin} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills Card */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

           {/* Languages Card (if exists) */}
           {project.languages && project.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.languages.map((lang, index) => (
                    <Badge key={index} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Experience, Education, etc. */}
        <div className="space-y-6 lg:col-span-2">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {project.summary}
              </p>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {project.experiences.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-muted last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{exp.jobRole}</h3>
                      <p className="text-sm font-medium text-primary">{exp.companyName}</p>
                    </div>
                    <Badge variant="outline" className="mt-1 w-fit sm:mt-0">
                      {exp.duration}
                    </Badge>
                  </div>
                  {exp.summary && (
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                      {exp.summary}
                    </p>
                  )}
                </div>
              ))}
              {project.experiences.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No experience listed.</p>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {project.educations.map((edu) => (
                <div key={edu.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start pb-4 border-b last:border-0 last:pb-0 border-border">
                  <div>
                    <h3 className="font-semibold text-foreground">{edu.schoolName}</h3>
                    <p className="text-sm text-foreground">{edu.credential}</p>
                    <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                  </div>
                  <Badge variant="outline" className="mt-1 w-fit sm:mt-0">
                    {edu.duration}
                  </Badge>
                </div>
              ))}
              {project.educations.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No education listed.</p>
              )}
            </CardContent>
          </Card>

          {/* Projects/Portfolios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {project.projectPortfolios.map((portfolio) => (
                <div key={portfolio.id} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{portfolio.projectName}</h3>
                    {portfolio.link && (
                      <a 
                        href={portfolio.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {portfolio.description && (
                    <p className="text-sm text-muted-foreground">
                      {portfolio.description}
                    </p>
                  )}
                </div>
              ))}
              {project.projectPortfolios.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground italic">No projects listed.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
