import Link from 'next/link';
export function SectionHeading({kicker,title,body,href,label}:{kicker?:string;title:string;body?:string;href?:string;label?:string}) { return <div className="sectionHead"><div><span className="kicker">{kicker}</span><h2>{title}</h2>{body&&<p>{body}</p>}</div>{href&&label&&<Link className="textLink" href={href}>{label}</Link>}</div> }
