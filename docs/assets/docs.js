(function() {
  'use strict';

  // ============================================
  // 1. Mermaid.js CDN 로드
  // ============================================
  
  let mermaidLoaded = false;

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
  script.async = true;

  script.onload = () => {
    mermaidLoaded = true;
    console.log('✓ Mermaid loaded');
    mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
    mermaid.contentLoaded();
  };

  script.onerror = () => {
    console.warn('✗ Mermaid CDN load failed');
    const mermaidElements = document.querySelectorAll('.mermaid');
    mermaidElements.forEach(el => {
      el.style.border = '2px solid #d32f2f';
      el.style.padding = '20px';
      el.style.backgroundColor = '#ffecec';
      el.innerHTML = '<strong>❌ 다이어그램 로드 실패</strong><br/>브라우저 콘솔을 확인하세요.';
    });
  };

  document.head.appendChild(script);

  // ============================================
  // 2. PDF 다운로드 버튼
  // ============================================
  
  document.addEventListener('DOMContentLoaded', () => {
    const pdfButton = document.getElementById('pdf-button');
    if (pdfButton) {
      pdfButton.addEventListener('click', () => {
        if (mermaidLoaded) {
          // Mermaid 렌더링 완료 대기
          setTimeout(() => {
            window.print();
          }, 500);
        } else {
          alert('다이어그램을 로드 중입니다. 잠시 후 다시 시도해주세요.');
        }
      });
    }
  });

  // ============================================
  // 3. TOC (목차) 자동 생성
  // ============================================
  
  document.addEventListener('DOMContentLoaded', () => {
    generateTOC();
    setupActiveHighlight();
  });

  function generateTOC() {
    const headings = document.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    const toc = document.createElement('aside');
    toc.className = 'toc';
    
    const tocTitle = document.createElement('strong');
    tocTitle.textContent = '목차';
    toc.appendChild(tocTitle);

    let currentLevel = 0;
    let list = null;

    headings.forEach((heading, index) => {
      // 앵커 ID 생성
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }

      const level = parseInt(heading.tagName[1]); // h2 = 2, h3 = 3

      // 목록 구조 유지
      if (!list) {
        list = document.createElement('ul');
        toc.appendChild(list);
      }

      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      
      // h3는 h2보다 들여쓰기
      if (level === 3) {
        link.style.marginLeft = '20px';
      }

      li.appendChild(link);
      list.appendChild(li);
    });

    // 첫 main 요소 앞에 TOC 삽입
    const main = document.querySelector('main');
    if (main && toc.querySelector('ul')) {
      main.insertBefore(toc, main.firstChild);
    }
  }

  function setupActiveHighlight() {
    const links = document.querySelectorAll('.toc a');
    const headings = document.querySelectorAll('h2, h3');

    window.addEventListener('scroll', () => {
      let current = '';
      headings.forEach(heading => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
          current = heading.id;
        }
      });

      links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  }
})();
