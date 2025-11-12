import { createClient } from '@supabase/supabase-js';

// Pegue estas variáveis do ambiente no Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    try {
        // Cria usuário no Supabase Auth
        const { data: userData, error: authError } = await supabase.auth.signUp({
            email,
            password: senha
        });

        if (authError) {
            return res.status(400).json({ message: authError.message });
        }

        // Adiciona dados extras na tabela "profiles" (ou como você nomeou)
        const { error: dbError } = await supabase.from('profiles').insert([
            {
                id: userData.user.id, // usa o mesmo ID do auth
                nome,
                tipo
            }
        ]);

        if (dbError) {
            return res.status(400).json({ message: dbError.message });
        }

        return res.status(200)
