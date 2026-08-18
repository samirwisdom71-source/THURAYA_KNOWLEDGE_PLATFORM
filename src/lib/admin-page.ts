import { redirect } from 'next/navigation'; import { getAdminUser } from './auth';
export async function requireAdminPage(){const user=await getAdminUser();if(!user)redirect('/admin/login');return user}
