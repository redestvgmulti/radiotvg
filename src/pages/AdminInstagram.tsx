import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Plus, Trash2, Loader2, GripVertical } from 'lucide-react';
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

/** Limpa a URL do Instagram removendo query params e trailing slashes */
const cleanInstagramUrl = (raw: string): string | null => {
  try {
    const url = new URL(raw.trim());
    // Aceita /p/CODE/ ou /reel/CODE/
    const match = url.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
    if (!match) return null;
    return `https://www.instagram.com/${match[1]}/${match[2]}/`;
  } catch {
    return null;
  }
};

const AdminInstagram = () => {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('instagram_posts')
      .select('*')
      .order('sort_order');
    setPosts((data as InstaPost[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const addPost = async () => {
    const cleanUrl = cleanInstagramUrl(newUrl);
    if (!cleanUrl) {
      toast({ title: 'URL inválida', description: 'Cole uma URL válida do Instagram (/p/... ou /reel/...)', variant: 'destructive' });
      return;
    }

    // Check for duplicates
    if (posts.some(p => p.post_url === cleanUrl)) {
      toast({ title: 'Post duplicado', description: 'Esse post já está cadastrado.', variant: 'destructive' });
      return;
    }

    setAdding(true);

    // If at limit, delete the oldest (highest sort_order)
    if (posts.length >= MAX_POSTS) {
      const oldest = posts[posts.length - 1];
      await supabase.from('instagram_posts').delete().eq('id', oldest.id);
    }

    const { error } = await supabase.from('instagram_posts').insert({
      post_url: cleanUrl,
      sort_order: 0, // newest first
    });

    if (!error) {
      // Re-order: shift all existing sort_orders up by 1
      const currentPosts = posts.filter(p => posts.length < MAX_POSTS || p.id !== posts[posts.length - 1].id);
      for (let i = 0; i < currentPosts.length; i++) {
        await supabase.from('instagram_posts').update({ sort_order: i + 1 }).eq('id', currentPosts[i].id);
      }
    }

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Post adicionado' });
      setNewUrl('');
    }
    await fetchPosts();
    setAdding(false);
  };

  const removePost = async (id: string) => {
    await supabase.from('instagram_posts').delete().eq('id', id);
    toast({ title: 'Post removido' });
    fetchPosts();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('instagram_posts').update({ is_active: !active }).eq('id', id);
    fetchPosts();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Instagram className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-display font-bold text-foreground">Instagram</h1>
      </div>

      <p className="text-xs text-muted-foreground">
        Cole a URL do post do Instagram. O embed será exibido automaticamente na home. Máximo de {MAX_POSTS} posts — ao adicionar um novo, o mais antigo será removido.
      </p>

      {/* Add new */}
      <div className="flex gap-2">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://www.instagram.com/p/... ou /reel/..."
          className="flex-1 h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <motion.button whileTap={{ scale: 0.95 }} onClick={addPost} disabled={adding || !newUrl.trim()}
          className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5">
          {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Adicionar
        </motion.button>
      </div>

      <p className="text-[10px] text-muted-foreground/60">{posts.length}/{MAX_POSTS} posts cadastrados</p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-border">
          <Instagram className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Nenhum post cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-card border border-border">
              <GripVertical className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
              <p className="flex-1 text-xs text-foreground truncate">{post.post_url}</p>
              <button onClick={() => toggleActive(post.id, post.is_active)}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${post.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                {post.is_active ? 'Ativo' : 'Inativo'}
              </button>
              <button onClick={() => removePost(post.id)} className="p-1.5 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInstagram;
