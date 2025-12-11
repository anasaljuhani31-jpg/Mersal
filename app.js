// المتغيرات العامة
let currentStep = 1;
let formData = {
    housingType: '',
    services: []
};

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadRequests();
    updateStats();
    // تعيين تاريخ اليوم في صفحة الملخص
    const summaryDate = document.getElementById('summary-date');
    if(summaryDate) summaryDate.innerText = new Date().toLocaleDateString('ar-SA');
});

// التنقل بين القوائم
function nav(page) {
    ['home', 'new', 'track'].forEach(p => document.getElementById(`view-${p}`).classList.add('hidden'));
    document.getElementById(`view-${page}`).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${page}`).classList.add('active');

    const titles = {'home': 'الرئيسية', 'new': 'إرسال طلب جديد', 'track': 'متابعة الطلبات'};
    document.getElementById('page-title').innerHTML = `
        <div class="w-2 h-8 bg-absherAccent rounded-full"></div>
        ${titles[page]}
    `;

    lucide.createIcons();

    if(page === 'new') resetForm();
    if(page === 'track' || page === 'home') {
        loadRequests();
        updateStats();
    }
}

// --- دوال مساعدة لإدارة الأخطاء (Red Borders & Shake) ---

function showError(stepId) {
    const cards = document.querySelectorAll(`#${stepId} .select-card`);
    cards.forEach(card => {
        card.classList.add('border-red-500', 'ring-2', 'ring-red-200', 'bg-red-50/50');
        // حركة اهتزاز احترافية
        card.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-6px) rotate(-1deg)' },
            { transform: 'translateX(6px) rotate(1deg)' },
            { transform: 'translateX(-6px) rotate(-1deg)' },
            { transform: 'translateX(6px) rotate(1deg)' },
            { transform: 'translateX(0)' }
        ], { duration: 500, easing: 'cubic-bezier(.36,.07,.19,.97)' });
    });
}

function clearError(stepId) {
    const cards = document.querySelectorAll(`#${stepId} .select-card`);
    cards.forEach(card => {
        card.classList.remove('border-red-500', 'ring-2', 'ring-red-200', 'bg-red-50/50');
    });
}

// --- منطق النموذج (Wizard) ---

function selectHousing(type) {
    clearError('step-1');
    formData.housingType = type;
    document.querySelectorAll('#step-1 .select-card').forEach(el => el.classList.remove('selected'));
    
    if(type === 'ملكية') document.getElementById('card-owned').classList.add('selected');
    if(type === 'إيجار') document.getElementById('card-rent').classList.add('selected');
}

function toggleService(card, name) {
    clearError('step-2');
    card.classList.toggle('selected');
    const box = card.querySelector('.checkbox-icon');
    
    if(formData.services.includes(name)) {
        formData.services = formData.services.filter(s => s !== name);
        box.innerHTML = '';
        box.classList.remove('bg-absherGreen', 'border-transparent');
        box.classList.add('border-gray-200');
    } else {
        formData.services.push(name);
        // أيقونة صح احترافية
        box.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i>';
        box.classList.remove('border-gray-200');
        box.classList.add('bg-absherDark', 'border-absherDark');
        lucide.createIcons();
    }
}

function nextStep() {
    const nextBtnInfo = document.getElementById('btn-next').querySelector('span span');

    // 1. التحقق من الخطوة الأولى
    if(currentStep === 1) {
        if(!formData.housingType) {
            showError('step-1');
            return;
        }
        if(formData.housingType === 'ملكية') {
            showMOJVerification();
        } else {
            showEjarVerification();
        }
        return;
    }

    if(currentStep === 'verify-moj' || currentStep === 'verify-ejar') {
        currentStep = 2;
        updateWizardUI();
        nextBtnInfo.innerText = 'المتابعة للتالي';
        return;
    }
    
    // 2. التحقق من الخطوة الثانية
    if(currentStep === 2) {
        if(formData.services.length === 0) {
            showError('step-2');
            return;
        }
        currentStep = 3;
        updateWizardUI();
        nextBtnInfo.innerText = 'اعتماد وإرسال الطلب';
        return;
    }

    if(currentStep === 3) {
        submitForm();
        return;
    }
}

function prevStep() {
    const nextBtnInfo = document.getElementById('btn-next').querySelector('span span');

    if(currentStep === 'verify-moj' || currentStep === 'verify-ejar') {
        currentStep = 1;
        updateWizardUI();
    }
    else if(currentStep === 2) {
        currentStep = 1; 
        updateWizardUI();
    }
    else if(currentStep === 3) {
        currentStep = 2;
        updateWizardUI();
    }
    
    if(currentStep !== 3) {
         nextBtnInfo.innerText = 'المتابعة للتالي';
    }
}

