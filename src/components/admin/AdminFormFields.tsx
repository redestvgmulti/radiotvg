import { useRef } from 'react';
import { Loader2, Upload, ImageIcon, X } from 'lucide-react';

export const InputField = ({ label, value, onChange, placeholder, type = 'text', className = '' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string }) => (
  <div>
    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1 block">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors ${className}`} />
  </div>
);

export const ImageUploadField = ({ imageUrl, onUrlChange, uploadKey, label = 'Imagem', uploading, onUpload, accept = 'image/*' }: { imageUrl: string; onUrlChange: (url: string) => void; uploadKey: string; label?: string; uploading: string | null; onUpload: (file: File, key: string) => Promise<string | null>; accept?: string }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">{label}</label>
      {imageUrl ? (
        <div className="relative inline-block">
          <img src={imageUrl} alt="" className="h-14 w-auto rounded-lg border border-slate-100 object-contain bg-slate-50" />
          <button onClick={() => onUrlChange('')} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm"><X className="h-2.5 w-2.5" /></button>
        </div>
      ) : (
        <div className="h-14 w-24 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50"><ImageIcon className="h-4 w-4 text-slate-300" /></div>
      )}
      <input type="file" accept={accept} ref={fileRef} className="hidden"
        onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const url = await onUpload(file, uploadKey); if (url) onUrlChange(url); } }} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading === uploadKey}
        className="h-8 px-3 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center gap-1.5 disabled:opacity-60 hover:bg-slate-200 transition-colors">
        {uploading === uploadKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        {uploading === uploadKey ? 'Enviando...' : 'Upload'}
      </button>
    </div>
  );
};
