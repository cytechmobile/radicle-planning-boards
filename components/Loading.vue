<!-- Source: https://app.radicle.xyz/nodes/seed.radicle.garden/rad:z4V1sjrXqjvFdnCUbxPFqd5p4DtH5/tree/src/components/Loading.svelte -->
<script setup lang="ts">
defineProps<{
  grayscale?: boolean
  small?: boolean
  center?: boolean
  fadeIn?: boolean
  margins?: boolean
  condensed?: boolean
}>()
</script>

<template>
  <div class="flex h-full items-center justify-center">
    <div
      class="spinner"
      :class="{ grayscale, small, center, 'fade-in': fadeIn, margins, condensed }"
    >
      <div class="bounce1"></div>
      <template v-if="!condensed">
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </template>
    </div>
  </div>
</template>


<style scoped>
.spinner {
  margin: auto 0;
  width: 70px;
  text-align: center;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.spinner.center {
  margin: auto auto;
}
.spinner.margins {
  margin: 0 0.5rem;
}

.spinner > div {
  width: 18px;
  height: 18px;
  background-color: var(--color-fill-secondary);
  border-radius: 9999px;
  display: inline-block;
  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}

.spinner.grayscale > div {
  background-color: var(--color-fill-ghost);
}

.spinner.condensed > div {
  -webkit-animation: sk-bouncedelay-condensed 0.7s infinite linear both;
  animation: sk-bouncedelay-condensed 0.7s infinite linear both;
}

.spinner.small > div {
  width: 0.5rem;
  height: 0.5rem;
}

.spinner.small {
  width: 35px;
}

.spinner .bounce1 {
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}

.spinner .bounce2 {
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}

@keyframes sk-bouncedelay-condensed {
  0%,
  100% {
    -webkit-transform: scale(0.2);
    transform: scale(0.2);
  }
  50% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

@keyframes sk-bouncedelay {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

.fade-in {
  animation: fadeIn 1.5s;
  animation-timing-function: ease-in;
  -webkit-animation: fadeIn 1.5s;
  -webkit-animation-timing-function: ease-in;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>