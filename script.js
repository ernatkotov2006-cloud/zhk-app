const form = document.getElementById('request-form');
const formTitle = document.getElementById('form-title');
const list = document.getElementById('request-list');
const residentBtn = document.getElementById('mode-resident');
const managerBtn = document.getElementById('mode-manager');
const filterStatus = document.getElementById('filter-status');
const filterCategory = document.getElementById('filter-category');

const newsForm = document.getElementById('news-form');
const newsFormTitle = document.getElementById('news-form-title');
const newsList = document.getElementById('news-list');

const pollForm = document.getElementById('poll-form');
const pollFormTitle = document.getElementById('poll-form-title');
const pollList = document.getElementById('poll-list');

const tabRequests = document.getElementById('tab-requests');
const tabNews = document.getElementById('tab-news');
const tabPolls = document.getElementById('tab-polls');
const requestsSection = document.getElementById('requests-section');
const newsSection = document.getElementById('news-section');
const pollsSection = document.getElementById('polls-section');

const STATUSES = ['Новая', 'В работе', 'Решена'];
const STATUS_CLASSES = {
  'Новая': 'new',
  'В работе': 'progress',
  'Решена': 'done'
};

let requests = JSON.parse(localStorage.getItem('requests')) || [];
let news = JSON.parse(localStorage.getItem('news')) || [];
let polls = JSON.parse(localStorage.getItem('polls')) || [];
let mode = 'resident';

function saveRequests() {
  localStorage.setItem('requests', JSON.stringify(requests));
}

function saveNews() {
  localStorage.setItem('news', JSON.stringify(news));
}

function savePolls() {
  localStorage.setItem('polls', JSON.stringify(polls));
}

