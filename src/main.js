import { createApp } from "vue";
import App from "./App.vue";
import "./assets/tailwind.css";
import Icons from "@/shared/icons";

const app = createApp(App);

Icons.forEach((component) => app.component(component.name, component));

app.mount("#app");
