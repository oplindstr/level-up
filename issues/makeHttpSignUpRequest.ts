export function makeHttpSignUpRequest(
  bearerToken: string,
  accountName: string,
  email: string,
  contentType: 'form' | 'json'
): string {
  let body = '';
  let requestContentType = '';

  if (contentType === 'form') {
    const encodedAccountName = encodeURIComponent(accountName)
    const encodedEmail = encodeURIComponent(email)

    body = `name=${encodedAccountName}&userEmail=${encodedEmail}`;
    requestContentType = 'application/x-www-form-urlencoded'
  } else {
    body = JSON.stringify({ name: accountName, userEmail: email });
    requestContentType = 'application/json'
  }

  return `POST /1/sign-up HTTP/1.1
    Host: api.myapp
    Authorization: Bearer ${bearerToken}
    Content-Type: ${requestContentType}
    Content-Length: ${body.length}
    
    ${body}`;
}