function nowString() {
  return new Date().toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderRequests() {
  list.innerHTML = '';
  let shown = 0;

  requests.forEach(function (request, index) {
    const status = request.status || 'Новая';

    if (filterStatus.value !== 'all' && filterStatus.value !== status) return;
    if (filterCategory.value !== 'all' && filterCategory.value !== request.category) return;

    shown++;
    const item = document.createElement('li');

    const text = document.createElement('div');
    text.textContent = request.category + ', кв. ' + request.apartment + ': ' + request.description;
    item.appendChild(text);

    if (request.date) {
      const date = document.createElement('div');
      date.className = 'date';
      date.textContent = request.date;
      item.appendChild(date);
    }

    const badge = document.createElement('span');
    badge.textContent = status;
    badge.className = 'badge ' + STATUS_CLASSES[status];
    item.appendChild(badge);

    if (mode === 'manager') {
      const select = document.createElement('select');
      STATUSES.forEach(function (s) {
        const option = document.createElement('option');
        option.textContent = s;
        option.selected = (s === status);
        select.appendChild(option);
      });
      select.addEventListener('change', function () {
        requests[index].status = select.value;
        saveRequests();
        renderRequests();
      });
      item.appendChild(select);

      const del = document.createElement('button');
      del.textContent = 'Удалить';
      del.className = 'delete-btn';
      del.addEventListener('click', function () {
        if (confirm('Удалить эту заявку?')) {
          requests.splice(index, 1);
          saveRequests();
          renderRequests();
        }
      });
      item.appendChild(del);
    }

    list.appendChild(item);
  });

  if (shown === 0) {
    const empty = document.createElement('li');
    empty.textContent = requests.length === 0 ? 'Пока заявок нет' : 'По этим фильтрам заявок нет';
    list.appendChild(empty);
  }
}

function renderNews() {
  newsList.innerHTML = '';

  if (news.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'Новостей пока нет';
    newsList.appendChild(empty);
    return;
  }

  news.forEach(function (post, index) {
    const item = document.createElement('li');

    const title = document.createElement('div');
    title.className = 'news-title';
    title.textContent = post.title;
    item.appendChild(title);

    const text = document.createElement('div');
    text.textContent = post.text;
    item.appendChild(text);

    const date = document.createElement('div');
    date.className = 'date';
    date.textContent = post.date;
    item.appendChild(date);

    if (mode === 'manager') {
      const del = document.createElement('button');
      del.textContent = 'Удалить';
      del.className = 'delete-btn';
      del.addEventListener('click', function () {
        if (confirm('Удалить эту новость?')) {
          news.splice(index, 1);
          saveNews();
          renderNews();
        }
      });
      item.appendChild(del);
    }

    newsList.appendChild(item);
  });
}

function renderPolls() {
  pollList.innerHTML = '';

  if (polls.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'Опросов пока нет';
    pollList.appendChild(empty);
    return;
  }

  polls.forEach(function (poll, index) {
    const item = document.createElement('li');

    const question = document.createElement('div');
    question.className = 'news-title';
    question.textContent = poll.question;
    item.appendChild(question);

    const total = poll.options.reduce(function (sum, o) { return sum + o.votes; }, 0);
    const showResults = (poll.myVote !== undefined) || mode === 'manager';

    poll.options.forEach(function (option, optionIndex) {
      if (showResults) {
        const percent = total === 0 ? 0 : Math.round(option.votes / total * 100);

        const row = document.createElement('div');
        row.className = 'result-row';
        const mark = (poll.myVote === optionIndex) ? ' ✓' : '';
        row.textContent = option.text + mark + ': ' + option.votes + ' (' + percent + '%)';

        const barWrap = document.createElement('div');
        barWrap.className = 'bar-wrap';
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.width = percent + '%';
        barWrap.appendChild(bar);
        row.appendChild(barWrap);

        item.appendChild(row);
      } else {
        const btn = document.createElement('button');
        btn.textContent = option.text;
        btn.className = 'option-btn';
        btn.addEventListener('click', function () {
          poll.options[optionIndex].votes++;
          poll.myVote = optionIndex;
          savePolls();
          renderPolls();
        });
        item.appendChild(btn);
      }
    });

    const info = document.createElement('div');
    info.className = 'date';
    info.textContent = 'Всего голосов: ' + total + ' · ' + poll.date;
    item.appendChild(info);

    if (mode === 'manager') {
      const del = document.createElement('button');
      del.textContent = 'Удалить';
      del.className = 'delete-btn';
      del.addEventListener('click', function () {
        if (confirm('Удалить этот опрос?')) {
          polls.splice(index, 1);
          savePolls();
          renderPolls();
        }
      });
      item.appendChild(del);
    }

    pollList.appendChild(item);
  });
}

function setMode(newMode) {
  mode = newMode;
  const isResident = (mode === 'resident');

  form.style.display = isResident ? 'block' : 'none';
  formTitle.style.display = isResident ? 'block' : 'none';
  newsForm.style.display = isResident ? 'none' : 'block';
  newsFormTitle.style.display = isResident ? 'none' : 'block';
  pollForm.style.display = isResident ? 'none' : 'block';
  pollFormTitle.style.display = isResident ? 'none' : 'block';

  residentBtn.classList.toggle('active', isResident);
  managerBtn.classList.toggle('active', !isResident);

  renderRequests();
  renderNews();
  renderPolls();
}

function setTab(tab) {
  requestsSection.style.display = (tab === 'requests') ? 'block' : 'none';
  newsSection.style.display = (tab === 'news') ? 'block' : 'none';
  pollsSection.style.display = (tab === 'polls') ? 'block' : 'none';

  tabRequests.classList.toggle('active', tab === 'requests');
  tabNews.classList.toggle('active', tab === 'news');
  tabPolls.classList.toggle('active', tab === 'polls');
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const request = {
    category: document.getElementById('category').value,
    apartment: document.getElementById('apartment').value,
    description: document.getElementById('description').value,
    status: 'Новая',
    date: nowString()
  };

  requests.unshift(request);
  saveRequests();
  renderRequests();
  form.reset();
});

newsForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const post = {
    title: document.getElementById('news-title').value,
    text: document.getElementById('news-text').value,
    date: nowString()
  };

  news.unshift(post);
  saveNews();
  renderNews();
  newsForm.reset();
});

pollForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const lines = document.getElementById('poll-options').value
    .split('\n')
    .map(function (line) { return line.trim(); })
    .filter(function (line) { return line !== ''; });

  if (lines.length < 2) {
    alert('Нужно минимум 2 варианта ответа');
    return;
  }
  if (lines.length > 6) {
    alert('Максимум 6 вариантов ответа');
    return;
  }

  const poll = {
    question: document.getElementById('poll-question').value,
    options: lines.map(function (line) { return { text: line, votes: 0 }; }),
    date: nowString()
  };

  polls.unshift(poll);
  savePolls();
  renderPolls();
  pollForm.reset();
});

residentBtn.addEventListener('click', function () { setMode('resident'); });
managerBtn.addEventListener('click', function () { setMode('manager'); });
tabRequests.addEventListener('click', function () { setTab('requests'); });
tabNews.addEventListener('click', function () { setTab('news'); });
tabPolls.addEventListener('click', function () { setTab('polls'); });
filterStatus.addEventListener('change', renderRequests);
filterCategory.addEventListener('change', renderRequests);

setMode('resident');