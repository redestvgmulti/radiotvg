import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Plus, Trash2, Loader2, GripVertical, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InstaPost {
  id: string;
  post_url: string;
  thumbnail_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const MAX_POSTS = 6;

const cleanInstagramUrl = (raw: string): string | null => {
  try {
    const url = new URL(raw.trim());
    const match = url.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
    if (!match) return null;
    return `https://www.instagram.com/${match[1]}/${match[2]}/`;
  } catch { return null; }
};

const AdminInstagram = () => {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    const { data } = await supabase.from('instagram_posts').select('*').order('sort_order');
    setPosts((data as InstaPost[]) || []); setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const addPost = async () => {
    const cleanUrl = cleanInstagramUrl(newUrl);
    if (!cleanUrl) { toast({ title: 'URL inválida', description: 'Cole uma URL válida do Instagram (/p/... ou /reel/...)', variant: 'destructive' }); return; }
    if (posts.some(p => p.post_url === cleanUrl)) { toast({ title: 'Post duplicado', description: 'Esse post já está cadastrado.', variant: 'destructive' }); return; }
    setAdding(true);
    if (posts.length >= MAX_POSTS) { const oldest = posts[posts.length - 1]; await supabase.from('instagram_posts').delete().eq('id', oldest.id); }
    const { error } = await supabase.from('instagram_posts').insert({ post_url: cleanUrl, sort_order: 0 });
    if (!error) {
      const currentPosts = posts.filter(p => posts.length < MAX_POSTS || p.id !== posts[posts.length - 1].id);
      for (let i = 0; i < currentPosts.length; i++) { await supabase.from('instagram_posts').update({ sort_order: i + 1 }).eq('id', currentPosts[i].id); }
    }
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Post adicionado' }); setNewUrl(''); }
    await fetchPosts(); setAdding(false);
  };

  const removePost = async (id: string) => { await supabase.from('instagram_posts').delete().eq('id', id); toast({ title: 'Post removido' }); fetchPosts(); };
  const toggleActive = async (id: string, active: boolean) => { await supabase.from('instagram_posts').update({ is_active: !active }).eq('id', id); fetchPosts(); };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <button onClick={() => navigate('/admin')} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center shadow-sm">
            <Instagram className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Instagram</h1>
            <p className="text-[10px] text-slate-400">Posts do Instagram na home</p>
          </div>
        </div>
      </div>

      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 space-y-4">
        <p className="text-xs text-slate-500">
          Cole a URL do post do Instagram. O embed será exibido automaticamente na home. Máximo de {MAX_POSTS} posts — ao adicionar um novo, o mais antigo será removido.
        </p>

        {/* Add new */}
        <div className="flex gap-2">
          <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://www.instagram.com/p/... ou /reel/..."
            className="flex-1 h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors" />
          <button onClick={addPost} disabled={adding || !newUrl.trim()}
            className="h-9 px-4 rounded-lg bg-rose-500 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 hover:bg-rose-600 transition-colors shadow-sm">
            {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Adicionar
          </button>
        </div>

        <p className="text-[10px] text-slate-400">{posts.length}/{MAX_POSTS} posts cadastrados</p>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-white border border-dashed border-slate-200">
            <Instagram className="h-8 w-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Nenhum post cadastrado.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <GripVertical className="h-4 w-4 text-slate-300 flex-shrink-0" />
                <p className="flex-1 text-xs text-slate-700 truncate font-mono">{post.post_url}</p>
                <button onClick={() => toggleActive(post.id, post.is_active)}
                  className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${post.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {post.is_active ? 'Ativo' : 'Inativo'}
                </button>
                <button onClick={() => removePost(post.id)} className="h-8 w-8 rounded-lg bg-slate-100 text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminInstagram;
