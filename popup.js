document.addEventListener('DOMContentLoaded', () => {
  const sshihabb007_urlInput = document.getElementById('url');
  const sshihabb007_depthInput = document.getElementById('depth');
  const sshihabb007_delayInput = document.getElementById('delay');
  const sshihabb007_scrollToBottomInput = document.getElementById('scroll-to-bottom');
  const sshihabb007_startButton = document.getElementById('start-crawl');
  const sshihabb007_stopButton = document.getElementById('stop-crawl');
  const sshihabb007_statusDiv = document.getElementById('status');
  const sshihabb007_pagesVisitedDiv = document.getElementById('pages-visited');
  const sshihabb007_timeElapsedDiv = document.getElementById('time-elapsed');
  const sshihabb007_brokenLinksUl = document.getElementById('broken-links');

  // Load saved state
  chrome.storage.local.get(['crawling', 'url', 'depth', 'delay', 'scrollToBottom'], (sshihabb007_result) => {
    if (sshihabb007_result.crawling) {
      sshihabb007_setUIState(true);
      sshihabb007_urlInput.value = sshihabb007_result.url || '';
      sshihabb007_depthInput.value = sshihabb007_result.depth || '1';
      sshihabb007_delayInput.value = sshihabb007_result.delay || '500';
      sshihabb007_scrollToBottomInput.checked = sshihabb007_result.scrollToBottom !== false;
    }
  });

  sshihabb007_startButton.addEventListener('click', () => {
    const sshihabb007_url = sshihabb007_urlInput.value;
    const sshihabb007_depth = sshihabb007_depthInput.value;
    const sshihabb007_delay = parseInt(sshihabb007_delayInput.value, 10);
    const sshihabb007_scrollToBottom = sshihabb007_scrollToBottomInput.checked;

    if (!sshihabb007_url) {
      sshihabb007_statusDiv.textContent = 'Status: Please enter a URL.';
      return;
    }

    try {
      new URL(sshihabb007_url);
    } catch (error) {
      sshihabb007_statusDiv.textContent = 'Status: Invalid URL.';
      return;
    }

    sshihabb007_setUIState(true);
    chrome.storage.local.set({ crawling: true, url: sshihabb007_url, depth: sshihabb007_depth, delay: sshihabb007_delay, scrollToBottom: sshihabb007_scrollToBottom });

    chrome.runtime.sendMessage({
      type: 'START_CRAWL',
      payload: { url: sshihabb007_url, depth: sshihabb007_depth, delay: sshihabb007_delay, scrollToBottom: sshihabb007_scrollToBottom }
    });
  });

  sshihabb007_stopButton.addEventListener('click', () => {
    sshihabb007_setUIState(false);
    chrome.storage.local.set({ crawling: false });
    chrome.runtime.sendMessage({ type: 'STOP_CRAWL' });
  });

  chrome.runtime.onMessage.addListener((sshihabb007_message) => {
    if (chrome.runtime.lastError) {
        // Ignore the error;
        return;
    }
    switch (sshihabb007_message.type) {
      case 'CRAWL_STATUS':
        sshihabb007_statusDiv.textContent = `Status: ${sshihabb007_message.payload.status}`;
        sshihabb007_pagesVisitedDiv.textContent = `Pages Visited: ${sshihabb007_message.payload.pagesVisited}`;
        sshihabb007_timeElapsedDiv.textContent = `Time Elapsed: ${sshihabb007_message.payload.timeElapsed}s`;
        break;
      case 'BROKEN_LINK':
        const sshihabb007_li = document.createElement('li');
        sshihabb007_li.textContent = `${sshihabb007_message.payload.url} - ${sshihabb007_message.payload.status}`;
        sshihabb007_brokenLinksUl.appendChild(sshihabb007_li);
        break;
      case 'CRAWL_COMPLETE':
        sshihabb007_setUIState(false);
        chrome.storage.local.set({ crawling: false });
        sshihabb007_statusDiv.textContent = 'Status: Crawl complete.';
        break;
    }
  });

  function sshihabb007_setUIState(sshihabb007_isCrawling) {
    sshihabb007_startButton.disabled = sshihabb007_isCrawling;
    sshihabb007_stopButton.disabled = !sshihabb007_isCrawling;
    sshihabb007_startButton.style.cursor = sshihabb007_isCrawling ? 'not-allowed' : 'pointer';
    sshihabb007_stopButton.style.cursor = sshihabb007_isCrawling ? 'pointer' : 'not-allowed';
  }
});
