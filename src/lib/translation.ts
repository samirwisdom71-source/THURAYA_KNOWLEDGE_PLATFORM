import { createHash } from 'node:crypto';

export function sourceHash(data: Record<string,unknown>) { return createHash('sha256').update(JSON.stringify(data)).digest('hex'); }

export async function translateObjectToEnglish(data: Record<string,unknown>): Promise<Record<string,unknown> | null> {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_TRANSLATION_MODEL;
  if (!key || !model) return null;
  const response = await fetch('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{'content-type':'application/json','authorization':`Bearer ${key}`},
    body:JSON.stringify({
      model,
      store:false,
      instructions:'Translate the supplied Arabic CMS JSON to professional natural English. Preserve keys, arrays, URLs, IDs, markdown structure, and proper nouns. Return JSON only. Do not add facts.',
      input:JSON.stringify(data),
      text:{format:{type:'json_object'}},
    }),
  });
  if (!response.ok) throw new Error(`Translation provider failed: ${response.status}`);
  const json = await response.json() as {output_text?:string};
  if (!json.output_text) return null;
  return JSON.parse(json.output_text) as Record<string,unknown>;
}
