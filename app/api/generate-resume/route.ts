import { generateText } from 'ai';
import { put } from '@vercel/blob';
import { marked } from 'marked';

export async function POST(req: Request) {
  try {
    const { projectData, jobInfo, shouldSave, userId } = await req.json();

    // Construct the prompt with the new fields
    const prompt = `You are an expert resume writer. Create a perfectly tailored resume in Markdown format for the following job application:

Job Title: ${jobInfo.jobTitle}
Company: ${jobInfo.companyName}

About the Role:
${jobInfo.aboutRole}

${jobInfo.aboutCompany ? `About the Company:\n${jobInfo.aboutCompany}\n` : ''}

${jobInfo.requiredSkills ? `Required Skills:\n${jobInfo.requiredSkills}\n` : ''}

Using this candidate's profile:
Name: ${projectData.header.name}
Role: ${projectData.header.role}
Contact: ${projectData.header.email} | ${projectData.header.phoneNumber}
${projectData.header.location ? `Location: ${projectData.header.location}` : ''}
${projectData.header.github ? `GitHub: ${projectData.header.github}` : ''}
${projectData.header.linkedin ? `LinkedIn: ${projectData.header.linkedin}` : ''}
${projectData.header.portfolioWebsite ? `Portfolio: ${projectData.header.portfolioWebsite}` : ''}

Summary: ${projectData.summary}

Experience:
${projectData.experiences.map((exp: any) => `- ${exp.jobRole} at ${exp.companyName} (${exp.duration})${exp.summary ? '\n  ' + exp.summary : ''}`).join('\n')}

Education:
${projectData.educations.map((edu: any) => `- ${edu.credential} in ${edu.fieldOfStudy}, ${edu.schoolName} (${edu.duration})`).join('\n')}

Skills: ${projectData.skills.join(', ')}

Projects:
${projectData.projectPortfolios.map((proj: any) => `- ${proj.projectName} (${proj.link})${proj.description ? '\n  ' + proj.description : ''}`).join('\n')}

${projectData.certifications && projectData.certifications.length > 0 ? `Certifications: ${projectData.certifications.join(', ')}` : ''}
${projectData.awards && projectData.awards.length > 0 ? `Awards: ${projectData.awards.join(', ')}` : ''}
${projectData.languages && projectData.languages.length > 0 ? `Languages: ${projectData.languages.join(', ')}` : ''}

Create a professional, ATS-optimized resume that:
1. Highlights relevant experience matching the job requirements (using the "About the Role" and "About the Company" details)
2. Emphasizes skills that match the required skills (if provided)
3. Uses strong action verbs and quantifiable achievements
4. Is formatted cleanly with clear sections
5. Tailors the summary to the specific role and company culture
6. Returns ONLY the Markdown content, no explanations or additional text

Format the resume in clean Markdown with proper headers (# for Name, ## for Sections, ### for Job Titles) and lists.`;

    const { text } = await generateText({
      model: 'openai/gpt-5',
      prompt,
      maxOutputTokens: 4000,
    });

    // Parse Markdown to HTML
    const bodyContent = marked.parse(text);

    // Professional Resume CSS Template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume - ${projectData.header.name}</title>
  <style>
    @page {
      margin: 0;
      size: A4;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #1f2937;
      max-width: 210mm;
      margin: 0 auto;
      padding: 15mm 20mm;
      box-sizing: border-box;
      background: white;
    }
    
    /* Typography */
    h1 {
      font-size: 28pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
      color: #111827;
      text-align: center;
      border-bottom: none;
    }
    
    h2 {
      font-size: 14pt;
      text-transform: uppercase;
      border-bottom: 2px solid #e5e7eb;
      margin-top: 24px;
      margin-bottom: 12px;
      padding-bottom: 4px;
      font-weight: 700;
      color: #374151;
      letter-spacing: 0.5px;
    }
    
    h3 {
      font-size: 11pt;
      font-weight: 700;
      margin-top: 12px;
      margin-bottom: 2px;
      color: #111827;
    }
    
    p {
      margin: 4px 0;
      font-size: 10.5pt;
    }
    
    /* Header Contact Info */
    h1 + p, h1 + p + p, h1 + ul {
      text-align: center;
      font-size: 10pt;
      color: #4b5563;
      margin-bottom: 20px;
    }

    /* Links */
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }

    /* Lists */
    ul {
      margin: 4px 0 8px 0;
      padding-left: 1.2em;
    }
    
    li {
      margin-bottom: 3px;
      font-size: 10.5pt;
      line-height: 1.4;
    }
    
    /* Skills section specifically */
    h2:contains("Skills") + p {
      line-height: 1.6;
    }

    /* Specific markdown adjustments */
    strong {
      font-weight: 600;
      color: #111827;
    }

    /* Print Optimization */
    @media print {
      body {
        width: 100%;
        padding: 0;
        margin: 1cm;
      }
      @page {
        margin: 1cm;
      }
      a {
        color: #000;
        text-decoration: none;
      }
    }
  </style>
</head>
<body>
  <div class="resume-content">
    ${bodyContent}
  </div>
</body>
</html>`;


    let blobUrl = '';
    
    if (shouldSave) {
      const fileName = `resume-${jobInfo.companyName.replace(/\s+/g, '-')}-${Date.now()}.html`;
      const blob = await put(fileName, htmlContent, {
        access: 'public',
        contentType: 'text/html',
      });
      blobUrl = blob.url;
    }

    return Response.json({
      markdown: text,
      html: htmlContent,
      blobUrl,
    });
  } catch (error) {
    console.error('Resume generation error:', error);
    return Response.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
}
