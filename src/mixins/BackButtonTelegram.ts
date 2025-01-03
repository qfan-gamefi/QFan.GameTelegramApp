export default {
    mounted() {
      const tg = window.Telegram.WebApp;
  
        tg.ready();
        tg.BackButton.show();
  
        tg.BackButton.onClick(() => {
            this.$router.push("/");
        });
    },
    unmounted() {
        const tg = window.Telegram.WebApp;
        tg.BackButton.hide();
    }
  };
  