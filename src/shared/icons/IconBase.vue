<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 18 18"
    :aria-labelledby="iconName"
  >
    <title :id="iconName" lang="en">{{ iconName }} icon</title>
    <g class="container" :fill="iconColor">
      <component :is="iconName"></component>
    </g>
  </svg>
</template>

<script>
export default {
  name: "icon-base",
  props: {
    iconName: {
      type: String,
      default: "icon-close",
    },
    size: {
      type: [Number, String],
      default: 18,
    },
    iconColor: {
      type: String,
      default: "currentColor",
    },
  },
};
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
}

.container {
  /* fix for material icons */
  transform: translate(-3%, -3%) scale(0.8);
}
</style>
