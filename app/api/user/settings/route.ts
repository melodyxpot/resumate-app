import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { User } from '@/types';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error('Get user settings error:', error);
    return Response.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();

    const db = await getDatabase();
    const result = await db.collection<User>('users').findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return Response.json({ user: result });
  } catch (error) {
    console.error('Update user settings error:', error);
    return Response.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    );
  }
}
