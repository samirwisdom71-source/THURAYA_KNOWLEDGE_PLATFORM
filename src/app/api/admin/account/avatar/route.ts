import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { audit } from '@/lib/audit';
import { avatarFilePath, publicAvatarUrl, removeAdminAvatar, saveAdminAvatar } from '@/lib/admin-avatar';
import { assertSameOrigin, requireAdminApi } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAdminApi();
    const result = await query<{ avatar_path: string | null }>('SELECT avatar_path FROM admin_users WHERE id=$1', [user.id]);
    const filePath = result.rows[0]?.avatar_path;
    const expected = avatarFilePath(user.id);
    if (!filePath || path.resolve(filePath) !== path.resolve(expected)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const bytes = await fs.readFile(filePath);
    return new NextResponse(bytes, {
      headers: {
        'content-type': 'image/webp',
        'cache-control': 'private, max-age=120',
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized or missing' }, { status: 404 });
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const user = await requireAdminApi();
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'اختاري صورة صالحة.' }, { status: 400 });
    await saveAdminAvatar(user.id, file);
    const fresh = await query<{ updated_at: string }>('SELECT updated_at FROM admin_users WHERE id=$1', [user.id]);
    await audit(user, 'update', 'admin_user', user.id, { avatar: 'replaced' });
    return NextResponse.json({ ok: true, avatarUrl: publicAvatarUrl(fresh.rows[0]?.updated_at) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'تعذر رفع الصورة' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    assertSameOrigin(req);
    const user = await requireAdminApi();
    const result = await query<{ avatar_path: string | null }>('SELECT avatar_path FROM admin_users WHERE id=$1', [user.id]);
    await removeAdminAvatar(user.id, result.rows[0]?.avatar_path);
    await audit(user, 'update', 'admin_user', user.id, { avatar: 'removed' });
    return NextResponse.json({ ok: true, avatarUrl: null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'تعذر حذف الصورة' }, { status: 400 });
  }
}
