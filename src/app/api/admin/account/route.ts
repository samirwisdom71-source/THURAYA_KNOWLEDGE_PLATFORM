import { NextResponse } from 'next/server';
import { assertSameOrigin, authenticateAdmin, hashAdminPassword, requireAdminApi } from '@/lib/auth';
import { query } from '@/lib/db';
import { audit } from '@/lib/audit';

export async function PATCH(req:Request){
  try{
    assertSameOrigin(req); const user=await requireAdminApi(); const b=await req.json();
    const name=String(b.name||'').trim(); const email=String(b.email||'').trim().toLowerCase(); const currentPassword=String(b.currentPassword||''); const newPassword=String(b.newPassword||'');
    if(name.length<2||!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({error:'تحقق من الاسم والبريد.'},{status:400});
    const verified=await authenticateAdmin(user.email,currentPassword); if(!verified)return NextResponse.json({error:'كلمة المرور الحالية غير صحيحة.'},{status:403});
    if(newPassword&&newPassword.length<12)return NextResponse.json({error:'كلمة المرور الجديدة يجب أن تكون 12 حرفًا على الأقل.'},{status:400});
    if(newPassword) await query('UPDATE admin_users SET name=$2,email=$3,password_hash=$4,updated_at=now() WHERE id=$1',[user.id,name,email,hashAdminPassword(newPassword)]);
    else await query('UPDATE admin_users SET name=$2,email=$3,updated_at=now() WHERE id=$1',[user.id,name,email]);
    await audit(user,'update','admin_user',user.id,{name,email,password_changed:Boolean(newPassword)});
    return NextResponse.json({ok:true});
  }catch(e){const code=(e as {code?:string}).code;return NextResponse.json({error:code==='23505'?'البريد مستخدم لحساب آخر.':(e instanceof Error?e.message:'Invalid request')},{status:(e as any)?.status||400});}
}
