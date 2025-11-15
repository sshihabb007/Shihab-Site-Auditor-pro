let sshihabb007_crawlState = {
  isCrawling: false,
  continuousCrawl: false,
  startTime: null,
  initialUrl: null,
  crawlDepth: 1,
  crawlDelay: 7000,
  scrollToBottom: true,
  visitedUrls: new Set(),
  urlQueue: [],
  pagesVisited: 0,
  timeElapsed: 0,
};

function sshihabb007_sendMessageToPopup(message) {
    chrome.runtime.sendMessage(message, () => {
        if (chrome.runtime.lastError) {
            // Ignore the error
        }
    });
}

chrome.runtime.onMessage.addListener((sshihabb007_message, sshihabb007_sender, sshihabb007_sendResponse) => {
  switch (sshihabb007_message.type) {
    case 'START_CRAWL':
      sshihabb007_startCrawl(sshihabb007_message.payload);
      break;
    case 'STOP_CRAWL':
      sshihabb007_stopCrawl();
      break;
  }
});

function sshihabb007_startCrawl({ url: sshihabb007_url, depth: sshihabb007_depth, delay: sshihabb007_delay, scrollToBottom: sshihabb007_scrollToBottom }) {
  if (sshihabb007_crawlState.isCrawling) {
    return;
  }

  console.log('Starting crawl with:', { sshihabb007_url, sshihabb007_depth, sshihabb007_delay, sshihabb007_scrollToBottom });

  sshihabb007_crawlState = {
    ...sshihabb007_crawlState,
    isCrawling: true,
    continuousCrawl: true,
    startTime: Date.now(),
    initialUrl: new URL(sshihabb007_url),
    crawlDepth: sshihabb007_depth === 'full' ? Infinity : parseInt(sshihabb007_depth, 10),
    crawlDelay: sshihabb007_delay,
    scrollToBottom: sshihabb007_scrollToBottom,
    urlQueue: [{ url: sshihabb007_url, depth: 0 }],
    visitedUrls: new Set(),
    pagesVisited: 0,
    timeElapsed: 0,
  };

  sshihabb007_crawlNext();
}

function sshihabb007_stopCrawl() {
  console.log('Stopping crawl.');
  sshihabb007_crawlState.isCrawling = false;
  sshihabb007_crawlState.continuousCrawl = false;
  sshihabb007_sendMessageToPopup({ type: 'CRAWL_COMPLETE' });
}

async function sshihabb007_crawlNext() {
  if (!sshihabb007_crawlState.isCrawling) {
    return;
  }

  if (sshihabb007_crawlState.urlQueue.length === 0) {
    if (sshihabb007_crawlState.continuousCrawl) {
      console.log('Restarting crawl.');
      sshihabb007_crawlState.urlQueue = [{ url: sshihabb007_crawlState.initialUrl.href, depth: 0 }];
      sshihabb007_crawlState.visitedUrls = new Set();
      sshihabb007_crawlState.pagesVisited = 0;
      sshihabb007_crawlNext();
    } else {
      sshihabb007_stopCrawl();
    }
    return;
  }

  const { url: sshihabb007_url, depth: sshihabb007_depth } = sshihabb007_crawlState.urlQueue.shift();

  if (sshihabb007_crawlState.visitedUrls.has(sshihabb007_url) || sshihabb007_depth > sshihabb007_crawlState.crawlDepth) {
    sshihabb007_crawlNext();
    return;
  }

  try {
    const sshihabb007_response = await fetch(sshihabb007_url, { method: 'HEAD' });
    if (!sshihabb007_response.ok) {
      sshihabb007_sendMessageToPopup({
        type: 'BROKEN_LINK',
        payload: { url: sshihabb007_url, status: sshihabb007_response.status },
      });
    }
  } catch (sshihabb007_error) {
    sshihabb007_sendMessageToPopup({
      type: 'BROKEN_LINK',
      payload: { url: sshihabb007_url, status: 'Network Error' },
    });
  }

  sshihabb007_crawlState.visitedUrls.add(sshihabb007_url);
  sshihabb007_crawlState.pagesVisited++;
  sshihabb007_updateStatus();

  // Create a new tab to crawl the page
  chrome.tabs.create({ url: sshihabb007_url, active: false }, (sshihabb007_tab) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: sshihabb007_tab.id },
        files: ['content.js'],
      },
      () => {
        chrome.tabs.sendMessage(sshihabb007_tab.id, { type: 'GET_LINKS', payload: { url: sshihabb007_url, depth: sshihabb007_depth, scrollToBottom: sshihabb007_crawlState.scrollToBottom } }, (sshihabb007_response) => {
          if (chrome.runtime.lastError) {
              // Ignore the error
              return;
          }
          if (sshihabb007_response && sshihabb007_response.links) {
            sshihabb007_handleFoundLinks(sshihabb007_response);
          }
          chrome.tabs.remove(sshihabb007_tab.id);
        });
      }
    );
  });


  setTimeout(sshihabb007_crawlNext, sshihabb007_crawlState.crawlDelay);
}

function sshihabb007_handleFoundLinks({ links: sshihabb007_links, depth: sshihabb007_depth }) {
    const sshihabb007_currentDepth = sshihabb007_depth + 1;

    for (const sshihabb007_link of sshihabb007_links) {
      const sshihabb007_absoluteUrl = new URL(sshihabb007_link, sshihabb007_crawlState.initialUrl.origin).href;
      if (
        sshihabb007_absoluteUrl.startsWith(sshihabb007_crawlState.initialUrl.origin) &&
        !sshihabb007_crawlState.visitedUrls.has(sshihabb007_absoluteUrl)
      ) {
        sshihabb007_crawlState.urlQueue.push({ url: sshihabb007_absoluteUrl, depth: sshihabb007_currentDepth });
      }
    }
}


function sshihabb007_updateStatus() {
  sshihabb007_crawlState.timeElapsed = Math.floor((Date.now() - sshihabb007_crawlState.startTime) / 1000);
  sshihabb007_sendMessageToPopup({
    type: 'CRAWL_STATUS',
    payload: {
      status: 'Crawling...',
      pagesVisited: sshihabb007_crawlState.pagesVisited,
      timeElapsed: sshihabb007_crawlState.timeElapsed,
    },
  });
}
