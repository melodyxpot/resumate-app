'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2, Plus, X, FileText } from 'lucide-react';
import { Experience, Education, ProjectPortfolio } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [header, setHeader] = useState({
    name: '',
    role: '',
    email: '',
    phoneNumber: '',
    github: '',
    location: '',
    linkedin: '',
    portfolioWebsite: '',
  });
  const [summary, setSummary] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [projectPortfolios, setProjectPortfolios] = useState<ProjectPortfolio[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        
        const response = await fetch('/api/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: {
              data: base64Data.split(',')[1],
              mediaType: file.type,
              filename: file.name,
            },
          }),
        });

        if (!response.ok) throw new Error('Failed to parse resume');

        const { data } = await response.json();
        
        setHeader(data.header);
        setSummary(data.summary);
        setExperiences(data.experiences.map((exp: any, i: number) => ({ ...exp, id: `exp-${i}` })));
        setEducations(data.educations.map((edu: any, i: number) => ({ ...edu, id: `edu-${i}` })));
        setSkills(data.skills || []);
        setProjectPortfolios(data.projectPortfolios?.map((proj: any, i: number) => ({ ...proj, id: `proj-${i}` })) || []);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to parse resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          header,
          summary,
          experiences,
          educations,
          skills,
          projectPortfolios,
        }),
      });

      if (!response.ok) throw new Error('Failed to create project');

      const { project } = await response.json();
      router.push(`/projects/${project._id}`);
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, { id: `exp-${Date.now()}`, jobRole: '', companyName: '', duration: '', summary: '' }]);
  };

  const addEducation = () => {
    setEducations([...educations, { id: `edu-${Date.now()}`, schoolName: '', duration: '', fieldOfStudy: '', credential: '' }]);
  };

  const addPortfolio = () => {
    setProjectPortfolios([...projectPortfolios, { id: `proj-${Date.now()}`, projectName: '', link: '', description: '' }]);
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create New Project</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your resume or fill in your information manually
        </p>
      </div>

      <Dialog open={uploading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center">Parsing Resume</DialogTitle>
            <DialogDescription className="text-center">
              Please wait while we extract information from your resume...
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col justify-center items-center py-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full opacity-20 animate-ping bg-primary"></div>
              <div className="flex relative justify-center items-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                <FileText className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <div className="w-full max-w-xs space-y-2">
              <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-indeterminate-bar"></div>
              </div>
              <p className="text-xs text-center text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Resume (Optional)</CardTitle>
          <CardDescription>
            Upload your existing resume to auto-fill the form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={`flex flex-col gap-2 justify-center items-center px-6 py-10 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-[1.01]' 
                : 'border-border hover:border-primary hover:bg-accent'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('resume-upload')?.click()}
          >
            <div className={`p-3 rounded-full transition-colors ${dragActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {dragActive ? "Drop your file here" : "Click to upload or drag and drop"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF or DOCX (max 5MB)
              </p>
            </div>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Name</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="e.g., Software Engineer Profile"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Header Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={header.name}
                onChange={(e) => setHeader({ ...header, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={header.role}
                onChange={(e) => setHeader({ ...header, role: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={header.email}
                onChange={(e) => setHeader({ ...header, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={header.phoneNumber}
                onChange={(e) => setHeader({ ...header, phoneNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={header.location}
                onChange={(e) => setHeader({ ...header, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={header.github}
                onChange={(e) => setHeader({ ...header, github: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={header.linkedin}
                onChange={(e) => setHeader({ ...header, linkedin: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio Website</Label>
              <Input
                id="portfolio"
                value={header.portfolioWebsite}
                onChange={(e) => setHeader({ ...header, portfolioWebsite: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write a brief professional summary..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Experience</CardTitle>
              <CardDescription>Add your work experience</CardDescription>
            </div>
            <Button type="button" onClick={addExperience} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {experiences.map((exp, idx) => (
              <div key={exp.id} className="p-4 space-y-3 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Experience {idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Job Role"
                  value={exp.jobRole}
                  onChange={(e) => {
                    const newExps = [...experiences];
                    newExps[idx].jobRole = e.target.value;
                    setExperiences(newExps);
                  }}
                />
                <Input
                  placeholder="Company Name"
                  value={exp.companyName}
                  onChange={(e) => {
                    const newExps = [...experiences];
                    newExps[idx].companyName = e.target.value;
                    setExperiences(newExps);
                  }}
                />
                <Input
                  placeholder="Duration (e.g., Jan 2020 - Present)"
                  value={exp.duration}
                  onChange={(e) => {
                    const newExps = [...experiences];
                    newExps[idx].duration = e.target.value;
                    setExperiences(newExps);
                  }}
                />
                <Textarea
                  placeholder="Summary (optional)"
                  value={exp.summary || ''}
                  onChange={(e) => {
                    const newExps = [...experiences];
                    newExps[idx].summary = e.target.value;
                    setExperiences(newExps);
                  }}
                  rows={2}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Education</CardTitle>
              <CardDescription>Add your educational background</CardDescription>
            </div>
            <Button type="button" onClick={addEducation} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {educations.map((edu, idx) => (
              <div key={edu.id} className="p-4 space-y-3 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Education {idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEducations(educations.filter((_, i) => i !== idx))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  placeholder="School Name"
                  value={edu.schoolName}
                  onChange={(e) => {
                    const newEdus = [...educations];
                    newEdus[idx].schoolName = e.target.value;
                    setEducations(newEdus);
                  }}
                />
                <Input
                  placeholder="Field of Study"
                  value={edu.fieldOfStudy}
                  onChange={(e) => {
                    const newEdus = [...educations];
                    newEdus[idx].fieldOfStudy = e.target.value;
                    setEducations(newEdus);
                  }}
                />
                <Input
                  placeholder="Credential (e.g., Bachelor's Degree)"
                  value={edu.credential}
                  onChange={(e) => {
                    const newEdus = [...educations];
                    newEdus[idx].credential = e.target.value;
                    setEducations(newEdus);
                  }}
                />
                <Input
                  placeholder="Duration (e.g., 2016 - 2020)"
                  value={edu.duration}
                  onChange={(e) => {
                    const newEdus = [...educations];
                    newEdus[idx].duration = e.target.value;
                    setEducations(newEdus);
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills & Abilities</CardTitle>
            <CardDescription>Add your technical and soft skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill}>
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    <span className="text-sm">{skill}</span>
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                      className="hover:text-primary/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Project Portfolios</CardTitle>
              <CardDescription>Add your notable projects</CardDescription>
            </div>
            <Button type="button" onClick={addPortfolio} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectPortfolios.map((proj, idx) => (
              <div key={proj.id} className="p-4 space-y-3 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Project {idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setProjectPortfolios(projectPortfolios.filter((_, i) => i !== idx))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Project Name"
                  value={proj.projectName}
                  onChange={(e) => {
                    const newProjs = [...projectPortfolios];
                    newProjs[idx].projectName = e.target.value;
                    setProjectPortfolios(newProjs);
                  }}
                />
                <Input
                  placeholder="Project Link"
                  value={proj.link}
                  onChange={(e) => {
                    const newProjs = [...projectPortfolios];
                    newProjs[idx].link = e.target.value;
                    setProjectPortfolios(newProjs);
                  }}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={proj.description || ''}
                  onChange={(e) => {
                    const newProjs = [...projectPortfolios];
                    newProjs[idx].description = e.target.value;
                    setProjectPortfolios(newProjs);
                  }}
                  rows={2}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
