# Чат Telegram на GREEN-API

Тестовое задание на позицию «Фронтенд-разработчик React» в GREEN-API: простой веб-интерфейс для отправки и получения текстовых сообщений в Telegram. Внешний вид повторяет [web.telegram.org](https://web.telegram.org/).

> По ТЗ основной мессенджер — MAX, но разрешена замена на WhatsApp или Telegram. Решение сделано для Telegram.

## Возможности

1. Вход по учётным данным инстанса GREEN-API: `idInstance` и `apiTokenInstance`.
2. Создание чата по номеру телефона получателя.
3. Отправка текстовых сообщений методом [SendMessage](https://green-api.com/telegram/docs/api/sending/SendMessage/).
4. Получение ответов через [HTTP API](https://green-api.com/telegram/docs/api/receiving/technology-http-api/): `ReceiveNotification` + `DeleteNotification`.
5. Статусы исходящих сообщений: отправляется, отправлено, доставлено, прочитано, ошибка.

## Быстрый старт

Нужен Node.js 20.19+ или 22.12+.

```bash
npm install
npm run dev
```

Приложение откроется на http://localhost:5173.

Другие команды:

```bash
npm run build    # проверка типов и production-сборка в dist/
npm run preview  # просмотр собранной версии
npm run lint     # ESLint
```

## Подготовка инстанса GREEN-API

1. Зарегистрируйтесь в [личном кабинете](https://console.green-api.com) и создайте инстанс для Telegram.
2. Авторизуйте его: в приложении Telegram откройте **Настройки → Устройства → Подключить устройство** и отсканируйте QR-код из кабинета.
3. В настройках инстанса:
   - оставьте **пустым** поле `webhookUrl`. Если адрес вебхука задан, `ReceiveNotification` не работает;
   - включите получение входящих сообщений и статусов исходящих.
4. Скопируйте из кабинета `idInstance` и `apiTokenInstance`.

## Сценарий проверки

1. Откройте приложение и введите `idInstance` и `apiTokenInstance`.
2. Введите номер получателя в международном формате, например `+7 999 123-45-67`, и нажмите «+».
3. Напишите сообщение и отправьте его (Enter — отправить, Shift+Enter — перенос строки).
4. Ответьте с аккаунта получателя в Telegram. Ответ появится в чате.

## Как это устроено

```
src/
├── api/greenApi.ts           # запросы к GREEN-API и разбор ошибок
├── hooks/useNotifications.ts # цикл получения уведомлений (long polling)
├── state/
│   ├── chatReducer.ts        # чаты, сообщения, статусы
│   └── storage.ts            # сохранение в sessionStorage / localStorage
├── components/               # LoginPage, Messenger, Sidebar, ChatView и др.
└── utils/                    # форматирование номеров и дат
```

- **Хост API.** У каждого инстанса свой `apiUrl`, и он совпадает с первыми четырьмя цифрами `idInstance` (`4100123456` → `https://4100.api.green-api.com`). Приложение вычисляет его само (`getApiUrl` в `src/api/greenApi.ts`), поэтому пользователь вводит только `idInstance` и `apiTokenInstance`.
- **Номер → chatId.** Telegram адресует личные чаты числовым `chatId`. При создании чата номер проверяется методом [CheckAccount](https://green-api.com/telegram/docs/api/service/CheckAccount/), и дальше сообщения отправляются и сопоставляются по `chatId`, как рекомендует документация.
- **Получение.** `useNotifications` в цикле вызывает `receiveNotification` с `receiveTimeout=20`. Каждое уведомление обрабатывается и удаляется через `deleteNotification`, даже если обработать его не удалось, иначе очередь остановится. При ошибке сети цикл повторяется через 5 секунд, а в интерфейсе появляется предупреждение.
- **Типы уведомлений.** Обрабатываются:
  - `incomingMessageReceived` — входящие;
  - `outgoingMessageReceived` — сообщения, отправленные с телефона;
  - `outgoingMessageStatus` — статусы доставки.

  Учитываются текстовые типы `textMessage` и `extendedTextMessage`.
- **Только созданные чаты.** Список чатов формирует сам пользователь. Уведомления из остальных чатов Telegram удаляются из очереди, но в интерфейс не попадают.
- **Отправка.** Сообщение сразу появляется в чате со статусом «отправляется». После ответа API оно получает настоящий `idMessage`, к которому дальше привязываются статусы доставки.
- **Хранение.** Учётные данные лежат в `sessionStorage` и удаляются при закрытии вкладки. История чатов хранится в `localStorage` отдельно для каждого инстанса.

## Стек

React 19, TypeScript, Vite. Сторонних UI-библиотек и библиотек состояния нет: функциональность минимальна, и встроенного `useReducer` достаточно.
