interface UserProfile {
  url: string;
  name: string;
  phone: string;
  signature: string;
}

export function getHtmlProfileView(userProfile: UserProfile): string {
  return `<div class="profile">
    <div class="name"><a href="${escapeHTMLAttribute(userProfile.url)}">${
      escapeHTMLAttribute(userProfile.name)
  }</a></div>
  <div class="phone">${escapeHTMLAttribute(userProfile.phone)}</div>
  <div class="signature">${escapeHTMLAttribute(userProfile.signature).replace('\n', '<br>')}</div>
    </div>`;
}

const textareaDOMElement = document.createElement('textarea');
function escapeHTMLAttribute(html: string) {
  textareaDOMElement.textContent = html;
  return textareaDOMElement.innerHTML;
}
