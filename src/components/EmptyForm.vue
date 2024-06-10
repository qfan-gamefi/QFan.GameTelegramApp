<template>
    <div class="empty-data">
        <h2>{{ title }}</h2>
        <!-- <p>{{ message }}</p> -->
        <slot></slot>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: "No Data!",
        },
        message: {
            type: String,
            default: "No data available.",
        },
    },
};
</script>

<style scoped>
.empty-data {
    text-align: center;
    margin-top: 50px;
    text-shadow: 1px 1px 0 #9f8900, -1px -1px 0 #9f8900, 1px -1px 0 #9f8900,
        -1px 1px 0 #9f8900, 1px 0 0 #9f8900, -1px 0 0 #9f8900, 0 1px 0 #9f8900,
        0 -1px 0 #9f8900;
}
</style>
