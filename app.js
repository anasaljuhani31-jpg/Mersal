// المتغيرات لحفظ البيانات
let currentStep = 1;
let formData = {
    housingType: '',
    services: []
};

// أول ما تشتغل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons(); // تشغيل الأيقونات فوراً
    loadRequests();       // عرض البيانات المحفوظة
    updateStats();        // تحديث الإحصائيات
});

// التنقل بين الصفحات الرئيسية
function nav(page) {
    ['home', 'new', 'track'].forEach(p => document.getElementById(`view-${p}`).classList.add('hidden'));
    document.getElementById(`view-${page}`).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${page}`).classList.add('active');

    const titles = {'home': 'الرئيسية', 'new': 'إرسال طلب جديد', 'track': 'متابعة الطلبات'};
    document.getElementById('page-title').innerText = titles[page];

    lucide.createIcons();

    if(page === 'new') resetForm();
    if(page === 'track' || page === 'home') {
        loadRequests();
        updateStats();
    }
}

// --- منطق النموذج (Wizard) ---

function selectHousing(type) {
    formData.housingType = type;
    document.querySelectorAll('#step-1 .select-card').forEach(el => el.classList.remove('selected'));
    if(type === 'ملكية') document.getElementById('card-owned').classList.add('selected');
    if(type === 'إيجار') document.getElementById('card-rent').classList.add('selected');
}

function toggleService(card, name) {
    card.classList.toggle('selected');
    const box = card.querySelector('.checkbox-icon');
    
    if(formData.services.includes(name)) {
        formData.services = formData.services.filter(s => s !== name);
        box.innerHTML = '';
        box.classList.remove('bg-absherGreen', 'border-transparent');
    } else {
        formData.services.push(name);
        box.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i>';
        box.classList.add('bg-absherGreen', 'border-transparent');
        lucide.createIcons();
    }
}

function nextStep() {
    if(currentStep === 1 && !formData.housingType) return alert('⚠️ الرجاء اختيار نوع العقار أولاً');
    if(currentStep === 2 && formData.services.length === 0) return alert('⚠️ الرجاء اختيار خدمة واحدة على الأقل');
    if(currentStep === 3) { submitForm(); return; }

    currentStep++;
    updateWizardUI();
}

function prevStep() {
    currentStep--;
    updateWizardUI();
}

function updateWizardUI() {
    [1, 2, 3].forEach(i => document.getElementById(`step-${i}`).classList.add('hidden'));
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');

    const progress = document.getElementById('progress-bar');
    if(currentStep === 1) progress.style.width = '0%';
    if(currentStep === 2) progress.style.width = '50%';
    if(currentStep === 3) progress.style.width = '100%';

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

    document.getElementById('btn-back').classList.toggle('hidden', currentStep === 1);
    
    const nextBtn = document.getElementById('btn-next');
    if(currentStep === 3) {
        nextBtn.innerHTML = 'إرسال الطلب <i data-lucide="send" class="w-4 h-4"></i>';
        document.getElementById('summary-type').innerText = formData.housingType;
        document.getElementById('summary-services').innerHTML = formData.services.map(s => 
            `<span class="bg-emerald-50 text-absherGreen border border-emerald-100 px-2 py-1 rounded text-xs font-bold">${s}</span>`
        ).join('');
    } else {
        nextBtn.innerHTML = 'التالي <i data-lucide="arrow-left" class="w-4 h-4"></i>';
    }
    lucide.createIcons();
}

function resetForm() {
    currentStep = 1;
    formData = { housingType: '', services: [] };
    document.querySelectorAll('.select-card').forEach(el => {
        el.classList.remove('selected');
        const box = el.querySelector('.checkbox-icon');
        if(box) { box.innerHTML = ''; box.classList.remove('bg-absherGreen', 'border-transparent'); }
    });
    updateWizardUI();
}

// --- التعامل مع البيانات (Local Storage بديل قاعدة البيانات) ---

function submitForm() {
    const btn = document.getElementById('btn-next');
    btn.innerText = 'جاري المعالجة...';
    btn.disabled = true;

    // محاكاة تأخير الشبكة لتبدو واقعية
    setTimeout(() => {
        // 1. جلب البيانات القديمة
        let requests = JSON.parse(localStorage.getItem('mersalRequests')) || [];
        
        // 2. إنشاء الطلب الجديد
        const newRequest = {
            id: Math.floor(Math.random() * 9000) + 1000, // رقم عشوائي
            housingType: formData.housingType,
            services: [...formData.services],
            date: new Date().toLocaleDateString('ar-SA'),
            status: 'قيد المعالجة'
        };

        // 3. الحفظ
        requests.unshift(newRequest); // إضافة في البداية
        localStorage.setItem('mersalRequests', JSON.stringify(requests));

        // 4. التوجيه
        alert('✅ تم إرسال الطلب بنجاح');
        btn.disabled = false;
        nav('track');
    }, 1000);
}

function loadRequests() {
    const requests = JSON.parse(localStorage.getItem('mersalRequests')) || [];
    const tbody = document.getElementById('table-body');
    const emptyState = document.getElementById('empty-state');

    tbody.innerHTML = '';

    if (requests.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        requests.forEach(req => {
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                    <td class="p-6 font-bold text-gray-700">#${req.id}</td>
                    <td class="p-6 font-bold text-gray-800">
                        ${req.housingType} 
                        <span class="text-xs text-gray-400 mx-2">|</span> 
                        <span class="text-absherGreen text-xs">${req.services.join('، ')}</span>
                    </td>
                    <td class="p-6 text-sm text-gray-500">${req.date}</td>
                    <td class="p-6"><span class="bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded text-xs font-bold">${req.status}</span></td>
                </tr>
            `;
        });
    }
}

function updateStats() {
    const requests = JSON.parse(localStorage.getItem('mersalRequests')) || [];
    // تحديث الرقم في الصفحة الرئيسية
    const statTotal = document.getElementById('stat-total');
    if(statTotal) statTotal.innerText = requests.length;
}
