<template>
    <div class="input-wrapper">
        <div class="label" v-if="label">{{ label }}</div>
        <input
            type="number"
            :value="modelValue"
            @input="onInput"
            inputmode="numeric"
            pattern="[0-9]*"
            class="input-field f-bangopro"
            :placeholder="placeholder"
        />
    </div>
</template>

<script>
export default {
    name: "InputNumber",
    props: {
        modelValue: {
            type: [String, Number],
            default: "",
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
    methods: {
        onInput(event) {
            const value = event.target.value;
            const numericValue = value.replace(/[^0-9]/g, "");

            // Nếu `modelValue` là kiểu `Number`, chuyển thành số
            if (typeof this.modelValue === "number") {
                this.$emit("update:modelValue", parseFloat(numericValue));
            } else {
                this.$emit("update:modelValue", numericValue);
            }
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
