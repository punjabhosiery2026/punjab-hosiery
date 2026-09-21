'use client';

import {useEffect} from 'react';

/** Adds reveal classes after hydration, keeping the initial server render visible. */
export default function ScrollReveal(){
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const targets=[...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    if(!targets.length)return;
    document.documentElement.classList.add('motion-ready');
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.12,rootMargin:'0px 0px -36px'});
    targets.forEach((target,index)=>{
      target.style.setProperty('--reveal-delay',`${Math.min(index%4,3)*55}ms`);
      observer.observe(target);
    });
    return()=>observer.disconnect();
  },[]);
  return null;
}
