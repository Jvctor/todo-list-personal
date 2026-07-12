// Service worker do Web Push: recebe a mensagem enviada pelo FCM e exibe a
// notificação, inclusive com o site fechado.
//
// Não carrega o SDK do Firebase de propósito. O push do FCM chega aqui como um
// Web Push padrão, então tratamos o evento `push` na mão — menos código, sem
// depender de script externo e sem risco de a notificação aparecer duplicada
// (o SDK também exibiria a sua).

const DEFAULT_TITLE = "Minhas tarefas";
const APP_URL = "/";

function readPayload(event) {
  if (!event.data) {
    return {};
  }
  try {
    return event.data.json();
  } catch (err) {
    return {};
  }
}

self.addEventListener("push", (event) => {
  const payload = readPayload(event);
  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || DEFAULT_TITLE;
  const options = {
    body: notification.body || data.body || "",
    // Agrupa por tarefa: um novo lembrete da mesma tarefa substitui o anterior
    // em vez de empilhar. Sem `todoId` (ex.: resumo diário), usa um grupo fixo.
    tag: data.todoId || "resumo",
    renotify: true,
    data: { url: data.url || APP_URL },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || APP_URL;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Reaproveita uma aba já aberta do app; só abre uma nova se não houver.
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});
