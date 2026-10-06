import { useEffect, useRef } from 'react';
import { X, Star, ArrowRight } from 'lucide-react';
import { Robot } from './Art';

export function Stars({ count = 0, size = 16 }) {
  return <span className="stars" aria-label={`${count} de 3 estrelas`}>{[1, 2, 3].map(n => <Star key={n} size={size} fill={n <= count ? 'currentColor' : 'none'} className={n <= count ? 'earned' : ''}/>)}</span>;
}
export function Brand({ onClick }) {
  return <button className="brand" onClick={onClick} aria-label="Bloco, início"><span className="brand-icon"><Robot/></span><span>bloco<span className="brand-dot">.</span><small>UMA AVENTURA DE APRENDER</small></span></button>;
}
export function Modal({ title, children, onClose, className = '' }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const targets = () => [...ref.current.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')].filter(e => !e.disabled);
    (targets()[0] || ref.current).focus();
    function keydown(e) {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Tab') {
        const all = targets(), first = all[0], last = all.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = originalOverflow; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, []);
  return <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose?.()}><section ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`modal ${className}`}>
    {onClose && <button className="icon-btn modal-close" onClick={onClose} aria-label="Fechar"><X size={21}/></button>}
    {children}
  </section></div>;
}
export function Empty({ title, description, action, onAction }) {
  return <div className="empty-state"><Robot happy/><h3>{title}</h3><p>{description}</p>{action && <button className="btn primary" onClick={onAction}>{action}<ArrowRight size={18}/></button>}</div>;
}
