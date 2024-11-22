<template>
    <div class="input-wrapper">
        <div class="label" v-if="label">{{ $t(label) }}</div>
        <div class="input-container">
            <input
                :type="type"
                :value="modelValue"
                @input="validateInput($event)"
                class="input-field f-bangopro"
                :placeholder="$t(placeholder)"
                inputmode="numeric"
                pattern="[0-9]*"
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
        validateInput(event) {
            const value = event.target.value;

            const numericValue = value.replace(/\D+/g, '');
            event.target.value = numericValue;
            this.$emit('update:modelValue', numericValue);
        },
        emitSelectedOption() {
            this.$emit("update:selectedOption", this.localSelectedOption);
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
    position: relative;
}

.input-container {
    position: relative;
    width: 100%;
}

.input-field {
    padding: 4px 50px 4px 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    color: #000000ed;
}

.input-select {
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    padding: 5px 9px;
    background: #f0f0f0;
    border-left: 1px solid #ccc;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    cursor: pointer;
    appearance: none;
    color: #000000ed;
    font-weight: 800;
}

.label {
    margin-bottom: 5px;
}
</style>
