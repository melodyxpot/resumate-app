import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { Project } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const projects = await db
      .collection<Project>('projects')
      .find({ userId: user._id!.toString() })
      .sort({ updatedAt: -1 })
      .toArray();

    return Response.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return Response.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectData = await req.json();

    const db = await getDatabase();
    const newProject: Project = {
      ...projectData,
      userId: user._id!.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Project>('projects').insertOne(newProject);
    newProject._id = result.insertedId;

    return Response.json({ project: newProject });
  } catch (error) {
    console.error('Create project error:', error);
    return Response.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
