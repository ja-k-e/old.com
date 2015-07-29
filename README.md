#jakealbaugh.com

##Getting Started
1. Install dependencies: `npm install`
2. Install components: `gulp bower`

##Daily Startup
1. `cd` to project directory
2. Start environment: `gulp` (will create `dist` directory)
3. Navigate to [http://localhost:4000/](http://localhost:4000/)

##Installing a New Gulp Plugin
1. Install plugin using npm: `npm install --save-dev [[plugin]]`

##Installing a New Component
1. Install component using bower: `bower install [name] --save`
2. Run local gulp task to add component to libs files: `gulp bower`
3. Start gulp: `gulp`