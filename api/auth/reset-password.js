import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const { token, senha } = req.body;

    if (!token || !senha) {
        return res.status(400).json({ message: 'Token e senha são obrigatórios.' });
    }

    try {
        // Supabase tem função built-in para atualizar senha via token
        const { data, error } = await supabase.auth.updateUser({
            accessToken: token,
            password: senha
        });

        if (error) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(200).json({ message: 'Senha redefinida com sucesso!' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
}
