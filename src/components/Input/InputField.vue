<template>
    <div class="input-wrapper">
        <div class="label" v-if="label">{{ label }}</div>
        <input
            :type="type"
            :value="modelValue"
            class="input-field f-bangopro"
            :placeholder="placeholder"
            :inputmode="type === 'number' ? 'numeric' : null"
            @input="onInput"
            :min="positiveIntegerOnly && type === 'number' ? 1 : null"
            @keypress="onKeyPress"
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
        positiveIntegerOnly: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        onInput(event) {
            let value = event.target.value;
            if(this.type === 'number' && this.positiveIntegerOnly){
                value = value.replace(/[^0-9]/g, '')
                if (value < 1) value = 1
            }
            
            this.$emit('update:modelValue', value);
        },
        onKeyPress(event) {
            if (event.key === '.' && this.positiveIntegerOnly) {
                event.preventDefault();
            }
        }
    }
};
</script>

<style scoped>
@import "@/styles/global.scss";
.input-wrapper {
    display: flex;
    flex-direction: column;
    font-size: 12px;
}

.input-field {
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    text-align: right;
    color: #000000;
}

.label {
    margin-bottom: 5px;
}
</style>
