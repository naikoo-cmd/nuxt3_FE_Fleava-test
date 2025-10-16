<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <span class="logo-dot" /> Naiko Movies
      </div>

    <nav class="site-footer__nav" aria-label="Footer">
      <NuxtLink to="/" class="site-footer__link">Beranda</NuxtLink>
      <NuxtLink to="/popular" class="site-footer__link">Populer</NuxtLink>
      <NuxtLink to="/top-rated" class="site-footer__link">Paling Dinilai</NuxtLink>
      <NuxtLink to="/upcoming" class="site-footer__link">Segera Tayang</NuxtLink>
    </nav>

      <div class="site-footer__social" aria-label="Social links">
        <a href="https://twitter.com" target="_blank" rel="noopener" class="site-footer__icon" aria-label="X">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M18.9 2H22l-8.1 9.3L22.7 22h-6.3l-5-6-5.8 6H2.4L11 12.3 2 2h6.4l4.6 5.5L18.9 2Zm-1.1 18h1.8L6.3 4H4.5l13.3 16Z"/></svg>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener" class="site-footer__icon" aria-label="Instagram">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.75-2.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z"/></svg>
        </a>
        <a href="https://github.com" target="_blank" rel="noopener" class="site-footer__icon" aria-label="GitHub">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.19-3.37-1.19a2.66 2.66 0 0 0-1.11-1.47c-.91-.62.07-.61.07-.61a2.1 2.1 0 0 1 1.53 1.03 2.13 2.13 0 0 0 2.9.83 2.13 2.13 0 0 1 .63-1.34c-2.22-.25-4.56-1.11-4.56-4.93A3.86 3.86 0 0 1 6.5 7.3a3.6 3.6 0 0 1 .1-2.65s.84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02a3.6 3.6 0 0 1 .1 2.65 3.86 3.86 0 0 1 1.02 2.67c0 3.83-2.34 4.68-4.57 4.93a2.39 2.39 0 0 1 .68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>
        </a>
      </div>
    </div>

    <div class="site-footer__legal">
      <small>© 2025 Naiko Movies. All rights reserved.</small>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style lang="scss" src="@/layout/styles/Footer.scss"></style>