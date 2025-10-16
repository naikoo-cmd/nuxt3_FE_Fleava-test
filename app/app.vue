<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <!-- global, smooth page transition for all routes -->
    <div class="app-shell">
      <div class="app-content">
        <NuxtPage :transition="{ name: 'route-fade', mode: 'out-in' }" />
      </div>
      <Footer />
    </div>
  </NuxtLayout>
</template>

<style lang="scss" src="@/layout/styles/Theme.scss"></style>
<style>
/* minimal layout shell so footer sits at the bottom without overlapping content */
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
.app-content {
  flex: 1 1 auto;
  min-height: 0; /* prevents overflow issues on mobile */
}
</style>
