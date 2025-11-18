import { generateText } from 'ai';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const { projectData, jobInfo, shouldSave, userId } = await req.json();

    const prompt = `You are an expert resume writer. Create a perfectly tailored resume in Markdown format for the following job application:

Job Title: ${jobInfo.jobTitle}
Company: ${jobInfo.companyName}
Job Description: ${jobInfo.jobDescription}
Required Skills: ${jobInfo.requiredSkills.join(', ')}

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
1. Highlights relevant experience matching the job requirements
2. Emphasizes skills that match the required skills
3. Uses strong action verbs and quantifiable achievements
4. Is formatted cleanly with clear sections
5. Tailors the summary to the specific role
6. Returns ONLY the Markdown content, no explanations or additional text

Format the resume in clean Markdown with proper headers and formatting.`;

    const { text } = await generateText({
      model: 'openai/gpt-5',
      prompt,
      maxOutputTokens: 4000,
    });

    // Convert Markdown to basic HTML for PDF generation
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 { font-size: 28px; margin-bottom: 10px; color: #1a1a1a; }
    h2 { font-size: 20px; margin-top: 30px; margin-bottom: 15px; color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
    h3 { font-size: 16px; margin-bottom: 8px; color: #1a1a1a; }
    p { margin: 8px 0; }
    ul { margin: 10px 0; padding-left: 20px; }
    li { margin: 5px 0; }
    strong { color: #1a1a1a; }
  </style>
</head>
<body>
${text.replace(/\n/g, '<br>').replace(/#{3}\s/g, '<h3>').replace(/#{2}\s/g, '<h2>').replace(/#{1}\s/g, '<h1>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
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
