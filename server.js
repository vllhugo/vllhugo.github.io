import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // serve index.html, login.html, script.js

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const JWT_SECRET = 'minha_chave_secreta'; // pode gerar aleatória

// --- 1. Endpoint login ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.admin.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ message: error.message });

    // Cria JWT simples para frontend
    const token = jwt.sign({ id: data.user.id, email: data.user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { email: data.user.email } });
});

// --- 2. Middleware para validar token ---
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token ausente' });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token inválido' });
    }
}

// --- 3. Endpoint para quadras ---
app.get('/api/quadras', authenticate, async (req, res) => {
    const { data, error } = await supabase.from('quadras').select('*');
    if (error) return res.status(500).json({ message: error.message });
    res.json({ quadras: data });
});

// --- 4. Endpoint para horários (exemplo simples) ---
app.post('/api/horarios-multi', authenticate, async (req, res) => {
    const { quadraId, dates } = req.body;
    // Aqui você faria consulta ao Supabase para buscar horários disponíveis
    // Exemplo fake para teste:
    const horariosComuns = ['08:00', '09:00', '10:00'];
    res.json({ horariosComuns });
});

// --- 5. Endpoint para reservas ---
app.post('/api/reservas', authenticate, async (req, res) => {
    const { reservas } = req.body;
    try {
        const { data, error } = await supabase.from('reservas').insert(reservas);
        if (error) return res.status(400).json({ message: error.message, details: reservas.map(r => ({ ...r, success: false, message: error.message })) });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 6. Inicia servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
