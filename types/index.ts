import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  defaultProjectId?: string;
  saveResumeByDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Experience {
  id: string;
  jobRole: string;
  companyName: string;
  duration: string;
  summary?: string;
}

export interface Education {
  id: string;
  schoolName: string;
  duration: string;
  fieldOfStudy: string;
  credential: string;
}

export interface ProjectPortfolio {
  id: string;
  projectName: string;
  link: string;
  description?: string;
}

export interface Project {
  _id?: ObjectId;
  userId: string;
  projectName: string;
  header: {
    name: string;
    role: string;
    email: string;
    phoneNumber: string;
    github?: string;
    location?: string;
    linkedin?: string;
    portfolioWebsite?: string;
  };
  summary: string;
  experiences: Experience[];
  educations: Education[];
  skills: string[];
  projectPortfolios: ProjectPortfolio[];
  certifications?: string[];
  awards?: string[];
  publications?: string[];
  languages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedResume {
  _id?: ObjectId;
  userId: string;
  projectId: string;
  fileName: string;
  blobUrl: string;
  jobInfo: {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    requiredSkills: string[];
  };
  createdAt: Date;
}
