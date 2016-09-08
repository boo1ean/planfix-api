## Инициализация

```js
var client = createApiClient({
	account: 'your_account_name',
	privateKey: 'your_private_key',
	apiKey: 'your_api_key'
});
```

## Авторизация

Перед тем как вызывать любыем методы, необходимо произвести авторизацию, после чего клиент будем прикреплять id сессии к каждому запросу автоматически

```js
client.auth.login({
	login: 'John',
	password: 'Galt'
});
```

## Доступные методы

Имена методов и их параметры совпадают с [оригинальной документацией](https://planfix.ru/docs/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%B9), только вместо `xml` используется `json` (автоматически кновертируется в xml)

## Пример использования