function showMOJVerification() {
    currentStep = 'verify-moj';
    hideAllSteps();
    const section = document.getElementById('step-verify-moj');
    if(section) {
        section.classList.remove('hidden');
        simulateLoading('moj');
    } else {
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

function simulateLoading(type) {
    const loadingDiv = document.getElementById(`${type}-loading`);
    const dataDiv = document.getElementById(`${type}-data`);
    const badge = document.getElementById(`${type}-status-badge`);
    const nextBtn = document.getElementById('btn-next');

    loadingDiv.classList.remove('hidden');
    dataDiv.classList.add('hidden');
    
    // تخصيص البادج حسب الجهة
    if(badge) {
        badge.innerHTML = type === 'moj' ? 
            '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> جاري الربط الآمن...' : 
            '<i data-lucide="satellite-dish" class="w-4 h-4 animate-spin"></i> جاري الاتصال بالشبكة...';
        badge.classList.remove('bg-green-500/20', 'text-green-300', 'border-green-500/30');
        badge.classList.add('bg-white/20', 'text-white', 'border-white/30');
    }
    
    nextBtn.disabled = true;
    nextBtn.classList.add('opacity-50', 'cursor-not-allowed', 'grayscale');

    setTimeout(() => {
        loadingDiv.classList.add('hidden');
        dataDiv.classList.remove('hidden');
        if(badge) {
            badge.innerHTML = '<i data-lucide="check-circle-2" class="w-4 h-4"></i> تم التحقق بنجاح';
            badge.classList.remove('bg-white/20', 'text-white', 'border-white/30');
            badge.classList.add('bg-green-500/20', 'text-green-100', 'border-green-500/30');
        }
        nextBtn.disabled = false;
        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'grayscale');
        lucide.createIcons();
    }, 2500); // زيادة الوقت قليلاً للشعور بالواقعية
}

function updateWizardUI() {
    hideAllSteps();
    if(typeof currentStep === 'number') {
        document.getElementById(`step-${currentStep}`).classList.remove('hidden');
    }
    updateProgressBar();

    for(let i=1; i<=3; i++) {
        const ind = document.getElementById(`ind-${i}`);
        const circle = ind.querySelector('.step-circle');
        const text = ind.querySelector('span');
        
        let isActive = false;
        if(i === 1) isActive = true;
        if(i === 2 && (currentStep === 2 || currentStep === 3)) isActive = true;
        if(i === 3 && currentStep === 3) isActive = true;

        if(isActive) {
            circle.classList.add('active');
            text.classList.remove('text-gray-500', 'font-medium');
            text.classList.add('text-absherDark', 'font-bold');
        } else {
            circle.classList.remove('active');
            text.classList.add('text-gray-500', 'font-medium');
            text.classList.remove('text-absherDark', 'font-bold');
        }
    }

    const backBtn = document.getElementById('btn-back');
    if(currentStep === 1) backBtn.classList.add('hidden');
    else backBtn.classList.remove('hidden');
    
    const nextBtn = document.getElementById('btn-next');
    const nextBtnText = nextBtn.querySelector('span span');
    const nextBtnIcon = nextBtn.querySelector('span i');

    if(currentStep === 3) {
        nextBtnText.innerText = 'اعتماد وإرسال الطلب';
        nextBtnIcon.setAttribute('data-lucide', 'send');
        nextBtn.classList.add('bg-absherAccent', 'text-absherDark', 'hover:bg-white');
        nextBtn.classList.remove('bg-absherDark', 'text-white');
        
        // تعبئة الملخص
        const typeIcon = document.getElementById('summary-type-icon');
        document.getElementById('summary-type').innerText = formData.housingType;
        typeIcon.innerHTML = formData.housingType === 'ملكية' ? 
            '<i data-lucide="building-estate" class="w-6 h-6 text-mojGold"></i>' : 
            '<i data-lucide="key-round" class="w-6 h-6 text-ejarCyan"></i>';

        document.getElementById('summary-services').innerHTML = formData.services.map(s => {
            let colorClass = s === 'الكهرباء' ? 'blue' : s === 'المياه' ? 'cyan' : 'purple';
            let icon = s === 'الكهرباء' ? 'zap' : s === 'المياه' ? 'droplets' : 'wifi';
            return `
                <span class="bg-${colorClass}-50 text-${colorClass}-700 border border-${colorClass}-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
                    <i data-lucide="${icon}" class="w-4 h-4"></i>
                    ${s}
                </span>
            `;
        }).join('');
    } else {
        nextBtnText.innerText = 'المتابعة للتالي';
        nextBtnIcon.setAttribute('data-lucide', 'arrow-left');
        nextBtn.classList.remove('bg-absherAccent', 'text-absherDark', 'hover:bg-white');
        nextBtn.classList.add('bg-absherDark', 'text-white');
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
    if(currentStep === 1) progress.style.width = '5%';
    if(currentStep === 'verify-moj' || currentStep === 'verify-ejar') progress.style.width = '35%';
    if(currentStep === 2) progress.style.width = '65%';
    if(currentStep === 3) progress.style.width = '100%';
}

function resetForm() {
    currentStep = 1;
    formData = { housingType: '', services: [] };
    clearError('step-1');
    clearError('step-2');
    document.querySelectorAll('.select-card').forEach(el => {
        el.classList.remove('selected');
        const box = el.querySelector('.checkbox-icon');
        if(box) { 
            box.innerHTML = ''; 
            box.classList.remove('bg-absherDark', 'border-absherDark');
            box.classList.add('border-gray-200');
        }
    });
    updateWizardUI();
}

// --- الحفظ والإرسال النهائي ---

function submitForm() {
    const btn = document.getElementById('btn-next');
    const btnText = btn.querySelector('span span');
    const originalText = btnText.innerText;
    
    btnText.innerText = 'جاري توثيق الطلب...';
    btn.disabled = true;
    btn.classList.add('opacity-80', 'cursor-wait');

    setTimeout(() => {
        let requests = JSON.parse(localStorage.getItem('mersalRequests')) || [];
        
        const newRequest = {
            id: Math.floor(Math.random() * 900000) + 100000, // رقم طلب أطول وأكثر واقعية
            housingType: formData.housingType,
            services: [...formData.services],
            date: new Date().toLocaleDateString('ar-SA'),
            status: 'قيد المعالجة'
        };

        requests.unshift(newRequest);
        localStorage.setItem('mersalRequests', JSON.stringify(requests));

        // تنبيه نجاح فخم باستخدام SweetAlert2
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '<h3 class="font-bold text-absherDark">تم تقديم الطلب بنجاح</h3>',
                html: `
                    <div class="text-center">
                        <div class="w-20 h-20 bg-green-100 mx-auto rounded-full flex items-center justify-center mb-4">
                            <i data-lucide="check-circle-2" class="w-10 h-10 text-green-600"></i>
                        </div>
                        <p class="text-gray-600 mb-2">رقم مرجع الطلب: <strong>#${newRequest.id}</strong></p>
                        <p class="text-sm text-gray-500">سيتم إشعارك عبر الرسائل النصية عند تحديث الحالة.</p>
                    </div>
                `,
                icon: null, // نستخدم الأيقونة المخصصة أعلاه
                showConfirmButton: true,
                confirmButtonText: 'متابعة حالة الطلب',
                confirmButtonColor: '#004D38',
                customClass: {
                    popup: 'rounded-3xl shadow-2xl font-sans',
                    confirmButton: 'font-bold px-6 py-3 rounded-xl text-lg shadow-md'
                },
                buttonsStyling: false
            }).then((result) => {
                if (result.isConfirmed) {
                    btn.disabled = false;
                    btn.classList.remove('opacity-80', 'cursor-wait');
                    btnText.innerText = originalText;
                    nav('track');
                }
            });
            lucide.createIcons(); // لتشغيل الأيقونة داخل التنبيه
        } else {
            alert(`✅ تم تقديم الطلب بنجاح برقم مرجعي #${newRequest.id}`);
            btn.disabled = false;
            nav('track');
        }

    }, 2000);
}

