chrome.runtime.onMessage.addListener((sshihabb007_message, sshihabb007_sender, sshihabb007_sendResponse) => {
  if (sshihabb007_message.type === 'GET_LINKS') {
    if (sshihabb007_message.payload.scrollToBottom) {
      sshihabb007_scrollToBottom().then(() => {
        const sshihabb007_links = Array.from(document.querySelectorAll('a'))
          .map(a => a.href)
          .filter(href => href.startsWith('http'));
        sshihabb007_sendResponse({
          links: sshihabb007_links,
          depth: sshihabb007_message.payload.depth,
        });
      });
    } else {
      const sshihabb007_links = Array.from(document.querySelectorAll('a'))
        .map(a => a.href)
        .filter(href => href.startsWith('http'));
      sshihabb007_sendResponse({
        links: sshihabb007_links,
        depth: sshihabb007_message.payload.depth,
      });
    }
  }
  return true; // To indicate that the response will be sent asynchronously
});

function sshihabb007_scrollToBottom() {
  return new Promise((resolve) => {
    const distance = 100;
    const delay = 100;
    const timer = setInterval(() => {
      window.scrollBy(0, distance);
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
        clearInterval(timer);
        resolve();
      }
    }, delay);
  });
}
