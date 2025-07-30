// filepath: /Users/bowang/Desktop/wallstreet/backend/routes/holdings.js
import express from 'express';
import supabase from '../supabase/client.js';
const router = express.Router();

// API to fetch holdings
router.get('/fetchHolding', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('holdings')
            .select();

        if (error) {
            console.error('Error fetching holdings:', error);
            return res.status(500).json({ error: 'Failed to fetch holdings' });
        }

        res.json(data);
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ error: 'Unexpected error occurred' });
    }
});

export default router;