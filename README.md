# Dream Diary
Dream Diary is a responsive web app that allows users to record their dreams and notes on those dreams.

## Screeshots
Landing Page: 
![Landing Page](./project-screenshots/landing-page.png?raw=true)

Login Page: 
![Login Page](./project-screenshots/login-page.png?raw=true)

Register Page:
![Register Page](./project-screenshots/register-page.png?raw=true)

Home Page:
![Home Page](./project-screenshots/home-page.png?raw=true)

Edit Page:
![Edit Page](./project-screenshots/edit-page.png?raw=true)

New Dream Page:
![New Dream Page](./project-screenshots/new-dream-page.png?raw=true)

## Live App
- https://dream-diary.vercel.app/

## Technologies Used
- React
- Html
- CSS
- Javascript
- Node.js
- PostgreSQL
- Javascript
- Express

## API Documentation
All requests require a valid json web token from a registered user and the content-type of application/json. 
- Base URL: https://dream-diary.herokuapp.com
    - GET All Dreams: /api/dreams
    - GET Dream By Id: /api/dreams/:dream_id
    - GET Dreams for a User: /api/dreams/byUserId/:user_id
    - Patch Dream By Id: /api/dreams/:dream_id
    - POST a dream: /api/dreams
    - POST to login a user: /api/auth/login    
    - POST a new user: /api/users/