<script setup lang="ts">
  /*
   * Sets class `dark` on `html` elem (if browser `prefers-color-scheme: dark`)
   * which activates TailwindCSS class-based dark mode
   */
  useDark()
</script>

<template>
  <div class="bg-rad-fill-ghost text-rad-foreground-contrast">
    Testing tailwind, rad themed colors and dark-mode support (delete me)
  </div>
  <NuxtWelcome/>
</template>