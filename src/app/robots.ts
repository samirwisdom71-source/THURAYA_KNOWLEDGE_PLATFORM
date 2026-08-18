import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots { const staging=process.env.APP_ENV==='staging'; if(staging)return {rules:{userAgent:'*',disallow:'/'}};return {rules:[{userAgent:'*',allow:'/',disallow:['/admin','/api/admin']}],sitemap:`${process.env.SITE_URL||'https://thuraya-alshamsi.gate-digital.com'}/sitemap.xml`} }
