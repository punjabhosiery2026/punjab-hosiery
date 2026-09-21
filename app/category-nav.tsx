'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';import {categoryHindi,useI18n} from './i18n';

type CategoryNode = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  level: number;
  sort_order: number;
};

const shopUrl = (category: string, subcategory?: string, child?: string) => {
  const params = new URLSearchParams({ category });
  if (subcategory) params.set('subcategory', subcategory);
  if (child) params.set('child_subcategory', child);
  return `/shop?${params.toString()}`;
};

function useCategories() {
  const [nodes, setNodes] = useState<CategoryNode[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(async (response) => (response.ok ? response.json() : []))
      .then((data) => setNodes(Array.isArray(data) ? data : []))
      .catch(() => setNodes([]));
  }, []);

  return nodes;
}

export function DesktopCategoryNav() {
  const nodes = useCategories();
  const {locale,t}=useI18n();const local=(name:string)=>locale==='hi'?(categoryHindi[name]||name):name;
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const roots = useMemo(() => nodes.filter((node) => node.level === 1), [nodes]);
  const childrenFor = (parentId: string) => nodes.filter((node) => node.parent_id === parentId);

  return (
    <nav className="main-nav" aria-label="Shop categories" onMouseLeave={() => setActiveMenu(null)}>
      {roots.map((root) => {
        const children = childrenFor(root.id);
        const isOpen = activeMenu === root.id;
        return (
          <div className="nav-dropdown" key={root.id} onMouseEnter={() => setActiveMenu(root.id)}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="menu"
              onClick={() => setActiveMenu(isOpen ? null : root.id)}
            >
              {local(root.name)}<span aria-hidden="true">⌄</span>
            </button>
            {isOpen && (
              <div className="mega-panel" role="menu" aria-label={`${root.name} categories`}>
                <Link className="mega-all" href={shopUrl(root.name)} role="menuitem" onClick={() => setActiveMenu(null)}>
                  {t('nav.shopAll')} {local(root.name)} →
                </Link>
                <div className="mega-links">
                  {children.map((child) => {
                    const grandChildren = childrenFor(child.id);
                    return (
                      <div className="mega-group" key={child.id}>
                        <Link href={shopUrl(root.name, child.name)} role="menuitem" onClick={() => setActiveMenu(null)}>
                          {local(child.name)}
                        </Link>
                        {grandChildren.map((grandChild) => (
                          <Link
                            className="mega-child"
                            href={shopUrl(root.name, child.name, grandChild.name)}
                            key={grandChild.id}
                            role="menuitem"
                            onClick={() => setActiveMenu(null)}
                          >
                            {local(grandChild.name)}
                          </Link>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Link href="/shop?new=true">{t('nav.newArrivals')}</Link>
      <Link className="sale-nav" href="/shop?sale=true">{t('nav.sale')}</Link>
      <Link href="/wholesale">Wholesale</Link>
    </nav>
  );
}

export function MobileCategoryNav() {
  const nodes = useCategories();
  const {locale,t}=useI18n();const local=(name:string)=>locale==='hi'?(categoryHindi[name]||name):name;
  const [isMenuOpen,setIsMenuOpen]=useState(false);
  const menuRef=useRef<HTMLDivElement>(null);
  const menuButtonRef=useRef<HTMLButtonElement>(null);
  const roots = useMemo(() => nodes.filter((node) => node.level === 1), [nodes]);
  const childrenFor = (parentId: string) => nodes.filter((node) => node.parent_id === parentId);
  useEffect(()=>{if(!isMenuOpen)return;const outside=(event:MouseEvent)=>{const target=event.target as Node;if(menuRef.current&&!menuRef.current.contains(target)&&menuButtonRef.current&&!menuButtonRef.current.contains(target))setIsMenuOpen(false)};const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setIsMenuOpen(false)};document.addEventListener('mousedown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('mousedown',outside);document.removeEventListener('keydown',escape)}},[isMenuOpen]);
  const close=()=>setIsMenuOpen(false);

  return (
    <div className="mobile-menu">
      <button ref={menuButtonRef} type="button" className="mobile-menu-button" aria-label="Open menu" aria-expanded={isMenuOpen} onClick={()=>setIsMenuOpen(open=>!open)}>☰ <span>Menu</span></button>
      {isMenuOpen&&<div ref={menuRef} className="mobile-menu-panel">
        {roots.map((root) => (
          <details key={root.id} className="mobile-category">
            <summary>{local(root.name)}</summary>
            <Link href={shopUrl(root.name)} onClick={close}>{t('nav.shopAll')} {local(root.name)}</Link>
            {childrenFor(root.id).map((child) => (
              <div key={child.id} className="mobile-subcategory">
                <Link href={shopUrl(root.name, child.name)} onClick={close}>{local(child.name)}</Link>
                {childrenFor(child.id).map((grandChild) => (
                  <Link className="mobile-child" href={shopUrl(root.name, child.name, grandChild.name)} key={grandChild.id} onClick={close}>
                    {local(grandChild.name)}
                  </Link>
                ))}
              </div>
            ))}
          </details>
        ))}
        <Link href="/shop?new=true" onClick={close}>{t('nav.newArrivals')}</Link>
        <Link href="/shop?sale=true" onClick={close}>{t('nav.sale')}</Link>
        <Link href="/wholesale" onClick={close}>Wholesale</Link>
      </div>}
    </div>
  );
}
