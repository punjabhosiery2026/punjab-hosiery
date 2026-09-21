'use client';
import {useI18n} from './i18n';
export default function LanguageSelector(){const{locale,setLocale}=useI18n();return <label className="language-selector"><span className="sr-only">Language</span><select value={locale} onChange={event=>setLocale(event.target.value as 'en'|'hi')} aria-label="Language"><option value="en">English</option><option value="hi">हिंदी</option></select></label>}
