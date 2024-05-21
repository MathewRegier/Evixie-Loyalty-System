document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      console.log('Token expired, removing token.');
      localStorage.removeItem('token');
      window.location.href = 'login.html'; // Redirect to login if the token is expired
    } else if (!token && window.location.pathname !== '/login.html') {
      console.log('No token found, redirecting to login.');
      window.location.href = 'login.html'; // Redirect to login if no token is found
    }
  });
  
  function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  }
  