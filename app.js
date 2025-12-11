let currentStep = 1;
let formData = {
    housingType: '',
    services: []
};

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadRequests();
    updateStats();
});

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
    if(currentStep === 1) {
        if(!formData.housingType) {
            alert('⚠️ الرجاء اختيار نوع العقار أولاً');
            return;
        }

        if(formData.housingType === 'ملكية') {
            showMOJVerification();
        } else if(formData.housingType === 'إيجار') {
            showEjarVerification();
        }
        return;
    }

    if(currentStep === 'verify-moj' || currentStep === 'verify-ejar') {
        currentStep = 2;
        updateWizardUI();
        return;
    }

    if(currentStep === 2) {
        if(formData.services.length === 0) {
            alert('⚠️ الرجاء اختيار خدمة واحدة على الأقل');
            return;
        }
        currentStep = 3;
        updateWizardUI();
        return;
    }

    if(currentStep === 3) {
        submitForm();
        return;
    }
}

function prevStep() {
    if(currentStep === 'verify-moj' || currentStep === 'verify-ejar') {
        currentStep = 1;
        updateWizardUI();
        return;
    }

    if(currentStep === 2) {
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

function showMOJVerification() {
    currentStep = 'verify-moj';

    ['step-1', 'step-verify-moj', 'step-verify-ejar', 'step-2', 'step-3'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    const mojStep = document.getElementById('step-verify-moj');
    mojStep.classList.remove('hidden');

    const loadingDiv = document.getElementById('moj-loading');
    const dataDiv = document.getElementById('moj-data');
    const statusBadge = document.getElementById('moj-status-badge');

    loadingDiv.classList.remove('hidden');
    dataDiv.classList.add('hidden');
    statusBadge.innerText = 'جاري الاتصال...';

    document.getElementById('btn-back').classList.remove('hidden');
    const nextBtn = document.getElementById('btn-next');
    nextBtn.disabled = true;
    nextBtn.classList.add('opacity-50', 'cursor-not-allowed');

    setTimeout(() => {
        loadingDiv.classList.add('hidden');
        dataDiv.classList.remove('hidden');
        statusBadge.innerText = 'تم التحقق ✓';
        statusBadge.classList.add('bg-green-500');

        nextBtn.disabled = false;
        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');

        lucide.createIcons();
    }, 2000);
}

function showEjarVerification() {
    currentStep = 'verify-ejar';

    ['step-1', 'step-verify-moj', 'step-verify-ejar', 'step-2', 'step-3'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    const ejarStep = document.getElementById('step-verify-ejar');
    ejarStep.classList.remove('hidden');

    const loadingDiv = document.getElementById('ejar-loading');
    const dataDiv = document.getElementById('ejar-data');
    const statusBadge = document.getElementById('ejar-status-badge');

    loadingDiv.classList.remove('hidden');
    dataDiv.classList.add('hidden');
    statusBadge.innerText = 'جاري الاتصال...';

    document.getElementById('btn-back').classList.remove('hidden');
    const nextBtn = document.getElementById('btn-next');
    nextBtn.disabled = true;
    nextBtn.classList.add('opacity-50', 'cursor-not-allowed');

    setTimeout(() => {
        loadingDiv.classList.add('hidden');
        dataDiv.classList.remove('hidden');
        statusBadge.innerText = 'تم التحقق ✓';
        statusBadge.classList.add('bg-green-500');

        nextBtn.disabled = false;
        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');

        lucide.createIcons();
    }, 2000);
}

function updateWizardUI() {
    ['step-1', 'step-verify-moj', 'step-verify-ejar', 'step-2', 'step-3'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    if(currentStep === 1) {
        document.getElementById('step-1').classList.remove('hidden');
    } else if(currentStep === 'verify-moj') {
        document.getElementById('step-verify-moj').classList.remove('hidden');
    } else if(currentStep === 'verify-ejar') {
        document.getElementById('step-verify-ejar').classList.remove('hidden');
    } else if(currentStep === 2) {
        document.getElementById('step-2').classList.remove('hidden');
    } else if(currentStep === 3) {
        document.getElementById('step-3').classList.remove('hidden');
    }

    const progress = document.getElementById('progress-bar');
    if(currentStep === 1) progress.style.width = '0%';
    if(currentStep === 'verify-moj' || currentStep === 'verify-ejar') progress.style.width = '25%';
    if(currentStep === 2) progress.style.width = '50%';
    if(currentStep === 3) progress.style.width = '100%';

    for(let i=1; i<=3; i++) {
        const ind = document.getElementById(`ind-${i}`);
        const circle = ind.querySelector('.step-circle');
        const text = ind.querySelector('span');

        let isActive = false;
        if(i === 1 && (currentStep === 1 || currentStep === 'verify-moj' || currentStep === 'verify-ejar')) isActive = true;
        if(i === 2 && currentStep === 2) isActive = true;
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
        if(box) {
            box.innerHTML = '';
            box.classList.remove('bg-absherGreen', 'border-transparent');
        }
    });

    const mojLoading = document.getElementById('moj-loading');
    const mojData = document.getElementById('moj-data');
    const mojBadge = document.getElementById('moj-status-badge');
    if(mojLoading) mojLoading.classList.remove('hidden');
    if(mojData) mojData.classList.add('hidden');
    if(mojBadge) {
        mojBadge.innerText = 'جاري الاتصال...';
        mojBadge.classList.remove('bg-green-500');
    }

    const ejarLoading = document.getElementById('ejar-loading');
    const ejarData = document.getElementById('ejar-data');
    const ejarBadge = document.getElementById('ejar-status-badge');
    if(ejarLoading) ejarLoading.classList.remove('hidden');
    if(ejarData) ejarData.classList.add('hidden');
    if(ejarBadge) {
        ejarBadge.innerText = 'جاري الاتصال...';
        ejarBadge.classList.remove('bg-green-500');
    }

    updateWizardUI();
}

function submitForm() {
    const btn = document.getElementById('btn-next');
    btn.innerText = 'جاري المعالجة...';
    btn.disabled = true;

    setTimeout(() => {
        let requests = JSON.parse(localStorage.getItem('mersalRequests')) || [];

        const newRequest = {
            id: Math.floor(Math.random() * 9000) + 1000,
            housingType: formData.housingType,
            services: [...formData.services],
            date: new Date().toLocaleDateString('ar-SA'),
            status: 'قيد المعالجة'
        };

        requests.unshift(newRequest);
        localStorage.setItem('mersalRequests', JSON.stringify(requests));

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
    const statTotal = document.getElementById('stat-total');
    if(statTotal) statTotal.innerText = requests.length;
}
