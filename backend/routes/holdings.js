// filepath: /Users/bowang/Desktop/wallstreet/backend/routes/holdings.js
import express from 'express';
import supabase from '../supabase/client.js';
const router = express.Router();

// API to fetch holdings (with optional ticker filter)
router.get('/fetchHolding', async (req, res) => {
    const { ticker } = req.query; // Get the ticker from query parameters

    try {
        let query = supabase.from('holdings').select();

        // If a ticker is provided, filter the results
        if (ticker) {
            query = query.eq('ticker', ticker.toUpperCase());
        }

        const { data, error } = await query;

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

// API to fetch company name by ticker
router.get('/tickerCompany/:ticker', async (req, res) => {
    const ticker = req.params.ticker; // Ensure the parameter is correctly accessed

    if (!ticker) {
        return res.status(400).json({ error: 'Ticker parameter is required' });
    }

    try {
        const { data, error } = await supabase
            .from('tickercompany')
            .select('company')
            .eq('ticker', ticker.toUpperCase())
            .single();

        if (error) {
            console.error('Error fetching company name:', error);
            return res.status(500).json({ error: 'Failed to fetch company name' });
        }

        if (!data) {
            return res.status(404).json({ error: 'Ticker not found' });
        }

        res.json(data);
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ error: 'Unexpected error occurred' });
    }
});

export default router;