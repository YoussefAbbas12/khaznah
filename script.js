let currentPin = '';
let data = {
  balance: 0,
  transactions: []
};

// Load data from LocalStorage (Simulating persistence)
function loadData() {
  const saved = localStorage.getItem('apex_factory_data');
  if (saved) {
    data = JSON.parse(saved);
  }
  updateUI();
}

function saveData() {
  localStorage.setItem('apex_factory_data', JSON.stringify(data));
}

window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const passwordPage = document.getElementById('password-page');

  loadData();

  setTimeout(() => {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      passwordPage.style.display = 'block';
    }, 500);
  }, 2500);
});

function appendPin(num) {
  if (currentPin.length < 4) {
    currentPin += num;
    console.log(currentPin)
    console.log('1267')
    updatePinDots();
    if (currentPin.length === 4) {
      if(currentPin === '1267'){
        setTimeout(() => showPage('main-content'), 300);
      }else{
        deleteAllPins()
      }
    }
  }
}

function deletePin() {
  currentPin = currentPin.slice(0, -1);
  updatePinDots();
}

function deleteAllPins() {
  currentPin = [];
  updatePinDots();
}

function updatePinDots() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('filled', index < currentPin.length);
  });
  if(currentPin.length === 0){
    dots.forEach((dot, index) => {
      dot.classList.remove('filled', index < currentPin.length);
    });
  }
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById(pageId).style.display = 'block';
}

function handleDeposit() {
  const amount = parseFloat(document.getElementById('dep-amount').value);
  const client = document.getElementById('dep-client').value;
  const invoice = document.getElementById('dep-invoice').value;

  if (!amount || amount <= 0) return alert('برجاء إدخال مبلغ صحيح');

  const transaction = {
    id: Date.now(),
    type: 'deposit',
    amount: amount,
    client: client || 'عميل نقدي',
    invoice: invoice || 'بدون فاتورة',
    date: new Date().toLocaleString('ar-EG'),
    category: 'توريد'
  };

  data.transactions.unshift(transaction);
  data.balance += amount;
  
  saveAndReset('dep');
}

function handleWithdraw() {
  const amount = parseFloat(document.getElementById('with-amount').value);
  const name = document.getElementById('with-name').value;
  const category = document.getElementById('with-category').value;

  if (!amount || amount <= 0) return alert('برجاء إدخال مبلغ صحيح');

  const transaction = {
    id: Date.now(),
    type: 'withdraw',
    amount: amount,
    name: name || 'غير معروف',
    category: category,
    date: new Date().toLocaleString('ar-EG')
  };

  data.transactions.unshift(transaction);
  data.balance -= amount;
  
  saveAndReset('with');
}

function saveAndReset(prefix) {
  saveData();
  updateUI();
  if (prefix === 'dep') {
    document.getElementById('dep-amount').value = '';
    document.getElementById('dep-client').value = '';
    document.getElementById('dep-invoice').value = '';
  } else {
    document.getElementById('with-amount').value = '';
    document.getElementById('with-name').value = '';
  }
  showPage('main-content');
}

function updateUI() {
  document.getElementById('total-balance').innerText = data.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 });
  renderTransactions(data.transactions);
}

function renderTransactions(list) {
  const container = document.getElementById('transaction-list');
  container.innerHTML = '';

  if(list.length == 0){
    const item = document.createElement('div');
    item.className = `activity-item`;
    
    item.innerHTML = `
      <div class="activity-info">
        <p class="no-data">لا يوجد</p>
      </div>
    `;
    container.appendChild(item);
  }else{
    list.forEach(t => {
      const item = document.createElement('div');
      item.className = `activity-item ${t.type}`;
      
      const isDeposit = t.type === 'deposit';
      const amountText = isDeposit ? `+ ${t.amount}` : `- ${t.amount}`;
      const detail = isDeposit ? `عميل: ${t.client} | ف:${t.invoice}` : `مستلم: ${t.name} | ${t.category}`;

      item.innerHTML = `
        <div class="activity-info">
          <p class="activity-title">${t.category}</p>
          <p class="activity-date">${t.date} | ${detail}</p>
        </div>
        <div class="activity-amount">
          ${amountText}
        </div>
      `;
      container.appendChild(item);
    });
  }
}

function filterTransactions(type, category="", btn) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');

  if (type === 'all') {
    renderTransactions(data.transactions);
  } else if(type === 'withdraw') {
    if(category === ""){
      const filtered = data.transactions.filter(t => t.type === type);
      renderTransactions(filtered);
    }else{
      console.log(data.transactions)
      const filtered = data.transactions.filter(t => t.category === category);
      renderTransactions(filtered);
    }
  }else{
    const filtered = data.transactions.filter(t => t.type === type);
    renderTransactions(filtered);
  }
}

function resetData() {
  if (confirm('هل أنت متأكد من تصفير كافة البيانات والخزينة؟')) {
    data = { balance: 0, transactions: [] };
    saveData();
    updateUI();
  }
}