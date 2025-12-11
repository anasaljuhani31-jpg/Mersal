let currentStep = 1;
let formData = { housingType: '', services: [] };

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadRequests();
    updateStats();
});

function nav(page) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    }
    ['home', 'new', 'track'].forEach(p => document.getElementById(`view-${p}`).classList.add('hidden'));
    document.getElementById(`view-${page}`).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${page}`).classList.add('active');
    const titles = {'home': 'الرئيسية', 'new': 'إرسال طلب جديد', 'track': 'متابعة الطلبات'};
    document.getElementById('page-title').innerHTML = `<div class="w-1.5 h-8 bg-absherAccent rounded-full"></div> ${titles[page]}`;
    lucide.createIcons();
    if(page === 'new') resetForm();
    if(page === 'track' || page === 'home') { loadRequests(); updateStats(); }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

function showError(stepId) {
    const cards = document.querySelectorAll(`#${stepId} .select-card`);
    cards.forEach(card => {
        card.classList.add('border-red-500', 'ring-2', 'ring-red-100', 'bg-red-50');
        setTimeout(() => card.classList.remove('bg-red-50'), 500);
    });
}

function clearError(stepId) {
    const cards = document.querySelectorAll(`#${stepId} .select-card`);
    cards.forEach(card => card.classList.remove('border-red-500', 'ring-2', 'ring-red-100', 'bg-red-50'));
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
        box.classList.remove('bg-absherDark', 'border-transparent');
    } else {
        formData.services.push(name);
        box.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i>';
        box.classList.add('bg-absherDark', 'border-transparent');
        lucide.createIcons();
    }
}

function nextStep() {
    const nextBtnText = document.getElementById('btn-next').querySelector('span');
    if(currentStep === 1) {
        if(!formData.housingType) { showError('step-1'); return; }
        if(formData.housingType === 'ملكية') showMOJVerification();
        else showEjarVerification();
        return;
    }
    if(currentStep === 'verify-moj' || currentStep === 'verify-ejar') {
        currentStep = 2;
        updateWizardUI();
        nextBtnText.innerText = 'التالي';
        return;
    }
    if(currentStep === 2) {
        if(formData.services.length === 0) { showError('step-2'); return; }
        currentStep = 3;
        updateWizardUI();
        document.getElementById('summary-type').innerText = formData.housingType;
        const servicesContainer = document.getElementById('summary-services');
        servicesContainer.innerHTML = '';
        formData.services.forEach(s => {
            servicesContainer.innerHTML += `<span class="bg-absherLight text-absherDark border border-absherGreen px-4 py-2 rounded-lg font-bold text-sm">${s}</span>`;
        });
        nextBtnText.innerText = 'اعتماد وإرسال الطلب';
        return;
    }
    if(currentStep === 3) { submitForm(); return; }
}

function prevStep() {
    const nextBtnText = document.getElementById('btn-next').querySelector('span');
    if(currentStep === 'verify-moj' || currentStep === 'verify-ejar') { currentStep = 1; updateWizardUI(); }
    else if(currentStep === 2) { currentStep = 1; updateWizardUI(); }
    else if(currentStep === 3) { currentStep = 2; updateWizardUI(); }
    if(currentStep !== 3) nextBtnText.innerText = 'التالي';
}

function showMOJVerification() {
    currentStep = 'verify-moj';
    hideAllSteps();
    document.getElementById('step-verify-moj').classList.remove('hidden');
    simulateLoading('moj');
    updateProgressBar();
}

function showEjarVerification() {
    currentStep = 'verify-ejar';
    hideAllSteps();
    document.getElementById('step-verify-ejar').classList.remove('hidden');
    simulateLoading('ejar');
    updateProgressBar();
}

function simulateLoading(type) {
    const loadingDiv = document.getElementById(`${type}-loading`);
    const dataDiv = document.getElementById(`${type}-data`);
    const nextBtn = document.getElementById('btn-next');
    loadingDiv.classList.remove('hidden');
    dataDiv.classList.add('hidden');
    nextBtn.disabled = true;
    nextBtn.classList.add('opacity-50');
    setTimeout(() => {
        loadingDiv.classList.add('hidden');
        dataDiv.classList.remove('hidden');
        nextBtn.disabled = false;
        nextBtn.classList.remove('opacity-50');
    }, 2000);
}

function updateWizardUI() {
    hideAllSteps();
    if(typeof currentStep === 'number') document.getElementById(`step-${currentStep}`).classList.remove('hidden');
    updateProgressBar();
    for(let i=1; i<=3; i++) {
        const ind = document.getElementById(`ind-${i}`);
        const circle = ind.querySelector('.step-circle');
        const text = ind.querySelector('span');
        if(i <= currentStep) {
            circle.classList.add('active');
            circle.classList.remove('text-gray-400');
            text.classList.add('text-absherDark');
        } else {
            circle.classList.remove('active');
            circle.classList.add('text-gray-400');
            text.classList.remove('text-absherDark');
        }
    }
    const backBtn = document.getElementById('btn-back');
    if(currentStep === 1) backBtn.classList.add('hidden');
    else backBtn.classList.remove('hidden');
}

function hideAllSteps() {
    ['step-1', 'step-verify-moj', 'step-verify-ejar', 'step-2', 'step-3'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
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
        if(box) { box.innerHTML = ''; box.classList.remove('bg-absherDark', 'border-transparent'); }
    });
    updateWizardUI();
}

function submitForm() {
    const btn = document.getElementById('btn-next');
    const btnText = btn.querySelector('span');
    const originalText = btnText.innerText;
    btnText.innerText = 'جاري التوثيق...';
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
        Swal.fire({
            title: 'تم إرسال الطلب بنجاح',
            text: `رقم المرجع: #${newRequest.id}`,
            icon: 'success',
            confirmButtonColor: '#004D38',
            confirmButtonText: 'حسناً'
        }).then(() => {
            btn.disabled = false;
            btn.classList.remove('opacity-80');
            btnText.innerText = originalText;
            nav('track');
        });
    }, 1500);
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
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b border-gray-100">
                    <td class="p-4 font-bold text-absherDark">#${req.id}</td>
                    <td class="p-4">${req.housingType}</td>
                    <td class="p-4 flex gap-2 flex-wrap">${req.services.map(s => `<span class="bg-gray-100 px-2 py-1 rounded text-xs">${s}</span>`).join('')}</td>
                    <td class="p-4 text-gray-500">${req.date}</td>
                    <td class="p-4"><span class="${statusClass} px-3 py-1 rounded-full text-xs font-bold">${req.status}</span></td>
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
