'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles, Download, X, FileText } from 'lucide-react';
import { Project } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function GenerateResumePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [aboutRole, setAboutRole] = useState('');
  const [aboutCompany, setAboutCompany] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [saveResume, setSaveResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<{
    markdown: string;
    html: string;
    blobUrl: string;
  } | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchSettings();
  }, []);

  const fetchProjects = async () => {
    const response = await fetch('/api/projects');
    const { projects } = await response.json();
    setProjects(projects);
  };

  const fetchSettings = async () => {
    const response = await fetch('/api/user/settings');
    const { user } = await response.json();
    setSaveResume(user.saveResumeByDefault || false);
    if (user.defaultProjectId) {
      setSelectedProject(user.defaultProjectId);
    }
  };


  const handleGenerate = async () => {
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }

    setLoading(true);
    try {
      const project = projects.find((p) => p._id!.toString() === selectedProject);

      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectData: project,
          jobInfo: {
            jobTitle,
            companyName,
            aboutRole,
            aboutCompany,
            requiredSkills,
          },
          shouldSave: saveResume,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate resume');

      const data = await response.json();
      setGeneratedResume(data);

      if (saveResume && data.blobUrl) {
        // This blobUrl is HTML, but we will save it for now.
        // Real PDF saving would require client-side generation and upload.
        await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: selectedProject,
            fileName: `${companyName}-${jobTitle}`,
            blobUrl: data.blobUrl,
            jobInfo: {
              jobTitle,
              companyName,
              jobDescription: aboutRole, // Mapping back for backward compatibility
              requiredSkills: requiredSkills.split('\n').filter(s => s.trim()),
            },
          }),
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = async () => {
    if (!generatedResume) return;

    // Use dynamic import for html2pdf.js since it relies on window
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = document.createElement('div');
    element.innerHTML = generatedResume.html;
    // Add print-specific styles to ensure it looks good
    const style = document.createElement('style');
    style.innerHTML = `
      body { margin: 0; padding: 0; }
      @page { margin: 0; }
    `;
    element.appendChild(style);

    const opt = {
      margin: 0,
      filename: `resume-${companyName.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    } as any;

    // Generate PDF
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Generate Resume</h1>
        <p className="mt-2 text-muted-foreground">
          Create a job-specific resume tailored with AI
        </p>
      </div>

      <Dialog open={loading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center">Generating Resume</DialogTitle>
            <DialogDescription className="text-center">
              AI is analyzing the job description and crafting your resume...
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col justify-center items-center py-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full opacity-20 animate-ping bg-primary"></div>
              <div className="flex relative justify-center items-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                <Sparkles className="w-8 h-8 animate-spin-slow" />
              </div>
            </div>
            <div className="w-full max-w-xs space-y-2">
              <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-indeterminate-bar"></div>
              </div>
              <p className="text-xs text-center text-muted-foreground">Generating professional content...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Project</CardTitle>
              <CardDescription>Choose a profile dataset</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id!.toString()} value={project._id!.toString()}>
                      {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>Enter the job details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutRole">About the Role *</Label>
                <Textarea
                  id="aboutRole"
                  placeholder="Paste description about the role here..."
                  value={aboutRole}
                  onChange={(e) => setAboutRole(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutCompany">About the Company (Optional)</Label>
                <Textarea
                  id="aboutCompany"
                  placeholder="Paste description about the company here..."
                  value={aboutCompany}
                  onChange={(e) => setAboutCompany(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredSkills">Required Skills (Optional)</Label>
                <Textarea
                  id="requiredSkills"
                  placeholder="Paste required skills here..."
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="saveResume"
                  checked={saveResume}
                  onCheckedChange={(checked) => setSaveResume(checked as boolean)}
                />
                <Label htmlFor="saveResume" className="cursor-pointer">
                  Save this resume to my collection
                </Label>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedProject || !jobTitle || !companyName || !aboutRole}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 w-5 h-5" />
                Generate Resume
              </>
            )}
          </Button>
        </div>

        <Card className="h-fit lg:sticky lg:top-8 overflow-hidden">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Your generated resume will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedResume ? (
              <div className="space-y-4">
                <div className="p-4 max-h-[600px] overflow-auto rounded-lg border border-border bg-card">
                  <div
                    className="prose prose-sm max-w-none break-words"
                    dangerouslySetInnerHTML={{ __html: generatedResume.html }}
                  />
                </div>
                <Button onClick={downloadResume} className="w-full">
                  <Download className="mr-2 w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center py-12 text-center text-muted-foreground">
                <Sparkles className="mb-4 w-12 h-12 opacity-50" />
                <p>Fill in the job information and click generate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
