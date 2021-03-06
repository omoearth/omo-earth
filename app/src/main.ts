import App from "./App.svelte";
import {EventBroker, Topic} from "./eventBroker";

declare global
{
  interface Window
  {
    shellEvents: Topic<any>;
    trigger: (trigger:any) => void;
  }
}

const eventBroker = new EventBroker();
window.shellEvents = eventBroker.createTopic("omo", "shell");
window.trigger = (trigger:any) => window.shellEvents.publish(trigger);
window.shellEvents.observable.subscribe(event => {
  console.log("main.ts receive 'omo.shell' event:", event);
})

const app = new App({
  target: document.body,
});

export default app;
