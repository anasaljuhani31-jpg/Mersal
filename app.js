// المتغيرات العامة
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
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    }

    ['home', 'new', 'track'].forEach(p => document.getElementById(view-${p}).classList.add('hidden'));
    document.getElementById(view-${page}).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById(btn-${page}).classList.add('active');

    const titles = {'home': 'الرئيسية', 'new': 'إرسال طلب جديد', 'track': 'متابعة الطلبات'};
    document.getElementById('page-title').innerHTML = `
        <div class="w-1.5 h-6 bg-absherAccent rounded-full"></div>
        ${titles[page]}
    `;

    lucide.createIcons();

    if(page === 'new') resetForm();
    if(page === 'track' || page === 'home') {
        loadRequests();
        updateStats();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

function showError(stepId) {
    const cards = document.querySelectorAll(#${stepId} .select-card);
    cards.forEach(card => {
        card.classList.add('border-red-500', 'ring-2', 'ring-red-200', 'bg-red-50/50');
        card.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ], { duration: 400 });
    });
}

function clearError(stepId) {
    const cards = document.querySelectorAll(#${stepId} .select-card);
    cards.forEach(card => {
        card.classList.remove('border-red-500', 'ring-2', 'ring-red-200', 'bg-red-50/50');
    });
}

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
        box.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i>';
        box.classList.remove('border-gray-200');
        box.classList.add('bg-absherDark', 'border-absherDark');
        lucide.createIcons();
    }
}

function nextStep() {
    const nextBtn = document.getElementById('btn-next');
    const nextBtnText = nextBtn.querySelector('span');

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
        nextBtnText.innerText = 'التالي';
        return;
    }
    
    if(currentStep === 2) {
        if(formData.services.length === 0) {
            showError('step-2');
            return;
        }
        currentStep = 3;
        updateWizardUI();
        nextBtnText.innerText = 'إرسال';
        return;
    }

    if(currentStep === 3) {
        submitForm();
        return;
    }
}

function prevStep() {
    const nextBtnText = document.getElementById('btn-next').querySelector('span');

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
         nextBtnText.innerText = 'التالي';
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
    const loadingDiv = document.getElementById(${type}-loading);
    const dataDiv = document.getElementById(${type}-data);
    const nextBtn = document.getElementById('btn-next');

    loadingDiv.classList.remove('hidden');
    dataDiv.classList.add('hidden');
    
    nextBtn.disabled = true;
    nextBtn.classList.add('opacity-50', 'cursor-not-allowed');

    setTimeout(() => {
        loadingDiv.classList.add('hidden');
        dataDiv.classList.remove('hidden');
        nextBtn.disabled = false;
        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        lucide.createIcons();
    }, 2000);
}

function updateWizardUI() {
    hideAllSteps();
    if(typeof currentStep === 'number') {
        document.getElementById(step-${currentStep}).classList.remove('hidden');
    }
    updateProgressBar();

    for(let i=1; i<=3; i++) {
        const ind = document.getElementById(ind-${i});
        const circle = ind.querySelector('.step-circle');
        
        let isActive = false;
        if(i === 1) isActive = true;
        if(i === 2 && (currentStep === 2 || currentStep === 3)) isActive = true;
        if(i === 3 && currentStep === 3) isActive = true;

        if(isActive) {
            circle.classList.add('active');
        } else {
            circle.classList.remove('active');
        }
    }

    const backBtn = document.getElementById('btn-back');
    if(currentStep === 1) backBtn.classList.add('hidden');
    else backBtn.classList.remove('hidden');
    
    const nextBtn = document.getElementById('btn-next');
    const nextBtnIcon = nextBtn.querySelector('i');

    if(currentStep === 3) {
        nextBtnIcon.setAttribute('data-lucide', 'send');
        // هنا تم إصلاح عرض البيانات في صفحة الملخص
        document.getElementById('summary-type').innerText = formData.housingType;
        document.getElementById('summary-services').innerHTML = formData.services.map(s => 
            <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold border border-gray-200">${s}</span>
        ).join('');
    } else {
        nextBtnIcon.setAttribute('data-lucide', 'arrow-left');
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
    if(currentStep === 'verify-moj' || currentStep === 'verify-ejar') progress.style.width = '33%';
    if(currentStep === 2) progress.style.width = '66%';
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

function submitForm() {
    const btn = document.getElementById('btn-next');
    const btnText = btn.querySelector('span');
    const originalText = btnText.innerText;
    
    btnText.innerText = 'جاري الإرسال...';
    btn.disabled = true;
    btn.classList.add('opacity-80');

    setTimeout(() => {
        let requests = JSON.parse(localStorage.getItem('mersalRequests')) || [];
        
        const newRequest = {
            id: Math.floor(Math.random() * 900000) + 100000,
            housingType: formData.housingType,
            services: [...formData.services],
            date: new Date().toLocaleDateString('ar-SA'),
            status: 'قيد المعالجة'
        };

        requests.unshift(newRequest);
        localStorage.setItem('mersalRequests', JSON.stringify(requests));

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'تم إرسال الطلب بنجاح',
                text: رقم الطلب: #${newRequest.id},
                icon: 'success',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#004D38'
            }).then((result) => {
                btn.disabled = false;
                btn.classList.remove('opacity-80');
                btnText.innerText = originalText;
                nav('track');
            });
        } else {
            alert('تم الإرسال بنجاح');
            btn.disabled = false;
            nav('track');
        }

    }, 2000);
}

function loadRequests() {
    const requests = JSON.parse(localStorage.getItem('mersalRequests')) || [];
    const tbody = document.getElementById('table-body');
    const emptyState = document.getElementById('empty-state');
    const tableContainer = tbody.parentElement.parentElement;

    if(!tbody) return;
    tbody.innerHTML = '';

    if (requests.length === 0) {
        if(emptyState) emptyState.classList.remove('hidden');
        if(tableContainer) tableContainer.classList.add('hidden');
    } else {
        if(emptyState) emptyState.classList.add('hidden');
        if(tableContainer) tableContainer.classList.remove('hidden');
        
        requests.forEach(req => {
            let statusClass = req.status === 'قيد المعالجة' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
            let statusIcon = req.status === 'قيد المعالجة' ? 'hourglass' : 'check-circle';

            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b border-gray-100">
                    <td class="p-4 font-bold text-absherDark">#${req.id}</td>
                    <td class="p-4 text-gray-800">${req.housingType}</td>
                    <td class="p-4">
                        <div class="flex flex-wrap gap-1">
                            ${req.services.map(s => <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">${s}</span>).join('')}
                        </div>
                    </td>
                    <td class="p-4 text-sm text-gray-500">${req.date}</td>
                    <td class="p-4">
                        <span class="${statusClass} px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
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
    if(statTotal) statTotal.innerText = requests.length;
}
