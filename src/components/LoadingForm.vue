<template>
    <div class="loading-container" v-if="loading">
        <div class="loading"></div>
    </div>
</template>

<script>
export default {
    props: {
        loading: {
            type: Boolean,
            required: true,
        },
    },
};
</script>

<style scoped>
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px; /* Điều chỉnh kích thước container tùy thuộc vào nhu cầu */
}

.loading {
    border: 4px solid #f3f3f3; /* Màu nền của vòng tròn */
    border-top: 4px solid #3498db; /* Màu của vòng tròn */
    border-radius: 50%; /* Làm tròn các góc để tạo thành hình tròn */
    width: 30px; /* Kích thước vòng tròn */
    height: 30px; /* Kích thước vòng tròn */
    animation: spin 1s linear infinite; /* Sử dụng animation "spin" trong 1 giây với tốc độ linear và lặp vô hạn */
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    } /* Góc quay ban đầu */
    100% {
        transform: rotate(360deg);
    } /* Góc quay cuối cùng (một vòng tròn) */
}
</style>
