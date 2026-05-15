# 0 to Infinity Ecommerce App using Spring Boot, MySQL and Thymeleaf

This ZIP contains:

1. `index.html` — the complete lesson page.
2. `css/style.css` — saffron professional theme.
3. `js/app.js`, `js/cart.js`, `js/api-demo.js`, `js/speak.js` — lesson JavaScript files.
4. `assets/spring-boot-ecommerce-og.png` — SEO / social sharing image.
5. `spring-boot-reference/` — reference Spring Boot project structure and sample code.

## How to view the lesson

Open `index.html` in a browser.

## How to start the Spring Boot reference app

1. Create MySQL database:

```sql
CREATE DATABASE ecommerce_db;
```

2. Edit:

```text
spring-boot-reference/src/main/resources/application.properties
```

3. Put your MySQL username and password.

4. From inside `spring-boot-reference`, run:

```bash
mvn spring-boot:run
```

5. Open:

```text
http://localhost:8080/
http://localhost:8080/products
http://localhost:8080/api/products
```

## Note

The reference app is a teaching starter. It is intentionally simple so students can understand entities,
repositories, services, controllers, APIs, Thymeleaf pages, and transactions.


## Latest update

- SEO canonical URL changed to: https://editor.learnwithchampak.live/spring/e-commerce
- Open Graph URL changed to: https://editor.learnwithchampak.live/spring/e-commerce
- Open Graph image changed to: https://editor.learnwithchampak.live/spring/e-commerce/assets/spring-boot-ecommerce-og.png
- Google AdSense script added in `<head>`.
- No `<ins>` ad blocks were added.
- Speak tags now use exact numbered IDs: `speak0`, `speak1`, `speak2`, ...
- The uploaded `find-on-page.js` speak controller is included as `js/find-on-page.js`.


## Accessibility update

Code blocks and `<pre>` areas now use a high-contrast dark background, light text, clear saffron border, and readable language-specific colors.
