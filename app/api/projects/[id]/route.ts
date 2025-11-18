import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { Project } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const project = await db.collection<Project>('projects').findOne({
      _id: new ObjectId(id),
      userId: user._id!.toString(),
    });

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    return Response.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return Response.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();

    const db = await getDatabase();
    const result = await db.collection<Project>('projects').findOneAndUpdate(
      {
        _id: new ObjectId(id),
        userId: user._id!.toString(),
      },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    return Response.json({ project: result });
  } catch (error) {
    console.error('Update project error:', error);
    return Response.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const result = await db.collection<Project>('projects').deleteOne({
      _id: new ObjectId(id),
      userId: user._id!.toString(),
    });

    if (result.deletedCount === 0) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return Response.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
