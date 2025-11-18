import { generateObject } from 'ai';
import { z } from 'zod';

const experienceSchema = z.object({
  jobRole: z.string(),
  companyName: z.string(),
  duration: z.string(),
  summary: z.string().optional(),
});

const educationSchema = z.object({
  schoolName: z.string(),
  duration: z.string(),
  fieldOfStudy: z.string(),
  credential: z.string(),
});

const projectPortfolioSchema = z.object({
  projectName: z.string(),
  link: z.string(),
  description: z.string().optional(),
});

const resumeSchema = z.object({
  header: z.object({
    name: z.string(),
    role: z.string(),
    email: z.string(),
    phoneNumber: z.string(),
    github: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    portfolioWebsite: z.string().optional(),
  }),
  summary: z.string(),
  experiences: z.array(experienceSchema),
  educations: z.array(educationSchema),
  skills: z.array(z.string()),
  projectPortfolios: z.array(projectPortfolioSchema),
  certifications: z.array(z.string()).optional(),
  awards: z.array(z.string()).optional(),
  publications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const { file } = await req.json();

    const { object } = await generateObject({
      model: 'openai/gpt-5',
      schema: resumeSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all information from this resume document. Parse all sections including header information, summary, work experience, education, skills, project portfolios, and any optional sections like certifications, awards, publications, and languages.',
            },
            {
              type: 'file',
              data: file.data,
              mediaType: file.mediaType,
              filename: file.filename,
            },
          ],
        },
      ],
    });

    return Response.json({ data: object });
  } catch (error) {
    console.error('Resume parsing error:', error);
    return Response.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    );
  }
}
