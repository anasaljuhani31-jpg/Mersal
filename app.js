// المتغيرات العامة
let currentStep = 1;
let formData = {
    housingType: '',
    services: []
};

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadRequests(); // تحميل الطلبات من الذاكرة
    updateStats();
});

// التنقل بين القوائم (الرئيسية - جديد - السجل)
function nav(page) {
    // إخفاء الكل وإظهار المطلوب
    ['home', 'new', 'track'].forEach(p => document.getElementById(`view-${p}`).classList.add('hidden'));
    document.getElementById(`view-${page}`).classList.remove('hidden');

    // تحديث الزر النشط
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${page}`).classList.add('active');

    // تغيير العنوان
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

// زر التالي (المنطق الذكي)
function nextStep() {
    // 1. التحقق من الخطوة الأولى (نوع السكن)
    if(currentStep === 1) {
        if(!formData.housingType) {
            alert('⚠️ الرجاء اختيار نوع العقار أولاً');
            return;
        }
        // هنا التوجيه الذكي لصفحات التحقق
        if(formData.housingType === 'ملكية') {
            showMOJVerification(); // وزارة العدل
        } else {
            showEjarVerification(); // إيجار
        }
        return;
    }

    // 2. إذا كان المستخدم في مرحلة التحقق (الخطوة الوسيطة)
    if(currentStep === 'verify-moj' || currentStep === 'verify-ejar') {
        currentStep = 2; // انتقل لاختيار الخدمات
        updateWizardUI();
        return;
    }
    
    // 3. التحقق من الخطوة الثانية (الخدمات)
    if(currentStep === 2) {
        if(formData.services.length === 0) {
            alert('⚠️ الرجاء اختيار خدمة واحدة على الأقل');
            return;
        }
        currentStep = 3;
        updateWizardUI();
        return;
    }

    // 4. الإرسال النهائي
    if(currentStep === 3) {
        submitForm();
        return;
    }
}

// زر السابق
function prevStep() {
    if(currentStep === 'verify-moj' || currentStep === 'verify-ejar') {
        currentStep = 1;
        updateWizardUI();
        return;
    }
    if(currentStep === 2) {
        // إذا رجع من الخدمات، نرجعه للخطوة 1 مباشرة (تجاوز التحقق)
        currentStep = 1; 
        updateWizardUI();
        return;
    }
    if(currentStep === 3) {
        currentStep = 2;
        updateWizardUI();
        return;
    }
}

// --- دوال عرض شاشات التحقق ---

function showMOJVerification() {
    currentStep = 'verify-moj';
    
    // إخفاء الجميع
    hideAllSteps();
    // إظهار وزارة العدل
    const section = document.getElementById('step-verify-moj');
    if(section) {
        section.classList.remove('hidden');
        // تشغيل المحاكاة (Loading)
        simulateLoading('moj');
    } else {
        // في حال لم يجد القسم (احتياط)، ينتقل للخطوة 2
        currentStep = 2;
        updateWizardUI();
    }
    updateProgressBar();
}

function showEjarVerification() {
    currentStep = 'verify-ejar';
    
    hideAllSteps();
    const section = document.getElementById('step-verify-ejar');
    if(section) {
        section.classList.remove('hidden');
        simulateLoading('ejar');
    } else {
        currentStep = 2;
        updateWizardUI();
    }
    updateProgressBar();
}

// محاكاة التحميل (Spinner)
function simulateLoading(type) {
    const loadingDiv = document.getElementById(`${type}-loading`);
    const dataDiv = document.getElementById(`${type}-data`);
    const badge = document.getElementById(`${type}-status-badge`);
    const nextBtn = document.getElementById('btn-next');

    // إعادة تعيين الحالة
    loadingDiv.classList.remove('hidden');
    dataDiv.classList.add('hidden');
    if(badge) {
        badge.innerText = 'جاري الاتصال...';
        badge.classList.remove('bg-green-500', 'text-white');
    }
    
    // قفل زر التالي مؤقتاً
    nextBtn.disabled = true;
    nextBtn.classList.add('opacity-50', 'cursor-not-allowed');

    // بعد ثانيتين
    setTimeout(() => {
        loadingDiv.classList.add('hidden');
        dataDiv.classList.remove('hidden');
        if(badge) {
            badge.innerText = 'تم التحقق ✓';
            badge.classList.add('bg-green-500', 'text-white');
        }
        // فتح زر التالي
        nextBtn.disabled = false;
        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        lucide.createIcons();
    }, 2000);
}

// تحديث الواجهة العامة
function updateWizardUI() {
    hideAllSteps();
    
    // إظهار الخطوة الحالية
    if(typeof currentStep === 'number') {
        document.getElementById(`step-${currentStep}`).classList.remove('hidden');
    }

    updateProgressBar();

    // تحديث الدوائر (Stepper)
    for(let i=1; i<=3; i++) {
        const ind = document.getElementById(`ind-${i}`);
        const circle = ind.querySelector('.step-circle');
        const text = ind.querySelector('span');
        
        // منطق تلوين الدوائر
        let isActive = false;
        if(i === 1) isActive = true; // دائماً نشطة
        if(i === 2 && (currentStep === 2 || currentStep === 3)) isActive = true;
        if(i === 3 && currentStep === 3) isActive = true;

        if(isActive) {
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

    // زر الرجوع
    const backBtn = document.getElementById('btn-back');
    if(currentStep === 1) backBtn.classList.add('hidden');
    else backBtn.classList.remove('hidden');
    
    // زر التالي/الإرسال
    const nextBtn = document.getElementById('btn-next');
    if(currentStep === 3) {
        nextBtn.innerHTML = 'إرسال الطلب <i data-lucide="send" class="w-4 h-4"></i>';
        // تعبئة الملخص
        document.getElementById('summary-type').innerText = formData.housingType;
        document.getElementById('summary-services').innerHTML = formData.services.map(s => 
            `<span class="bg-emerald-50 text-absherGreen border border-emerald-100 px-2 py-1 rounded text-xs font-bold">${s}</span>`
        ).join('');
    } else {
        nextBtn.innerHTML = 'التالي <i data-lucide="arrow-left" class="w-4 h-4"></i>';
    }
    
    lucide.createIcons();
}

function hideAllSteps() {
    const steps = ['step-1', 'step-verify-moj', 'step-verify-ejar', 'step-2', 'step-3'];
    steps.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
}

function updateProgressBar() {
    const progress = document.getElementById('progress-bar');
    if(currentStep === 1) progress.style.width = '0%';
    if(currentStep === 'verify-moj' || currentStep === 'verify-ejar') progress.style.width = '25%';
    if(currentStep === 2) progress.style.width = '50%';
    if(currentStep === 3) progress.style.width = '100%';
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

// --- الحفظ (LocalStorage) ---

function submitForm() {
    const btn = document.getElementById('btn-next');
    btn.innerText = 'جاري المعالجة...';
    btn.disabled = true;

    setTimeout(() => {
        // 1. جلب البيانات القديمة
        let requests = JSON.parse(localStorage.getItem('mersalRequests')) || [];
        
        // 2. إنشاء الطلب الجديد
        const newRequest = {
            id: Math.floor(Math.random() * 9000) + 1000,
            housingType: formData.housingType,
            services: [...formData.services],
            date: new Date().toLocaleDateString('ar-SA'),
            status: 'قيد المعالجة'
        };

        // 3. الحفظ
        requests.unshift(newRequest);
        localStorage.setItem('mersalRequests', JSON.stringify(requests));

        // 4. النهاية
        alert('✅ تم إرسال الطلب بنجاح');
        btn.disabled = false;
        nav('track');
    }, 1500);
}

function loadRequests() {
    const requests = JSON.parse(localStorage.getItem('mersalRequests')) || [];
    const tbody = document.getElementById('table-body');
    const emptyState = document.getElementById('empty-state');

    if(!tbody) return;
    tbody.innerHTML = '';

    if (requests.length === 0) {
        if(emptyState) emptyState.classList.remove('hidden');
    } else {
        if(emptyState) emptyState.classList.add('hidden');
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
    const statTotal = document.getElementById('stat-total');
    if(statTotal) statTotal.innerText = requests.length;
}
