<template>
    <div class="input-wrapper">
        <div class="label" v-if="label">{{ label }}</div>
        <input
            :type="type"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            class="input-field f-bangopro"
            :placeholder="placeholder"
        />
    </div>
</template>

<script>
export default {
    name: "InputField",
    props: {
        modelValue: {
            type: [String, Number],
            default: "",
        },
        type: {
            type: String,
            default: "text",
        },
        label: {
            type: String,
            default: "",
        },
        placeholder: {
            type: String,
            default: "",
        },
    },
};
</script>

<style scoped>
@import "@/styles/global.scss";
.input-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
}

.input-field {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    text-align: right;
    color: black;
}

.label {
    margin-bottom: 5px;
}
</style>
