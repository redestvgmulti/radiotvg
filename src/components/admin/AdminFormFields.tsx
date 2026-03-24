import { useRef } from 'react';
import { Loader2, Upload, ImageIcon, X } from 'lucide-react';

export const InputField = ({ label, value, onChange, placeholder, type = 'text', className = '' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string }) => (
  <div>
    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1 block">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors ${className}`} />
  </div>
);

export const TextAreaField = ({ label, value, onChange, placeholder, className = '', rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string; rows?: number }) => (
  <div>
    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1 block">{label}</label>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className={`w-full py-2 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors resize-y ${className}`} />
  </div>
);

export const ImageUploadField = ({ imageUrl, onUrlChange, uploadKey, label = 'Imagem', uploading, onUpload, accept = 'image/*' }: { imageUrl: string; onUrlChange: (url: string) => void; uploadKey: string; label?: string; uploading: string | null; onUpload: (file: File, key: string) => Promise<string | null>; accept?: string }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (file) { 
        const url = await onUpload(file, uploadKey); 
        if (url) onUrlChange(url); 
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">{label}</label>
      <div 
        onClick={() => !imageUrl && fileRef.current?.click()}
        className={`relative w-full h-36 rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all ${
          imageUrl ? 'border-transparent shadow-sm' : 'border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 cursor-pointer'
        }`}
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); onUrlChange(''); }} 
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-red-500 flex items-center justify-center shadow-sm hover:bg-white hover:text-red-600 hover:scale-105 transition-all"
              title="Remover imagem"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            {uploading === uploadKey ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                <span className="text-xs text-blue-600 font-semibold">Enviando imagem...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                  <Upload className="h-5 w-5 text-slate-400" />
                </div>
                <span className="text-sm font-semibold text-slate-700 mb-1">Clique para enviar uma imagem</span>
                <span className="text-[11px] text-slate-500">Recomendado: 800 x 400px • Máx: 5MB</span>
              </>
            )}
          </div>
        )}
      </div>
      <input type="file" accept={accept} ref={fileRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
};
