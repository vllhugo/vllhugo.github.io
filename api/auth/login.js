import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido' });

  const { email, senha } = req.body;

  if (!email || !senha) return res.status(400).json({ message: 'Email e senha são obrigatórios' });

  try {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ message: 'Email ou senha inválidos' });

    // Supõe senha armazenada como hash simples (bcrypt recomendado na prática)
    if (user.senha !== senha) return res.status(401).json({ message: 'Email ou senha inválidos' });

    // Gerar token simples (JWT recomendado na prática)
    const accessToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    res.status(200).json({
      accessToken,
      userName: user.nome,
      userType: user.tipo // ex: 'dono' ou 'cliente'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
}
