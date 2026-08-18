import React from 'react';

function inline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return parts.map((part,i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2,-2)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) return <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function Markdown({ text, className = '' }: { text: string; className?: string }) {
  const lines = String(text || '').split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    nodes.push(<ul key={`ul-${nodes.length}`}>{list.map((x,i)=><li key={i}>{inline(x)}</li>)}</ul>);
    list = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (line.startsWith('- ')) { list.push(line.slice(2)); continue; }
    flush();
    if (line.startsWith('### ')) nodes.push(<h3 key={nodes.length}>{inline(line.slice(4))}</h3>);
    else if (line.startsWith('## ')) nodes.push(<h2 key={nodes.length}>{inline(line.slice(3))}</h2>);
    else if (line.startsWith('# ')) nodes.push(<h1 key={nodes.length}>{inline(line.slice(2))}</h1>);
    else nodes.push(<p key={nodes.length}>{inline(line)}</p>);
  }
  flush();
  return <div className={`prose ${className}`}>{nodes}</div>;
}
