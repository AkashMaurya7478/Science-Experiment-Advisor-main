const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for experiment suggestions
app.post('/get-response', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // Here you would typically call your AI service
        // For now, we'll return a mock response
        const response = {
            response: `Here's a simple experiment you can do with ${prompt}:\n\n1. Mix the materials together\n2. Observe the reaction\n3. Record your findings\n\nRemember to follow safety guidelines!`
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 