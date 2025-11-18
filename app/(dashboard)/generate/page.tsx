'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles, Download, X } from 'lucide-react';
import { Project } from '@/types';

export default function GenerateResumePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
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

  const addSkill = () => {
    if (skillInput.trim()) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput('');
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
            jobDescription,
            requiredSkills,
          },
          shouldSave: saveResume,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate resume');

      const data = await response.json();
      setGeneratedResume(data);

      if (saveResume && data.blobUrl) {
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
              jobDescription,
              requiredSkills,
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

  const downloadResume = () => {
    if (!generatedResume) return;

    const blob = new Blob([generatedResume.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${companyName.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Generate Resume</h1>
        <p className="mt-2 text-muted-foreground">
          Create a job-specific resume tailored with AI
        </p>
      </div>

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
                <Label htmlFor="jobDescription">Job Description *</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a required skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                {requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {requiredSkills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary"
                      >
                        <span className="text-sm">{skill}</span>
                        <button
                          type="button"
                          onClick={() => setRequiredSkills(requiredSkills.filter((_, i) => i !== idx))}
                          className="hover:text-primary/70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
            disabled={loading || !selectedProject || !jobTitle || !companyName || !jobDescription}
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

        <Card className="h-fit lg:sticky lg:top-8">
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
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedResume.html }}
                  />
                </div>
                <Button onClick={downloadResume} className="w-full">
                  <Download className="mr-2 w-4 h-4" />
                  Download Resume
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
