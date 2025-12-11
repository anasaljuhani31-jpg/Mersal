const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// قاعدة بيانات مؤقتة
let requestsDB = [];
let idCounter = 1;

// استقبال طلب جديد
app.post('/api/requests', (req, res) => {
    const { housingType, services } = req.body;
    
    // محاكاة حفظ البيانات
    setTimeout(() => {
        const newRequest = {
            id: idCounter++,
            housingType, 
            services,    
            status: 'قيد المعالجة', 
            date: new Date().toLocaleDateString('ar-SA')
        };
        requestsDB.push(newRequest);
        res.json({ success: true, message: 'تم الإرسال بنجاح' });
    }, 500);
});

// جلب الطلبات
app.get('/api/requests', (req, res) => {
    res.json(requestsDB);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});