function loadRequests() {
    const requests = JSON.parse(localStorage.getItem('mersalRequests')) || [];
    const tbody = document.getElementById('table-body');
    const emptyState = document.getElementById('empty-state');
    const tableContainer = tbody.parentElement;

    if(!tbody) return;
    tbody.innerHTML = '';

    if (requests.length === 0) {
        if(emptyState) emptyState.classList.remove('hidden');
        if(tableContainer) tableContainer.classList.add('hidden');
    } else {
        if(emptyState) emptyState.classList.add('hidden');
        if(tableContainer) tableContainer.classList.remove('hidden');
        
        requests.forEach(req => {
            // تنسيق حالة الطلب
            let statusClass = req.status === 'قيد المعالجة' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200';
            let statusIcon = req.status === 'قيد المعالجة' ? 'hourglass' : 'check-circle-2';

            tbody.innerHTML += `
                <tr class="hover:bg-bgLight/50 transition-all group bg-white even:bg-gray-50/30">
                    <td class="p-6 font-extrabold text-absherDark rounded-r-xl group-hover:text-absherAccent transition">#${req.id}</td>
                    <td class="p-6 font-bold text-gray-800">
                        <div class="flex items-center gap-2">
                            <span class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                <i data-lucide="${req.housingType === 'ملكية' ? 'building-estate' : 'key-round'}" class="w-4 h-4"></i>
                            </span>
                            ${req.housingType}
                        </div>
                    </td>
                    <td class="p-6">
                        <div class="flex flex-wrap gap-2">
                            ${req.services.map(s => `<span class="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">${s}</span>`).join('')}
                        </div>
                    </td>
                    <td class="p-6 text-sm font-medium text-gray-500">${req.date}</td>
                    <td class="p-6 rounded-l-xl">
                        <span class="${statusClass} border px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                            <i data-lucide="${statusIcon}" class="w-3 h-3"></i>
                            ${req.status}
                        </span>
                    </td>
                </tr>
            `;
        });
    }
    lucide.createIcons();
}

function updateStats() {
    const requests = JSON.parse(localStorage.getItem('mersalRequests')) || [];
    const statTotal = document.getElementById('stat-total');
    if(statTotal) {
        // تأثير عداد بسيط
        let current = 0;
        const target = requests.length;
        if (target === 0) {
            statTotal.innerText = '0';
            return;
        }
        const increment = Math.ceil(target / 20);
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                statTotal.innerText = target;
                clearInterval(timer);
            } else {
                statTotal.innerText = current;
            }
        }, 30);
    }
}
