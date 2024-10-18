<template>
    <div>{{ label }}</div>
    <div class="custom-select">
        <select :value="value" @change="onChange($event)">
            <option
                v-for="option in options"
                :key="option.value"
                :value="option.value"
            >
                {{ option.text }}
            </option>
        </select>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "CustomSelect",
    props: {
        value: {
            type: [String, Number],
            required: true,
        },
        options: {
            type: Array as () => { value: string | number; text: string }[],
            required: true,
        },
        label: {
            type: String,
            default: "Select an option",
        },
    },
    emits: ["update:value"],
    methods: {
        onChange(event: Event) {
            const selectedValue = (event.target as HTMLSelectElement).value;
            this.$emit("update:value", selectedValue);
        },
    },
});
</script>

<style scoped>
.custom-select {
    position: relative;
    width: 100%;
    max-width: 300px;
}

select {
    width: 100%;
    border-radius: 5px;
    background-color: #ffa53a;
    transition: border-color 0.3s ease;
    appearance: none;
    padding-left: 10px;
}

select:focus {
    border-color: #007bff;
    outline: none;
}

option {
    /* padding: 10px; */
}

select[value=""] {
    color: #aaa;
}

.custom-select::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 16px;
    width: 10px;
    height: 10px;
    background-color: #fff;
    clip-path: polygon(100% 0%, 0 0%, 50% 100%);
    transform: translateY(-50%);
}
</style>
