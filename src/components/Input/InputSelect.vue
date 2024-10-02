<template>
    <div class="input-wrapper">
        <div class="label" v-if="label">{{ label }}</div>
        <div class="input-container">
            <input
                :type="type"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
                class="input-field"
                :placeholder="placeholder"
            />
            <select
                v-model="localSelectedOption"
                class="input-select"
                @change="emitSelectedOption"
            >
                <option v-for="option in options" :key="option" :value="option">
                    {{ option }}
                </option>
            </select>
        </div>
    </div>
</template>

<script>
export default {
    name: "InputSelect",
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
        options: {
            type: Array,
            default: () => [],
        },
        selectedOption: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            localSelectedOption: this.selectedOption,
        };
    },
    watch: {
        selectedOption(newVal) {
            this.localSelectedOption = newVal;
        },
    },
    methods: {
        emitSelectedOption() {
            this.$emit("update:selectedOption", this.localSelectedOption);
        },
    },
};
</script>

<style scoped>
.input-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    position: relative;
}

.input-container {
    position: relative;
    width: 100%;
}

.input-field {
    padding: 8px 50px 8px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    font-family: "GAMERIA";
}

.input-select {
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    padding: 7px;
    background: #f0f0f0;
    border-left: 1px solid #ccc;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    cursor: pointer;
}

.label {
    margin-bottom: 5px;
}
</style>
