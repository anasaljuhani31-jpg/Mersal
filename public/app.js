// المتغيرات لحفظ البيانات
let currentStep = 1;
let formData = {
    housingType: '',
    services: []
};

// أول ما تشتغل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons(); // تشغيل الأيقونات فوراً
    fetchRequests();      // جلب البيانات
});

// التنقل بين الصفحات الرئيسية (القائمة الجانبية)
function nav(page) {
    // إخفاء كل الصفحات
    ['home', 'new', 'track'].forEach(p => document.getElementById(`view-${p}`).classList.add('hidden'));
    // إظهار الصفحة المطلوبة
    document.getElementById(`view-${page}`).classList.remove('hidden');

    // تلوين الزر النشط في القائمة
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${page}`).classList.add('active');

    // تغيير العنوان
    const titles = {'home': 'الرئيسية', 'new': 'إرسال طلب جديد', 'track': 'متابعة الطلبات'};
    document.getElementById('page-title').innerText = titles[page];

    // إعادة تشغيل الأيقونات لأننا غيرنا الصفحة
    lucide.createIcons();

    if(page === 'new') resetForm();
    if(page === 'track' || page === 'home') fetchRequests();
}

// --- منطق نموذج الطلب (Wizard) ---

// اختيار نوع السكن (الخطوة 1)
function selectHousing(type) {
    formData.housingType = type;
    
    // تغيير ألوان الكروت
    document.querySelectorAll('#step-1 .select-card').forEach(el => el.classList.remove('selected'));
    
    if(type === 'ملكية') document.getElementById('card-owned').classList.add('selected');
    if(type === 'إيجار') document.getElementById('card-rent').classList.add('selected');
}

// اختيار الخدمات (الخطوة 2)
function toggleService(card, name) {
    card.classList.toggle('selected');
    const box = card.querySelector('.checkbox-icon');
    
    if(formData.services.includes(name)) {
        // إزالة الخدمة
        formData.services = formData.services.filter(s => s !== name);
        box.innerHTML = '';
        box.classList.remove('bg-absherGreen', 'border-transparent');
    } else {
        // إضافة الخدمة
        formData.services.push(name);
        box.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i>';
        box.classList.add('bg-absherGreen', 'border-transparent');
        lucide.createIcons(); // تشغيل أيقونة الصح
    }
}

// زر التالي
function nextStep() {
    // التحقق من الخطوة الأولى
    if(currentStep === 1) {
        if(!formData.housingType) {
            alert('⚠️ الرجاء اختيار نوع العقار أولاً');
            return;
        }
    }
    
    // التحقق من الخطوة الثانية
    if(currentStep === 2) {
        if(formData.services.length === 0) {
            alert('⚠️ الرجاء اختيار خدمة واحدة على الأقل');
            return;
        }
    }

    // الإرسال في الخطوة الأخيرة
    if(currentStep === 3) {
        submitForm();
        return;
    }

    currentStep++;
    updateWizardUI();
}

// زر الرجوع
function prevStep() {
    currentStep--;
    updateWizardUI();
}

// تحديث واجهة الخطوات
function updateWizardUI() {
    // إخفاء كل الخطوات وإظهار الحالية
    [1, 2, 3].forEach(i => document.getElementById(`step-${i}`).classList.add('hidden'));
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');

    // تحديث شريط التقدم (الخط الملون)
    const progress = document.getElementById('progress-bar');
    if(currentStep === 1) progress.style.width = '0%';
    if(currentStep === 2) progress.style.width = '50%';
    if(currentStep === 3) progress.style.width = '100%';

    // تحديث ألوان الدوائر (1-2-3)
    for(let i=1; i<=3; i++) {
        const ind = document.getElementById(`ind-${i}`);
        const circle = ind.querySelector('.step-circle');
        const text = ind.querySelector('span');
        
        if(i <= currentStep) {
            circle.classList.remove('text-gray-400');
            circle.classList.add('bg-absherGreen', 'border-absherGreen', 'text-white');
            text.classList.add('text-absherDark', 'font-bold');
            text.classList.remove('text-gray-400');
        } else {
            circle.classList.remove('bg-absherGreen', 'border-absherGreen', 'text-white');
            circle.classList.add('text-gray-400');
            text.classList.remove('text-absherDark', 'font-bold');
            text.classList.add('text-gray-400');
        }
    }

    // التحكم في الأزرار السفلية
    document.getElementById('btn-back').classList.toggle('hidden', currentStep === 1);
    
    const nextBtn = document.getElementById('btn-next');
    if(currentStep === 3) {
        nextBtn.innerHTML = 'إرسال الطلب <i data-lucide="send" class="w-4 h-4"></i>';
        
        // تعبئة صفحة الملخص
        document.getElementById('summary-type').innerText = formData.housingType;
        document.getElementById('summary-services').innerHTML = formData.services.map(s => 
            `<span class="bg-emerald-50 text-absherGreen border border-emerald-100 px-2 py-1 rounded text-xs font-bold">${s}</span>`
        ).join('');
    } else {
        nextBtn.innerHTML = 'التالي <i data-lucide="arrow-left" class="w-4 h-4"></i>';
    }
    
    // مهم جداً: إعادة رسم الأيقونات لأن المحتوى تغير
    lucide.createIcons();
}

function resetForm() {
    currentStep = 1;
    formData = { housingType: '', services: [] };
    // تنظيف الكروت
    document.querySelectorAll('.select-card').forEach(el => {
        el.classList.remove('selected');
        const box = el.querySelector('.checkbox-icon');
        if(box) { box.innerHTML = ''; box.classList.remove('bg-absherGreen', 'border-transparent'); }
    });
    updateWizardUI();
}

// إرسال للباك اند
async function submitForm() {
    const btn = document.getElementById('btn-next');
    btn.innerText = 'جاري الإرسال...';
    btn.disabled = true;

    try {
        await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        alert('✅ تم إرسال الطلب بنجاح');
        nav('track');
    } catch (e) {
        console.error(e);
        alert('حدث خطأ في الاتصال');
    } finally {
        btn.disabled = false;
    }
}

// جلب البيانات للجدول
async function fetchRequests() {
    try {
        const res = await fetch('/api/requests');
        const data = await res.json();
        document.getElementById('stat-total').innerText = data.length;
        
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        data.forEach(req => {
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 transition">
                    <td class="p-6 font-bold text-gray-700">#${req.id}</td>
                    <td class="p-6 font-bold text-gray-800">${req.housingType} <span class="text-xs text-gray-400 mx-2">|</span> ${req.services.join('، ')}</td>
                    <td class="p-6 text-sm text-gray-500">${req.date}</td>
                    <td class="p-6"><span class="bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded text-xs font-bold">${req.status}</span></td>
                </tr>
            `;
        });
    } catch(e) { console.error(e); }
}