import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { SavedResume } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Building, ExternalLink } from 'lucide-react';

export default async function ResumesPage() {
  const user = await getCurrentUser();
  const db = await getDatabase();

  const resumes = await db
    .collection<SavedResume>('resumes')
    .find({ userId: user!._id!.toString() })
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Saved Resumes</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your generated resumes
        </p>
      </div>

      {resumes.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardTitle>No saved resumes yet</CardTitle>
            <CardDescription>
              Generate your first job-specific resume to see it here
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume._id!.toString()} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{resume.fileName}</CardTitle>
                    <CardDescription className="mt-1">
                      {resume.jobInfo.jobTitle}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="w-4 h-4" />
                    <span>{resume.jobInfo.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button asChild className="w-full mt-4">
                  <a
                    href={resume.blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 w-4 h-4" />
                    View Resume
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
