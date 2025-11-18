import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { SavedResume } from '@/types';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const resumes = await db
      .collection<SavedResume>('resumes')
      .find({ userId: user._id!.toString() })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({ resumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    return Response.json(
      { error: 'Failed to fetch resumes' },
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

    const resumeData = await req.json();

    const db = await getDatabase();
    const newResume: SavedResume = {
      ...resumeData,
      userId: user._id!.toString(),
      createdAt: new Date(),
    };

    const result = await db.collection<SavedResume>('resumes').insertOne(newResume);
    newResume._id = result.insertedId;

    return Response.json({ resume: newResume });
  } catch (error) {
    console.error('Save resume error:', error);
    return Response.json(
      { error: 'Failed to save resume' },
      { status: 500 }
    );
  }
}
