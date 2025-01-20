<template>
      <div
        class="w-fit rounded-md text-xs border"
        :class="['group', { active: isActive }]"
        @click="handleClick"
      >
        {{ position }}
      </div>
  </template>
  
  <script>
  export default {
    name: 'GroupPlayerComponent',
    props: {
      position: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        isActive: false,
      };
    },
    emits: ["groupClicked"],
    methods: {
      handleClick() {
        this.isActive = !this.isActive;
        this.$emit('groupClicked', this.position, this.isActive);
      },
    },
  };
  </script>
  
  <style scoped>
  .group {
    padding: 4px;
    cursor: pointer;
  }
  
  .group.active {
    background-color: #ffa53a;
    font-weight: bold;
  }
  </style>
  