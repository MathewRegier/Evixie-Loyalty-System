document.addEventListener('DOMContentLoaded', async () => {
  document.body.style.display = 'none'; // Hide the body initially

  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const isTokenExpired = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  };

  if (isTokenExpired(token)) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  const response = await fetch('/company/branding', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    console.error('Failed to load branding information.');
    document.body.style.display = 'block'; // Show the body if there's an error
    return;
  }

  const branding = await response.json();
  console.log('Branding data retrieved:', branding); // Debug log

  applyBranding(branding);

  document.body.style.display = 'block'; // Show the body after branding is loaded
});

function applyBranding(branding) {
  if (branding.logoUrl) {
    const logo = document.getElementById('companyLogo');
    if (logo) {
      logo.src = branding.logoUrl;
    }
  }
  if (branding.primaryColor) {
    document.documentElement.style.setProperty('--primary-color', branding.primaryColor);
  }
  if (branding.secondaryColor) {
    document.documentElement.style.setProperty('--secondary-color', branding.secondaryColor);
  }
  if (branding.backgroundColor) {
    document.documentElement.style.setProperty('--background-color', branding.backgroundColor);
    const formGroupContainer = document.querySelector('.form-group-container');
    if (formGroupContainer) {
      formGroupContainer.style.backgroundColor = branding.backgroundColor;
    }
  }
  if (branding.textColor) {
    document.documentElement.style.setProperty('--text-color', branding.textColor);
  }
  if (branding.buttonBackgroundColor) {
    document.documentElement.style.setProperty('--button-background-color', branding.buttonBackgroundColor);
  }
  if (branding.buttonTextColor) {
    document.documentElement.style.setProperty('--button-text-color', branding.buttonTextColor);
  }
}
