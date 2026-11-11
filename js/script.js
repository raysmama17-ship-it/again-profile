// 01. 휴대폰 메뉴 열기·닫기와 접근성 상태 동기화
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
const mobileQuery = window.matchMedia('(max-width: 767px)');

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  toggle.querySelector('.menu-icon').textContent = open ? '×' : '☰';
  header.classList.toggle('menu-open', open);
  navigation.hidden = mobileQuery.matches && !open;
}

function syncMenu() {
  const focusWasInNav = navigation.contains(document.activeElement);
  const focusWasOnToggle = document.activeElement === toggle;
  toggle.hidden = !mobileQuery.matches;
  setMenu(false);
  if (mobileQuery.matches && focusWasInNav) toggle.focus();
  if (!mobileQuery.matches && focusWasOnToggle) navigation.querySelector('a').focus();
}

toggle.addEventListener('click', () => {
  setMenu(toggle.getAttribute('aria-expanded') !== 'true');
});

navigation.addEventListener('click', event => {
  if (mobileQuery.matches && event.target.closest('a')) {
    setMenu(false);
    // 닫힌 메뉴 안에 키보드 초점이 남지 않도록 버튼으로 되돌림
    toggle.focus({ preventScroll: true });
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
  }
});

document.addEventListener('click', event => {
  if (mobileQuery.matches && !header.contains(event.target)) setMenu(false);
});

mobileQuery.addEventListener('change', syncMenu);
syncMenu();

// 02. 스크롤 상태 표시: 헤더 색상은 유지하고 하단 구분 그림자만 적용
function syncHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 16);
}
window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

// 03. 문의 폼 입력 확인: 실제 전송 서비스는 아직 연결되지 않음
const contactForm = document.querySelector('#contact-form');
const formMessage = document.querySelector('#form-msg');
const nameField = document.querySelector('#name');
const emailField = document.querySelector('#email');
const messageField = document.querySelector('#message');
const contactFields = [nameField, emailField, messageField];

contactForm.addEventListener('submit', event => {
  event.preventDefault(); // 연결 전에는 페이지 이동이나 네트워크 전송을 하지 않음
  contactFields.forEach(field => {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  });

  const errors = [];
  if (!nameField.value.trim()) errors.push([nameField, '이름을 입력해 주세요.']);
  if (!emailField.value.trim() || emailField.validity.typeMismatch) {
    errors.push([emailField, '올바른 이메일 주소를 입력해 주세요.']);
  }
  if (messageField.value.trim().length < 10) {
    errors.push([messageField, '문의 내용을 10자 이상 입력해 주세요.']);
  }

  formMessage.classList.toggle('is-error', errors.length > 0);
  if (errors.length) {
    errors.forEach(([field]) => {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', 'form-msg');
    });
    formMessage.textContent = errors.map(([, text]) => text).join(' ');
    errors[0][0].focus();
    return;
  }

  formMessage.textContent = '입력 내용을 확인했습니다. 아직 전송 서비스가 연결되지 않아 문의가 전송되지는 않았습니다.';
});

// 이벤트 연결 후 버튼 활성화: JavaScript가 꺼져 있을 때 잘못 제출되는 것 방지
contactForm.querySelector('button[type="submit"]').disabled = false;
