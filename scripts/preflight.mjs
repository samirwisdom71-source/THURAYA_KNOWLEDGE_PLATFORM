import './load-env.mjs';
const env=process.env.APP_ENV||'development';
const errors=[]; const warnings=[];
if(!process.env.DATABASE_URL) errors.push('DATABASE_URL is required');
if(env==='production'){
  if(!/^https:\/\//.test(process.env.SITE_URL||'')) errors.push('Production SITE_URL must use https://');
  if(process.env.CAPTCHA_MODE!=='required') errors.push('Production CAPTCHA_MODE must be required');
  if(!process.env.TURNSTILE_SITE_KEY||!process.env.TURNSTILE_SECRET_KEY) errors.push('Production Turnstile site/secret keys are required');
  if(/REPLACE_WITH_|changeme|example/i.test(`${process.env.TURNSTILE_SITE_KEY||''} ${process.env.TURNSTILE_SECRET_KEY||''}`)) errors.push('Replace Turnstile placeholder keys with a real widget for this hostname');
}
if(process.env.AUTO_TRANSLATE_ON_PUBLISH==='true'&&!process.env.OPENAI_API_KEY) warnings.push('AUTO_TRANSLATE_ON_PUBLISH=true but OPENAI_API_KEY is missing; translations will remain pending/failed.');
if(errors.length){console.error('PREFLIGHT FAILED');for(const e of errors)console.error(`- ${e}`);process.exit(1)}
for(const w of warnings)console.warn(`WARN: ${w}`);
console.log(`Preflight passed (${env}).`);
